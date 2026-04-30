export type SessionType = "standard" | "review" | "mastery";

export function getSessionType(sessionNumber: number): SessionType {
  if (sessionNumber % 21 === 0) return "mastery";
  if (sessionNumber % 7 === 0) return "review";
  return "standard";
}

export function getCycleNumbers(sessionNumber: number): {
  reviewCycle: number;
  masteryCycle: number;
} {
  return {
    reviewCycle: Math.ceil(sessionNumber / 7),
    masteryCycle: Math.ceil(sessionNumber / 21),
  };
}
