import ReactMarkdown from "react-markdown";
import type { PhaseRow, PhaseMessage, PhaseContentMessage, ChatTurn } from "@/lib/types";

type ApplyData = {
  task_description?: string;
  starter_hint?: string;
  success_criteria?: string[];
};

function extractApplyData(phaseRow: PhaseRow | null): ApplyData | null {
  if (!phaseRow) return null;
  const seed = phaseRow.messages.find(
    (m) => "kind" in m && m.kind === "content",
  );
  if (!seed || !("data" in seed)) return null;
  return (seed as PhaseContentMessage).data as ApplyData;
}

function getChatTurns(messages: PhaseMessage[]): ChatTurn[] {
  return messages.filter(
    (m): m is ChatTurn => !("kind" in m) && "content" in m,
  );
}

const markdownClass =
  "space-y-3 text-[15px] leading-7 text-neutral-800 dark:text-neutral-200 " +
  "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 dark:[&_h2]:text-neutral-100 " +
  "[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] dark:[&_code]:bg-neutral-800 " +
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-900 [&_pre]:p-4 [&_pre]:text-neutral-100 dark:[&_pre]:bg-neutral-800 " +
  "[&_strong]:font-semibold";

export default function ApplyView({
  sessionId,
  phaseRow,
}: {
  sessionId: string;
  phaseRow: PhaseRow | null;
}) {
  const data = extractApplyData(phaseRow);

  if (!data?.task_description) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        Apply content missing. Try restarting the session.
      </p>
    );
  }

  const engagementMet = phaseRow?.engagement_met ?? false;
  const chatTurns = phaseRow ? getChatTurns(phaseRow.messages) : [];
  const hasAttempts = chatTurns.some((m) => m.role === "user");

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Hands-on task
        </span>
        <h1 className="text-2xl font-medium tracking-tight">Apply</h1>
      </header>

      <section className={markdownClass}>
        <ReactMarkdown>{data.task_description}</ReactMarkdown>
      </section>

      {data.success_criteria && data.success_criteria.length > 0 && (
        <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-2 text-xs uppercase tracking-[0.15em] text-neutral-500">
            Goals
          </p>
          <ul className="flex flex-col gap-1 text-sm text-neutral-700 dark:text-neutral-300">
            {data.success_criteria.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasAttempts && data.starter_hint && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-200">
          <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-70">
            Hint
          </p>
          <p>{data.starter_hint}</p>
        </div>
      )}

      {chatTurns.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          {chatTurns.map((turn, i) => (
            <div
              key={i}
              className={`rounded-md px-4 py-3 text-sm ${
                turn.role === "user"
                  ? "border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  : "border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-50">
                {turn.role === "user" ? "You" : "Coach"}
              </p>
              <div className="whitespace-pre-wrap">{turn.content}</div>
            </div>
          ))}
        </div>
      )}

      {engagementMet && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800/50 dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-900 dark:text-green-200">
            You&apos;ve met the goals for this task.
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-400">
            You can keep refining below, or continue to the next phase.
          </p>
          <form action="/api/session/phase" method="post" className="mt-3">
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="phase" value="apply" />
            <input type="hidden" name="action" value="advance" />
            <input type="hidden" name="response" value="__advance__" />
            <button
              type="submit"
              className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
            >
              Continue to Adapt
            </button>
          </form>
        </div>
      )}

      <form
        action="/api/session/phase"
        method="post"
        className="flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800"
      >
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="phase" value="apply" />

        <textarea
          name="response"
          required
          minLength={20}
          placeholder={
            hasAttempts ? "Refine your work…" : "Start working on the task…"
          }
          className="min-h-[180px] w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500">
            {engagementMet
              ? "You can keep iterating or continue above."
              : "Submit your work for feedback."}
          </span>
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Submit
          </button>
        </div>
      </form>
    </article>
  );
}
