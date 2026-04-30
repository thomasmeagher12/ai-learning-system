import { calendarDaysBetween } from "../lib/date";
import { getInterval } from "../lib/concepts";
import { getSessionType } from "../lib/session-type";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  pass  ${name}`);
  } else {
    failed++;
    const msg = `  FAIL  ${name}\n        expected: ${JSON.stringify(expected)}\n        actual:   ${JSON.stringify(actual)}`;
    failures.push(msg);
    console.log(msg);
  }
}

function section(label: string) {
  console.log(`\n${label}`);
}

section("calendarDaysBetween");
{
  const day1Morning = new Date(2026, 3, 1, 8, 0);
  const day1Night = new Date(2026, 3, 1, 23, 59);
  const day2Morning = new Date(2026, 3, 2, 0, 1);
  const day3 = new Date(2026, 3, 3, 12, 0);
  const day10 = new Date(2026, 3, 10, 12, 0);

  check("same day, morning to night", calendarDaysBetween(day1Morning, day1Night), 0);
  check("11:59pm → 12:01am next day = 1", calendarDaysBetween(day1Night, day2Morning), 1);
  check("day 1 → day 3 = 2", calendarDaysBetween(day1Morning, day3), 2);
  check("day 1 → day 10 = 9", calendarDaysBetween(day1Morning, day10), 9);
  check("identical timestamp = 0", calendarDaysBetween(day3, day3), 0);

  // DST spring-forward in US: 2026-03-08 02:00 → 03:00. Test that calendar diff still reads as 1.
  const beforeDst = new Date(2026, 2, 7, 12, 0);
  const afterDst = new Date(2026, 2, 8, 12, 0);
  check("across US spring-forward = 1", calendarDaysBetween(beforeDst, afterDst), 1);

  // Year boundary
  const dec31 = new Date(2025, 11, 31, 23, 0);
  const jan1 = new Date(2026, 0, 1, 1, 0);
  check("year boundary = 1", calendarDaysBetween(dec31, jan1), 1);
}

section("getInterval");
{
  check("strength 0.0 → 2", getInterval(0.0), 2);
  check("strength 0.3 → 2", getInterval(0.3), 2);
  check("strength 0.39 → 2", getInterval(0.39), 2);
  check("strength 0.4 → 4 (boundary)", getInterval(0.4), 4);
  check("strength 0.55 → 4", getInterval(0.55), 4);
  check("strength 0.6 → 8 (boundary)", getInterval(0.6), 8);
  check("strength 0.79 → 8", getInterval(0.79), 8);
  check("strength 0.8 → 16 (boundary)", getInterval(0.8), 16);
  check("strength 1.0 → 16", getInterval(1.0), 16);
}

section("getSessionType");
{
  check("session 1 → standard", getSessionType(1), "standard");
  check("session 6 → standard", getSessionType(6), "standard");
  check("session 7 → review", getSessionType(7), "review");
  check("session 8 → standard", getSessionType(8), "standard");
  check("session 14 → review", getSessionType(14), "review");
  check("session 20 → standard", getSessionType(20), "standard");
  check("session 21 → mastery (mastery beats review)", getSessionType(21), "mastery");
  check("session 22 → standard", getSessionType(22), "standard");
  check("session 28 → review", getSessionType(28), "review");
  check("session 42 → mastery", getSessionType(42), "mastery");
  check("session 49 → review", getSessionType(49), "review");
  check("session 63 → mastery", getSessionType(63), "mastery");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(f);
  process.exit(1);
}
