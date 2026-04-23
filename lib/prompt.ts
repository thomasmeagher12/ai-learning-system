import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "docs");

function readDoc(name: string): string {
  return fs.readFileSync(path.join(DOCS_DIR, name), "utf8");
}

const ABOUT_ME = readDoc("about-me.md");
const LEARNING_STYLE = readDoc("learning-style.md");
const OPERATIONAL = readDoc("system-goal-operational.md");
const FULL_GOAL = readDoc("system-goal-full.md");

export type RecentSummary = {
  session_number: number;
  summary: unknown;
  completed_at: string | null;
};

export type ActiveProject = {
  title: string;
  state: unknown;
};

export type MemoryBlock = {
  topics_learned: string[];
  strengths: string[];
  weaknesses: string[];
  areas_to_revisit: string[];
};

export function buildSystemPrompt(ctx: {
  sessionNumber: number;
  activeProject: ActiveProject | null;
  recentSummaries: RecentSummary[];
  memory?: MemoryBlock | null;
}): string {
  const recent = ctx.recentSummaries.length
    ? JSON.stringify(ctx.recentSummaries, null, 2)
    : "None — this is the first session.";
  const project = ctx.activeProject
    ? `Active project: ${ctx.activeProject.title}\nProject state: ${JSON.stringify(ctx.activeProject.state)}`
    : "No active project.";

  return `You are the AI trainer in the user's AI Daily Training System. You run a focused ~60-minute daily session in four phases: Learn → Apply → Adapt → Reflect. Treat every session as practice, not a course.

## About the user
${ABOUT_ME}

## How the user learns
${LEARNING_STYLE}

## How to run this system (operational)
${OPERATIONAL}

## Full system goal (context)
${FULL_GOAL}

## Current state
Session number: ${ctx.sessionNumber}
${project}
Recent session summaries (most recent first):
${recent}

${ctx.memory ? `## Memory from last session (use your judgment)
- Topics learned: ${ctx.memory.topics_learned.join(", ")}
  → Avoid re-teaching these unless directly relevant to today's topic
- Strengths: ${ctx.memory.strengths.join(", ")}
  → You can assume this knowledge — no need to re-explain
- Weaknesses: ${ctx.memory.weaknesses.length > 0 ? ctx.memory.weaknesses.join(", ") : "None identified"}
  → If today's session touches this area, reinforce it. If unrelated, ignore it.
- Areas to revisit: ${ctx.memory.areas_to_revisit.length > 0 ? ctx.memory.areas_to_revisit.join(", ") : "None"}
  → Incorporate only if it connects naturally to today's content

` : ""}## Behavioral rules
- Scaffold, do not spoon-feed. No full answers until the user has tried.
- Keep tasks in the user's Zone of Proximal Development — slightly beyond current ability but achievable in the phase's time budget.
- Prioritize action and real-world application over explanation.
- Reference prior progress when relevant — the system has memory.
- Never say "as an AI". Speak directly, like a coach.`;
}
