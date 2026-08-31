import { prisma } from "@sponsor/db";
import type { FeedEntryDTO } from "@sponsor/shared";

export async function getFeed(limit: number, cursor?: string | null) {
  const rows = await prisma.log.findMany({
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const entries: FeedEntryDTO[] = rows.map((log) => ({
    id: log.id,
    activityType: log.activityType,
    points: log.points,
    companyName: log.companyName,
    contactName: log.contactName,
    outcome: log.outcome as FeedEntryDTO["outcome"],
    notes: log.notes,
    createdAt: log.createdAt.toISOString(),
    user: log.user,
  }));

  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
  return { entries, nextCursor };
}
