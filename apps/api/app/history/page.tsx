import { prisma } from "@sponsor/db";
import { outcomeLabel, type OutcomeKey } from "@sponsor/shared";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/getSessionUser";
import { relativeTime } from "@/lib/relativeTime";

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const [logs, activityTypes] = await Promise.all([
    prisma.log.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.activityType.findMany(),
  ]);
  const labelByKey = Object.fromEntries(activityTypes.map((a) => [a.key, a.label]));

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Your history</h1>
      {logs.length === 0 && <p className="muted">You haven&apos;t logged anything yet.</p>}
      {logs.map((log) => (
        <div key={log.id} className="list-row">
          <span>
            {labelByKey[log.activityType] ?? log.activityType} — {log.companyName}
            <span className="muted"> ({outcomeLabel(log.outcome as OutcomeKey)})</span>
          </span>
          <span className="muted">
            {log.points} pts · {relativeTime(log.createdAt.toISOString())}
          </span>
        </div>
      ))}
    </div>
  );
}
