import { prisma } from "./db";
import { constants } from "./constants";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Neon-backed sliding-window rate limiter.
 *
 * A shared persistent store is required on serverless (Vercel): in-memory
 * maps are per-instance and reset constantly, so they cannot limit an
 * attacker that spreads requests (spec §12.5).
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const windowMs = constants.RATE_LIMIT_WINDOW_MS;
  const maxRequests = constants.RATE_LIMIT_MAX_REQUESTS;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Opportunistic cleanup of expired entries (bounded work per call).
  await prisma.rateLimitEntry.deleteMany({
    where: { createdAt: { lt: windowStart } },
  });

  const count = await prisma.rateLimitEntry.count({
    where: {
      key,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= maxRequests) {
    const oldest = await prisma.rateLimitEntry.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
    });
    const resetAt = oldest ? oldest.createdAt.getTime() + windowMs : now.getTime() + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  await prisma.rateLimitEntry.create({ data: { key } });
  return { allowed: true, remaining: maxRequests - count - 1, resetAt: now.getTime() + windowMs };
}

/**
 * Build a rate-limit key from the client IP and route. The raw IP is never
 * stored — only a keyed hash, so the table cannot be mined for addresses.
 */
export function getClientKey(ip: string | undefined, path: string): string {
  const safeIp = (ip || "unknown").split(",")[0].trim().slice(0, 45);
  return `rl:${hashKey(`${safeIp}:${path}`)}`;
}

/** Small non-reversible hash so raw IPs never land in the database. */
function hashKey(input: string): string {
  // Node's crypto is available in the runtime used by Next.js route handlers.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("node:crypto") as typeof import("node:crypto");
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}
