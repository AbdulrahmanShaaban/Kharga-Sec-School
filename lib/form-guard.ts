import { NextResponse } from "next/server";
import { checkRateLimit, getClientKey } from "./rate-limit";

/**
 * Shared anti-spam pipeline for the public submission endpoints.
 *
 *   1. honeypot  — silently pretend success for bots
 *   2. rate limit — Neon-backed sliding window (shared across serverless
 *                   instances, so it cannot be dodged by spreading requests)
 *
 * (hCaptcha was removed by explicit decision of the school portal owner.)
 */
export type GuardDecision =
  | { kind: "ok" }
  | { kind: "silentSuccess" }
  | { kind: "error"; response: NextResponse };

export async function evaluateSubmissionGuard(options: {
  routeKey: string;
  ip?: string | null;
  honeypot?: string | null;
}): Promise<GuardDecision> {
  const { routeKey, ip, honeypot } = options;

  // 1) Honeypot — do not reveal that we detected the bot.
  if (honeypot && honeypot.trim() !== "") {
    return { kind: "silentSuccess" };
  }

  // 2) Rate limiting (shared, persistent).
  const key = getClientKey(ip ?? undefined, routeKey);
  const rl = await checkRateLimit(key);
  if (!rl.allowed) {
    return {
      kind: "error",
      response: NextResponse.json(
        { error: "عدد كبير من المحاولات. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى." },
        { status: 429 }
      ),
    };
  }

  return { kind: "ok" };
}

/** Format Zod issues into a field -> messages map for the client. */
export function fieldErrorsFromZod(issues: Array<{ path: PropertyKey[]; message: string }>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}
