import { NextRequest } from "next/server";

import { getFeed } from "@/lib/feed";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || DEFAULT_LIMIT, MAX_LIMIT);
  const cursor = searchParams.get("cursor");

  return Response.json(await getFeed(limit, cursor));
}
