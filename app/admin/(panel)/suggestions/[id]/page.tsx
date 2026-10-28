import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, Phone, User, Globe } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateArabic } from "@/lib/format-date";
import { SuggestionActions } from "@/components/admin/suggestion-actions";
import { suggestionStatusMeta } from "@/components/admin/status-meta";

export const instant = false;

export const metadata: Metadata = { title: "تفاصيل المقترح" };

type Props = { params: Promise<{ id: string }> };

export default async function SuggestionDetailPage({ params }: Props) {
  const { id } = await params;
  const suggestion = await prisma.suggestionPrivate
    .findUnique({ where: { id }, include: { published: true } })
    .catch(() => null);
  if (!suggestion) notFound();

  const meta = suggestionStatusMeta[suggestion.status];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/suggestions"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary transition-colors hover:text-accent"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
        العودة إلى المقترحات
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-extrabold text-primary">نص المقترح</h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
                {meta.label}
              </span>
            </div>

            <div className="prose-arabic mt-4 whitespace-pre-wrap border-t border-border pt-4 text-[1.02rem]">
              {suggestion.suggestionText}
            </div>

            <p className="tabular mt-4 text-xs text-muted-foreground">
              وُرد في {formatDateArabic(suggestion.submittedAt)}
              {suggestion.reviewedAt && ` · تمت المراجعة ${formatDateArabic(suggestion.reviewedAt)}`}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-primary">بيانات المقدّم</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {suggestion.submitterName && (
                <li className="flex items-center gap-2.5 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {suggestion.submitterName}
                </li>
              )}
              {suggestion.contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <a href={`mailto:${suggestion.contactEmail}`} dir="ltr" className="font-semibold text-secondary hover:underline">
                    {suggestion.contactEmail}
                  </a>
                </li>
              )}
              {suggestion.contactPhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <a href={`tel:${suggestion.contactPhone.replace(/\s/g, "")}`} dir="ltr" className="tabular font-semibold text-secondary hover:underline">
                    {suggestion.contactPhone}
                  </a>
                </li>
              )}
              {!suggestion.submitterName && !suggestion.contactEmail && !suggestion.contactPhone && (
                <li className="text-muted-foreground">لم يُقدّم المقدّم أي بيانات تواصل.</li>
              )}
            </ul>
          </section>

          {suggestion.published && (
            <section className="rounded-2xl border border-success/25 bg-success-soft p-5">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-success" aria-hidden />
                <h2 className="text-sm font-extrabold text-success">منشور حاليًا في صفحة المقترحات</h2>
              </div>
              <p className="tabular mt-2 text-xs text-muted-foreground">
                نُشر في {formatDateArabic(suggestion.published.publishedAt)} — بنصّه فقط دون بيانات المقدّم.
              </p>
            </section>
          )}
        </div>

        <aside>
          <SuggestionActions id={suggestion.id} status={suggestion.status} reviewNote={suggestion.reviewNote ?? ""} />
        </aside>
      </div>
    </div>
  );
}
