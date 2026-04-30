import { getSupabaseAdmin } from "./supabase";
import { USER_ID } from "./db";

export type ConceptRow = {
  id: string;
  user_id: string;
  concept_name: string;
  concept_summary: string;
  skill_domain: string;
  curriculum_stage: number | null;
  source_session: number;
  strength_score: number;
  recall_count: number;
  last_reviewed_session: number | null;
  last_reviewed_date: string | null;
  next_review_target: number;
  due_for_recall: boolean;
  created_at: string;
};

// Numeric thresholds from docs/curriculum.md "Advancement criteria" lines.
// The "AND can build X" / "AND completed a Review Session" gates are softer —
// they're surfaced to the model in the prompt, not enforced here.
const STAGE_CONSOLIDATION_THRESHOLDS: Record<number, number> = {
  1: 5,
  2: 6,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
};

const CONSOLIDATION_STRENGTH = 0.6;
const MAX_STAGE = 7;

export function computeCurrentStage(concepts: ConceptRow[]): number {
  for (let stage = 1; stage < MAX_STAGE; stage++) {
    const required = STAGE_CONSOLIDATION_THRESHOLDS[stage];
    const consolidated = concepts.filter(
      (c) => c.curriculum_stage === stage && c.strength_score >= CONSOLIDATION_STRENGTH,
    ).length;
    if (consolidated < required) return stage;
  }
  return MAX_STAGE;
}

export function getInterval(strength: number): number {
  if (strength < 0.4) return 2;
  if (strength < 0.6) return 4;
  if (strength < 0.8) return 8;
  return 16;
}

export async function getConceptsDueForRecall(
  currentSessionNumber: number,
  limit = 3,
): Promise<ConceptRow[]> {
  const supa = getSupabaseAdmin();
  const { data, error } = await supa
    .from("concepts")
    .select("*")
    .eq("user_id", USER_ID)
    .order("next_review_target", { ascending: true })
    .order("strength_score", { ascending: true })
    .order("last_reviewed_date", { ascending: true, nullsFirst: true });

  if (error) throw error;

  const filtered = (data as ConceptRow[]).filter(
    (c) => c.last_reviewed_session !== currentSessionNumber - 1,
  );

  const sorted = filtered.sort((a, b) => {
    const aOverdue = a.next_review_target <= currentSessionNumber ? 0 : 1;
    const bOverdue = b.next_review_target <= currentSessionNumber ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    if (a.strength_score !== b.strength_score)
      return a.strength_score - b.strength_score;
    const aDate = a.last_reviewed_date ?? "";
    const bDate = b.last_reviewed_date ?? "";
    return aDate.localeCompare(bDate);
  });

  return sorted.slice(0, limit);
}

export async function updateConceptStrength(
  conceptId: string,
  quality: "strong" | "partial" | "weak",
  currentSessionNumber: number,
): Promise<void> {
  const supa = getSupabaseAdmin();
  const { data, error } = await supa
    .from("concepts")
    .select("*")
    .eq("id", conceptId)
    .single();

  if (error) throw error;
  const concept = data as ConceptRow;

  const delta = quality === "strong" ? 0.15 : quality === "weak" ? -0.2 : 0;
  const newStrength = Math.min(1.0, Math.max(0.0, concept.strength_score + delta));
  const interval = getInterval(newStrength);

  await supa
    .from("concepts")
    .update({
      strength_score: newStrength,
      last_reviewed_session: currentSessionNumber,
      last_reviewed_date: new Date().toISOString(),
      recall_count: concept.recall_count + 1,
      next_review_target: currentSessionNumber + interval,
      due_for_recall: false,
    })
    .eq("id", conceptId);
}

export async function getAllConcepts(): Promise<ConceptRow[]> {
  const supa = getSupabaseAdmin();
  const { data, error } = await supa
    .from("concepts")
    .select("*")
    .eq("user_id", USER_ID)
    .order("source_session", { ascending: true });

  if (error) throw error;
  return (data as ConceptRow[]) ?? [];
}

const STOPWORDS = new Set([
  "basics", "fundamentals", "intro", "introduction", "overview",
  "to", "of", "the", "a", "an", "and", "or", "for", "with", "in", "on",
]);

type ConceptSig = {
  collapsed: string;
  tokens: Set<string>;
  initials: string;
};

function normalizeConceptName(name: string): ConceptSig {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const raw = cleaned.split(" ").filter(Boolean);
  const singular = raw.map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
  const meaningful = singular.filter((t) => t.length >= 2 && !STOPWORDS.has(t));
  return {
    collapsed: meaningful.join(" "),
    tokens: new Set(meaningful),
    initials: meaningful.map((t) => t[0]).join(""),
  };
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersect = 0;
  for (const t of a) if (b.has(t)) intersect++;
  const union = a.size + b.size - intersect;
  return union === 0 ? 0 : intersect / union;
}

function isDuplicateConcept(a: ConceptSig, b: ConceptSig): boolean {
  if (a.collapsed.length === 0 || b.collapsed.length === 0) return false;
  if (a.collapsed === b.collapsed) return true;
  if (jaccard(a.tokens, b.tokens) >= 0.6) return true;
  if (a.tokens.size === 1 && b.initials.length >= 2 && [...a.tokens][0] === b.initials) return true;
  if (b.tokens.size === 1 && a.initials.length >= 2 && [...b.tokens][0] === a.initials) return true;
  return false;
}

export async function saveConceptsFromSession(
  concepts: Array<{
    concept_name: string;
    concept_summary: string;
    skill_domain: string;
    curriculum_stage: number;
  }>,
  sessionNumber: number,
): Promise<void> {
  if (concepts.length === 0) return;
  const supa = getSupabaseAdmin();

  const { data: existingRows, error: fetchErr } = await supa
    .from("concepts")
    .select("concept_name")
    .eq("user_id", USER_ID);
  if (fetchErr) throw fetchErr;

  const seen: ConceptSig[] = (existingRows ?? []).map((r) =>
    normalizeConceptName(r.concept_name as string),
  );

  const fresh: typeof concepts = [];
  for (const c of concepts) {
    const sig = normalizeConceptName(c.concept_name);
    if (seen.some((s) => isDuplicateConcept(sig, s))) {
      console.log(`[concepts] skipping duplicate: "${c.concept_name}"`);
      continue;
    }
    fresh.push(c);
    seen.push(sig);
  }

  if (fresh.length === 0) return;

  const rows = fresh.map((c) => ({
    user_id: USER_ID,
    concept_name: c.concept_name,
    concept_summary: c.concept_summary,
    skill_domain: c.skill_domain,
    curriculum_stage: c.curriculum_stage,
    source_session: sessionNumber,
    strength_score: 0.3,
    recall_count: 0,
    next_review_target: sessionNumber + 2,
    due_for_recall: false,
  }));
  const { error } = await supa.from("concepts").insert(rows);
  if (error) throw error;
}
