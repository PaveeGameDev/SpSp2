import { prisma } from "@sponsor/db";
import type { Tier } from "@sponsor/shared";
import Link from "next/link";

import { LeaderboardList } from "@/app/components/LeaderboardList";
import { TierBadge } from "@/app/components/TierBadge";
import { getFeed } from "@/lib/feed";
import { getSessionUser } from "@/lib/getSessionUser";
import { getLeaderboard } from "@/lib/leaderboard";
import { getPoolStats } from "@/lib/pool";
import { relativeTime } from "@/lib/relativeTime";

export default async function Page() {
  const user = await getSessionUser();
  if (!user) return <Welcome />;

  const [alltime, monthly, pool, feed, activityTypes] = await Promise.all([
    getLeaderboard("alltime"),
    getLeaderboard("monthly"),
    getPoolStats(),
    getFeed(10),
    prisma.activityType.findMany(),
  ]);
  const labelByKey = Object.fromEntries(activityTypes.map((a) => [a.key, a.label]));

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Hey {user.name.split(" ")[0]}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        <TierBadge tier={user.currentTier as Tier} />
      </p>

      <section className="card">
        <div className="stat-row">
          <div className="stat">
            <span className="value">{user.monthlyPoints}</span>
            <span className="label">points this month</span>
          </div>
          <div className="stat">
            <span className="value">{user.totalPoints}</span>
            <span className="label">all-time points</span>
          </div>
          <div className="stat">
            <span className="value">${pool.dollars.toFixed(2)}</span>
            <span className="label">team pool this month</span>
          </div>
        </div>
      </section>

      <div style={{ marginBottom: 24 }}>
        <Link href="/log" className="button button-primary">
          + Log an activity
        </Link>
      </div>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2>Leaderboard</h2>
          <Link href="/leaderboard" className="muted" style={{ fontSize: 14 }}>
            View full leaderboard →
          </Link>
        </div>
        <LeaderboardList alltime={alltime} monthly={monthly} currentUserId={user.id} limit={5} />
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Recent activity</h2>
        {feed.entries.length === 0 && <p className="muted">Nothing logged yet.</p>}
        {feed.entries.map((entry) => (
          <div key={entry.id} className="list-row">
            <span>
              <strong>{entry.user.name}</strong> logged {labelByKey[entry.activityType] ?? entry.activityType} —{" "}
              {entry.companyName}
            </span>
            <span className="muted">
              {entry.points} pts · {relativeTime(entry.createdAt)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function Welcome() {
  return (
    <div style={{ textAlign: "center", paddingTop: "20vh" }}>
      <h1>SpeedySponsor</h1>
      <p className="muted" style={{ margin: "12px 0 32px" }}>
        Log outreach, earn points, and turn team effort into real sponsor dollars.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 280, margin: "0 auto" }}>
        <a href="/api/auth/google/start" className="button button-primary">
          Sign in with Google
        </a>
        <span className="muted" style={{ fontSize: 13 }}>
          Sign in with Apple (web) coming soon
        </span>
      </div>
    </div>
  );
}
