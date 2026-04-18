import { getSupabaseAdmin } from "./supabase";
import type { Session } from "./types";

export const USER_ID = "me";

export async function getActiveSession(): Promise<Session | null> {
  const s = getSupabaseAdmin();
  const { data, error } = await s
    .from("sessions")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Session) ?? null;
}

export async function getLastCompletedSession(): Promise<Session | null> {
  const s = getSupabaseAdmin();
  const { data, error } = await s
    .from("sessions")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("status", "complete")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Session) ?? null;
}
