import fs from "node:fs";
import path from "node:path";
import type { MemorySummary } from "./claude";
import type { ConceptRow } from "./concepts";

const DOCS_DIR = path.join(process.cwd(), "docs");

function readDoc(name: string): string {
  return fs.readFileSync(path.join(DOCS_DIR, name), "utf8");
}

const ABOUT_ME = readDoc("about-me.md");
const LEARNING_STYLE = readDoc("learning-style.md");
const OPERATIONAL = readDoc("system-goal-operational.md");
const FULL_GOAL = readDoc("system-goal-full.md");
const CURRICULUM = readDoc("curriculum.md");

export type RecentSummary = {
  session_number: number;
  summary: unknown;
  completed_at: string | null;
};

export type ActiveProject = {
  title: string;
  state: unknown;
};

export type RecentMemory = {
  session_number: number;
  memory_summary: MemorySummary;
};

export function buildSystemPrompt(ctx: {
  sessionNumber: number;
  currentStage: number;
  activeProject: ActiveProject | null;
  recentSummaries: RecentSummary[];
  recentMemories?: RecentMemory[];
  sessionType?: "standard" | "review" | "mastery";
  reviewCycle?: number;
  masteryCycle?: number;
  warmUpConcepts?: ConceptRow[];
  allConcepts?: ConceptRow[];
}): string {
  const recent = ctx.recentSummaries.length
    ? JSON.stringify(ctx.recentSummaries, null, 2)
    : "None — this is the first session.";
  const project = ctx.activeProject
    ? `Active project: ${ctx.activeProject.title}\nProject state: ${JSON.stringify(ctx.activeProject.state)}`
    : "No active project.";

  const memories = ctx.recentMemories && ctx.recentMemories.length > 0
    ? ctx.recentMemories
        .map((m) => {
          const s = m.memory_summary;
          const parts = [
            `Topics learned: ${s.topics_learned.join(", ")}`,
            `Strengths: ${s.strengths.join(", ")}`,
            `Weaknesses: ${s.weaknesses.length > 0 ? s.weaknesses.join(", ") : "None identified"}`,
            `Revisit: ${s.areas_to_revisit.length > 0 ? s.areas_to_revisit.join(", ") : "None"}`,
          ];
          return `Session ${m.session_number}: ${parts.join(". ")}.`;
        })
        .join("\n")
    : null;

  let sessionDirective = "";

  if (ctx.sessionType === "standard" && ctx.warmUpConcepts && ctx.warmUpConcepts.length > 0) {
    const conceptList = ctx.warmUpConcepts
      .map((c) => `- ${c.concept_name}: ${c.concept_summary}`)
      .join("\n");
    sessionDirective = `## Recall Warm-Up
Before the Learn phase, the user will recall these concepts:
${conceptList}
Do not re-teach these concepts in the Learn phase today.

`;
  } else if (ctx.sessionType === "review" && ctx.reviewCycle) {
    sessionDirective = `## Session Type: Review Session (Cycle ${ctx.reviewCycle})
This is a Review Session. Do not introduce new concepts. All content should consolidate and synthesize the prior 6-session cycle while drawing connections to earlier cycles where relevant. The energy is consolidating — help the user make sure what they've learned is solid before moving forward.

`;
  } else if (ctx.sessionType === "mastery" && ctx.masteryCycle) {
    sessionDirective = `## Session Type: Mastery Session (Cycle ${ctx.masteryCycle})
This is a Mastery Session. Do not introduce new concepts. All content should span the full concept history. Prioritize long-lag retrieval of older concepts and synthesis across skill domains. Frame the session as a developmental milestone — the user should feel the compounding effect of daily practice.

`;
  }

  let conceptHistory = "";
  if (
    (ctx.sessionType === "review" || ctx.sessionType === "mastery") &&
    ctx.allConcepts &&
    ctx.allConcepts.length > 0
  ) {
    const conceptLines = ctx.allConcepts
      .map((c) => {
        const stage = c.curriculum_stage ? `Stage ${c.curriculum_stage}` : "Stage —";
        return `- ${c.concept_name} (${stage}, ${c.skill_domain}) — Session ${c.source_session}, strength: ${c.strength_score.toFixed(2)}. ${c.concept_summary}`;
      })
      .join("\n");
    conceptHistory = `## Full concept history
${conceptLines}

`;
  }

  return `You are the AI trainer in the user's AI Daily Training System. You run a focused ~60-minute daily session in four phases: Learn → Apply → Adapt → Reflect. Treat every session as practice, not a course.

## About the user
${ABOUT_ME}

## How the user learns
${LEARNING_STYLE}

## How to run this system (operational)
${OPERATIONAL}

## Full system goal (context)
${FULL_GOAL}

## Curriculum (source of truth for topic selection)
${CURRICULUM}

## Current state
Session number: ${ctx.sessionNumber}
Current curriculum stage: Stage ${ctx.currentStage}
${project}
Recent session summaries (most recent first):
${recent}

${memories ? `## Memory across recent sessions
${memories}

Use this rolling memory to avoid re-teaching mastered topics, build on demonstrated strengths, and address recurring weaknesses. Earlier sessions carry less weight than recent ones.

` : ""}${sessionDirective}${conceptHistory}## Behavioral rules
- The user is in **Stage ${ctx.currentStage}** of the curriculum. This is computed deterministically from the concept log — do not second-guess it. Today's Learn topic MUST come from Stage ${ctx.currentStage}'s anchor concept list in the Curriculum section above. Do not pull topics from any other stage, even if recent session summaries point in a different direction.
- If recent session summaries describe work from a higher stage than ${ctx.currentStage}, that is prior out-of-order practice — acknowledge it briefly in the continuity message ("we've touched some of this before in a different framing") but still anchor today's Learn topic in Stage ${ctx.currentStage}.
- Pick a Stage ${ctx.currentStage} anchor concept that is NOT yet present in the concept history above (or is present but at strength_score < 0.6). Foundations first.
- Scaffold, do not spoon-feed. No full answers until the user has tried.
- Keep tasks in the user's Zone of Proximal Development — slightly beyond current ability but achievable in the phase's time budget.
- Prioritize action and real-world application over explanation.
- Reference prior progress when relevant — the system has memory.
- Never say "as an AI". Speak directly, like a coach.`;
}
