import { prisma } from "@sponsor/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return Response.json([]);

  const rows = await prisma.log.findMany({
    where: { companyName: { contains: q, mode: "insensitive" } },
    select: { companyName: true },
    distinct: ["companyName"],
    take: 10,
    orderBy: { companyName: "asc" },
  });

  return Response.json(rows.map((r) => r.companyName));
}
