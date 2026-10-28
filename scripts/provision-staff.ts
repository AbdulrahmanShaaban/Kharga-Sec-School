#!/usr/bin/env node
/**
 * Provision staff accounts (trusted procedure — run locally, never expose).
 *
 * Creates/updates the school's short-address accounts:
 *   - m@kharga.school      → ADMIN   (مدير المدرسة)
 *   - t@kharga.school      → TEACHER (فريق العمل)
 *   - t1..t3@kharga.school → TEACHER (فريق العمل — طلاب/مساعدون)
 *
 * All accounts share the password passed via STAFF_PASSWORD (no default —
 * the operator must state it explicitly, and it is never logged to disk).
 *
 * Usage:
 *   STAFF_PASSWORD="Kharga#2026" npx tsx scripts/provision-staff.ts
 *
 * Rules:
 * - Idempotent: re-running refreshes the password/role but never deletes data.
 * - The password is hashed with Better Auth's own hashPassword, so the
 *   accounts sign in through the normal credential flow.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env manually so the script works with plain `npx tsx`
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
  // no .env
}

const password = process.env.STAFF_PASSWORD;
if (!password) {
  console.error('REFUSED: set STAFF_PASSWORD first, e.g.  STAFF_PASSWORD="..." npx tsx scripts/provision-staff.ts');
  process.exit(1);
}

type Seed = { email: string; name: string; role: "ADMIN" | "TEACHER" };

const STAFF: Seed[] = [
  { email: "m@kharga.school", name: "مدير المدرسة", role: "ADMIN" },
  { email: "t@kharga.school", name: "فريق العمل", role: "TEACHER" },
  { email: "t1@kharga.school", name: "فريق العمل ١", role: "TEACHER" },
  { email: "t2@kharga.school", name: "فريق العمل ٢", role: "TEACHER" },
  { email: "t3@kharga.school", name: "فريق العمل ٣", role: "TEACHER" },
];

async function main() {
  const { prisma } = await import("../lib/db");
  const { hashPassword } = await import("better-auth/crypto");

  if (!password) throw new Error("STAFF_PASSWORD missing");
  const hashed = await hashPassword(password);

  for (const seed of STAFF) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: { role: seed.role, name: seed.name, emailVerified: true },
      create: {
        email: seed.email,
        name: seed.name,
        emailVerified: true,
        role: seed.role,
      },
    });

    const account = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashed },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashed,
        },
      });
    }

    console.log(`✔ ${seed.email} (${seed.role})`);
  }

  console.log("\nAll staff accounts are ready. Sign in at /admin/login");
}

main().catch((e) => {
  console.error("provision-staff failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
