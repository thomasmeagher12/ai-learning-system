export type Phase = "learn" | "apply" | "adapt" | "reflect";
export type CurrentPhase = Phase | "complete";
export type SessionStatus = "in_progress" | "complete";
export type ProjectStatus = "active" | "paused" | "done";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type PhaseContentMessage = {
  role: "assistant";
  kind: "content";
  data: Record<string, unknown>;
};

export type PhaseMessage = ChatTurn | PhaseContentMessage;

export type Session = {
  id: string;
  user_id: string;
  session_number: number;
  status: SessionStatus;
  current_phase: CurrentPhase;
  streak: number;
  skill_estimate: unknown | null;
  summary: unknown | null;
  created_at: string;
  completed_at: string | null;
};

export type PhaseRow = {
  id: string;
  session_id: string;
  phase: Phase;
  messages: PhaseMessage[];
  user_response: string | null;
  engagement_met: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  state: unknown | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};
