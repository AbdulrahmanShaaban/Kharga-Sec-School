"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, FileText, MessageSquare, Lightbulb, Image as ImageIcon, Settings, LogOut, UserRound, Type } from "lucide-react";
import { cn } from "@/lib/utils";

/** Who is signed in — passed down from the guarded layout. */
export type PanelUser = {
  name: string | null;
  email: string;
  roleLabel: string;
};

const navItems = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/content", label: "المحتوى", icon: FileText },
  { href: "/admin/complaints", label: "الشكاوى", icon: MessageSquare },
  { href: "/admin/suggestions", label: "المقترحات", icon: Lightbulb },
  { href: "/admin/media", label: "الوسائط", icon: ImageIcon },
  { href: "/admin/pages", label: "نصوص الصفحات", icon: Type },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="تنقل لوحة التحكم" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/sign-out" method="POST">
      <button
        type="submit"
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white",
          className
        )}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        تسجيل الخروج
      </button>
    </form>
  );
}

function UserBadge({ user }: { user: PanelUser }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <UserRound className="h-4.5 w-4.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{user.name || user.email}</p>
        <p className="truncate text-xs text-white/60">{user.roleLabel}</p>
      </div>
    </div>
  );
}

/** Desktop sidebar — always visible on large screens. */
export function AdminSidebar({ user }: { user: PanelUser }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-primary text-white lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <h2 className="text-base font-extrabold">لوحة التحكم</h2>
        <p className="mt-0.5 text-xs text-white/60">مدرسة الخارجة الثانوية بنين</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks />
      </div>
      <div className="space-y-2 border-t border-white/10 p-3">
        <UserBadge user={user} />
        <SignOutButton />
      </div>
    </aside>
  );
}

/** Mobile drawer — replaces the sidebar below the lg breakpoint. */
export function AdminMobileNav({ user }: { user: PanelUser }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح قائمة لوحة التحكم"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary transition-colors hover:bg-muted"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="قائمة لوحة التحكم">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 right-0 flex w-[17rem] max-w-[85vw] flex-col bg-primary text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-sm font-extrabold">لوحة التحكم</p>
                <p className="text-xs text-white/60">مدرسة الخارجة الثانوية بنين</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="space-y-2 border-t border-white/10 p-3">
              <UserBadge user={user} />
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
