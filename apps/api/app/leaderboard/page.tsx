import { redirect } from "next/navigation";

import { LeaderboardList } from "@/app/components/LeaderboardList";
import { getSessionUser } from "@/lib/getSessionUser";
import { getLeaderboard } from "@/lib/leaderboard";

export default async function LeaderboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const [alltime, monthly] = await Promise.all([getLeaderboard("alltime"), getLeaderboard("monthly")]);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Most Wanted</h1>
      <LeaderboardList alltime={alltime} monthly={monthly} currentUserId={user.id} />
    </div>
  );
}
