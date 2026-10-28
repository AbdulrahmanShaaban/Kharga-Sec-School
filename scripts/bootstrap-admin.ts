#!/usr/bin/env node
/**
 * Bootstrap Admin — creates the FIRST admin account (trusted procedure).
 * Run this locally or on a trusted server, never from a public surface.
 *
 * Usage:
 *   ADMIN_BOOTSTRAP_EMAIL=alkhargasecondaryschoolforboys@gmail.com npx tsx scripts/bootstrap-admin.ts
 *
 * Rules (spec §10):
 * - The email must exactly match the school-approved address.
 * - The password is asked for interactively and never logged or stored.
 * - Re-running never overwrites an existing ADMIN account's password.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

// Load .env manually so the script works with plain `npx tsx`
try {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  // .env not found — rely on already-exported environment variables
}

const ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL;
const REQUIRED_EMAIL = "alkhargasecondaryschoolforboys@gmail.com";

if (!ADMIN_EMAIL) {
  console.error("ERROR: ADMIN_BOOTSTRAP_EMAIL env variable is required");
  process.exit(1);
}

if (ADMIN_EMAIL !== REQUIRED_EMAIL) {
  console.error(`ERROR: email mismatch — the bootstrap only provisions the school-approved address (${REQUIRED_EMAIL}).`);
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

async function main() {
  const password = await new Promise<string>((resolveP) => {
    rl.question("Enter admin password (min 10 chars, will not be displayed twice): ", (answer) => {
      rl.close();
      resolveP(answer);
    });
  });

  if (password.length < 10) {
    console.error("ERROR: password must be at least 10 characters");
    process.exit(1);
  }

  const { prisma } = await import("../lib/db");
  // Use Better Auth's own hasher so the stored hash matches what sign-in verifies.
  const { hashPassword } = await import("better-auth/crypto");

  const existing = await prisma.user.findUnique({ where: { email: REQUIRED_EMAIL } });

  if (existing) {
    if (existing.role === "ADMIN") {
      console.log("Admin user already exists with the ADMIN role — nothing changed.");
      console.log("To rotate the password, delete the account row from a trusted environment and re-run this script.");
      process.exit(0);
    }
    await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN", emailVerified: true } });
    console.log(`User ${REQUIRED_EMAIL} upgraded to ADMIN role.`);
  } else {
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: REQUIRED_EMAIL,
        name: "Admin",
        emailVerified: true,
        role: "ADMIN",
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashed,
      },
    });

    console.log(`Admin user created: ${REQUIRED_EMAIL}`);
  }

  console.log("Bootstrap complete. You can now sign in at /admin/login");
}

main().catch((e) => {
  console.error("bootstrap-admin failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
