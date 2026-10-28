import type { Metadata } from "next";
import { Lightbulb, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PageHero, EmptyState } from "@/components/site/content";
import { Reveal } from "@/components/site/motion";
import { formatDateArabic } from "@/lib/format-date";
import { SuggestionForm } from "./suggestion-form";

export const instant = false;

export const metadata: Metadata = {
  title: "تقديم مقترح",
  description: "نموذج تقديم المقترحات وعرض المقترحات المعتمدة للنشر — مدرسة الخارجة الثانوية بنين.",
};

export default async function SuggestionsPage() {
  // Only approved, published suggestions — text only (spec §6).
  const [published, copy] = await Promise.all([
    prisma.publishedSuggestion.findMany({ orderBy: { publishedAt: "desc" }, take: 30 }).catch(() => []),
    getPageCopy("suggestions"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PageHero title={copy["hero.title"] || "المقترحات"} subtitle={copy["hero.subtitle"]} />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-secondary/25 bg-secondary-soft p-5 text-sm leading-relaxed text-secondary">
          <strong className="font-extrabold">تنبيه:</strong> {copy["intro"]}
        </div>

        <Reveal>
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
                <Lightbulb className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-xl font-extrabold text-primary">تقديم مقترح</h2>
            </div>
            <SuggestionForm />
          </section>
        </Reveal>

        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-xl font-extrabold text-primary">{copy["published.heading"]}</h2>
          </div>

          {published.length === 0 ? (
            <EmptyState
              title="لا توجد مقترحات منشورة حتى الآن"
              hint="تُنشر هنا المقترحات التي توافق الإدارة على نشرها، بنصّها فقط."
            />
          ) : (
            <ul className="space-y-4">
              {published.map((s) => (
                <li key={s.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="prose-arabic whitespace-pre-wrap text-[15px] text-foreground">{s.suggestionText}</p>
                  <p className="tabular mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    نُشر في {formatDateArabic(s.publishedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
