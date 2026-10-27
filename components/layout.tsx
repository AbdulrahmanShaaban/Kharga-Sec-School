"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "الصفحة الرئيسية" },
  { href: "/about", label: "نبذة عن المدرسة" },
  { href: "/news", label: "الأخبار" },
  { href: "/activities", label: "الأنشطة" },
  { href: "/competitions", label: "المسابقات" },
  { href: "/contact", label: "التواصل" },
  { href: "/complaints", label: "الشكاوى" },
  { href: "/suggestions", label: "المقتراحات" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <School className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">مدرسة الخرجة الثانوية بنين</span>
            <span className="text-xs text-muted-foreground">مدرسة الخرجة الثانوية بنين</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-1 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <School className="h-6 w-6" />
              </div>
              <span className="font-bold text-primary">مدرسة الخرجة الثانوية بنين</span>
            </div>
            <p className="text-sm text-muted-foreground">
              مدرسة الثانوية بنين
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">تفاصيل الاتصال</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span>عنوان المدرسة (يُدخل من لوحة التحكم)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>رقم الهاتف (يُدخل من لوحة التحكم)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>البريد الإلكتروني (يُدخل من لوحة التحكم)</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-accent">نبذة عن المدرسة</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-accent">الأخبار</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-accent">التواصل</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-accent">خصوصية</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 مدرسة الخرجة الثانوية بنين. جميع الحقوق محفوظة.</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:text-accent">خصوصية</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}