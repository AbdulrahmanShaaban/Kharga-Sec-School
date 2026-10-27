#!/usr/bin/env tsx
/**
 * Bootstrap Admin — creates the first admin account.
 * Run this in a trusted environment (secure server, local machine).
 *
 * Usage: npx tsx scripts/bootstrap-admin.ts
 *
 * Required env: ADMIN_BOOTSTRAP_EMAIL (must match the approved email)
 * The script will prompt for a password securely (not logged).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { randomBytes, scryptSync } from "node:crypto";

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

const ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL;
const REQUIRED_EMAIL = "alkhargasecondaryschoolforboys@gmail.com";

if (!ADMIN_EMAIL) {
  console.error("ERROR: ADMIN_BOOTSTRAP_EMAIL env variable is required");
  process.exit(1);
}

if (ADMIN_EMAIL !== REQUIRED_EMAIL) {
  console.error(`ERROR: Email mismatch. Expected: ${REQUIRED_EMAIL}`);
  process.exit(1);
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const password = await new Promise<string>((resolve) => {
  rl.question("Enter admin password: ", (answer) => {
    rl.close();
    resolve(answer);
  });
});

if (password.length < 8) {
  console.error("ERROR: Password must be at least 8 characters");
  process.exit(1);
}

const { prisma } = await import("../lib/db");

// Check if user exists
const existing = await prisma.user.findUnique({
  where: { email: ADMIN_EMAIL },
});

if (existing) {
  if (existing.role === "ADMIN") {
    console.log("Admin user already exists with ADMIN role.");
    process.exit(0);
  }
  // Upgrade existing user to admin
  await prisma.user.update({
    where: { id: existing.id },
    data: { role: "ADMIN" },
  });
  console.log(`User ${ADMIN_EMAIL} upgraded to ADMIN role.`);
} else {
  // Create user directly with bcrypt hash
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  const passwordHash = `${salt}:${hash}`;

  const user = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "Admin",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  // Create account record with password hash
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: passwordHash,
    },
  });

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
}

console.log("Bootstrap complete. You can now log in at /admin/login");