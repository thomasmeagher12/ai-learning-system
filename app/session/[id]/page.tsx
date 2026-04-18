import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Session, PhaseRow, Phase } from "@/lib/types";
import SessionShell from "./SessionShell";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = getSupabaseAdmin();

  const { data: session } = await supa
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();

  if (session.status === "complete") {
    redirect(`/session/${id}/complete`);
  }

  const phase = session.current_phase as Phase;
  const { data: phaseRow } = await supa
    .from("phase_data")
    .select("*")
    .eq("session_id", id)
    .eq("phase", phase)
    .maybeSingle();

  return (
    <SessionShell
      session={session as Session}
      phaseRow={phaseRow as PhaseRow | null}
    />
  );
}
