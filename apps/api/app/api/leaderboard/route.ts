import { NextRequest } from "next/server";

import { getLeaderboard } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  const scope = new URL(request.url).searchParams.get("scope") === "monthly" ? "monthly" : "alltime";
  return Response.json(await getLeaderboard(scope));
}
