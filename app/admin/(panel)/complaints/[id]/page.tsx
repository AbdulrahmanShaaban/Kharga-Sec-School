import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, Phone, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateArabic } from "@/lib/format-date";
import { ComplaintActions } from "@/components/admin/complaint-actions";
import { complaintStatusMeta } from "@/components/admin/status-meta";

export const instant = false;

export const metadata: Metadata = { title: "تفاصيل الشكوى" };

type Props = { params: Promise<{ id: string }> };

export default async function ComplaintDetailPage({ params }: Props) {
  const { id } = await params;
  const complaint = await prisma.complaint.findUnique({ where: { id } }).catch(() => null);
  if (!complaint) notFound();

  const meta = complaintStatusMeta[complaint.status];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/complaints"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary transition-colors hover:text-accent"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
        العودة إلى الشكاوى
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-extrabold text-primary sm:text-2xl">{complaint.subject}</h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
                {meta.label}
              </span>
            </div>

            <p className="tabular mt-2 text-sm text-muted-foreground">
              رقم المتابعة {complaint.referenceCode} · {formatDateArabic(complaint.submittedAt)}
            </p>

            <div className="prose-arabic mt-5 whitespace-pre-wrap border-t border-border pt-5 text-[1.02rem]">
              {complaint.message}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-primary">بيانات المقدّم</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {complaint.submitterName && (
                <li className="flex items-center gap-2.5 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {complaint.submitterName}
                </li>
              )}
              {complaint.contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <a href={`mailto:${complaint.contactEmail}`} dir="ltr" className="font-semibold text-secondary hover:underline">
                    {complaint.contactEmail}
                  </a>
                </li>
              )}
              {complaint.contactPhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <a href={`tel:${complaint.contactPhone.replace(/\s/g, "")}`} dir="ltr" className="tabular font-semibold text-secondary hover:underline">
                    {complaint.contactPhone}
                  </a>
                </li>
              )}
              {complaint.gradeClass && <li className="text-foreground">الصف/الفصل: {complaint.gradeClass}</li>}
              {!complaint.submitterName && !complaint.contactEmail && !complaint.contactPhone && !complaint.gradeClass && (
                <li className="text-muted-foreground">لم يُقدّم المقدّم أي بيانات تواصل.</li>
              )}
            </ul>
            {complaint.reviewedAt && (
              <p className="tabular mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                آخر مراجعة: {formatDateArabic(complaint.reviewedAt)}
                {complaint.resolvedAt && ` · تم الحل: ${formatDateArabic(complaint.resolvedAt)}`}
              </p>
            )}
          </section>
        </div>

        <aside>
          <ComplaintActions id={complaint.id} status={complaint.status} internalNotes={complaint.internalNotes ?? ""} />
        </aside>
      </div>
    </div>
  );
}
