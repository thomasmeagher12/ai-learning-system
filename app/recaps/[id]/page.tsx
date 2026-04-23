import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SessionSummary } from "@/lib/claude";
import type { PhaseMessage, PhaseContentMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RecapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = getSupabaseAdmin();

  const { data: session } = await supa
    .from("sessions")
    .select("id, session_number, streak, summary, completed_at")
    .eq("id", id)
    .eq("status", "complete")
    .maybeSingle();

  if (!session) notFound();

  const summary = session.summary as SessionSummary | null;

  let topic = "AI concepts";
  const { data: learnRow } = await supa
    .from("phase_data")
    .select("messages")
    .eq("session_id", id)
    .eq("phase", "learn")
    .maybeSingle();

  if (learnRow) {
    const seed = (learnRow.messages as PhaseMessage[]).find(
      (m) => "kind" in m && m.kind === "content",
    );
    if (seed && "data" in seed) {
      topic = String((seed as PhaseContentMessage).data.topic ?? topic);
    }
  }

  const areas = Array.isArray(summary?.areas_to_revisit)
    ? summary.areas_to_revisit
    : summary?.areas_to_revisit
      ? [String(summary.areas_to_revisit)]
      : [];

  const dateStr = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <header className="mb-8">
          <Link
            href="/recaps"
            className="mb-4 inline-block text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            &larr; All Summaries
          </Link>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Session {session.session_number}
            </span>
            <h1 className="text-2xl font-medium tracking-tight">{topic}</h1>
            {dateStr && (
              <span className="text-sm text-neutral-500">{dateStr}</span>
            )}
            {session.streak > 0 && (
              <span className="text-xs text-neutral-500">
                {session.streak}-day streak
              </span>
            )}
          </div>
        </header>

        {summary ? (
          <div className="flex flex-col gap-5">
            <SummaryBlock label="What was covered">
              {summary.what_was_covered}
            </SummaryBlock>
            <SummaryBlock label="What you built">
              {summary.what_was_built}
            </SummaryBlock>
            <SummaryBlock label="Key insight">
              {summary.key_insight}
            </SummaryBlock>

            <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-neutral-500">
                Areas to revisit
              </p>
              {areas.length > 0 ? (
                <ul className="flex flex-col gap-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {areas.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">
                  No areas to revisit identified.
                </p>
              )}
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/50 dark:bg-blue-950/30">
              <p className="mb-1 text-xs uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                Tomorrow
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                {summary.tomorrow_suggestion}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-neutral-500">
            Session summary unavailable.
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <Link
            href={`/session/${id}?review=1`}
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            Review Full Session
          </Link>
        </div>
      </div>
    </main>
  );
}

function SummaryBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="mb-1 text-xs uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        {children}
      </p>
    </div>
  );
}
