import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

/**
 * Better Auth configuration.
 *
 * Security decisions (spec §10):
 * - Public sign-up is completely disabled. The only way to create an admin
 *   account is the trusted `scripts/bootstrap-admin.ts` procedure.
 * - Sessions are HttpOnly cookies (Secure in production, SameSite=Lax).
 * - Built-in rate limiting guards the email/password endpoints against
 *   password guessing.
 * - The role is NEVER taken from client input; it is read from the database
 *   by `lib/session.ts#requireAdmin`.
 */
function requiredSecret(name: string): string {
  const value = process.env[name];
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") {
    // Fail fast in production instead of running with a weak/absent secret.
    throw new Error(`[auth] Missing or too-short ${name} (min 32 chars). Set it in the hosting environment.`);
  }
  return "dev-only-insecure-secret-do-not-use-in-production-0123456789";
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // No public registration: admin accounts are provisioned only through the
    // trusted bootstrap procedure (docs/ADMIN-SETUP.md).
    disableSignUp: true,
  },
  secret: requiredSecret("BETTER_AUTH_SECRET"),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false,
        // The role can never be changed through client-side sign-up/sign-in payloads.
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60, // 1 hour
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60, // seconds
    max: 10, // requests per window per IP for auth endpoints
  },
  advanced: {
    // Cross-site request protection for state-changing auth endpoints.
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
