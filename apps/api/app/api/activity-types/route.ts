import { prisma } from "@sponsor/db";
import type { ActivityTypeDTO } from "@sponsor/shared";

export async function GET() {
  const activityTypes = await prisma.activityType.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const response: ActivityTypeDTO[] = activityTypes.map((a) => ({
    key: a.key,
    label: a.label,
    category: a.category as ActivityTypeDTO["category"],
    points: a.points,
    sortOrder: a.sortOrder,
  }));
  return Response.json(response);
}
