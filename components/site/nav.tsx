"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/news", label: "الأخبار" },
  { href: "/activities", label: "الأنشطة" },
  { href: "/competitions", label: "المسابقات" },
  { href: "/about", label: "عن المدرسة" },
  { href: "/contact", label: "التواصل" },
];

const secondaryItems = [
  { href: "/complaints", label: "تقديم شكوى" },
  { href: "/suggestions", label: "تقديم مقترح" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={cn(
            "relative rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors",
            isActive(pathname, item.href)
              ? "text-primary"
              : "text-muted-foreground hover:text-primary hover:bg-muted"
          )}
        >
          {item.label}
          {isActive(pathname, item.href) && (
            <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
          )}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
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
        aria-label="فتح قائمة التنقل"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary transition-colors hover:bg-muted"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 right-0 flex w-[19rem] max-w-[85vw] flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-sm font-bold text-primary">القائمة</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق قائمة التنقل"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav aria-label="التنقل" className="flex flex-col gap-1 overflow-y-auto p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors",
                    isActive(pathname, item.href)
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 border-t border-border" />
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
