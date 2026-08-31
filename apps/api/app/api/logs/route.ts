import { prisma } from "@sponsor/db";
import { OUTCOMES, tierForPoints, type CreateLogRequest, type CreateLogResponse, type Tier } from "@sponsor/shared";
import { NextRequest } from "next/server";

import { requireUser, UnauthorizedError } from "@/lib/requireUser";

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireUser(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) return Response.json({ error: err.message }, { status: 401 });
    throw err;
  }

  const body = (await request.json()) as Partial<CreateLogRequest>;

  if (!body.activityType) return Response.json({ error: "activityType is required" }, { status: 400 });
  if (!body.companyName?.trim()) return Response.json({ error: "companyName is required" }, { status: 400 });
  if (!body.outcome || !OUTCOMES.some((o) => o.key === body.outcome)) {
    return Response.json({ error: "outcome must be a valid outcome key" }, { status: 400 });
  }

  const activityType = await prisma.activityType.findUnique({ where: { key: body.activityType } });
  if (!activityType || !activityType.active) {
    return Response.json({ error: "Unknown or inactive activityType" }, { status: 400 });
  }

  const { log, updatedUser, newTier } = await prisma.$transaction(async (tx) => {
    const log = await tx.log.create({
      data: {
        userId: user.id,
        activityType: activityType.key,
        points: activityType.points,
        companyName: body.companyName!.trim(),
        contactName: body.contactName?.trim() || null,
        outcome: body.outcome!,
        notes: body.notes?.trim() || null,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        totalPoints: { increment: activityType.points },
        monthlyPoints: { increment: activityType.points },
      },
    });

    const newTier = tierForPoints(updatedUser.totalPoints);
    if (newTier !== updatedUser.currentTier) {
      await tx.user.update({ where: { id: user.id }, data: { currentTier: newTier } });
    }

    return { log, updatedUser, newTier };
  });

  const response: CreateLogResponse = {
    log: {
      id: log.id,
      activityType: log.activityType,
      points: log.points,
      companyName: log.companyName,
      contactName: log.contactName,
      outcome: log.outcome as CreateLogResponse["log"]["outcome"],
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    },
    totalPoints: updatedUser.totalPoints,
    monthlyPoints: updatedUser.monthlyPoints,
    tier: newTier,
    tierCrossed: newTier !== (user.currentTier as Tier) ? newTier : null,
  };
  return Response.json(response);
}
