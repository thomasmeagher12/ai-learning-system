import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getActiveSession, getTodayCompletedSession, USER_ID } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/prompt";
import { generateLearnPhase } from "@/lib/claude";
import type { MemorySummary } from "@/lib/claude";
import { getSessionType, getCycleNumbers } from "@/lib/session-type";
import { getConceptsDueForRecall, getAllConcepts, computeCurrentStage } from "@/lib/concepts";
import {
  generateReviewLearnPhase,
  generateMasteryLearnPhase,
  generateWarmUpPhase,
} from "@/lib/claude-review";
import type { PhaseMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const active = await getActiveSession();
  if (active) {
    return Response.redirect(
      new URL(`/session/${active.id}`, request.url),
      303,
    );
  }

  const todayDone = await getTodayCompletedSession();
  if (todayDone) {
    return Response.redirect(new URL("/", request.url), 303);
  }

  const supa = getSupabaseAdmin();

  const [{ data: recent }, { data: project }, { data: maxRow }] =
    await Promise.all([
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
      supa
        .from("sessions")
        .select("session_number")
        .eq("user_id", USER_ID)
        .order("session_number", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const sessionNumber = (maxRow?.session_number ?? 0) + 1;
  const sessionType = getSessionType(sessionNumber);
  const { reviewCycle, masteryCycle } = getCycleNumbers(sessionNumber);

  const streak = 0;

  const recentRows = recent ?? [];
  const recentSummaries = recentRows.map((r) => ({
    session_number: r.session_number as number,
    summary: r.summary,
    completed_at: (r.completed_at as string | null) ?? null,
  }));
  const recentMemories = recentRows
    .filter((r) => r.memory_summary != null)
    .map((r) => ({
      session_number: r.session_number as number,
      memory_summary: r.memory_summary as MemorySummary,
    }));
  const activeProject = project
    ? { title: project.title as string, state: project.state }
    : null;

  if (sessionType === "review" || sessionType === "mastery") {
    const allConcepts = await getAllConcepts();
    const currentStage = computeCurrentStage(allConcepts);

    const systemPrompt = buildSystemPrompt({
      sessionNumber,
      currentStage,
      activeProject,
      recentSummaries,
      recentMemories,
      sessionType,
      reviewCycle,
      masteryCycle,
      allConcepts,
    });

    const learn =
      sessionType === "review"
        ? await generateReviewLearnPhase(systemPrompt)
        : await generateMasteryLearnPhase(systemPrompt);

    const { data: session, error: sessErr } = await supa
      .from("sessions")
      .insert({
        user_id: USER_ID,
        session_number: sessionNumber,
        session_type: sessionType,
        status: "in_progress",
        current_phase: "learn",
        streak,
      })
      .select("id")
      .single();
    if (sessErr || !session) {
      throw new Error(`Failed to create session: ${sessErr?.message}`);
    }

    const seedData =
      sessionType === "review"
        ? {
            recap_markdown: (learn as { recap_markdown: string; calibration_question: string }).recap_markdown,
            calibration_question: (learn as { recap_markdown: string; calibration_question: string }).calibration_question,
            topic: `Review — Cycle ${reviewCycle}`,
          }
        : {
            narrative_markdown: (learn as { narrative_markdown: string; reflection_prompt: string }).narrative_markdown,
            reflection_prompt: (learn as { narrative_markdown: string; reflection_prompt: string }).reflection_prompt,
            topic: `Mastery — Cycle ${masteryCycle}`,
          };

    const initialMessage: PhaseMessage = {
      role: "assistant",
      kind: "content",
      data: seedData,
    };

    await supa.from("phase_data").insert({
      session_id: session.id,
      phase: "learn",
      messages: [initialMessage],
      engagement_met: false,
    });

    return Response.redirect(
      new URL(`/session/${session.id}`, request.url),
      303,
    );
  }

  // Standard session
  const allConcepts = await getAllConcepts();
  const currentStage = computeCurrentStage(allConcepts);
  const warmUpConcepts = await getConceptsDueForRecall(sessionNumber);
  const hasWarmUp = warmUpConcepts.length > 0;

  const systemPrompt = buildSystemPrompt({
    sessionNumber,
    currentStage,
    activeProject,
    recentSummaries,
    recentMemories,
    sessionType: "standard",
    warmUpConcepts: hasWarmUp ? warmUpConcepts : undefined,
  });

  const learn = await generateLearnPhase(systemPrompt);

  const { data: session, error: sessErr } = await supa
    .from("sessions")
    .insert({
      user_id: USER_ID,
      session_number: sessionNumber,
      session_type: "standard",
      status: "in_progress",
      current_phase: hasWarmUp ? "warmup" : "learn",
      streak,
    })
    .select("id")
    .single();
  if (sessErr || !session) {
    throw new Error(`Failed to create session: ${sessErr?.message}`);
  }

  if (hasWarmUp) {
    const warmUp = await generateWarmUpPhase(systemPrompt, warmUpConcepts);
    const warmUpSeed: PhaseMessage = {
      role: "assistant",
      kind: "content",
      data: { recall_prompts: warmUp.recall_prompts },
    };
    await supa.from("phase_data").insert({
      session_id: session.id,
      phase: "warmup",
      messages: [warmUpSeed],
      engagement_met: false,
    });
  }

  const initialMessage: PhaseMessage = {
    role: "assistant",
    kind: "content",
    data: {
      continuity_message: learn.continuity_message,
      topic: learn.topic,
      concept_markdown: learn.concept_markdown,
      comprehension_question: learn.comprehension_question,
    },
  };

  await supa.from("phase_data").insert({
    session_id: session.id,
    phase: "learn",
    messages: [initialMessage],
    engagement_met: false,
  });

  return Response.redirect(
    new URL(`/session/${session.id}`, request.url),
    303,
  );
}
