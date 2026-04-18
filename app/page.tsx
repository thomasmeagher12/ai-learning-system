import Link from "next/link";
import { getActiveSession, getLastCompletedSession } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export default async function Home() {
  const [active, last] = await Promise.all([
    getActiveSession(),
    getLastCompletedSession(),
  ]);

  const resumePath = active ? `/session/${active.id}` : null;
  const streak = last?.streak ?? 0;
  const lastLabel = last ? formatRelativeDate(last.completed_at ?? last.created_at) : null;

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            AI Daily Training
          </p>
          <h1 className="text-3xl font-medium tracking-tight">
            Ready to train.
          </h1>
        </div>

        {resumePath ? (
          <Link
            href={resumePath}
            className="w-full rounded-full bg-neutral-900 px-6 py-4 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Resume Session
          </Link>
        ) : (
          <form action="/api/session/start" method="post" className="w-full">
            <button
              type="submit"
              className="w-full rounded-full bg-neutral-900 px-6 py-4 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Start Daily Session
            </button>
          </form>
        )}

        {(streak > 0 || lastLabel) && (
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            {streak > 0 && <span>{streak}-day streak</span>}
            {streak > 0 && lastLabel && <span aria-hidden>·</span>}
            {lastLabel && <span>Last session {lastLabel}</span>}
          </div>
        )}
      </div>
    </main>
  );
}
