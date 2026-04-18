import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SessionSummary } from "@/lib/claude";

export const dynamic = "force-dynamic";

export default async function SessionCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = getSupabaseAdmin();
  const { data: session } = await supa
    .from("sessions")
    .select("session_number, streak, summary, completed_at")
    .eq("id", id)
    .eq("status", "complete")
    .maybeSingle();

  if (!session) notFound();

  const summary = session.summary as SessionSummary | null;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Session {session.session_number}
          </span>
          <h1 className="text-3xl font-medium tracking-tight">
            Session complete.
          </h1>
          {session.streak > 0 && (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {session.streak}-day streak
            </span>
          )}
        </div>

        {summary ? (
          <div className="flex w-full flex-col gap-5">
            <SummaryBlock label="What was covered">
              {summary.what_was_covered}
            </SummaryBlock>
            <SummaryBlock label="What you built">
              {summary.what_was_built}
            </SummaryBlock>
            <SummaryBlock label="Key insight">
              {summary.key_insight}
            </SummaryBlock>

            {summary.areas_to_revisit.length > 0 && (
              <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-neutral-500">
                  Areas to revisit
                </p>
                <ul className="flex flex-col gap-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {summary.areas_to_revisit.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          <p className="text-sm text-neutral-500">
            Session summary unavailable.
          </p>
        )}

        <Link
          href="/"
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Back to Home
        </Link>
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
