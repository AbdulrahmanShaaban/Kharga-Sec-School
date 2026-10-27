#!/usr/bin/env node
/**
 * Verify database has seeded content.
 */

const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

// Load .env manually
try {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  // .env not found
}

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const [newsCount, activitiesCount, competitionsCount, settingsCount] = await Promise.all([
    prisma.contentItem.count({ where: { type: "NEWS" } }),
    prisma.contentItem.count({ where: { type: "ACTIVITY" } }),
    prisma.contentItem.count({ where: { type: "COMPETITION" } }),
    prisma.siteSettings.count(),
  ]);

  console.log(`News: ${newsCount}`);
  console.log(`Activities: ${activitiesCount}`);
  console.log(`Competitions: ${competitionsCount}`);
  console.log(`Settings: ${settingsCount}`);

  if (newsCount > 0) {
    const news = await prisma.contentItem.findMany({ where: { type: "NEWS" } });
    console.log("\nNews items:");
    news.forEach((n) => console.log(`  - ${n.title} (${n.slug}) status=${n.status}`));
  }
}

main()
  .catch((e) => {
    console.error("Check failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });