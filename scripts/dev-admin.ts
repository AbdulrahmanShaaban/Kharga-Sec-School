#!/usr/bin/env node
/**
 * DEVELOPMENT-ONLY admin for local work on the portal.
 *
 * Refuses to run when NODE_ENV=production. The account uses a clearly fake
 * address that can never collide with the school-approved admin
 * (docs/ADMIN-SETUP.md covers the real bootstrap).
 *
 * Usage:  npm run dev:admin
 * Optional: DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD env overrides.
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
  // no .env
}

if (process.env.NODE_ENV === "production") {
  console.error("REFUSED: this script is development-only. Use scripts/bootstrap-admin.ts.");
  process.exit(1);
}

const email = process.env.DEV_ADMIN_EMAIL || "devadmin@localhost.test";
const password = process.env.DEV_ADMIN_PASSWORD || "dev-admin-password-123";

async function main() {
  const { prisma } = await import("../lib/db");
  const { hashPassword } = await import("better-auth/crypto");

  const hashed = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", emailVerified: true },
    create: { email, name: "Dev Admin", emailVerified: true, role: "ADMIN" },
  });

  const account = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
  if (account) {
    await prisma.account.update({ where: { id: account.id }, data: { password: hashed } });
  } else {
    await prisma.account.create({
      data: { userId: user.id, accountId: user.id, providerId: "credential", password: hashed },
    });
  }

  console.log(`Development admin ready: ${email} / ${password}`);
  console.log("(development only — never create this account in production)");
}

main().catch((e) => {
  console.error("dev-admin failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
