import { prisma } from "@sponsor/db";
import type { LeaderboardEntryDTO, Tier } from "@sponsor/shared";

export async function getLeaderboard(scope: "alltime" | "monthly", limit?: number): Promise<LeaderboardEntryDTO[]> {
  const orderField = scope === "monthly" ? "monthlyPoints" : "totalPoints";

  const users = await prisma.user.findMany({
    orderBy: { [orderField]: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    points: scope === "monthly" ? user.monthlyPoints : user.totalPoints,
    tier: user.currentTier as Tier,
  }));
}
