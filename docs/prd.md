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

*End of Document — Version 1.0 MVP*