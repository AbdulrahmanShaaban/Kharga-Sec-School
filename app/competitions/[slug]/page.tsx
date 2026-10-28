import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CompetitionStatusBadge, competitionStatus } from "@/components/site/content";
import { formatDateArabic, formatInCairo } from "@/lib/format-date";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await prisma.contentItem
    .findFirst({ where: { slug, type: "COMPETITION", status: "PUBLISHED" } })
    .catch(() => null);
  if (!item) return { title: "مسابقة غير موجودة" };
  return { title: item.title, description: item.excerpt ?? undefined };
}

export default async function CompetitionDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await prisma.contentItem
    .findFirst({
      where: { slug, type: "COMPETITION", status: "PUBLISHED" },
      include: { media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
    })
    .catch(() => null);

  if (!item) notFound();

  const status = competitionStatus(item.eventStartAt, item.eventEndAt);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link
            href="/competitions"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary transition-colors hover:text-accent"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            العودة إلى المسابقات
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold leading-snug text-primary sm:text-[2.4rem]">{item.title}</h1>
            <CompetitionStatusBadge status={status} />
          </div>

          {item.eventStartAt && (
            <p className="tabular mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formatInCairo(item.eventStartAt)}
              {item.eventEndAt && ` — ${formatDateArabic(item.eventEndAt)}`}
            </p>
          )}
          {item.location && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {item.location}
            </p>
          )}

          {item.media[0] && (
            <figure className="mt-7 overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={item.media[0].secureUrl}
                alt={item.media[0].altText || item.title}
                width={item.media[0].width ?? 1200}
                height={item.media[0].height ?? 675}
                className="h-auto w-full object-cover"
                priority
              />
            </figure>
          )}

          {item.excerpt && (
            <p className="mt-7 border-r-4 border-accent bg-accent-soft/60 px-4 py-3 text-base font-semibold leading-relaxed">
              {item.excerpt}
            </p>
          )}

          <div className="prose-arabic mt-8 whitespace-pre-wrap text-[1.05rem]">{item.body}</div>

          {item.conditions && (
            <section className="mt-8 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-primary">شروط المشاركة</h2>
              <div className="prose-arabic mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{item.conditions}</div>
            </section>
          )}

          {item.results && (
            <section className="mt-8 rounded-2xl border border-success/25 bg-success-soft p-6">
              <h2 className="text-lg font-extrabold text-success">النتائج</h2>
              <div className="prose-arabic mt-3 whitespace-pre-wrap text-sm text-foreground">{item.results}</div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
