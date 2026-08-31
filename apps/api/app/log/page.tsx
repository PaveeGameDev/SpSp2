import { prisma } from "@sponsor/db";
import { redirect } from "next/navigation";

import { LogForm } from "@/app/log/LogForm";
import { getSessionUser } from "@/lib/getSessionUser";

export default async function LogPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const activityTypes = await prisma.activityType.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Pull a Job</h1>
      <LogForm
        activityTypes={activityTypes.map((a) => ({
          key: a.key,
          label: a.label,
          category: a.category as "online" | "in_person",
          points: a.points,
          sortOrder: a.sortOrder,
        }))}
      />
    </div>
  );
}
