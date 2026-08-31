export const TIERS = ["none", "bronze", "silver", "gold"] as const;
export type Tier = (typeof TIERS)[number];

// Ordered ascending; used both to render badges and to detect threshold crossings.
export const TIER_THRESHOLDS: { tier: Exclude<Tier, "none">; points: number }[] = [
  { tier: "bronze", points: 50 },
  { tier: "silver", points: 150 },
  { tier: "gold", points: 300 },
];

export function tierForPoints(totalPoints: number): Tier {
  let tier: Tier = "none";
  for (const threshold of TIER_THRESHOLDS) {
    if (totalPoints >= threshold.points) tier = threshold.tier;
  }
  return tier;
}
