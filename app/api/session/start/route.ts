import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getActiveSession, getTodayCompletedSession, getMostRecentMemory, USER_ID } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/prompt";
import { generateLearnPhase } from "@/lib/claude";
import type { PhaseMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

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

  const [{ data: recent }, { data: project }, { data: maxRow }, { data: lastComplete }, memory] =
    await Promise.all([
      supa
        .from("sessions")
        .select("session_number, summary, completed_at")
        .eq("user_id", USER_ID)
        .eq("status", "complete")
        .order("completed_at", { ascending: false })
        .limit(3),
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
      supa
        .from("sessions")
        .select("streak, completed_at")
        .eq("user_id", USER_ID)
        .eq("status", "complete")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getMostRecentMemory(),
    ]);

  const sessionNumber = (maxRow?.session_number ?? 0) + 1;

  let streak = 1;
  if (lastComplete?.completed_at) {
    const days = daysBetween(new Date(lastComplete.completed_at), new Date());
    streak = days <= 1 ? (lastComplete.streak ?? 0) + 1 : 1;
  }

  const systemPrompt = buildSystemPrompt({
    sessionNumber,
    activeProject: project
      ? { title: project.title as string, state: project.state }
      : null,
    memory,
    recentSummaries: (recent ?? []).map((r) => ({
      session_number: r.session_number as number,
      summary: r.summary,
      completed_at: (r.completed_at as string | null) ?? null,
    })),
  });

  const learn = await generateLearnPhase(systemPrompt);

  const { data: session, error: sessErr } = await supa
    .from("sessions")
    .insert({
      user_id: USER_ID,
      session_number: sessionNumber,
      status: "in_progress",
      current_phase: "learn",
      streak,
    })
    .select("id")
    .single();
  if (sessErr || !session) {
    throw new Error(`Failed to create session: ${sessErr?.message}`);
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

  const { error: phaseErr } = await supa.from("phase_data").insert({
    session_id: session.id,
    phase: "learn",
    messages: [initialMessage],
    engagement_met: false,
  });
  if (phaseErr) {
    throw new Error(`Failed to insert phase_data: ${phaseErr.message}`);
  }

  return Response.redirect(
    new URL(`/session/${session.id}`, request.url),
    303,
  );
}
