import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { USER_ID } from "@/lib/db";
import type { PhaseMessage, PhaseContentMessage } from "@/lib/types";
import SessionList from "@/app/components/SessionList";

export const dynamic = "force-dynamic";

export default async function RecapsPage() {
  const supa = getSupabaseAdmin();

  const { data: sessions } = await supa
    .from("sessions")
    .select("id, session_number, completed_at, created_at")
    .eq("user_id", USER_ID)
    .eq("status", "complete")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(50);

  const sessionIds = (sessions ?? []).map((s) => s.id);

  let topicMap = new Map<string, string>();
  if (sessionIds.length > 0) {
    const { data: learnRows } = await supa
      .from("phase_data")
      .select("session_id, messages")
      .in("session_id", sessionIds)
      .eq("phase", "learn");

    for (const row of learnRows ?? []) {
      const seed = (row.messages as PhaseMessage[]).find(
        (m) => "kind" in m && m.kind === "content",
      );
      if (seed && "data" in seed) {
        const topic = String((seed as PhaseContentMessage).data.topic ?? "");
        if (topic) topicMap.set(row.session_id, topic);
      }
    }
  }

  const items = (sessions ?? []).map((s) => ({
    id: s.id,
    sessionNumber: s.session_number as number,
    topic: topicMap.get(s.id),
    dateStr: (s.completed_at ?? s.created_at) as string,
    href: `/recaps/${s.id}`,
  }));

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              AI Daily Training
            </span>
            <h1 className="text-2xl font-medium tracking-tight">
              Session Summaries
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Home
          </Link>
        </header>

        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            No completed sessions yet. Start your first session to see summaries
            here.
          </p>
        ) : (
          <SessionList items={items} />
        )}
      </div>
    </main>
  );
}
