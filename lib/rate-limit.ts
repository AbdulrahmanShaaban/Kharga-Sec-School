import { prisma } from "./db";
import { constants } from "./constants";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const windowMs = constants.RATE_LIMIT_WINDOW_MS;
  const maxRequests = constants.RATE_LIMIT_MAX_REQUESTS;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Clean old entries
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
      where: { key },
      orderBy: { createdAt: "asc" },
    });
    const resetAt = oldest
      ? oldest.createdAt.getTime() + windowMs
      : now.getTime() + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  await prisma.rateLimitEntry.create({ data: { key } });
  return { allowed: true, remaining: maxRequests - count - 1, resetAt: now.getTime() + windowMs };
}

export function getClientKey(ip: string | undefined, path: string): string {
  const safeIp = (ip || "unknown").split(",")[0].trim();
  return `rl:${safeIp}:${path}`;
}