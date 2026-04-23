import { getSupabaseAdmin } from "./supabase";
import type { Session } from "./types";
import type { MemorySummary } from "./claude";

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

export async function getTodayCompletedSession(): Promise<Session | null> {
  const s = getSupabaseAdmin();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const { data, error } = await s
    .from("sessions")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("status", "complete")
    .gte("completed_at", todayStart.toISOString())
    .lt("completed_at", tomorrowStart.toISOString())
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Session) ?? null;
}

export async function getMostRecentMemory(): Promise<MemorySummary | null> {
  const s = getSupabaseAdmin();
  const { data, error } = await s
    .from("sessions")
    .select("memory_summary")
    .eq("user_id", USER_ID)
    .eq("status", "complete")
    .not("memory_summary", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.memory_summary as MemorySummary) ?? null;
}
