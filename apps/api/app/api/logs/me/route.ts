import { prisma } from "@sponsor/db";
import type { LogDTO } from "@sponsor/shared";
import { NextRequest } from "next/server";

import { requireUser, UnauthorizedError } from "@/lib/requireUser";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireUser(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) return Response.json({ error: err.message }, { status: 401 });
    throw err;
  }

  const rows = await prisma.log.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const response: LogDTO[] = rows.map((log) => ({
    id: log.id,
    activityType: log.activityType,
    points: log.points,
    companyName: log.companyName,
    contactName: log.contactName,
    outcome: log.outcome as LogDTO["outcome"],
    notes: log.notes,
    createdAt: log.createdAt.toISOString(),
  }));
  return Response.json(response);
}
