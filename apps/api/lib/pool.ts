import { prisma } from "@sponsor/db";
import type { PoolStatsDTO } from "@sponsor/shared";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getPoolStats(): Promise<PoolStatsDTO> {
  const [{ _sum }, configRows] = await Promise.all([
    prisma.user.aggregate({ _sum: { monthlyPoints: true } }),
    prisma.config.findMany({ where: { key: { in: ["points_per_dollar_ratio", "monthly_dollar_cap"] } } }),
  ]);

  const configByKey = Object.fromEntries(configRows.map((c) => [c.key, c.value]));
  const pointsPerDollarRatio = Number(configByKey.points_per_dollar_ratio) || 10;
  const cap = configByKey.monthly_dollar_cap !== undefined ? Number(configByKey.monthly_dollar_cap) : null;

  const totalPointsThisMonth = _sum.monthlyPoints ?? 0;
  const rawDollars = totalPointsThisMonth / pointsPerDollarRatio;
  const dollars = cap !== null ? Math.min(rawDollars, cap) : rawDollars;

  return {
    month: currentMonthKey(),
    totalPointsThisMonth,
    pointsPerDollarRatio,
    dollars,
    cap,
  };
}
