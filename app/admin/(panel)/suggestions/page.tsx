import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDateArabic } from "@/lib/format-date";
import { EmptyState } from "@/components/site/content";
import { suggestionStatusMeta } from "@/components/admin/status-meta";

export const instant = false;

export const metadata: Metadata = { title: "المقترحات" };

const statusFilters = [
  { key: "", label: "الكل" },
  { key: "PENDING", label: "بانتظار المراجعة" },
  { key: "APPROVED", label: "معتمدة" },
  { key: "REJECTED", label: "مرفوضة" },
  { key: "HIDDEN", label: "مخفي" },
];

export default async function AdminSuggestionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;

  const where: { status?: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN" } = {};
  if (sp.status && ["PENDING", "APPROVED", "REJECTED", "HIDDEN"].includes(sp.status)) {
    where.status = sp.status as "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  }

  const items = await prisma.suggestionPrivate
    .findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 100,
      include: { published: { select: { publishedAt: true } } },
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">المقترحات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عند الاعتماد يُنشر نص المقترح فقط في صفحة المقترحات — دون أي بيانات تعريفية.
        </p>
      </div>

      <nav aria-label="تصفية حسب الحالة" className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const href = f.key ? `/admin/suggestions?status=${f.key}` : "/admin/suggestions";
          const active = (sp.status ?? "") === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState title="لا توجد مقترحات بهذه الحالة" hint="تظهر هنا المقترحات المقدمة من الزوار." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const meta = suggestionStatusMeta[item.status];
              return (
                <li key={item.id}>
                  <Link href={`/admin/suggestions/${item.id}`} className="block px-5 py-4 transition-colors hover:bg-muted">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <p className="line-clamp-1 min-w-0 flex-1 text-[15px] font-bold text-primary">{item.suggestionText}</p>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="tabular mt-1 text-xs text-muted-foreground">
                      {formatDateArabic(item.submittedAt)}
                      {item.published?.publishedAt && ` · نُشر ${formatDateArabic(item.published.publishedAt)}`}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
