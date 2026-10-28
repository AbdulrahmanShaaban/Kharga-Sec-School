import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDateArabic } from "@/lib/format-date";
import { EmptyState } from "@/components/site/content";
import { ArchiveButton } from "./archive-button";

export const instant = false;

export const metadata: Metadata = { title: "المحتوى" };

const typeLabels: Record<string, string> = { NEWS: "خبر", ACTIVITY: "نشاط", COMPETITION: "مسابقة" };
const statusLabels: Record<string, string> = {
  DRAFT: "مسودة",
  PUBLISHED: "منشور",
  ARCHIVED: "مؤرشف",
  SCHEDULED: "مجدول",
};
const statusTone: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  PUBLISHED: "bg-success-soft text-success border-success/20",
  ARCHIVED: "bg-destructive-soft text-destructive border-destructive/20",
  SCHEDULED: "bg-secondary-soft text-secondary border-secondary/20",
};

const filters = [
  { key: "", label: "الكل" },
  { key: "news", label: "أخبار" },
  { key: "activity", label: "أنشطة" },
  { key: "competition", label: "مسابقات" },
];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const sp = await searchParams;

  const where: { type?: "NEWS" | "ACTIVITY" | "COMPETITION"; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED" } = {};
  if (sp.type === "news" || sp.type === "activity" || sp.type === "competition") {
    where.type = sp.type.toUpperCase() as "NEWS" | "ACTIVITY" | "COMPETITION";
  }
  if (sp.status && ["draft", "published", "archived", "scheduled"].includes(sp.status)) {
    where.status = sp.status.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
  }

  const items = await prisma.contentItem
    .findMany({ where, orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }], take: 100 })
    .catch(() => []);

  const activeType = sp.type ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-primary">المحتوى</h1>
        <Link
          href="/admin/content/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          محتوى جديد
        </Link>
      </div>

      <nav aria-label="تصفية حسب النوع" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const href = f.key ? `/admin/content?type=${f.key}` : "/admin/content";
          const active = activeType === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState title="لا يوجد محتوى" hint="ابدأ بإنشاء خبر أو نشاط أو مسابقة جديدة." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/content/${item.id}`}
                      className="truncate text-[15px] font-bold text-primary hover:text-secondary hover:underline"
                    >
                      {item.title}
                    </Link>
                    {item.pinned && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">مثبّت</span>
                    )}
                  </div>
                  <p className="tabular mt-1 text-xs text-muted-foreground">
                    {typeLabels[item.type]} · آخر تحديث {formatDateArabic(item.updatedAt)}
                    {item.publishedAt && ` · نُشر ${formatDateArabic(item.publishedAt)}`}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusTone[item.status] ?? ""}`}
                >
                  {statusLabels[item.status] ?? item.status}
                </span>
                <div className="flex shrink-0 items-center gap-3 text-sm font-bold">
                  <Link href={`/admin/content/${item.id}`} className="text-secondary hover:text-accent">
                    تعديل
                  </Link>
                  {item.status !== "ARCHIVED" && <ArchiveButton id={item.id} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
