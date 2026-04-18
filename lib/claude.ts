import { getAnthropic, CLAUDE_MODEL } from "./anthropic";

export type LearnContent = {
  continuity_message: string;
  topic: string;
  concept_markdown: string;
  comprehension_question: string;
};

const learnTool = {
  name: "emit_learn_phase",
  description:
    "Emit the opening of today's training session: a short continuity message, the Learn-phase concept, and a comprehension question the user must answer to proceed.",
  input_schema: {
    type: "object" as const,
    properties: {
      continuity_message: {
        type: "string",
        description:
          "One short paragraph (2–3 sentences) acknowledging prior progress or welcoming a first session. Warm, not verbose. No headers.",
      },
      topic: {
        type: "string",
        description: "Short name of the concept being taught today.",
      },
      concept_markdown: {
        type: "string",
        description:
          "The Learn-phase teaching content in markdown. 200–400 words. Concise, practical, directly usable. No lecture. Scaffolded to the user's current level.",
      },
      comprehension_question: {
        type: "string",
        description:
          "A single question that forces genuine thinking about the concept — not a recall question. The user must answer it before proceeding to Apply.",
      },
    },
    required: [
      "continuity_message",
      "topic",
      "concept_markdown",
      "comprehension_question",
    ],
  },
};

export type PhaseEvaluation = {
  accepted: boolean;
  feedback: string;
};

const evaluateResponseTool = {
  name: "evaluate_phase_response",
  description:
    "Evaluate the user's response to a phase question. Decide whether it's a genuine attempt and produce short coaching feedback.",
  input_schema: {
    type: "object" as const,
    properties: {
      accepted: {
        type: "boolean",
        description:
          "True if the response is a genuine attempt that engages with the material. It does NOT need to be correct or complete — only to show real thinking. Reject only blank, one-word, nonsense, or clearly off-task responses.",
      },
      feedback: {
        type: "string",
        description:
          "1–3 sentences of coaching feedback. If accepted: brief confirmation, optionally nudge toward deeper thinking. If rejected: warmly point out what's missing and invite another attempt. Never give away the full answer.",
      },
    },
    required: ["accepted", "feedback"],
  },
};

export async function evaluatePhaseResponse(
  systemPrompt: string,
  args: { context: string; question: string; response: string },
): Promise<PhaseEvaluation> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    system: systemPrompt,
    tools: [evaluateResponseTool],
    tool_choice: { type: "tool", name: "evaluate_phase_response" },
    messages: [
      {
        role: "user",
        content: `Content presented:\n\n${args.context}\n\n---\n\nQuestion asked:\n${args.question}\n\n---\n\nUser's response:\n${args.response}\n\n---\n\nEvaluate the response. Scaffold, do not give the answer.`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for evaluate_phase_response");
  }
  return block.input as PhaseEvaluation;
}

export type AdaptContent = {
  trend_content_markdown: string;
  analysis_question: string;
};

const adaptTool = {
  name: "emit_adapt_phase",
  description:
    "Generate the Adapt phase: connect today's session topic to a current AI trend, tool, use case, or real-world scenario. Include an analysis question.",
  input_schema: {
    type: "object" as const,
    properties: {
      trend_content_markdown: {
        type: "string",
        description:
          "200–400 words of markdown connecting the session topic to a specific, current-style real-world AI trend, tool, or use case. Be concrete — name real tools, companies, or scenarios. Written as if briefing someone who needs to apply this knowledge.",
      },
      analysis_question: {
        type: "string",
        description:
          "A single question asking the user to analyze, evaluate, or apply the trend to their own goals. Should require genuine thought, not recall.",
      },
    },
    required: ["trend_content_markdown", "analysis_question"],
  },
};

export async function generateAdaptPhase(
  systemPrompt: string,
  sessionTopic: string,
): Promise<AdaptContent> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    tools: [adaptTool],
    tool_choice: { type: "tool", name: "emit_adapt_phase" },
    messages: [
      {
        role: "user",
        content: `Today's session topic was: "${sessionTopic}". Generate the Adapt phase now — connect this topic to a specific real-world AI trend, tool, or use case the user should know about.`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_adapt_phase");
  }
  return block.input as AdaptContent;
}

export type ApplyContent = {
  task_description: string;
  starter_hint: string;
  success_criteria: string[];
};

const applyTool = {
  name: "emit_apply_phase",
  description:
    "Generate a hands-on Apply task connected to today's Learn topic. The task should involve building, creating, or solving something concrete.",
  input_schema: {
    type: "object" as const,
    properties: {
      task_description: {
        type: "string",
        description:
          "2–3 paragraphs of markdown describing a concrete, hands-on task. Should be achievable in 20–25 minutes. Connected to today's topic and the user's goals. If an active project exists, connect the task to it.",
      },
      starter_hint: {
        type: "string",
        description:
          "A brief nudge (1–2 sentences) to help the user get started without giving away the approach. Think 'where to begin', not 'what to do'.",
      },
      success_criteria: {
        type: "array",
        items: { type: "string" },
        description:
          "2–3 short bullet points describing what a successful attempt looks like. Used by the coach to judge readiness and shown to the user as goals.",
      },
    },
    required: ["task_description", "starter_hint", "success_criteria"],
  },
};

export async function generateApplyPhase(
  systemPrompt: string,
  sessionTopic: string,
): Promise<ApplyContent> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    tools: [applyTool],
    tool_choice: { type: "tool", name: "emit_apply_phase" },
    messages: [
      {
        role: "user",
        content: `Today's topic was: "${sessionTopic}". Generate a hands-on Apply task now. Make it practical and buildable — something the user creates, not just answers.`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_apply_phase");
  }
  return block.input as ApplyContent;
}

export type ApplyTurnResult = {
  feedback: string;
  progression_ready: boolean;
};

const evaluateApplyTool = {
  name: "evaluate_apply_turn",
  description:
    "Evaluate the user's latest Apply-phase submission. Provide coaching feedback and decide if the user has demonstrated enough understanding to progress.",
  input_schema: {
    type: "object" as const,
    properties: {
      feedback: {
        type: "string",
        description:
          "Coaching feedback on the user's latest submission. Adjust depth based on attempt number and quality: early attempts get guiding questions only; after 2–3 weak attempts, offer more structured guidance; only after sustained struggle, provide a fuller walkthrough. Never dump the full solution. 1–5 sentences.",
      },
      progression_ready: {
        type: "boolean",
        description:
          "True only when the user has demonstrated genuine understanding through their work — not just submitted enough times. They should have met most of the success criteria through their own effort, even if imperfectly.",
      },
    },
    required: ["feedback", "progression_ready"],
  },
};

export async function evaluateApplyTurn(
  systemPrompt: string,
  args: {
    taskDescription: string;
    successCriteria: string[];
    conversationHistory: { role: "user" | "assistant"; content: string }[];
    attemptNumber: number;
  },
): Promise<ApplyTurnResult> {
  const client = getAnthropic();

  const applyInstructions = `\n\n## Apply Phase — Active Now
Task given to user:\n${args.taskDescription}

Success criteria:\n${args.successCriteria.map((c) => `- ${c}`).join("\n")}

This is attempt #${args.attemptNumber}. Escalate feedback depth:
- Attempts 1–2: Ask guiding questions. Do not explain the approach.
- Attempts 3–4: Offer a nudge or partial structure. Still hold back the full answer.
- Attempts 5+: Provide more direct guidance, but let the user finish the work.

Judge progression readiness against the success criteria, not just effort.`;

  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt + applyInstructions,
    tools: [evaluateApplyTool],
    tool_choice: { type: "tool", name: "evaluate_apply_turn" },
    messages: args.conversationHistory,
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for evaluate_apply_turn");
  }
  return block.input as ApplyTurnResult;
}

export async function generateLearnPhase(
  systemPrompt: string,
): Promise<LearnContent> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    tools: [learnTool],
    tool_choice: { type: "tool", name: "emit_learn_phase" },
    messages: [
      {
        role: "user",
        content:
          "Generate today's Learn phase now. Pick a concept appropriate for the user's current state given the session number, recent summaries, and any active project.",
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_learn_phase");
  }
  return block.input as LearnContent;
}

export type SessionSummary = {
  what_was_covered: string;
  what_was_built: string;
  key_insight: string;
  areas_to_revisit: string[];
  tomorrow_suggestion: string;
};

const sessionSummaryTool = {
  name: "emit_session_summary",
  description:
    "Generate a brief summary of the completed training session for the user to review.",
  input_schema: {
    type: "object" as const,
    properties: {
      what_was_covered: {
        type: "string",
        description:
          "1–2 sentences: what concept was taught and explored today.",
      },
      what_was_built: {
        type: "string",
        description:
          "1–2 sentences: what the user built or created in the Apply phase.",
      },
      key_insight: {
        type: "string",
        description:
          "1 sentence: the most important takeaway from this session.",
      },
      areas_to_revisit: {
        type: "array",
        items: { type: "string" },
        description:
          "0–3 short items the user could strengthen, based on their responses.",
      },
      tomorrow_suggestion: {
        type: "string",
        description:
          "1–2 sentences: what would be a natural next step or topic for the next session.",
      },
    },
    required: [
      "what_was_covered",
      "what_was_built",
      "key_insight",
      "areas_to_revisit",
      "tomorrow_suggestion",
    ],
  },
};

export async function generateSessionSummary(
  systemPrompt: string,
  phaseDigest: string,
): Promise<SessionSummary> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    tools: [sessionSummaryTool],
    tool_choice: { type: "tool", name: "emit_session_summary" },
    messages: [
      {
        role: "user",
        content: `The session is now complete. Here is a digest of all phases:\n\n${phaseDigest}\n\nGenerate a brief, useful session summary.`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return tool_use for emit_session_summary");
  }
  return block.input as SessionSummary;
}
