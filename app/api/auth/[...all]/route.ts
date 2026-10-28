import { auth } from "@/lib/auth";

/**
 * Better Auth HTTP surface: /api/auth/*
 *
 * Handles sign-in/sign-out/session for the admin panel. Sign-up is disabled
 * inside `lib/auth.ts` (emailAndPassword.disableSignUp), so this route does
 * not provide any public registration path.
 */
const handler = auth.handler;

export async function GET(request: Request): Promise<Response> {
  return handler(request);
}

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
