import DraftTextarea from "@/app/components/DraftTextarea";
import type { PhaseRow } from "@/lib/types";

const QUESTIONS = [
  "What worked well today?",
  "What didn't work or felt unclear?",
  "What would you do differently next time?",
  "What did you learn about using AI?",
];

export default function ReflectView({
  sessionId,
  phaseRow,
  reviewMode = false,
}: {
  sessionId: string;
  phaseRow: PhaseRow | null;
  reviewMode?: boolean;
}) {
  const engagementMet = phaseRow?.engagement_met ?? false;

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Reflect
        </span>
        <h1 className="text-2xl font-medium tracking-tight">
          Session reflection
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {reviewMode
            ? "Your reflection from this session."
            : "Take a few minutes to think back on today\u2019s session. Honest reflection is how this system adapts to you."}
        </p>
      </header>

      <ul className="flex flex-col gap-3 text-[15px] leading-7 text-neutral-800 dark:text-neutral-200">
        {QUESTIONS.map((q) => (
          <li key={q} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            {q}
          </li>
        ))}
      </ul>

      {reviewMode || engagementMet ? (
        phaseRow?.user_response && (
          <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
            <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-50">
              Your reflection
            </p>
            <div className="whitespace-pre-wrap">{phaseRow.user_response}</div>
          </div>
        )
      ) : (
        <form
          action="/api/session/phase"
          method="post"
          className="flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800"
        >
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="phase" value="reflect" />

          <DraftTextarea
            sessionId={sessionId}
            phase="reflect"
            serverValue={phaseRow?.user_response ?? ""}
            required
            minLength={50}
            placeholder="Write your reflection here…"
            className="min-h-[200px] w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-500">
              Write a genuine reflection to complete the session.
            </span>
            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Complete Session
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
