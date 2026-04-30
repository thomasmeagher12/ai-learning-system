import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getLastCompletedSession } from "@/lib/db";
import type { Session, PhaseRow, Phase } from "@/lib/types";
import SessionShell from "./SessionShell";

export const dynamic = "force-dynamic";

const ALL_PHASES: Phase[] = ["warmup", "learn", "apply", "adapt", "reflect"];

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string; phase?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supa = getSupabaseAdmin();

  const { data: session } = await supa
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();

  const isComplete = session.status === "complete";
  const reviewMode = isComplete && query.review === "1";

  if (isComplete && !reviewMode) {
    redirect(`/session/${id}/complete`);
  }

  const { data: allPhaseRows } = await supa
    .from("phase_data")
    .select("*")
    .eq("session_id", id);

  const phaseMap = new Map<Phase, PhaseRow>();
  for (const row of (allPhaseRows ?? []) as PhaseRow[]) {
    phaseMap.set(row.phase as Phase, row);
  }

  const requestedPhase = query.phase && ALL_PHASES.includes(query.phase as Phase)
    ? (query.phase as Phase)
    : null;

  const activePhase = session.current_phase as Phase;
  const activeIdx = ALL_PHASES.indexOf(activePhase);

  let viewingPhase: Phase = reviewMode ? (phaseMap.has("warmup") ? "warmup" : "learn") : activePhase;
  if (requestedPhase) {
    if (reviewMode) {
      viewingPhase = requestedPhase;
    } else if (ALL_PHASES.indexOf(requestedPhase) < activeIdx) {
      viewingPhase = requestedPhase;
    }
  }

  const currentPhaseRow = phaseMap.get(viewingPhase) ?? null;

  const completedPhases = ALL_PHASES.filter((p) => {
    const row = phaseMap.get(p);
    return row?.engagement_met === true;
  });

  const displayStreak =
    session.status === "complete"
      ? (session.streak as number) ?? 0
      : (await getLastCompletedSession())?.streak ?? 0;

  return (
    <SessionShell
      session={session as Session}
      phaseRow={currentPhaseRow}
      reviewMode={reviewMode}
      viewingPhase={viewingPhase}
      completedPhases={completedPhases}
      displayStreak={displayStreak}
    />
  );
}
