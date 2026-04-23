import ReactMarkdown from "react-markdown";
import DraftTextarea from "@/app/components/DraftTextarea";
import type { PhaseRow, PhaseMessage, ChatTurn } from "@/lib/types";

type LearnData = {
  continuity_message?: string;
  topic?: string;
  concept_markdown?: string;
  comprehension_question?: string;
};

function extractLearnData(phaseRow: PhaseRow | null): LearnData | null {
  if (!phaseRow) return null;
  const seed = phaseRow.messages.find(
    (m) => "kind" in m && m.kind === "content",
  );
  if (!seed || !("data" in seed)) return null;
  return seed.data as LearnData;
}

function lastFeedback(messages: PhaseMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if ("content" in m && m.role === "assistant") {
      return (m as ChatTurn).content;
    }
  }
  return null;
}

const markdownClass =
  "space-y-3 text-[15px] leading-7 text-neutral-800 dark:text-neutral-200 " +
  "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 dark:[&_h2]:text-neutral-100 " +
  "[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] dark:[&_code]:bg-neutral-800 " +
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-900 [&_pre]:p-4 [&_pre]:text-neutral-100 dark:[&_pre]:bg-neutral-800 " +
  "[&_strong]:font-semibold";

export default function LearnView({
  sessionId,
  phaseRow,
  reviewMode = false,
}: {
  sessionId: string;
  phaseRow: PhaseRow | null;
  reviewMode?: boolean;
}) {
  const data = extractLearnData(phaseRow);

  if (!data?.concept_markdown) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        Learn content missing. Try restarting the session.
      </p>
    );
  }

  const engagementMet = phaseRow?.engagement_met ?? false;
  const feedback =
    phaseRow && !engagementMet ? lastFeedback(phaseRow.messages) : null;
  const acceptedFeedback =
    phaseRow && engagementMet ? lastFeedback(phaseRow.messages) : null;

  return (
    <article className="flex flex-col gap-8">
      {data.continuity_message && (
        <p className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm italic text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          {data.continuity_message}
        </p>
      )}

      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Today&apos;s concept
        </span>
        {data.topic && (
          <h1 className="text-2xl font-medium tracking-tight">{data.topic}</h1>
        )}
      </header>

      <section className={markdownClass}>
        <ReactMarkdown>{data.concept_markdown}</ReactMarkdown>
      </section>

      {data.comprehension_question && (
        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {reviewMode ? "Question" : "Before you continue"}
            </span>
            <p className="text-[15px] leading-7 text-neutral-800 dark:text-neutral-200">
              {data.comprehension_question}
            </p>
          </div>

          {feedback && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-70">
                Coach
              </p>
              <p>{feedback}</p>
            </div>
          )}

          {reviewMode || engagementMet ? (
            <>
              {phaseRow?.user_response && (
                <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
                  <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-50">
                    Your response
                  </p>
                  <div className="whitespace-pre-wrap">{phaseRow.user_response}</div>
                </div>
              )}
              {acceptedFeedback && (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-200">
                  <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-70">
                    Coach
                  </p>
                  <p>{acceptedFeedback}</p>
                </div>
              )}
            </>
          ) : (
            <form
              action="/api/session/phase"
              method="post"
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="sessionId" value={sessionId} />
              <input type="hidden" name="phase" value="learn" />

              <DraftTextarea
                sessionId={sessionId}
                phase="learn"
                serverValue={phaseRow?.user_response ?? ""}
                required
                minLength={20}
                placeholder="Think before answering…"
                className="min-h-[140px] w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-500">
                  Submit a genuine attempt to unlock Next.
                </span>
                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
