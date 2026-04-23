import { getSupabaseAdmin } from "../lib/supabase";
import { generateMemorySummary } from "../lib/claude";
import type { PhaseMessage } from "../lib/types";

async function main() {
  const supa = getSupabaseAdmin();

  const { data: sessions } = await supa
    .from("sessions")
    .select("id, session_number, summary")
    .eq("status", "complete")
    .is("memory_summary", null)
    .order("completed_at", { ascending: true });

  if (!sessions || sessions.length === 0) {
    console.log("No sessions to backfill.");
    return;
  }

  for (const sess of sessions) {
    console.log(`\nBackfilling Session #${sess.session_number} (${sess.id})...`);

    const { data: phases } = await supa
      .from("phase_data")
      .select("phase, messages, user_response")
      .eq("session_id", sess.id);

    const phaseDigest = (phases ?? [])
      .map((p) => {
        const msgs = (p.messages as PhaseMessage[])
          .filter((m): m is PhaseMessage & { content: string } =>
            "content" in m && typeof (m as Record<string, unknown>).content === "string",
          )
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");
        return `## ${(p.phase as string).toUpperCase()}\n${msgs}`;
      })
      .join("\n\n");

    const summaryStr = sess.summary ? JSON.stringify(sess.summary) : "";

    const memory = await generateMemorySummary(summaryStr, phaseDigest);

    await supa
      .from("sessions")
      .update({ memory_summary: memory })
      .eq("id", sess.id);

    console.log(`Session #${sess.session_number} memory_summary:`);
    console.log(JSON.stringify(memory, null, 2));
  }

  console.log("\nBackfill complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
