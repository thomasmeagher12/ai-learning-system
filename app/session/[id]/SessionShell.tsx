import Link from "next/link";
import type { Session, PhaseRow, Phase } from "@/lib/types";
import WarmUpView from "./WarmUpView";
import LearnView from "./LearnView";
import ApplyView from "./ApplyView";
import AdaptView from "./AdaptView";
import ReflectView from "./ReflectView";

const ALL_PHASES: Phase[] = ["warmup", "learn", "apply", "adapt", "reflect"];
const STANDARD_PHASES: Phase[] = ["learn", "apply", "adapt", "reflect"];

const PHASE_LABEL: Record<Phase, string> = {
  warmup: "Warm-Up",
  learn: "Learn",
  apply: "Apply",
  adapt: "Adapt",
  reflect: "Reflect",
};

function getVisiblePhases(session: Session, completedPhases: Phase[]): Phase[] {
  const sessionType = session.session_type ?? "standard";
  if (sessionType === "review" || sessionType === "mastery") {
    return STANDARD_PHASES;
  }
  if (completedPhases.includes("warmup") || session.current_phase === "warmup") {
    return ALL_PHASES;
  }
  return STANDARD_PHASES;
}

export default function SessionShell({
  session,
  phaseRow,
  reviewMode = false,
  viewingPhase,
  completedPhases = [],
  displayStreak = 0,
}: {
  session: Session;
  phaseRow: PhaseRow | null;
  reviewMode?: boolean;
  viewingPhase?: Phase;
  completedPhases?: Phase[];
  displayStreak?: number;
}) {
  const visiblePhases = getVisiblePhases(session, completedPhases);
  const rawActivePhase = session.current_phase;
  const activePhase: Phase = visiblePhases.includes(rawActivePhase as Phase)
    ? (rawActivePhase as Phase)
    : "reflect";
  const displayPhase = viewingPhase ?? (reviewMode ? "learn" : activePhase);
  const activeIdx = visiblePhases.indexOf(activePhase);
  const displayIdx = visiblePhases.indexOf(displayPhase);

  const navigablePhases = reviewMode
    ? visiblePhases.filter((p) => completedPhases.includes(p))
    : completedPhases.filter((p) => visiblePhases.indexOf(p) < activeIdx);

  const canGoBack = displayIdx > 0 && navigablePhases.includes(visiblePhases[displayIdx - 1]);
  const canGoForward = reviewMode
    ? displayIdx < visiblePhases.length - 1 && navigablePhases.includes(visiblePhases[displayIdx + 1])
    : displayIdx < activeIdx;

  const isViewingPriorPhase = !reviewMode && displayPhase !== activePhase;

  const prevPhase = canGoBack ? visiblePhases[displayIdx - 1] : null;
  const nextPhase = canGoForward ? visiblePhases[displayIdx + 1] : null;

  const sessionType = (session.session_type ?? "standard") as string;

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
          {reviewMode ? (
            <span className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 dark:border-neutral-700">
              Review
            </span>
          ) : (
            <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
              {(session.session_type ?? "standard").toUpperCase()}
            </span>
          )}
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {PHASE_LABEL[displayPhase]} · Session {session.session_number}
            {displayStreak > 0 && ` · ${displayStreak}-day streak`}
          </span>
          <div className="flex gap-1.5" aria-hidden>
            {visiblePhases.map((p, i) => (
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
          {sessionType === "review" && (
            <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/50 dark:bg-blue-950/30">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Review Session — Cycle {Math.ceil(session.session_number / 7)}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Today we consolidate and connect what you&apos;ve built over the past 7 sessions.
              </p>
            </div>
          )}
          {sessionType === "mastery" && (
            <div className="mb-6 rounded-md border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800/50 dark:bg-purple-950/30">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                Mastery Session — Cycle {Math.ceil(session.session_number / 21)}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                Today we zoom out and take stock of everything you&apos;ve built.
              </p>
            </div>
          )}

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

          {displayPhase === "warmup" && (
            <WarmUpView sessionId={session.id} phaseRow={phaseRow} reviewMode={reviewMode || isViewingPriorPhase} />
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
