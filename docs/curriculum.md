# ADTS Curriculum Map
## Grounded in Anthropic Academy + AI Strategy Synthesis (Self-Authored Capstone)

This document maps the Anthropic Academy course catalog to a structured, mastery-based progression. A self-authored capstone stage (Stage 7) extends the technical foundation into AI strategy and consulting.

The system prompt in `lib/prompt.ts` loads this document to anchor concept generation to real course content rather than Claude's general knowledge.

---

## Stage Progression vs. Session Cycle (Two Independent Layers)

The system operates on **two layers that progress independently**:

**Layer 1 — Session Cycle (Fixed):**
The 7/21 review and mastery cadence defined in the PRD continues unchanged. Every 7th session is a Review Session; every 21st is a Mastery Session. This layer is the *retention scaffolding* — it ensures consolidation and long-lag retrieval regardless of curriculum content.

**Layer 2 — Stage Progression (Mastery-Based):**
Stages advance based on demonstrated competence, not session count. A stage is complete when its anchor concepts have been introduced and reach the strength threshold defined in its advancement criteria. Some stages will take 7 sessions; others will take 12. Topics that take longer to grasp get more time.

**Why this matters:**
- Mastery-based progression aligns with mastery learning theory (Bloom) — advancement is tied to demonstrated understanding, not seat time.
- Review and Mastery Sessions can fall mid-stage. That's fine — they consolidate whatever has been learned to that point and draw from the full concept history.
- The session cycle and stage progression do not need to align. Their independence is a deliberate design choice.

---

## Course Catalog

### Course 1: Claude 101
**Source:** https://anthropic.skilljar.com/claude-101
**Used in:** Stages 1–2

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| What is Claude? | LLM fundamentals, Claude's capabilities and limitations, how generative AI works |
| Your first conversation with Claude | Conversation structure, turn-taking, context windows |
| Getting better results | Basic prompting principles, clarity, specificity, iteration |
| Claude desktop app: Chat, Cowork, Code | Tool landscape — chat vs. Cowork vs. Code, when to use each |
| Organizing your work and knowledge | Projects, knowledge management, persistent context |
| Introduction to projects | Project structure, scoping work with Claude |
| Creating with artifacts | Artifact generation, output formats, use cases |
| Working with skills | Skills as reusable instructions, workflow building |
| Expanding Claude's reach | Connectors, integrations, extending Claude's capabilities |
| Connecting your tools | Tool connections, MCP at a surface level |
| Enterprise search | Search integration, knowledge retrieval |
| Research mode for deep dives | Deep research workflows, source evaluation |
| Claude in action: use-cases by role | Real-world application by profession and context |
| Putting it all together | End-to-end workflow synthesis |

---

### Course 2: AI Fluency — Framework & Foundations
**Source:** https://anthropic.skilljar.com/ai-fluency-framework-foundations
**Used in:** Stages 1–2
**Framework:** The 4D Framework — Delegation, Description, Discernment, Diligence

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| AI Fundamentals & Framework (10 lessons) | Generative AI systems, capabilities and limitations, the 4D Framework overview, strategic vs. reactive AI use |
| Delegation | Deciding what to delegate to AI, scoping tasks appropriately, when NOT to delegate |
| Description | Crafting effective prompts, context-setting, constraints, role assignment, iteration |
| Discernment | Evaluating AI outputs critically, identifying errors and hallucinations, quality assessment |
| Diligence | Ethical use, responsible AI collaboration, transparency, verification |
| Description-Discernment Loop | Iterative prompt refinement, systematic improvement of outputs |
| Project planning with AI | Structuring complex tasks, breaking work into AI-appropriate chunks |
| Practical application: creative contexts | AI in creative work, co-creation, maintaining voice |
| Practical application: business contexts | AI in business workflows, productivity, decision support |
| Practical application: educational contexts | AI in learning, research, academic integrity |

---

### Course 3: Building with the Claude API
**Source:** https://anthropic.skilljar.com/claude-with-the-anthropic-api
**Used in:** Stages 3–6
**Prerequisites:** Python proficiency, JSON handling, API key access

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| **Getting Started with Claude (16 lessons)** | |
| API authentication | Auth patterns, API keys, security best practices |
| Basic API requests | Request structure, model selection, response handling |
| Conversation management | Multi-turn conversations, message history, context management |
| System prompts | System prompt design, behavioral instruction, role setting |
| Structured output generation | JSON mode, output schemas, parsing responses |
| **Prompt Engineering & Evaluation (16 lessons)** | |
| Prompting strategies | Chain-of-thought, few-shot, zero-shot, role prompting |
| Evaluation frameworks | Defining success criteria, rubric design |
| Systematic testing | Automated eval pipelines, prompt versioning |
| Prompt iteration | A/B testing prompts, regression testing |
| **Tool Use with Claude (14 lessons)** | |
| Function calling | Tool definitions, input schemas, output handling |
| Multi-turn tool interactions | Chaining tool calls, state management |
| Batch tool calling | Parallel tool execution, efficiency patterns |
| Built-in utilities | Web search, code execution, file handling |
| **Retrieval Augmented Generation (10 lessons)** | |
| Text chunking | Chunking strategies, overlap, size tradeoffs |
| Embeddings | Embedding models, vector representations, similarity search |
| Hybrid search | BM25 + vector search, reranking, multi-index architectures |
| Contextual retrieval | Retrieval-augmented context, relevance tuning |
| **Model Context Protocol (12 lessons)** | |
| MCP architecture | Client-server model, protocol fundamentals |
| MCP server implementation | Tools, resources, prompts as primitives |
| MCP client implementation | Connecting applications to MCP servers |
| **Claude Code & Computer Use (8 lessons)** | |
| Claude Code in development workflows | Agentic coding, context management, CLAUDE.md |
| Computer use | UI automation, browser control |
| **Agents and Workflows (11 lessons)** | |
| Agent architectures | Autonomous agents, tool-using agents, orchestration |
| Parallel execution | Concurrent tool use, fan-out patterns |
| Operation chaining | Sequential workflows, conditional routing |
| Debugging agents | Observability, error handling, recovery patterns |

---

### Course 4: Introduction to Model Context Protocol
**Source:** https://anthropic.skilljar.com/introduction-to-model-context-protocol
**Used in:** Stage 5
**Prerequisites:** Python, async/await, API familiarity

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| **MCP Fundamentals & Server Development (8 lessons)** | |
| MCP architecture and rationale | Why MCP exists, client-server model, protocol design decisions |
| Building MCP servers | Python SDK, server setup, exposing tools |
| Tool primitives | Defining tools, input schemas, handler functions |
| Testing with MCP Inspector | Debugging servers, inspecting tool calls |
| **MCP Client Implementation & Advanced Features (8 lessons)** | |
| Building MCP clients | Connecting to MCP servers from applications |
| Resources | Exposing data sources directly through MCP |
| Prompts as primitives | Pre-built prompt templates via MCP |
| Complete application flow | End-to-end MCP integration, document management project |

---

### Course 5: Claude Code in Action
**Source:** https://anthropic.skilljar.com/claude-code-in-action
**Used in:** Stage 4
**Prerequisites:** Command line familiarity, Claude Code access

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| How coding assistants work | Agentic loop, Explore-Plan-Code-Commit workflow |
| Setup and context management | /init, CLAUDE.md files, @ mentions, context window management |
| Making changes with Claude Code | File manipulation, command execution, code analysis tools |
| Hotkeys and conversation control | Workflow efficiency, interruption, redirection |
| Plan Mode and Thinking Mode | Complex task planning, deeper reasoning for hard problems |
| Custom commands | Automating repetitive workflows, slash commands |
| MCP integration with Claude Code | Extending Claude Code with external services |
| GitHub integration | Automated PR reviews, issue handling, repo workflows |
| Hooks | Adding custom behavior into Claude Code's execution |

---

### Course 6: Introduction to Subagents
**Source:** https://anthropic.skilljar.com/introduction-to-subagents
**Used in:** Stage 6

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| How subagents work | Isolated context windows, input/output flow, summary return |
| Creating custom subagents | /agents command, defining subagent roles |
| Designing effective subagents | Structured outputs, obstacle reporting, tool access limits |
| Subagent patterns | Code reviewers, documentation generators, specialized agents |
| When to use subagents | Decision framework for delegation vs. direct work |
| Anti-patterns | Common mistakes, context bloat, over-delegation |

---

### Course 7: AI Strategy Synthesis (Self-Authored)
**Source:** Self-authored, drawing on the NIST AI Risk Management Framework, the EU AI Act, ISO/IEC 42001, Gartner / McKinsey / BCG strategy frameworks, and the technical foundation built across Stages 1–6
**Used in:** Stage 7 (capstone)
**Prerequisites:** Stage 6 mastery (substantive technical builds across API, tools, MCP, and agents)

**Modules & Key Concepts:**

| Module | Key Concepts |
|---|---|
| AI vendor landscape | Claude vs. OpenAI vs. Gemini vs. open-source — capability tradeoffs, pricing models, deployment options, evaluation criteria |
| Capability assessment | Mapping business problems to AI capabilities, identifying poor fits, distinguishing hype from utility |
| Build vs. buy vs. integrate | Decision framework for when to build custom, use SaaS, or integrate via API/agents |
| AI governance frameworks | NIST AI RMF, EU AI Act fundamentals, ISO/IEC 42001 — the regulatory landscape for AI deployment |
| AI risk taxonomy | Hallucination, IP/copyright, data privacy, security, fairness, model drift — risk identification and mitigation |
| Business case construction | ROI models, KPI selection, pilot design, measuring AI impact, common measurement pitfalls |
| Industry application patterns | Cross-industry case studies — finance, healthcare, legal, retail, professional services |
| Change management for AI | Organizational adoption, human-AI workflow design, training programs, addressing resistance |
| Vendor evaluation deliverable | Producing a structured vendor comparison memo for a real or hypothetical client |
| Capstone consulting engagement | End-to-end AI strategy proposal: vendor recommendation, governance plan, ROI model, phased rollout, risk register |

The Adapt phase in Stage 7 sessions should pull live, current articles, reports, and tool announcements via web search — this stage cannot rely on static training-data knowledge of "the AI landscape" because that landscape changes monthly.

---

## Stage Definitions

The system advances through stages based on mastery, not session count. Suggested durations are estimates for planning, not enforced limits. Stage advancement criteria are checked against the concept log.

### Stage 1 — Foundations
**Courses:** Claude 101, AI Fluency intro
**Focus:** Understanding what AI is, how Claude works, basic prompting, the 4D Framework

**Anchor concepts:**
- What generative AI is and how it works
- Claude's capabilities and limitations
- The 4D Framework: Delegation, Description, Discernment, Diligence
- Basic prompting: clarity, context, constraints
- When and what to delegate to AI
- Iterating on outputs (Description-Discernment loop)
- Organizing work with Projects

**Advancement criteria:** 5 of 7 anchor concepts at strength_score ≥ 0.6, AND at least one Review Session completed during the stage
**Suggested duration:** 6–9 sessions
**Session type:** Standard only — warm-up recall has no concepts to draw from yet

---

### Stage 2 — Practical AI Skills
**Courses:** AI Fluency (Practical Skills), Claude 101 (advanced modules)
**Focus:** Hands-on prompting competency, output evaluation, real-world application

**Anchor concepts:**
- Crafting structured prompts with role, context, constraints
- Evaluating outputs critically — spotting errors, hallucinations, gaps
- The Description-Discernment loop in practice
- Delegation decisions — scoping tasks appropriately
- Diligence: responsible use, verification, transparency
- Applying AI to creative, business, and educational contexts
- Artifacts — generating and using structured outputs
- Research mode — deep dives, source evaluation

**Advancement criteria:** 6 of 8 anchor concepts at strength_score ≥ 0.6, AND learner can independently complete a multi-turn prompting task with discernment
**Suggested duration:** 7–10 sessions
**Session type:** Standard with warm-up recall (drawing from Stage 1)

---

### Stage 3 — API Foundations
**Courses:** Building with the Claude API (Getting Started + Prompt Engineering sections)
**Focus:** Moving from using Claude to building with Claude

**Anchor concepts:**
- API authentication and request structure
- Multi-turn conversation management
- System prompt design and behavioral instruction
- Structured output generation (JSON mode, schemas)
- Prompting strategies: chain-of-thought, few-shot, zero-shot
- Evaluation frameworks: success criteria, rubric design
- Systematic prompt testing and iteration

**Advancement criteria:** 5 of 7 anchor concepts at strength_score ≥ 0.6, AND learner can build a small Claude API application from scratch
**Suggested duration:** 7–10 sessions
**Session type:** Standard with warm-up recall

---

### Stage 4 — Tools, Workflows & Claude Code
**Courses:** Building with the Claude API (Tool Use), Claude Code in Action
**Focus:** Extending Claude with tools, building real workflows, agentic coding

**Anchor concepts:**
- Function calling: tool definitions, input schemas, handlers
- Multi-turn tool interactions and state management
- Batch tool calling and parallel execution
- Claude Code: agentic loop, Explore-Plan-Code-Commit
- Context management: CLAUDE.md, /init, @ mentions
- Custom commands and workflow automation
- GitHub integration for development workflows
- Tool error handling and recovery patterns

**Advancement criteria:** 6 of 8 anchor concepts at strength_score ≥ 0.6, AND learner has built at least one working tool-using application
**Suggested duration:** 8–12 sessions
**Session type:** Standard with warm-up recall

---

### Stage 5 — RAG, MCP & Integration
**Courses:** Building with the Claude API (RAG + MCP sections), Introduction to MCP
**Focus:** Data integration, retrieval systems, modular AI architecture

**Anchor concepts:**
- Text chunking strategies and tradeoffs
- Embeddings and vector similarity search
- Hybrid search: BM25 + vector, reranking
- Contextual retrieval and relevance tuning
- MCP architecture: client-server model, protocol design
- Building MCP servers: tools, resources, prompts as primitives
- Building MCP clients: connecting applications to servers
- Resources for direct data access
- Testing and debugging MCP with MCP Inspector

**Advancement criteria:** 7 of 9 anchor concepts at strength_score ≥ 0.6, AND learner has built either a working RAG pipeline or a functional MCP server
**Suggested duration:** 9–13 sessions
**Session type:** Standard with warm-up recall

---

### Stage 6 — Agent Architecture & System Design
**Courses:** Building with the Claude API (Agents section), Introduction to Subagents
**Focus:** Designing and building autonomous AI systems. This stage is the deepest technical stage in the curriculum and should not be rushed — it produces the artifacts the Stage 7 capstone will reference.

**Anchor concepts:**
- Agent architectures: tool-using agents, orchestration patterns
- Parallel execution and fan-out patterns
- Operation chaining and conditional routing
- Debugging and observability for agents
- Subagent architecture: isolated contexts, input/output design
- Designing effective subagents: structured outputs, tool limits
- Decision framework: when to use subagents vs. direct work
- Anti-patterns in agentic system design
- Multi-agent orchestration patterns
- Agent evaluation and reliability testing

**Advancement criteria:** 8 of 10 anchor concepts at strength_score ≥ 0.6, AND learner has built **at least two substantive agent systems** — one single-agent with tools, one multi-agent or subagent system. These builds become reference artifacts for Stage 7 case studies.
**Suggested duration:** 10–14 sessions
**Session type:** Standard with warm-up recall

---

### Stage 7 — AI Strategy Synthesis (Capstone)
**Courses:** Course 7 (self-authored), drawing on all prior stages and live current sources via web search
**Focus:** Translating technical capability into client-facing strategy. The shift is from *"I can build this"* to *"I can advise a business on whether, how, and with whom to build this."*

**Anchor concepts:**
- AI vendor landscape and capability comparison
- Build vs. buy vs. integrate decision framework
- NIST AI RMF and AI governance fundamentals
- AI risk identification and mitigation strategies
- ROI modeling and business case construction
- Pilot design and evaluation methodology
- Industry-specific AI application patterns
- AI change management and adoption frameworks
- Vendor evaluation memo (deliverable)
- Capstone client proposal (deliverable)

**Advancement criteria:** Learner produces (a) a written vendor comparison memo and (b) a full capstone AI strategy proposal for a hypothetical client. Both are evaluated by the system against a structured rubric in the Apply phase.
**Suggested duration:** 8–12 sessions
**Session type:** Standard with warm-up recall drawing from all prior stages
**Capstone Mastery Session:** A "graduation" Mastery Session at the conclusion of Stage 7, framed as: *"You've moved from learning AI to advising on AI. Here is the full skill set you've built."*

---

## Coverage Tracking

The system tracks which concepts have been introduced using the `concepts` table. The current schema includes a legacy `skill_domain` field, retained for backward compatibility, but stage progression is the authoritative organizing principle.

When generating concepts at session completion:

- Reference the course and module the concept came from in `concept_summary`
- Note the stage in the concept_summary (e.g., "Stage 3: API authentication patterns from Building with the Claude API")
- The system prompt uses the concept log to determine which stage the learner is in and what has not yet been covered

---

## Transition Rules

The system prompt should use this document to enforce mastery-based progression:

1. **Do not introduce Stage N+1 concepts until Stage N advancement criteria are met.** Check the concept log against the criteria for the current stage. If criteria are not met, today's Learn topic must come from the current stage's anchor list.

2. **Prefer concepts from the current stage anchor list** when selecting today's Learn topic. Only branch out when the anchor list is exhausted or the learner's skill estimate suggests readiness for the next stage.

3. **Never repeat a concept that has strength_score above 0.7** in the Learn phase. That concept is consolidated — use it in Apply or warm-up recall instead.

4. **Review and Mastery Sessions draw from the full concept history**, not just the current stage. The curriculum stage is a guide for new concept introduction only. Review and Mastery sessions are not gated by stage — they happen on the 7/21 cycle regardless.

5. **Stage 6 should not be rushed.** Two substantive agent builds are a hard prerequisite for Stage 7. The system should resist advancing to Stage 7 until both builds exist as concrete artifacts the learner can reference.

6. **Stage 7 Adapt phases must use live current sources** via web search. Do not generate "AI vendor landscape" or "industry application" content from training-data knowledge alone — that landscape shifts monthly and stale content undermines the consulting framing.

---

## Research Grounding

This curriculum is grounded in the following Anthropic Academy courses, all available at anthropic.skilljar.com:

- Claude 101
- AI Fluency: Framework & Foundations (Dakan & Feller, Ringling College / UCC, 2023–2024)
- Building with the Claude API
- Introduction to Model Context Protocol
- Claude Code in Action
- Introduction to Subagents

The AI Fluency Framework (4D: Delegation, Description, Discernment, Diligence) is a peer-informed framework developed in partnership with Anthropic and grounded in research on AI-human collaboration in creative and business contexts. It provides the conceptual spine of Stages 1–2 and informs the Reflect phase questions throughout the system.

Stage 7 (AI Strategy Synthesis) is self-authored and draws on:
- NIST AI Risk Management Framework (NIST AI 100-1)
- EU AI Act
- ISO/IEC 42001 (AI Management Systems)
- Industry strategy reports (McKinsey State of AI, BCG, Gartner)
- Live sources via web search (current at session time)

The mastery-based stage progression model is grounded in **mastery learning theory** (Bloom, 1968) — advancement is tied to demonstrated competence rather than seat time. The retention scaffolding (the 7/21 review/mastery cycle) is grounded in **spaced repetition** (Ebbinghaus), **retrieval practice** (Roediger & Karpicke), and **desirable difficulties** (Bjork). These two layers operating independently is a deliberate design conjecture: progression should respond to the learner; retention scaffolding should not.

This document should be cited in research outputs as the basis for the claim that the ADTS curriculum is "grounded in the Anthropic Academy course catalog with a self-authored AI strategy synthesis capstone, structured as a mastery-based progression with independent retention scaffolding."
