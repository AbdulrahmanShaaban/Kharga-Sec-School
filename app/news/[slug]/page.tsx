import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { formatDateArabic } from "@/lib/format-date";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await prisma.contentItem
    .findFirst({ where: { slug, type: "NEWS", status: "PUBLISHED" } })
    .catch(() => null);
  if (!item) return { title: "خبر غير موجود" };
  return { title: item.title, description: item.excerpt ?? undefined };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await prisma.contentItem
    .findFirst({
      where: { slug, type: "NEWS", status: "PUBLISHED" },
      include: { media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
    })
    .catch(() => null);

  if (!item) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary transition-colors hover:text-accent"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            العودة إلى الأخبار
          </Link>

          <h1 className="mt-5 text-3xl font-extrabold leading-snug text-primary sm:text-[2.4rem]">{item.title}</h1>

          {item.publishedAt && (
            <p className="tabular mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden />
              نُشر في {formatDateArabic(item.publishedAt)}
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
              {item.media[0].altText && (
                <figcaption className="px-4 py-3 text-xs text-muted-foreground">{item.media[0].altText}</figcaption>
              )}
            </figure>
          )}

          {item.excerpt && (
            <p className="mt-7 border-r-4 border-accent bg-accent-soft/60 px-4 py-3 text-base font-semibold leading-relaxed text-foreground">
              {item.excerpt}
            </p>
          )}

          <div className="prose-arabic mt-8 whitespace-pre-wrap text-[1.05rem] text-foreground">{item.body}</div>

          {item.media.length > 1 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-extrabold text-primary">معرض الصور</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {item.media.slice(1).map((media) => (
                  <div key={media.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
                    <Image
                      src={media.secureUrl}
                      alt={media.altText || item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
