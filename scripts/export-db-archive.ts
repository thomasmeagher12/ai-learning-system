// Dumps Supabase tables to ~/Desktop/ai-learning-system-archive/database/
// as pretty-printed JSON for offline reading + thesis analysis.
//   npx tsx scripts/export-db-archive.ts

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
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

const OUT_DIR = join(homedir(), "Desktop/ai-learning-system-archive/database");
mkdirSync(OUT_DIR, { recursive: true });

const TABLES = ["sessions", "concepts", "phase_data", "projects"] as const;

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  for (const table of TABLES) {
    const { data, error } = await supa.from(table).select("*");
    if (error) {
      console.error(`  ${table}: ERROR — ${error.message}`);
      continue;
    }
    const rows = data ?? [];
    const path = join(OUT_DIR, `${table}.json`);
    writeFileSync(path, JSON.stringify(rows, null, 2));
    console.log(`  ${table}: ${rows.length} rows → ${path}`);
  }

  // Manifest
  writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify({ exported_at: stamp, tables: TABLES }, null, 2),
  );
  console.log(`\nDone. Archive at: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
