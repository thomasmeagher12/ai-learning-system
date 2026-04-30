import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { USER_ID } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/prompt";
import {
  evaluatePhaseResponse,
  evaluateApplyTurn,
  generateApplyPhase,
  generateAdaptPhase,
  generateSessionSummary,
  generateMemorySummary,
} from "@/lib/claude";
import type { MemorySummary } from "@/lib/claude";
import { evaluateWarmUpResponse, extractConceptsFromSession } from "@/lib/claude-review";
import { updateConceptStrength, saveConceptsFromSession, getAllConcepts, computeCurrentStage } from "@/lib/concepts";
import { calendarDaysBetween } from "@/lib/date";
import type { Phase, PhaseMessage, PhaseContentMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

const PHASES: Phase[] = ["warmup", "learn", "apply", "adapt", "reflect"];

function nextPhaseAfter(p: Phase): Phase | "complete" {
  const idx = PHASES.indexOf(p);
  return idx < PHASES.length - 1 ? PHASES[idx + 1] : "complete";
}

function isContentMessage(m: PhaseMessage): m is PhaseContentMessage {
  return "kind" in m && m.kind === "content";
}

function getSessionTopic(sessionId: string, supa: ReturnType<typeof getSupabaseAdmin>) {
  return supa
    .from("phase_data")
    .select("messages")
    .eq("session_id", sessionId)
    .eq("phase", "learn")
    .maybeSingle()
    .then(({ data }) => {
      if (!data) return "AI concepts";
      const seed = (data.messages as PhaseMessage[]).find(isContentMessage);
      return seed ? String((seed as PhaseContentMessage).data.topic ?? "AI concepts") : "AI concepts";
    });
}

async function loadSystemPrompt(session: { session_number: number }) {
  const supa = getSupabaseAdmin();
  const [{ data: recent }, { data: project }, allConcepts] = await Promise.all([
    supa
      .from("sessions")
      .select("session_number, summary, completed_at, memory_summary")
      .eq("user_id", USER_ID)
      .eq("status", "complete")
      .order("completed_at", { ascending: false })
      .limit(7),
    supa
      .from("projects")
      .select("title, state")
      .eq("user_id", USER_ID)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getAllConcepts(),
  ]);

  const recentRows = recent ?? [];
  const currentStage = computeCurrentStage(allConcepts);

  return buildSystemPrompt({
    sessionNumber: session.session_number,
    currentStage,
    activeProject: project
      ? { title: project.title as string, state: project.state }
      : null,
    recentSummaries: recentRows.map((r) => ({
      session_number: r.session_number as number,
      summary: r.summary,
      completed_at: (r.completed_at as string | null) ?? null,
    })),
    recentMemories: recentRows
      .filter((r) => r.memory_summary != null)
      .map((r) => ({
        session_number: r.session_number as number,
        memory_summary: r.memory_summary as MemorySummary,
      })),
  });
}

async function seedApplyPhase(
  supa: ReturnType<typeof getSupabaseAdmin>,
  sessionId: string,
  systemPrompt: string,
  topic: string,
) {
  const apply = await generateApplyPhase(systemPrompt, topic);
  const seedMsg: PhaseMessage = {
    role: "assistant",
    kind: "content",
    data: {
      task_description: apply.task_description,
      starter_hint: apply.starter_hint,
      success_criteria: apply.success_criteria,
    },
  };
  await supa.from("phase_data").upsert(
    {
      session_id: sessionId,
      phase: "apply",
      messages: [seedMsg],
      engagement_met: false,
    },
    { onConflict: "session_id,phase" },
  );
}

async function seedAdaptPhase(
  supa: ReturnType<typeof getSupabaseAdmin>,
  sessionId: string,
  systemPrompt: string,
  topic: string,
) {
  const adapt = await generateAdaptPhase(systemPrompt, topic);
  const seedMsg: PhaseMessage = {
    role: "assistant",
    kind: "content",
    data: {
      trend_content_markdown: adapt.trend_content_markdown,
      analysis_question: adapt.analysis_question,
    },
  };
  await supa.from("phase_data").upsert(
    {
      session_id: sessionId,
      phase: "adapt",
      messages: [seedMsg],
      engagement_met: false,
    },
    { onConflict: "session_id,phase" },
  );
}

async function seedReflectPhase(
  supa: ReturnType<typeof getSupabaseAdmin>,
  sessionId: string,
) {
  await supa.from("phase_data").upsert(
    {
      session_id: sessionId,
      phase: "reflect",
      messages: [],
      engagement_met: false,
    },
    { onConflict: "session_id,phase" },
  );
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const sessionId = String(form.get("sessionId") ?? "");
  const phase = String(form.get("phase") ?? "") as Phase;
  const response = String(form.get("response") ?? "").trim();

  if (!sessionId || !phase || !response) {
    return new Response("Missing required fields", { status: 400 });
  }

  const supa = getSupabaseAdmin();

  const [sessionRes, phaseRes] = await Promise.all([
    supa.from("sessions").select("*").eq("id", sessionId).maybeSingle(),
    supa
      .from("phase_data")
      .select("*")
      .eq("session_id", sessionId)
      .eq("phase", phase)
      .maybeSingle(),
  ]);

  const session = sessionRes.data;
  const phaseRow = phaseRes.data;
  if (!session) return new Response("Session not found", { status: 404 });
  if (!phaseRow) return new Response("Phase data not found", { status: 404 });
  if (session.current_phase !== phase) {
    return Response.redirect(
      new URL(`/session/${sessionId}`, request.url),
      303,
    );
  }

  if (phase === "warmup") {
    const messages = phaseRow.messages as PhaseMessage[];
    const seed = messages.find(isContentMessage);
    if (!seed) return new Response("Missing warmup seed", { status: 500 });

    const recallPrompts = (seed.data.recall_prompts as Array<{
      concept_id: string;
      concept_name: string;
      question: string;
    }>) ?? [];

    const userTurns = messages.filter(
      (m) => !("kind" in m) && m.role === "user",
    );
    const currentIndex = userTurns.length;
    const currentPrompt = recallPrompts[currentIndex];

    if (!currentPrompt) {
      await supa.from("sessions").update({ current_phase: "learn" }).eq("id", sessionId);
      await supa
        .from("phase_data")
        .update({ engagement_met: true, updated_at: new Date().toISOString() })
        .eq("id", phaseRow.id);
      return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
    }

    const systemPrompt = await loadSystemPrompt(session);

    const { data: conceptRow } = await supa
      .from("concepts")
      .select("concept_summary")
      .eq("id", currentPrompt.concept_id)
      .maybeSingle();

    const evaluation = await evaluateWarmUpResponse(systemPrompt, {
      concept_name: currentPrompt.concept_name,
      concept_summary: String(conceptRow?.concept_summary ?? ""),
      question: currentPrompt.question,
      response,
    });

    try {
      await updateConceptStrength(
        currentPrompt.concept_id,
        evaluation.quality,
        session.session_number,
      );
    } catch (err) {
      console.error("[warmup] updateConceptStrength failed:", err);
    }

    const updatedMessages: PhaseMessage[] = [
      ...messages,
      { role: "user", content: response },
      { role: "assistant", content: `**${evaluation.quality.charAt(0).toUpperCase() + evaluation.quality.slice(1)}** — ${evaluation.feedback}` },
    ];

    const allDone = currentIndex + 1 >= recallPrompts.length;

    await supa
      .from("phase_data")
      .update({
        messages: updatedMessages,
        user_response: response,
        engagement_met: allDone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phaseRow.id);

    if (allDone) {
      await supa.from("sessions").update({ current_phase: "learn" }).eq("id", sessionId);
    }

    return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
  }

  if (phase === "learn") {
    const messages = phaseRow.messages as PhaseMessage[];
    const seed = messages.find(isContentMessage);
    if (!seed) return new Response("Missing learn seed", { status: 500 });

    const sessionType = (session.session_type as string) ?? "standard";

    let context: string;
    let question: string;
    const topic = String(seed.data.topic ?? "AI concepts");

    if (sessionType === "review") {
      context = String(seed.data.recap_markdown ?? "");
      question = String(seed.data.calibration_question ?? "");
    } else if (sessionType === "mastery") {
      context = String(seed.data.narrative_markdown ?? "");
      question = String(seed.data.reflection_prompt ?? "");
    } else {
      context = String(seed.data.concept_markdown ?? "");
      question = String(seed.data.comprehension_question ?? "");
    }

    const systemPrompt = await loadSystemPrompt(session);
    const evaluation = await evaluatePhaseResponse(systemPrompt, {
      context,
      question,
      response,
    });

    const feedbackContent = evaluation.accepted && evaluation.what_was_good
      ? `${evaluation.what_was_good}${evaluation.one_improvement ? `\n\n**To go further:** ${evaluation.one_improvement}` : ""}`
      : evaluation.feedback;

    const updatedMessages: PhaseMessage[] = [
      ...messages,
      { role: "user", content: response },
      { role: "assistant", content: feedbackContent },
    ];

    await supa
      .from("phase_data")
      .update({
        messages: updatedMessages,
        user_response: response,
        engagement_met: evaluation.accepted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phaseRow.id);

    if (evaluation.accepted) {
      const next = nextPhaseAfter("learn");
      await supa.from("sessions").update({ current_phase: next }).eq("id", sessionId);

      if (next === "apply") {
        await seedApplyPhase(supa, sessionId, systemPrompt, topic);
      }
    }

    return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
  }

  if (phase === "apply") {
    const action = String(form.get("action") ?? "");
    const messages = phaseRow.messages as PhaseMessage[];
    const seed = messages.find(isContentMessage);
    if (!seed) return new Response("Missing apply seed", { status: 500 });

    if (action === "advance" && phaseRow.engagement_met) {
      const next = nextPhaseAfter("apply");
      await supa.from("sessions").update({ current_phase: next }).eq("id", sessionId);

      if (next === "adapt") {
        const systemPrompt = await loadSystemPrompt(session);
        const topic = await getSessionTopic(sessionId, supa);
        await seedAdaptPhase(supa, sessionId, systemPrompt, topic);
      }

      return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
    }

    const taskDescription = String(seed.data.task_description ?? "");
    const successCriteria = (seed.data.success_criteria as string[]) ?? [];

    const chatTurns = messages
      .filter((m): m is { role: "user" | "assistant"; content: string } =>
        !("kind" in m) && "content" in m,
      )
      .map((m) => ({ role: m.role, content: m.content }));

    const attemptNumber =
      chatTurns.filter((m) => m.role === "user").length + 1;

    const conversationForClaude: { role: "user" | "assistant"; content: string }[] = [
      { role: "assistant", content: taskDescription },
      ...chatTurns,
      { role: "user", content: response },
    ];

    const systemPrompt = await loadSystemPrompt(session);
    const result = await evaluateApplyTurn(systemPrompt, {
      taskDescription,
      successCriteria,
      conversationHistory: conversationForClaude,
      attemptNumber,
    });

    const updatedMessages: PhaseMessage[] = [
      ...messages,
      { role: "user", content: response },
      { role: "assistant", content: result.feedback },
    ];

    await supa
      .from("phase_data")
      .update({
        messages: updatedMessages,
        user_response: response,
        engagement_met: result.progression_ready,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phaseRow.id);

    return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
  }

  if (phase === "adapt") {
    const messages = phaseRow.messages as PhaseMessage[];
    const seed = messages.find(isContentMessage);
    if (!seed) return new Response("Missing adapt seed", { status: 500 });

    const trendContent = String(seed.data.trend_content_markdown ?? "");
    const question = String(seed.data.analysis_question ?? "");

    const systemPrompt = await loadSystemPrompt(session);
    const evaluation = await evaluatePhaseResponse(systemPrompt, {
      context: trendContent,
      question,
      response,
    });

    const feedbackContent = evaluation.accepted && evaluation.what_was_good
      ? `${evaluation.what_was_good}${evaluation.one_improvement ? `\n\n**To go further:** ${evaluation.one_improvement}` : ""}`
      : evaluation.feedback;

    const updatedMessages: PhaseMessage[] = [
      ...messages,
      { role: "user", content: response },
      { role: "assistant", content: feedbackContent },
    ];

    await supa
      .from("phase_data")
      .update({
        messages: updatedMessages,
        user_response: response,
        engagement_met: evaluation.accepted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phaseRow.id);

    if (evaluation.accepted) {
      const next = nextPhaseAfter("adapt");
      await supa.from("sessions").update({ current_phase: next }).eq("id", sessionId);

      if (next === "reflect") {
        await seedReflectPhase(supa, sessionId);
      }
    }

    return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
  }

  if (phase === "reflect") {
    if (response.length < 50) {
      await supa
        .from("phase_data")
        .update({
          user_response: response,
          updated_at: new Date().toISOString(),
        })
        .eq("id", phaseRow.id);

      return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
    }

    await supa
      .from("phase_data")
      .update({
        messages: [{ role: "user", content: response }],
        user_response: response,
        engagement_met: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phaseRow.id);

    const systemPrompt = await loadSystemPrompt(session);
    const { data: allPhases } = await supa
      .from("phase_data")
      .select("phase, messages, user_response")
      .eq("session_id", sessionId);

    const phaseDigest = (allPhases ?? [])
      .map((p) => {
        const msgs = (p.messages as PhaseMessage[])
          .filter((m): m is PhaseMessage & { content: string } =>
            "content" in m && typeof (m as Record<string, unknown>).content === "string",
          )
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");
        return `## ${(p.phase as string).toUpperCase()}\n${msgs}`;
      })
      .join("\n\n");

    let summary = null;
    try {
      summary = await generateSessionSummary(systemPrompt, phaseDigest);
    } catch (err) {
      console.error("[reflect] generateSessionSummary failed:", err);
    }

    let memorySummary = null;
    try {
      memorySummary = await generateMemorySummary(
        summary ? JSON.stringify(summary) : "",
        phaseDigest,
      );
    } catch (err) {
      console.error("[reflect] generateMemorySummary failed:", err);
    }

    try {
      const existing = await getAllConcepts();
      const concepts = await extractConceptsFromSession(
        systemPrompt,
        phaseDigest,
        existing.map((c) => c.concept_name),
      );
      await saveConceptsFromSession(concepts, session.session_number);
    } catch (err) {
      console.error("[reflect] concept extraction/save failed:", err);
    }

    const completedAt = new Date();

    const { data: prevComplete } = await supa
      .from("sessions")
      .select("streak, completed_at")
      .eq("user_id", USER_ID)
      .eq("status", "complete")
      .neq("id", sessionId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let newStreak = 1;
    if (prevComplete?.completed_at) {
      const gap = calendarDaysBetween(new Date(prevComplete.completed_at), completedAt);
      if (gap === 1) {
        newStreak = (prevComplete.streak ?? 0) + 1;
      }
    }

    await supa
      .from("sessions")
      .update({
        current_phase: "complete",
        status: "complete",
        completed_at: completedAt.toISOString(),
        streak: newStreak,
        ...(summary ? { summary } : {}),
        ...(memorySummary ? { memory_summary: memorySummary } : {}),
      })
      .eq("id", sessionId);

    return Response.redirect(new URL(`/session/${sessionId}`, request.url), 303);
  }

  return new Response(`Phase "${phase}" not yet implemented`, { status: 501 });
}
