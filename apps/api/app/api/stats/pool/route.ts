import { getPoolStats } from "@/lib/pool";

export async function GET() {
  return Response.json(await getPoolStats());
}
