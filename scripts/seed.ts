#!/usr/bin/env node
/**
 * DEVELOPMENT-ONLY seed — refuses to run when NODE_ENV=production.
 *
 * Everything created here is a DRAFT: nothing appears on the public site
 * until a human reviews and publishes it from the admin panel (spec §8 —
 * the production site must never ship invented news, contacts, or results).
 *
 * Usage:  npm run db:seed
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const envPath = resolve(process.cwd(), ".env");
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  // no .env — rely on exported env
}

if (process.env.NODE_ENV === "production") {
  console.error("REFUSED: this seed is development-only. Production content is entered through the admin panel.");
  process.exit(1);
}

async function main() {
  const { prisma } = await import("../lib/db");

  console.log("Seeding development data (drafts only)...");

  // ── Cleanup of the legacy bad seed ────────────────────────────────
  // An earlier seed published invented news/contacts as real data (spec §5
  // forbids invented data). Remove those rows so the site shows honest
  // empty states until the school enters the real content.
  const legacySlugs = ["start-of-first-term", "final-exams-schedule", "spring-activity", "math-competition"];
  const removed = await prisma.contentItem.deleteMany({ where: { slug: { in: legacySlugs } } });
  if (removed.count > 0) console.log(`Removed ${removed.count} legacy fake content items`);

  const legacySettings = await prisma.siteSettings.findFirst({
    where: {
      OR: [{ phone: "+20 123 456 7890" }, { email: "info@khargha.edu.eg" }, { id: "seed-settings" }],
    },
  });
  if (legacySettings) {
    await prisma.siteSettings.update({
      where: { id: legacySettings.id },
      data: {
        address: null,
        phone: null,
        email: null,
        hours: null,
        mapUrl: null,
        facebookUrl: null,
        twitterUrl: null,
        instagramUrl: null,
      },
    });
    console.log("Cleared invented contact data from the legacy settings row");
  }

  // A minimal settings row so the admin settings page has a base to edit.
  // No phone/email/address: the school fills in the real ones (spec §5).
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        schoolName: "مدرسة الخارجة الثانوية بنين",
        seoTitle: "مدرسة الخارجة الثانوية بنين",
        seoDesc: "الموقع الرسمي لمدرسة الخارجة الثانوية بنين",
      },
    });
    console.log("Site settings row created (school name only — contacts intentionally empty)");
  } else {
    console.log("Site settings already exist — left untouched");
  }

  const drafts = [
    {
      type: "NEWS" as const,
      title: "مسودة خبر تجريبي",
      slug: "dev-draft-news",
      excerpt: "خبر تجريبي للتطوير فقط — لن يظهر للزوار قبل النشر.",
      body: "هذا نص تجريبي للتأكد من عمل نموذج المحتوى. عدّله أو احذفه من لوحة التحكم.",
      status: "DRAFT" as const,
      pinned: false,
      sortOrder: 0,
    },
    {
      type: "ACTIVITY" as const,
      title: "مسودة نشاط تجريبي",
      slug: "dev-draft-activity",
      excerpt: "نشاط تجريبي للتطوير فقط.",
      body: "نشاط تجريبي للتأكد من عرض التواريخ والمكان. عدّله أو احذفه من لوحة التحكم.",
      status: "DRAFT" as const,
      eventStartAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      eventEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      location: "ملعب المدرسة",
      pinned: false,
      sortOrder: 0,
    },
    {
      type: "COMPETITION" as const,
      title: "مسودة مسابقة تجريبية",
      slug: "dev-draft-competition",
      excerpt: "مسابقة تجريبية للتطوير فقط.",
      body: "مسابقة تجرريبية للتأكد من عمل شارة الحالة وقسم النتائج. عدّلها أو احذفها من لوحة التحكم.",
      status: "DRAFT" as const,
      eventStartAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      eventEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      location: "قاعة العلوم",
      conditions: "شروط تجريبية — تُستبدل بشروط المسابقة الحقيقية.",
      pinned: false,
      sortOrder: 0,
    },
  ];

  for (const draft of drafts) {
    await prisma.contentItem.upsert({
      where: { slug: draft.slug },
      update: {},
      create: draft,
    });
  }
  console.log(`${drafts.length} draft content items ready`);

  console.log("\nSeed complete. Sign in with:  npm run dev:admin");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
