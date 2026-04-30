// One-time backfill: stamps the 14 pre-curriculum concepts with their best-fit
// curriculum_stage. Run AFTER applying supabase/migrations/2026-04-29-curriculum-stage.sql.
//
//   npx tsx scripts/backfill-curriculum-stage.ts

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Mapping rationale (see docs/curriculum.md):
//  - "Practical AI Skills" (Stage 2) covers structured prompts, output evaluation,
//    description-discernment loop, applying AI to contexts. Most of the existing
//    concepts are prompt/constraint design at the chat level — Stage 2.
//  - Production deployment, monitoring, and business-impact analysis fit the
//    Stage 7 capstone (pilot design, business case, change management).
//  - Nothing here is API-level (Stage 3), tool use (Stage 4), RAG/MCP (Stage 5),
//    or agent architecture (Stage 6).
const STAGE_BY_NAME: Record<string, number> = {
  "Multi-Step Prompt Pipelines": 2,
  "Explicit Output Formatting in Prompts": 2,
  "Edge Case Handling in Workflows": 2,
  "Data contracts in multi-step workflows": 2,
  "Constraint hierarchy and override rules": 2,
  "Category classification strategies": 2,
  "Conflicting Signal Resolution in Workflows": 2,
  "Multi-Value Extraction and Prioritization": 2,
  "Constraint Logic Validation Through Verbalization": 2,
  "Constraint Logic Validation Through Test Case Conflicts": 2,
  "Self-Described vs Request-Based Classification": 2,
  "Workflow monitoring and failure diagnosis": 7,
  "Production deployment stages and validation thresholds": 7,
  "Business impact analysis for failure modes": 7,
};

async function main() {
  const { data: rows, error } = await supa
    .from("concepts")
    .select("id, concept_name, curriculum_stage");
  if (error) throw error;

  let updated = 0;
  let skipped = 0;
  let unmapped: string[] = [];

  for (const row of rows ?? []) {
    if (row.curriculum_stage != null) {
      skipped++;
      continue;
    }
    const stage = STAGE_BY_NAME[row.concept_name as string];
    if (!stage) {
      unmapped.push(row.concept_name as string);
      continue;
    }
    const { error: upErr } = await supa
      .from("concepts")
      .update({ curriculum_stage: stage })
      .eq("id", row.id);
    if (upErr) throw upErr;
    updated++;
    console.log(`  Stage ${stage} ← ${row.concept_name}`);
  }

  console.log(`\nUpdated ${updated} | Already-tagged ${skipped} | Unmapped ${unmapped.length}`);
  if (unmapped.length > 0) {
    console.log("Unmapped concepts (left null):");
    for (const n of unmapped) console.log(`  - ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
