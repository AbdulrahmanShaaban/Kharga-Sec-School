import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDateArabic } from "@/lib/format-date";
import { EmptyState } from "@/components/site/content";
import { complaintStatusMeta } from "@/components/admin/status-meta";

export const instant = false;

export const metadata: Metadata = { title: "الشكاوى" };

const statusFilters = [
  { key: "", label: "الكل" },
  { key: "NEW", label: "جديدة" },
  { key: "UNDER_REVIEW", label: "قيد المراجعة" },
  { key: "IN_PROGRESS", label: "قيد المعالجة" },
  { key: "RESOLVED", label: "تم الحل" },
  { key: "CLOSED", label: "مغلقة" },
];

export default async function AdminComplaintsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;

  const where: { status?: "NEW" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" } = {};
  if (sp.status && ["NEW", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(sp.status)) {
    where.status = sp.status as "NEW" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  }

  const items = await prisma.complaint
    .findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 100,
      select: {
        id: true,
        referenceCode: true,
        subject: true,
        category: true,
        status: true,
        submittedAt: true,
      },
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">الشكاوى</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          الشكاوى سرية ولا تُعرض للعامة. تظهر هنا فقط للمشرفين المخولين.
        </p>
      </div>

      <nav aria-label="تصفية حسب الحالة" className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const href = f.key ? `/admin/complaints?status=${f.key}` : "/admin/complaints";
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
        <EmptyState title="لا توجد شكاوى بهذه الحالة" hint="ستظهر الشكاوى الواردة هنا فور تقديمها من الزوار." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const meta = complaintStatusMeta[item.status];
              return (
                <li key={item.id}>
                  <Link href={`/admin/complaints/${item.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-muted">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-primary">{item.subject}</p>
                      <p className="tabular mt-1 text-xs text-muted-foreground">
                        رقم {item.referenceCode} · {item.category || "بدون تصنيف"} · {formatDateArabic(item.submittedAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}
                    >
                      {meta.label}
                    </span>
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
