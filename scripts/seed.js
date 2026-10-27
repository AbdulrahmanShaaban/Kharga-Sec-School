#!/usr/bin/env node
/**
 * Seed database with initial content.
 * Run after migrations: node scripts/seed.js
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
  console.log("Seeding database...");

  // Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "seed-settings" },
    update: {},
    create: {
      id: "seed-settings",
      schoolName: "مدرسة الخرجة الثانوية بنين",
      tagline: "مدرسة الثانوية",
      address: "الخرجة، مصر",
      phone: "+20 123 456 7890",
      email: "info@khargha.edu.eg",
      hours: "السبت - الخميس: 8:00 ص - 3:00 م",
      facebookUrl: "https://facebook.com/khargha-school",
      twitterUrl: "https://twitter.com/khargha-school",
      instagramUrl: "https://instagram.com/khargha-school",
      footerText: "مدرسة الخرجة الثانوية بنين - جميع الحقوق محفوظة",
      seoTitle: "مدرسة الخرجة الثانوية بنين",
      seoDesc: "الموقع oficial لمدرسة الخرجة الثانوية بنين",
    },
  });
  console.log("Site settings created");

  // Sample News
  const newsItems = [
    {
      type: "NEWS",
      title: "بدأ الفصل الدراسي الأول",
      slug: "start-of-first-term",
      body: "نبلغ جميع طلاب وطلاب المدرسة أن الفصل الدراسي الأول سيبدأ في يوم السبت 15 سبتمبر 2026. نتطلع إلى رؤيتكم.",
      excerpt: "الاعلان عن بداية الفصل الدراسي الأول",
      status: "PUBLISHED",
      publishedAt: new Date("2026-09-15T08:00:00Z"),
      pinned: true,
      sortOrder: 1,
    },
    {
      type: "NEWS",
      title: "الامتحانات النهائية",
      slug: "final-exams-schedule",
      body: "جدول الامتحانات النهائية للفصل الدراسي الأول. يرجى مراجعة الجدول بعناية.",
      excerpt: "جدول الامتحانات النهائية",
      status: "PUBLISHED",
      publishedAt: new Date("2026-10-20T08:00:00Z"),
      pinned: false,
      sortOrder: 2,
    },
  ];

  for (const item of newsItems) {
    await prisma.contentItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log("Sample news created");

  // Sample Activities
  const activities = [
    {
      type: "ACTIVITY",
      title: "الربيعية المدرسية",
      slug: "spring-activity",
      body: "الربيعية في المدرسة. تفاصيل الحدث.",
      excerpt: "الربيعية المدرسية",
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-20T08:00:00Z"),
      eventStartAt: new Date("2026-04-01T08:00:00Z"),
      eventEndAt: new Date("2026-04-01T15:00:00Z"),
      location: "ملعب المدرسة",
      conditions: "الطلاب المسجلون فقط",
      pinned: false,
      sortOrder: 1,
    },
  ];

  for (const item of activities) {
    await prisma.contentItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log("Sample activities created");

  // Sample Competitions
  const competitions = [
    {
      type: "COMPETITION",
      title: "المنافسة الرياضية في الرياضيات",
      slug: "math-competition",
      body: "المنافسة الرياضية في مادة الرياضيات. يشترى participate.",
      excerpt: "المنافسة الرياضية",
      status: "PUBLISHED",
      publishedAt: new Date("2026-11-01T08:00:00Z"),
      eventStartAt: new Date("2026-11-15T08:00:00Z"),
      eventEndAt: new Date("2026-11-15T14:00:00Z"),
      location: "قاعة العلوم",
      conditions: "الطلاب من الفصلين الأول والثاني",
      results: "النواتج ستُ announce لاحقاً",
      pinned: false,
      sortOrder: 1,
    },
  ];

  for (const item of competitions) {
    await prisma.contentItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log("Sample competitions created");

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });