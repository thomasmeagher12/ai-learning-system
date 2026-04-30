import { getAnthropic, CLAUDE_MODEL } from "./anthropic";
import type { ConceptRow } from "./concepts";

export type WarmUpContent = {
  recall_prompts: Array<{
    concept_id: string;
    concept_name: string;
    question: string;
  }>;
};

const warmUpTool = {
  name: "emit_warmup_phase",
  description:
    "Generate recall questions for the warm-up phase. One question per concept, asking the user to explain, apply, or connect the concept in their own words.",
  input_schema: {
    type: "object" as const,
    properties: {
      recall_prompts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            concept_id: {
              type: "string",
              description: "The ID of the concept being recalled.",
            },
            concept_name: {
              type: "string",
              description: "The name of the concept.",
            },
            question: {
              type: "string",
              description:
                "A recall question that asks the user to explain, apply, or connect this concept in their own words. Not a definition quiz — ask them to use the concept or relate it to something.",
            },
          },
          required: ["concept_id", "concept_name", "question"],
        },
        description: "One recall prompt per concept.",
      },
    },
    required: ["recall_prompts"],
  },
};

export async function generateWarmUpPhase(
  systemPrompt: string,
  concepts: ConceptRow[],
): Promise<WarmUpContent> {
  const client = getAnthropic();
  const conceptList = concepts
    .map(
      (c) =>
        `- ID: ${c.id} | Name: ${c.concept_name} | Summary: ${c.concept_summary} | Strength: ${c.strength_score}`,
    )
    .join("\n");

  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    tools: [warmUpTool],
    tool_choice: { type: "tool", name: "emit_warmup_phase" },
    messages: [
      {
        role: "user",
        content: `Generate warm-up recall questions for these concepts. Ask the user to explain, apply, or connect each concept — not recite definitions.\n\n${conceptList}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_warmup_phase");
  }
  return block.input as WarmUpContent;
}

export type WarmUpEvaluation = {
  quality: "strong" | "partial" | "weak";
  feedback: string;
};

const evaluateWarmUpTool = {
  name: "evaluate_warmup_response",
  description:
    "Evaluate how well the user recalled a concept. Strong: accurate and in their own words. Partial: mostly right but incomplete. Weak: missing or wrong.",
  input_schema: {
    type: "object" as const,
    properties: {
      quality: {
        type: "string",
        enum: ["strong", "partial", "weak"],
        description:
          "Strong: accurate and in their own words. Partial: mostly right but incomplete. Weak: missing or wrong.",
      },
      feedback: {
        type: "string",
        description:
          "Brief coaching-style feedback. 1–2 sentences. Warm, not corrective. If weak, gently remind them of the key idea without lecturing.",
      },
    },
    required: ["quality", "feedback"],
  },
};

export async function evaluateWarmUpResponse(
  systemPrompt: string,
  args: {
    concept_name: string;
    concept_summary: string;
    question: string;
    response: string;
  },
): Promise<WarmUpEvaluation> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    system: systemPrompt,
    tools: [evaluateWarmUpTool],
    tool_choice: { type: "tool", name: "evaluate_warmup_response" },
    messages: [
      {
        role: "user",
        content: `Concept: ${args.concept_name}\nReference summary: ${args.concept_summary}\n\nQuestion asked: ${args.question}\n\nUser's response: ${args.response}\n\nEvaluate how well they recalled this concept.`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for evaluate_warmup_response");
  }
  const raw = block.input as Record<string, unknown>;
  return {
    quality: (["strong", "partial", "weak"].includes(String(raw.quality))
      ? String(raw.quality)
      : "partial") as "strong" | "partial" | "weak",
    feedback: String(raw.feedback ?? ""),
  };
}

export type ReviewLearnContent = {
  recap_markdown: string;
  calibration_question: string;
};

const reviewLearnTool = {
  name: "emit_review_learn_phase",
  description:
    "Generate the Learn phase for a Review Session. Synthesize the prior cycle's concepts into a narrative — not a list. Include a calibration question.",
  input_schema: {
    type: "object" as const,
    properties: {
      recap_markdown: {
        type: "string",
        description:
          "300–500 words of markdown synthesizing the prior cycle's concepts. Show how they connect and build on each other. Written as a narrative, not a bulleted list.",
      },
      calibration_question: {
        type: "string",
        description:
          "Ask the user what feels solid and what still feels fuzzy from the prior cycle. Open-ended, reflective.",
      },
    },
    required: ["recap_markdown", "calibration_question"],
  },
};

export async function generateReviewLearnPhase(
  systemPrompt: string,
): Promise<ReviewLearnContent> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    tools: [reviewLearnTool],
    tool_choice: { type: "tool", name: "emit_review_learn_phase" },
    messages: [
      {
        role: "user",
        content:
          "This is a Review Session. Generate a narrative synthesis of the concepts from the prior cycle, showing how they connect. Then ask the user what feels solid and what feels fuzzy.",
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_review_learn_phase");
  }
  return block.input as ReviewLearnContent;
}

export type MasteryLearnContent = {
  narrative_markdown: string;
  reflection_prompt: string;
};

const masteryLearnTool = {
  name: "emit_mastery_learn_phase",
  description:
    "Generate the Learn phase for a Mastery Session. Create a longitudinal narrative spanning all prior cycles, grouped by skill domain.",
  input_schema: {
    type: "object" as const,
    properties: {
      narrative_markdown: {
        type: "string",
        description:
          "400–600 words of markdown spanning all prior cycles. Group by skill domain. Frame as 'here is what you have built' — a developmental milestone, not a review.",
      },
      reflection_prompt: {
        type: "string",
        description:
          "Ask: 'What surprises you about how much ground you've covered?' Open-ended, inviting genuine reflection.",
      },
    },
    required: ["narrative_markdown", "reflection_prompt"],
  },
};

export async function generateMasteryLearnPhase(
  systemPrompt: string,
): Promise<MasteryLearnContent> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    tools: [masteryLearnTool],
    tool_choice: { type: "tool", name: "emit_mastery_learn_phase" },
    messages: [
      {
        role: "user",
        content:
          "This is a Mastery Session. Generate a longitudinal narrative spanning all prior cycles, grouped by skill domain. Frame it as a developmental milestone — the user should feel the compounding effect of daily practice.",
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_mastery_learn_phase");
  }
  return block.input as MasteryLearnContent;
}

const extractConceptsTool = {
  name: "extract_session_concepts",
  description:
    "Identify 1–3 key concepts from a completed training session.",
  input_schema: {
    type: "object" as const,
    properties: {
      concepts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            concept_name: {
              type: "string",
              description: "Short name for the concept (3–6 words).",
            },
            concept_summary: {
              type: "string",
              description:
                "1–2 sentence summary of what this concept is and why it matters.",
            },
            skill_domain: {
              type: "string",
              enum: [
                "Prompting & Prompt Engineering",
                "Workflow Design & Automation",
                "Tool Evaluation & Adaptation",
                "System Design & Architecture",
                "API & Integration",
                "Business Application & Consulting",
              ],
              description: "Which skill domain this concept belongs to.",
            },
            curriculum_stage: {
              type: "integer",
              enum: [1, 2, 3, 4, 5, 6, 7],
              description:
                "Which curriculum stage (1–7) this concept belongs to. Match the concept against the Stage Definitions and anchor concept lists in the Curriculum section of the system prompt — pick the lowest stage where the concept fits an anchor.",
            },
          },
          required: [
            "concept_name",
            "concept_summary",
            "skill_domain",
            "curriculum_stage",
          ],
        },
        minItems: 1,
        maxItems: 3,
        description: "1–3 key concepts from the session.",
      },
    },
    required: ["concepts"],
  },
};

export async function extractConceptsFromSession(
  systemPrompt: string,
  phaseDigest: string,
  existingConceptNames: string[] = [],
): Promise<
  Array<{
    concept_name: string;
    concept_summary: string;
    skill_domain: string;
    curriculum_stage: number;
  }>
> {
  const client = getAnthropic();

  const existingBlock = existingConceptNames.length
    ? `\n\nThe user already has these concepts in their library — do NOT extract a concept that overlaps with any of them, even if worded differently (e.g. "RAG basics" overlaps with "Retrieval-Augmented Generation"). Only return genuinely new concepts.\n${existingConceptNames.map((n) => `- ${n}`).join("\n")}`
    : "";

  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    tools: [extractConceptsTool],
    tool_choice: { type: "tool", name: "extract_session_concepts" },
    messages: [
      {
        role: "user",
        content: `Extract 1–3 key concepts from this completed session.${existingBlock}\n\n${phaseDigest}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for extract_session_concepts");
  }
  const raw = block.input as {
    concepts: Array<{
      concept_name: string;
      concept_summary: string;
      skill_domain: string;
      curriculum_stage: number;
    }>;
  };
  return raw.concepts;
}
