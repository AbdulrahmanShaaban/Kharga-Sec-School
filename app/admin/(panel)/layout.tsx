import Link from "next/link";
import Image from "next/image";
import { requireAdmin, roleLabel } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/nav";

// The guard reads the session and re-reads the role from the database on every
// request, so this segment (and every page under it) must never be prerendered.
export const instant = false;

/**
 * Guarded admin shell (spec §10).
 *
 * Lives in a route group so /admin/login is NOT wrapped by it — otherwise the
 * redirect would loop on the login page itself.
 * The role is re-read from the database by requireAdmin(), never trusted from
 * the session cookie.
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        user={{ name: admin.name, email: admin.email, roleLabel: roleLabel(admin.role) }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <AdminMobileNav
            user={{ name: admin.name, email: admin.email, roleLabel: roleLabel(admin.role) }}
          />
          <Link href="/admin" className="flex items-center gap-2 text-sm font-extrabold text-primary">
            <span className="relative h-8 w-8 overflow-hidden rounded-lg ring-1 ring-border">
              <Image src="/logo.jpg" alt="شعار المدرسة" fill sizes="32px" className="object-cover" />
            </span>
            لوحة التحكم
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
