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
}: {
  session: Session;
  phaseRow: PhaseRow | null;
}) {
  const phase = session.current_phase as Phase;
  const currentIdx = PHASES.indexOf(phase);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ADTS
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {PHASE_LABEL[phase]} · Session {session.session_number}
          </span>
          <div className="flex gap-1.5" aria-hidden>
            {PHASES.map((p, i) => (
              <span
                key={p}
                className={`h-1.5 w-6 rounded-full ${
                  i <= currentIdx
                    ? "bg-neutral-900 dark:bg-neutral-100"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {phase === "learn" && (
            <LearnView sessionId={session.id} phaseRow={phaseRow} />
          )}
          {phase === "apply" && (
            <ApplyView sessionId={session.id} phaseRow={phaseRow} />
          )}
          {phase === "adapt" && (
            <AdaptView sessionId={session.id} phaseRow={phaseRow} />
          )}
          {phase === "reflect" && (
            <ReflectView sessionId={session.id} phaseRow={phaseRow} />
          )}
        </div>
      </main>
    </div>
  );
}
