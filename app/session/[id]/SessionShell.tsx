import Link from "next/link";
import type { Session, PhaseRow, Phase } from "@/lib/types";
import LearnView from "./LearnView";
import ApplyView from "./ApplyView";
import AdaptView from "./AdaptView";
import ReflectView from "./ReflectView";

const PHASES: Phase[] = ["learn", "apply", "adapt", "reflect"];
const PHASE_LABEL: Record<Phase, string> = {
  learn: "Learn",
  apply: "Apply",
  adapt: "Adapt",
  reflect: "Reflect",
};

export default function SessionShell({
  session,
  phaseRow,
  reviewMode = false,
  viewingPhase,
  completedPhases = [],
}: {
  session: Session;
  phaseRow: PhaseRow | null;
  reviewMode?: boolean;
  viewingPhase?: Phase;
  completedPhases?: Phase[];
}) {
  const rawActivePhase = session.current_phase;
  const activePhase: Phase = PHASES.includes(rawActivePhase as Phase)
    ? (rawActivePhase as Phase)
    : "reflect";
  const displayPhase = viewingPhase ?? (reviewMode ? "learn" : activePhase);
  const activeIdx = PHASES.indexOf(activePhase);
  const displayIdx = PHASES.indexOf(displayPhase);

  const navigablePhases = reviewMode
    ? PHASES.filter((p) => completedPhases.includes(p))
    : completedPhases.filter((p) => PHASES.indexOf(p) < activeIdx);

  const canGoBack = displayIdx > 0 && navigablePhases.includes(PHASES[displayIdx - 1]);
  const canGoForward = reviewMode
    ? displayIdx < PHASES.length - 1 && navigablePhases.includes(PHASES[displayIdx + 1])
    : displayIdx < activeIdx;

  const isViewingPriorPhase = !reviewMode && displayPhase !== activePhase;

  const prevPhase = canGoBack ? PHASES[displayIdx - 1] : null;
  const nextPhase = canGoForward ? PHASES[displayIdx + 1] : null;

  function phaseUrl(phase: Phase) {
    const base = `/session/${session.id}`;
    if (reviewMode) return `${base}?review=1&phase=${phase}`;
    if (phase === activePhase) return base;
    return `${base}?phase=${phase}`;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          AI Daily Training
        </Link>
        <div className="flex items-center gap-4">
          {reviewMode && (
            <span className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 dark:border-neutral-700">
              Review
            </span>
          )}
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {PHASE_LABEL[displayPhase]} · Session {session.session_number}
          </span>
          <div className="flex gap-1.5" aria-hidden>
            {PHASES.map((p, i) => (
              <span
                key={p}
                className={`h-1.5 w-6 rounded-full ${
                  p === displayPhase
                    ? "bg-neutral-900 dark:bg-neutral-100"
                    : reviewMode
                      ? completedPhases.includes(p)
                        ? "bg-neutral-400 dark:bg-neutral-500"
                        : "bg-neutral-200 dark:bg-neutral-800"
                      : i <= activeIdx
                        ? "bg-neutral-400 dark:bg-neutral-500"
                        : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {isViewingPriorPhase && (
            <div className="mb-6 flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-xs text-neutral-500">
                Viewing completed phase — your current work is in {PHASE_LABEL[activePhase]}.
              </p>
              <Link
                href={`/session/${session.id}`}
                className="text-xs font-medium text-neutral-900 hover:underline dark:text-neutral-100"
              >
                Back to {PHASE_LABEL[activePhase]}
              </Link>
            </div>
          )}

          {displayPhase === "learn" && (
            <LearnView sessionId={session.id} phaseRow={phaseRow} reviewMode={reviewMode || isViewingPriorPhase} />
          )}
          {displayPhase === "apply" && (
            <ApplyView sessionId={session.id} phaseRow={phaseRow} reviewMode={reviewMode || isViewingPriorPhase} />
          )}
          {displayPhase === "adapt" && (
            <AdaptView sessionId={session.id} phaseRow={phaseRow} reviewMode={reviewMode || isViewingPriorPhase} />
          )}
          {displayPhase === "reflect" && (
            <ReflectView sessionId={session.id} phaseRow={phaseRow} reviewMode={reviewMode || isViewingPriorPhase} />
          )}

          {(canGoBack || canGoForward) && (
            <nav className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
              {canGoBack && prevPhase ? (
                <Link
                  href={phaseUrl(prevPhase)}
                  className="flex items-center gap-1.5 text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  <span aria-hidden>&larr;</span> {PHASE_LABEL[prevPhase]}
                </Link>
              ) : (
                <span />
              )}
              {canGoForward && nextPhase ? (
                <Link
                  href={phaseUrl(nextPhase)}
                  className="flex items-center gap-1.5 text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {PHASE_LABEL[nextPhase]} <span aria-hidden>&rarr;</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}
