import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const activityTypes = [
  { key: "cold_email", label: "Cold Email", category: "online", points: 5, sortOrder: 0 },
  { key: "followup_email", label: "Follow-up Email", category: "online", points: 3, sortOrder: 1 },
  { key: "linkedin_outreach", label: "LinkedIn/Social Outreach", category: "online", points: 4, sortOrder: 2 },
  { key: "sponsor_research", label: "Sponsor Research (New Lead)", category: "online", points: 3, sortOrder: 3 },
  { key: "social_post", label: "Social Media Post/DM", category: "online", points: 3, sortOrder: 4 },
  { key: "cold_call", label: "Cold Call", category: "in_person", points: 8, sortOrder: 0 },
  { key: "in_person_pitch", label: "In-Person Pitch/Meeting", category: "in_person", points: 15, sortOrder: 1 },
  { key: "event_booth", label: "Event/Expo Booth", category: "in_person", points: 20, sortOrder: 2 },
  { key: "career_fair_talk", label: "Career Fair Recruiting Talk", category: "in_person", points: 12, sortOrder: 3 },
  { key: "community_outreach", label: "Community/Alumni Outreach", category: "in_person", points: 6, sortOrder: 4 },
];

const configRows = [
  { key: "points_per_dollar_ratio", value: "10" },
  // monthly_dollar_cap intentionally omitted -> uncapped by default
];

async function main() {
  for (const activityType of activityTypes) {
    await prisma.activityType.upsert({
      where: { key: activityType.key },
      update: activityType,
      create: activityType,
    });
  }

  for (const config of configRows) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }

  console.log(`Seeded ${activityTypes.length} activity types and ${configRows.length} config rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
