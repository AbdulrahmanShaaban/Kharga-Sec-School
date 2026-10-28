import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./db";

/**
 * Roles allowed to reach the admin panel and admin APIs.
 * ADMIN  = مدير المدرسة (owns the school account).
 * TEACHER = فريق العمل (students/staff who publish content — full access per
 *           the school's decision; the role only labels who they are).
 */
export const ADMIN_ROLE = "ADMIN";
export const STAFF_ROLE = "TEACHER";
export const ADMIN_ROLES: readonly string[] = [ADMIN_ROLE, STAFF_ROLE];

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

/** Human label for the signed-in staff member (shown in the panel header). */
export function roleLabel(role: string): string {
  return role === ADMIN_ROLE ? "مدير المدرسة" : "فريق العمل";
}

/**
 * Read the current session (server-side only).
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Verify that the caller is an authenticated staff member (ADMIN or TEACHER).
 *
 * The role is always re-read from the database instead of trusting anything
 * carried in the session cookie or client payload (spec §10). Every admin
 * Route Handler and Server Component must call this before reading or
 * writing data.
 *
 * Returns `null` when the request is not authorized.
 */
export async function requireAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user || !ADMIN_ROLES.includes(user.role)) return null;

  return user;
}
