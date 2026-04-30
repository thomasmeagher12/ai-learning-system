# Product Requirements Document
## AI Daily Training System (ADTS)
**Version:** 1.0 — MVP  
**Author:** Personal Project  
**Status:** Draft  
**Date:** April 2026

---

## 1. Overview

### 1.1 Product Summary
The AI Daily Training System (ADTS) is a web-based, AI-powered personal training platform that delivers a structured, adaptive, ~60-minute daily session to build real-world AI skills through consistent, compounding practice.

It is not a course, a chat tool, or a content library. It is a focused training environment — purpose-built for daily use, with intelligent memory, adaptive content, and required engagement.

### 1.2 Core Value Proposition
**What makes this different from just using ChatGPT or Claude:**
- Structured daily session format (Learn → Apply → Adapt → Reflect)
- Persistent memory across sessions — the system knows where you left off
- Scaffolded, coaching-style interaction (not answer-first)
- Required engagement before progression (no passive clicking)
- Continuous adaptation based on real progress, not a static curriculum
- Feels like entering a training environment, not opening a chat window

---

## 2. Target User

### 2.1 Primary User (MVP)
A single user: a 23-year-old graduate student (UCSB, Master's in Education — Technology & Learning) with a finance and MIS undergraduate background. Interested in AI, blockchain, and business applications of technology. Goal is to build AI systems, consult businesses on AI implementation, and create scalable tech products.

**Learning preferences:**
- Short, focused, hands-on sessions
- Challenged to think before being given answers
- Prefers practical, real-world learning over theory

### 2.2 Future Users
If the system proves effective, it should be architecturally extensible to support multiple users. This is a non-priority for MVP but should not be architecturally blocked.

---

## 3. Product Goals

### 3.1 Primary Goals (MVP)
- Deliver a focused, immersive daily training session each day
- Generate session content dynamically via Claude (AI), personalized to progress
- Track memory across sessions so the experience feels continuous
- Require active engagement — no passive completion
- Feel intentional and coach-like, not like a chatbot

### 3.2 Non-Goals (MVP)
- Multi-user support
- Mobile-native app
- Social/community features
- Marketplace or monetization layer
- Course library or content catalog

---

## 4. User Experience

### 4.1 Entry Point — Landing Page
The landing page is minimal and high-intent. It contains:
- A strong visual identity (clean, focused aesthetic)
- A single CTA: **"Start Daily Session"**
- Optional: Streak display and light progress indicator (secondary, never dominant)

The experience should communicate: *"I'm about to train."* — not "browse content" or "open a tool."

### 4.2 Session Flow
Each session follows a strict 4-phase structure displayed as sequential full-screen slides or screens.

Navigation: the user progresses via a **"Next"** button — but only after meeting an engagement requirement for that phase. There is no skipping.

```
[Landing] → [Learn] → [Apply] → [Adapt] → [Reflect] → [Session Complete]
```

Each screen is:
- Visually clean and minimal
- Focused on one task at a time
- Clearly labeled with the current phase and objective

### 4.3 Phase Specifications

#### Phase 1: Learn (10–15 min)
- Claude introduces a focused, practical AI concept
- Content is concise, directly usable, and scaffolded to current skill level
- **Engagement requirement:** User must answer a comprehension question or brief prompt before proceeding
- Early sessions may draw from foundational sources (e.g., Anthropic AI courses); this phases out over time

#### Phase 2: Apply (20–25 min)
- Claude presents a hands-on task (building, creating, or problem solving)
- Task is connected to the day's concept and user's current project (if active)
- **Engagement requirement:** User must submit a genuine attempt before receiving feedback
- Claude responds adaptively based on the quality of the attempt:
  - Struggling → hint + guiding question
  - Partial → nudge toward refinement
  - Strong → confirmation + follow-up challenge
- Feedback escalates in depth across turns (light → structured → full explanation)
- Progression requires demonstrated understanding, not just a response

**Project logic:**
- If user has a project in progress → system continues it
- If user specifies a project idea → system incorporates it
- If user has no idea → system generates a relevant project based on skill level and trends

#### Phase 3: Adapt (15–20 min)
- Claude connects the session topic to real-world AI trends, tools, or use cases
- Content is dynamically generated and updated (not static)
- May include: current AI news, relevant tools, business/education scenarios
- **Engagement requirement:** User responds to a brief prompt or analysis question

#### Phase 4: Reflect (5–10 min)
- Claude asks structured reflection questions:
  - What worked well?
  - What didn't work?
  - What would you change?
  - What did you learn about using AI?
- **Engagement requirement:** User must submit a written reflection to complete the session
- This phase is REQUIRED — it cannot be skipped

### 4.4 Session Complete Screen
After the Reflect phase:
- Brief session summary (what was covered, what was built)
- Streak updated
- Optional prompt: "Anything you want to continue or build on tomorrow?"

---

## 5. AI & Content Generation

### 5.1 Content Engine
All session content is generated dynamically by Claude (claude-sonnet-4 via Anthropic API).

Each session is generated fresh based on:
- Session history (topics covered, tasks completed)
- Current skill level (system-estimated, continuously updated)
- Projects in progress
- Past performance and weak areas
- Real-world AI trends (optionally via web search tool)

### 5.2 Curriculum Logic
- **Early stage:** Loosely guided by foundational AI material (e.g., Anthropic AI Fluency courses) — used as a structural baseline, not rigid curriculum
- **Mid stage:** Shifts toward applied tasks, real-world workflows, and independent building
- **Long-term:** Fully driven by real-world problems, current trends, and user-defined projects

### 5.3 Scaffolding Principles (Claude Behavior)
- Never give full answers immediately
- Encourage attempts before providing hints
- Escalate support only after effort is shown
- Ask follow-up questions that deepen understanding
- Evaluate quality of response, not just presence of response
- Determine progression readiness based on demonstrated understanding

### 5.4 System Prompt Architecture
Claude receives a structured system prompt at the start of each session containing:
- User profile and background
- Session history summary
- Current skill level estimate
- Active project status
- Today's session objectives
- Behavioral instructions (scaffolding, feedback escalation rules)

---

## 6. Memory & Persistence

### 6.1 What Is Tracked (Per Session)
- Date and session number
- Phase-by-phase content delivered
- User responses and submissions
- Feedback given by Claude
- Projects started or continued
- Reflection responses
- Progression decisions (passed/extended/struggled)

### 6.2 What Is Tracked (Across Sessions)
- All topics covered (with timestamps)
- Skill level estimate (updated after each session)
- Active projects and their current state
- Streak and consistency data
- Strength/weakness signals (derived from performance)

### 6.3 Memory Management
- All tracking is automatic — no manual logging required by user
- User may optionally adjust or correct progress (light input, not mandatory)
- System uses stored memory to generate the next session's content and continuity message

### 6.4 Continuity Messaging
At the start of each session, Claude acknowledges prior progress:
- *"Yesterday you worked on X — today we'll build on that."*
- *"You struggled with Y recently — we'll revisit it briefly."*
- *"You're mid-project on Z — let's continue from where you left off."*

---

## 7. Technical Architecture (MVP)

### 7.1 Frontend
- Web application (React recommended)
- Full-screen, slide-based session UI
- Minimal design — one focused view at a time
- Streak and progress indicators (subtle, non-distracting)
- Input fields for user responses at each phase

### 7.2 Backend
- API layer to handle session generation requests
- Passes user context + memory to Claude API
- Stores session data and memory after each session

### 7.3 Database
- Structured storage for all memory data (see Section 6)
- Schema designed to support single user now, multiple users later
- Fields: user_id, session_id, date, phase_data, reflection, project_state, skill_estimate, streak

### 7.4 AI Integration
- Anthropic Claude API (claude-sonnet-4)
- Optional: Web search tool enabled for Adapt phase (real-world trend content)
- System prompt built dynamically from stored memory at session start

### 7.5 Hosting
- Simple cloud deployment (e.g., Vercel for frontend, Railway or Supabase for backend/DB)
- No infrastructure complexity at MVP stage

---

## 8. MVP Feature Scope

### In Scope (MVP)
- Landing page with single CTA
- 4-phase session flow (Learn → Apply → Adapt → Reflect)
- Required engagement per phase (no passive progression)
- Dynamic session content generated by Claude
- Adaptive feedback loop in Apply phase
- Session memory storage (automatic)
- Continuity messaging between sessions
- Streak tracking
- Project continuity across sessions

### Out of Scope (MVP)
- User authentication / multi-user support
- Mobile app
- Custom curriculum builder
- Analytics dashboard
- Social or sharing features
- Payments or subscriptions
- Notifications or scheduling

---

## 9. Success Metrics

### 9.1 Engagement
- Sessions completed per week (target: 5–7)
- Streak length over time
- Average time per session (target: 45–70 min)

### 9.2 Learning Quality
- Depth of reflection responses over time
- Frequency of project completion
- Progression from guided tasks → independent building

### 9.3 System Quality
- Continuity accuracy (does the system correctly reference prior sessions?)
- Content relevance (does the session feel adapted to current level?)
- User-reported session quality ("Was this practical, relevant, and worth my time?")

---

## 10. Guiding Principle

> *"This was practical, relevant, and worth my time."*

Every session should pass this test. The system exists to develop compounding AI skill through daily, active, adaptive practice — not to deliver content or track completions.

---

## 11. Spaced Repetition & Review Architecture

### 11.1 Theoretical Foundation

This section extends the ADTS with a long-term retention architecture grounded in three bodies of learning science research.

**Spaced repetition** (Ebbinghaus, 1885): Memory degrades predictably over time along a forgetting curve. Reviewing material at strategically increasing intervals — rather than massing review close together — dramatically improves long-term retention with less total study time.

**Retrieval practice** (Roediger & Karpicke, 2006): The act of recalling information from memory, rather than re-reading or re-watching it, produces significantly stronger and more durable learning. This effect holds even when retrieval fails — the attempt itself strengthens the memory trace.

**Desirable difficulties** (Bjork, 1994): Conditions that slow down or challenge learning in the short term — spacing, interleaving, retrieval — produce better long-term outcomes than easier, massed practice. The system should treat difficulty as a feature, not a problem.

These three frameworks collectively justify the architecture below. The system is not adding review for completeness — it is adding review because the research is unambiguous that daily-only learning without spaced retrieval will not produce durable skill.

---

### 11.2 Concept Memory Schema

To support spaced repetition, the system must track individual concepts — not just sessions — over time. This extends the existing memory schema (Section 6) with a new concept-level tracking layer.

Each concept introduced in a session is stored with the following fields:

| Field | Description |
|---|---|
| `concept_id` | Unique identifier |
| `concept_name` | Short label (e.g., "prompt chaining") |
| `concept_summary` | 1–2 sentence description of the concept |
| `skill_domain` | Category tag (e.g., Prompting, Workflow Design, API & Integration) |
| `source_session` | Session number where the concept was introduced |
| `date_introduced` | Date of first exposure |
| `last_reviewed_session` | Session number of most recent retrieval |
| `last_reviewed_date` | Date of most recent retrieval |
| `recall_count` | Total number of times retrieved |
| `strength_score` | Estimated mastery, 0.0–1.0, updated after each retrieval |
| `due_for_recall` | Boolean flag, set by scheduling logic |
| `next_review_target` | Estimated session number for next retrieval |

The `strength_score` is updated after each retrieval attempt based on response quality: strong recall increases the score, weak or failed recall decreases it and shortens the next review interval.

Concept extraction is automatic — Claude identifies and logs 1–3 key concepts per session at the point of session completion, requiring no manual input from the user.

---

### 11.3 Session Types

The system operates on a fixed **7-session rhythm**. Session type is determined automatically before each session begins — no user configuration required.

**The repeating cycle:**

| Session | Type |
|---|---|
| 1–6 | Standard (with Recall Warm-Up) |
| 7 | Review Session |
| 8–13 | Standard (with Recall Warm-Up) |
| 14 | Review Session |
| 15–20 | Standard (with Recall Warm-Up) |
| 21 | Mastery Session |
| 22–27 | Standard (with Recall Warm-Up) |
| 28 | Review Session |
| 29–34 | Standard (with Recall Warm-Up) |
| 35 | Review Session |
| 36–41 | Standard (with Recall Warm-Up) |
| 42 | Mastery Session |
| … | Pattern continues indefinitely |

Every 7th session is a Review Session. Every 21st session is a Mastery Session, superseding what would otherwise be a Review Session at that position.

All three session types use the same four-phase structure: Learn → Apply → Adapt → Reflect. What changes across types is the framing, tone, and content mandate inside each phase — enough that each type feels like a different gear, not a different machine.

**Updated session flows:**

*Standard:*
```
[Landing] → [Recall Warm-Up] → [Learn] → [Apply] → [Adapt] → [Reflect] → [Session Complete]
```

*Review:*
```
[Landing] → [Review Session Screen] → [Learn] → [Apply] → [Adapt] → [Reflect] → [Session Complete]
```

*Mastery:*
```
[Landing] → [Mastery Session Screen] → [Learn] → [Apply] → [Adapt] → [Reflect] → [Session Complete]
```

---

### 11.4 Phase Specifications by Session Type

The four phases carry different energy and content mandates depending on session type. The table below summarizes the distinction, followed by full specifications for each type.

| Phase | Standard | Review | Mastery |
|---|---|---|---|
| **Learn** | New concept introduction | Cycle consolidation — no new concepts | Longitudinal narrative across all cycles |
| **Apply** | Single-concept hands-on task | Multi-concept synthesis challenge | Cross-domain capstone challenge |
| **Adapt** | Real-world connection for today's concept | Transfer task — new scenario, prior tools | Full skill-set positioning against real-world AI work |
| **Reflect** | Tactical — what worked today | Evaluative — what stuck across the cycle | Perspective — how far have I come, where do I stand |

---

#### 11.4.1 Standard Session Phases

The standard session follows the phase specifications defined in Section 4.3, with one addition: a Recall Warm-Up block prepended before Learn (see Section 11.5).

The energy of a standard session is **forward-looking**. A new concept is introduced, applied, connected to the real world, and reflected on. The session closes with the learner having built or produced something concrete.

---

#### 11.4.2 Review Session Phases

Review Sessions occur at every 7th session (excluding Mastery positions). They introduce no new concepts. All content draws from the prior 6-session cycle, weighted toward weaker and older concepts across the full history.

The energy of a Review Session is **consolidating**. The learner is not moving forward — they are making sure what they've already covered is solid before the next cycle begins.

**Learn (10–15 min) — Cycle Recap**
Claude delivers a compressed narrative synthesis of the major concepts from the prior 6 sessions. This is not a list of topics — it is a connected story that shows how the concepts relate to each other and to the learner's development arc. Where relevant, Claude draws explicit connections to earlier cycles, not as a history lesson but to show how ideas compound over time.

*Engagement requirement:* The learner must respond to a prompt such as: "Before we move on — what from this cycle do you feel most confident about, and what still feels fuzzy?" Claude uses this response to calibrate the Apply task.

**Apply (20–25 min) — Integrated Synthesis Challenge**
The task requires the learner to use multiple concepts from the prior cycle together in a single build or problem. Where possible, the challenge also incorporates a concept from an earlier cycle to reinforce cross-cycle integration. The difficulty is deliberately higher than a standard Apply task — synthesis is harder than isolated application, and that difficulty is intentional.

Claude does not give hints immediately. The learner must make a genuine attempt. Feedback escalates as in standard sessions: struggling → hint + question, partial → nudge, strong → follow-up challenge.

*Engagement requirement:* Genuine attempt required before any feedback is given.

**Adapt (15–20 min) — Transfer Task**
Claude presents a real-world scenario the learner has not encountered before and asks them to apply the prior cycle's concepts to it. The scenario should be meaningfully different from examples used during the cycle — the goal is transfer, demonstrating that learning is flexible and not context-dependent.

Where relevant, Claude notes how concepts from earlier cycles also apply to the scenario, reinforcing the cumulative nature of the skill set.

*Engagement requirement:* The learner must submit an analysis or proposed approach before Claude responds.

**Reflect (5–10 min) — Evaluative Reflection**
Reflection in Review Sessions is evaluative rather than tactical. The questions ask the learner to assess the cycle as a whole, not just what happened today.

Prompts include:
- Which concepts from this cycle feel genuinely solid?
- Which still feel uncertain or fragile?
- What connections did you notice that you hadn't seen before?
- What do you want to make sure stays with you as we move into the next cycle?

Reflection responses from Review Sessions are weighted more heavily in future concept scheduling than standard session reflections — they are the richest signal the system has about actual retention state.

*Engagement requirement:* Written reflection required to complete the session. Cannot be skipped.

---

#### 11.4.3 Mastery Session Phases

Mastery Sessions occur at every 21st session (sessions 21, 42, 63, and so on). They supersede the Review Session that would otherwise fall at that position. They span the entire concept history — every concept introduced since session 1 is eligible for surfacing, with explicit prioritization of concepts that have not been recalled in a long time.

The energy of a Mastery Session is a **perspective shift**. The learner zooms out and sees how far they have come. The session is explicitly framed as a milestone — not an exam, not a review, but a moment to take stock of accumulated capability.

**Learn (10–15 min) — Longitudinal Synthesis**
Claude delivers a developmental narrative that spans all prior cycles. The most significant concepts from each cycle are surfaced, grouped by skill domain. The framing is explicitly about growth: *"Here is what you have built and what you now know."*

Connections between distant concepts are highlighted deliberately — things introduced in session 2 and session 18, for example — to show how the skill set has become integrated rather than fragmented. This is the session where the learner should feel the compounding effect of daily practice.

*Engagement requirement:* The learner is asked: "Looking at this, what surprises you about how much ground you've covered?" Claude uses this response to frame the Apply task.

**Apply (20–25 min) — Capstone Challenge**
The most demanding Apply task in the system. The challenge requires integrating knowledge across multiple skill domains and multiple prior cycles. It cannot be solved by applying a single concept — it requires the learner to draw on the full range of what they have learned.

At early Mastery Sessions (session 21), this may be a complex multi-step prompt engineering or workflow design challenge. At later Mastery Sessions (session 42+), it should be a full system design problem or a consulting scenario with real constraints.

Difficulty scales with how many cycles have been completed. The task should feel genuinely hard — this is the point at which the learner proves to themselves that the training has produced real capability, not just familiarity.

*Engagement requirement:* Genuine attempt required. Claude does not provide hints on the first submission — the learner must push through the difficulty before support is offered.

**Adapt (15–20 min) — Real-World Positioning**
Claude connects the learner's full accumulated skill set to current AI industry trends, tools, and roles. The framing shifts perspective deliberately: *"Given what you now know across all of these areas, here is where you stand and what you are capable of."*

This phase should feel motivating and grounding — not inflated praise, but an honest assessment of what the learner can now do that they could not do at the start. Claude may reference specific things the learner built during prior Apply tasks as concrete evidence of capability.

*Engagement requirement:* The learner responds to: "Based on what you can do now, what kind of AI work do you feel most equipped to take on?"

**Reflect (5–10 min) — Mastery Reflection**
Reflection in Mastery Sessions is perspective-level rather than tactical or evaluative. The questions ask the learner to think about their overall development and identity as someone who works with AI.

Prompts include:
- What can you do now that you genuinely could not do when you started?
- Which skill domain feels strongest? Which still has the most room to grow?
- What concept from early on has turned out to matter more than you expected?
- What would you build if you started a project today with no constraints?

Mastery Session reflections are stored separately from standard and review reflections and are used to recalibrate the overall skill level estimate and reweight the concept pool for the next cycle.

*Engagement requirement:* Written reflection required. Cannot be skipped.

---

### 11.5 Recall Warm-Up (Standard Sessions)

Every standard session begins with a Recall Warm-Up before the Learn phase. This is not a quiz. It is a low-stakes, coach-guided retrieval exercise designed to feel like a natural warm-up.

**Duration:** 5–8 minutes

**Structure:**
- Claude surfaces 1–3 concepts flagged as due for recall by the scheduling logic
- For each concept, Claude asks the learner to explain, apply, or connect it in their own words — not recite a definition
- Claude evaluates the quality of the response and updates the concept's `strength_score`
- Claude provides brief, affirming feedback — correcting gaps without lecturing

**Tone:** Conversational and warm. This should never feel like a pop quiz. The framing is always: *"Let's briefly revisit something before we get into today's session — tell me what you remember about X."*

**Engagement requirement:** The learner must submit a response to each recall prompt before proceeding. Brief or low-effort responses are met with a follow-up question, not automatic progression.

**Concept selection:** Determined by the scheduling logic defined in Section 11.6.

---

### 11.6 Recall Scheduling Logic

The system uses intentional spacing — not random selection — to determine which concepts are surfaced in each session's Recall Warm-Up and how Review and Mastery Sessions draw from the concept history.

**Core principle: no concept is ever permanently retired.**

Completing a Review or Mastery Session does not close out any prior concept. Every concept ever introduced remains in the active pool. The scheduling logic controls *frequency* of recall based on mastery — high-strength concepts are recalled less often, but they are never removed. Long gaps between recalls are intentional: they are what produce durable long-term memory.

**The 7-session rhythm as the structural skeleton:**

The fixed Review and Mastery cadence provides the primary structure for consolidation. The daily Recall Warm-Up fills in retrieval between those milestones. These two layers work together:

- Warm-ups handle frequent, low-stakes retrieval of recent and weak concepts
- Review Sessions handle cycle-level consolidation and cross-cycle connection
- Mastery Sessions handle long-horizon synthesis and long-lag retrieval of older material

**Concept recall intervals (warm-up scheduling):**

| Strength Score | Target Recall Frequency |
|---|---|
| 0.0 – 0.4 (weak) | Every 2–3 sessions |
| 0.4 – 0.6 (developing) | Every 4–5 sessions |
| 0.6 – 0.8 (solid) | Every 7–10 sessions |
| 0.8 – 1.0 (strong) | Every 14–21 sessions |

Concepts with high strength scores are recalled infrequently — but they are always recalled eventually, triggered by the mastery interval at minimum.

**Warm-up selection priority (in order):**
1. Concepts overdue for recall based on their target frequency
2. Concepts with a `strength_score` below 0.4, regardless of interval
3. Concepts flagged as weak in the most recent Review or Mastery Session reflection
4. Concepts from the oldest prior cycle that have not been surfaced recently
5. Concepts approaching their next interval target within 1–2 sessions

**Review Session concept selection priority:**
1. All concepts from the prior 6-session cycle (primary focus)
2. Concepts from any prior cycle with a `strength_score` below 0.5
3. Concepts from any prior cycle not recalled in 14+ sessions

**Mastery Session concept selection priority:**
1. Concepts not recalled in 21+ sessions (highest priority — long-lag retrieval)
2. Concepts whose `strength_score` has declined since last measured
3. Significant concepts from the earliest cycles (sessions 1–21)
4. Concepts that span multiple skill domains and support synthesis

**Hard limits:**
- Maximum 3 concepts per Recall Warm-Up to preserve session time
- No concept recalled in two consecutive standard sessions
- No concept is ever marked as permanently complete or removed from the pool

**Strength score update rules:**

| Response Quality | Score Change | Interval Effect |
|---|---|---|
| Strong recall | +0.15 | Next interval extends |
| Partial recall | No change | Interval maintained |
| Weak or failed recall | −0.20 | Interval resets to shortest window for that strength band |

---

### 11.7 AI Generation Updates

The system prompt passed to Claude at session start (Section 5.4) is extended to include the following additional context:

- **Session type flag:** `standard` | `review` | `mastery`
- **Current cycle number:** which 7-session cycle is active
- **Mastery cycle number:** which 21-session cycle is active
- **Recall warm-up concepts:** list of concepts due for retrieval, with summaries and current strength scores (standard sessions only)
- **Full concept log:** all concepts introduced to date with metadata
- **Session type instruction:** explicit behavioral directive matching the session type

For Review Sessions, the system prompt includes: *"This is a Review Session. Do not introduce new concepts. All content should consolidate and synthesize the prior cycle while drawing connections to earlier cycles where relevant."*

For Mastery Sessions, the system prompt includes: *"This is a Mastery Session. Do not introduce new concepts. All content should span the full concept history. Prioritize long-lag retrieval of older concepts and synthesis across skill domains. Frame the session as a developmental milestone."*

Claude uses this context to generate the correct session type automatically. No user configuration is required.

---

### 11.8 UI Behavior

The session flow updates to reflect the new architecture while preserving the clean, minimal, slide-based aesthetic.

**Standard sessions:**
- A new screen labeled **"Warm-Up"** appears before the Learn screen
- The phase indicator reads: `Warm-Up → Learn → Apply → Adapt → Reflect`
- The Warm-Up screen is visually consistent with other phase screens — no quiz-like styling

**Review Sessions:**
- A labeled entry screen appears after Landing: *"Review Session — Cycle [N]"*
- One-line framing: *"Today we consolidate and connect what you've built over the past 7 sessions."*
- Phase indicator reads: `Learn → Apply → Adapt → Reflect` (no Warm-Up on Review Sessions — the entire session serves the consolidation function)
- Visual treatment is clean and minimal, slightly distinct from a standard session to signal the shift in mode

**Mastery Sessions:**
- A labeled entry screen appears after Landing: *"Mastery Session — Cycle [N]"*
- One-line framing: *"Today we zoom out and take stock of everything you've built."*
- Phase indicator reads: `Learn → Apply → Adapt → Reflect`
- Visually treated as a milestone — elevated presentation relative to standard and review sessions, but still clean and minimal

**What does not change:**
- Full-screen, slide-based UI
- One focused view at a time
- No dashboards, concept maps, or progress visualizations visible during sessions
- The overall experience remains coach-like and forward-moving

---

### 11.9 Relationship to Existing Sections

This section extends but does not replace any prior section of this PRD.

- **Section 4 (User Experience):** Standard session flow is updated to include Recall Warm-Up. Review and Mastery session flows are additive. Session type is surfaced on the entry screen before each session begins.
- **Section 5 (AI & Content Generation):** System prompt architecture is extended with session type flag, concept memory context, cycle numbers, and session type behavioral instructions.
- **Section 6 (Memory & Persistence):** Concept-level tracking is added as a new layer alongside existing session-level tracking. Session-level memory is unchanged. The concept table links to sessions via `source_session` and `last_reviewed_session` foreign keys.
- **Section 7 (Technical Architecture):** Database schema is extended with a concept memory table. No existing tables are removed or restructured.
- **Section 8 (MVP Feature Scope):** The full spaced repetition architecture — Recall Warm-Up, Review Sessions, Mastery Sessions, concept tracking, and scheduling logic — is scoped as a **post-MVP feature**. The core session loop must be running and generating concept data before the scheduling logic has anything to operate on. This should be built in the second build phase, after the standard session flow is stable and validated.

---

*End of Document — Version 1.1 MVP*