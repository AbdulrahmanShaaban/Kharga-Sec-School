import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, MessageSquare, Lightbulb, Plus, Eye, Settings } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDateArabic } from "@/lib/format-date";

export const instant = false;

export const metadata: Metadata = { title: "لوحة التحكم" };

type StatCard = {
  label: string;
  value: number;
  href: string;
  icon: typeof FileText;
  tone: string;
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const [newsCount, activitiesCount, competitionsCount, newComplaints, pendingSuggestions, publishedSuggestions] =
    await Promise.all([
      prisma.contentItem.count({ where: { type: "NEWS", status: { not: "ARCHIVED" } } }).catch(() => 0),
      prisma.contentItem.count({ where: { type: "ACTIVITY", status: { not: "ARCHIVED" } } }).catch(() => 0),
      prisma.contentItem.count({ where: { type: "COMPETITION", status: { not: "ARCHIVED" } } }).catch(() => 0),
      prisma.complaint.count({ where: { status: { in: ["NEW", "UNDER_REVIEW"] } } }).catch(() => 0),
      prisma.suggestionPrivate.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.publishedSuggestion.count().catch(() => 0),
    ]);

  const stats: StatCard[] = [
    { label: "أخبار", value: newsCount, href: "/admin/content?type=news", icon: FileText, tone: "bg-primary-soft text-primary" },
    { label: "أنشطة", value: activitiesCount, href: "/admin/content?type=activity", icon: FileText, tone: "bg-secondary-soft text-secondary" },
    { label: "مسابقات", value: competitionsCount, href: "/admin/content?type=competition", icon: FileText, tone: "bg-accent-soft text-accent" },
    { label: "شكاوى جديدة", value: newComplaints, href: "/admin/complaints", icon: MessageSquare, tone: "bg-destructive-soft text-destructive" },
    { label: "مقترحات بانتظار المراجعة", value: pendingSuggestions, href: "/admin/suggestions", icon: Lightbulb, tone: "bg-warning-soft text-warning" },
    { label: "مقترحات منشورة", value: publishedSuggestions, href: "/admin/suggestions", icon: Eye, tone: "bg-success-soft text-success" },
  ];

  let recentComplaints: Array<{ id: string; referenceCode: string; subject: string; submittedAt: Date }> = [];
  try {
    recentComplaints = await prisma.complaint.findMany({
      orderBy: { submittedAt: "desc" },
      take: 5,
      select: { id: true, referenceCode: true, subject: true, submittedAt: true },
    });
  } catch {
    // dashboard still renders with zeroed stats
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-muted-foreground">مرحبًا {admin.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/content/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" aria-hidden />
            محتوى جديد
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-muted"
          >
            <Eye className="h-4 w-4" aria-hidden />
            معاينة الموقع
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4" aria-hidden />
            الإعدادات
          </Link>
        </div>
      </div>

      <section aria-label="إحصائيات">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <span>
                  <span className="tabular block text-2xl font-extrabold text-primary">{stat.value.toLocaleString("ar-EG")}</span>
                  <span className="block text-sm font-semibold text-muted-foreground">{stat.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-extrabold text-primary">آخر الشكاوى الواردة</h2>
          <Link href="/admin/complaints" className="text-sm font-bold text-secondary transition-colors hover:text-accent">
            عرض الكل
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">لا توجد شكاوى حتى الآن.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentComplaints.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/complaints/${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{c.subject}</span>
                    <span className="tabular block text-xs text-muted-foreground">رقم {c.referenceCode}</span>
                  </span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">{formatDateArabic(c.submittedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
