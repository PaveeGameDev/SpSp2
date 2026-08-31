export const OUTCOMES = [
  { key: "no_response", label: "No response yet" },
  { key: "said_no", label: "Said no" },
  { key: "asked_followup", label: "Asked for follow-up" },
  { key: "interested", label: "Interested, need to follow up" },
] as const;

export type OutcomeKey = (typeof OUTCOMES)[number]["key"];

export function outcomeLabel(key: OutcomeKey): string {
  return OUTCOMES.find((o) => o.key === key)?.label ?? key;
}
