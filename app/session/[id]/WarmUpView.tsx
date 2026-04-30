import Link from "next/link";
import DraftTextarea from "@/app/components/DraftTextarea";
import type { PhaseRow, PhaseMessage } from "@/lib/types";

type RecallPrompt = {
  concept_id: string;
  concept_name: string;
  question: string;
};

function extractPrompts(phaseRow: PhaseRow | null): RecallPrompt[] {
  if (!phaseRow) return [];
  const seed = phaseRow.messages.find(
    (m) => "kind" in m && m.kind === "content",
  );
  if (!seed || !("data" in seed)) return [];
  return (seed.data.recall_prompts as RecallPrompt[]) ?? [];
}

function getChatMessages(messages: PhaseMessage[]): Array<{ role: string; content: string }> {
  return messages
    .filter((m) => !("kind" in m) && "content" in m)
    .map((m) => ({ role: (m as { role: string }).role, content: (m as { content: string }).content }));
}

export default function WarmUpView({
  sessionId,
  phaseRow,
  reviewMode = false,
}: {
  sessionId: string;
  phaseRow: PhaseRow | null;
  reviewMode?: boolean;
}) {
  const prompts = extractPrompts(phaseRow);
  const chatMessages = getChatMessages(phaseRow?.messages ?? []);
  const userTurnCount = chatMessages.filter((m) => m.role === "user").length;
  const allDone = phaseRow?.engagement_met ?? false;
  const currentIndex = allDone ? prompts.length : userTurnCount;
  const currentPrompt = prompts[currentIndex];

  if (prompts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        Warm-up content missing. Try restarting the session.
      </p>
    );
  }

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Warm-Up · {userTurnCount} of {prompts.length}
        </span>
        <h1 className="text-2xl font-medium tracking-tight">
          Quick Recall
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Before we start something new, let&apos;s check in on what you&apos;ve learned before.
        </p>
      </header>

      {chatMessages.map((msg, i) => {
        const promptIdx = Math.floor(i / 2);
        const prompt = prompts[promptIdx];
        if (msg.role === "user") {
          return (
            <div key={i} className="flex flex-col gap-2">
              {prompt && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
                    {prompt.concept_name}
                  </span>
                  <p className="text-[15px] leading-7 text-neutral-800 dark:text-neutral-200">
                    {prompt.question}
                  </p>
                </div>
              )}
              <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
                <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-50">
                  Your response
                </p>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        }
        return (
          <div
            key={i}
            className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-200"
          >
            <p className="mb-1 text-xs uppercase tracking-[0.15em] opacity-70">
              Coach
            </p>
            <p>{msg.content}</p>
          </div>
        );
      })}

      {allDone ? (
        <div className="flex flex-col items-center gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Nice work. Let&apos;s get into today&apos;s session.
          </p>
          {!reviewMode && (
            <Link
              href={`/session/${sessionId}`}
              className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Continue to Learn
            </Link>
          )}
        </div>
      ) : currentPrompt ? (
        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
              {currentPrompt.concept_name}
            </span>
            <p className="text-[15px] leading-7 text-neutral-800 dark:text-neutral-200">
              {currentPrompt.question}
            </p>
          </div>

          <form
            action="/api/session/phase"
            method="post"
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="phase" value="warmup" />

            <DraftTextarea
              sessionId={sessionId}
              phase="warmup"
              serverValue=""
              required
              minLength={10}
              placeholder="What do you remember about this?"
              className="min-h-[120px] w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500">
                Explain in your own words — no need to be perfect.
              </span>
              <button
                type="submit"
                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}
