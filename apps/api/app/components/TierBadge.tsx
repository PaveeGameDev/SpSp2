import type { Tier } from "@sponsor/shared";

const LABEL: Record<Tier, string> = {
  none: "No Vault Yet",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "none") return <span className="badge muted">{LABEL[tier]}</span>;
  return <span className={`badge badge-${tier}`}>{LABEL[tier]}</span>;
}
