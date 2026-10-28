import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ContentCard, EmptyState, PageHero, competitionStatus } from "@/components/site/content";
import { formatInCairo } from "@/lib/format-date";

export const instant = false;

export const metadata: Metadata = {
  title: "المسابقات",
  description: "المسابقات التربوية والتعليمية وشروط المشاركة ونتائجها — مدرسة الخارجة الثانوية بنين.",
};

export default async function CompetitionsPage() {
  const [items, copy] = await Promise.all([
    prisma.contentItem
      .findMany({
        where: { type: "COMPETITION", status: "PUBLISHED" },
        orderBy: [{ pinned: "desc" }, { eventStartAt: "desc" }, { createdAt: "desc" }],
        include: { media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
      })
      .catch(() => []),
    getPageCopy("competitions"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PageHero title={copy["hero.title"] || "مسابقات المدرسة"} subtitle={copy["hero.subtitle"]} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        {items.length === 0 ? (
          <EmptyState
            title={copy["empty.title"] || "لا توجد مسابقات منشورة حتى الآن"}
            hint={copy["empty.hint"]}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                item={{
                  href: `/competitions/${item.slug}`,
                  title: item.title,
                  excerpt: item.excerpt,
                  coverUrl: item.media[0]?.secureUrl ?? null,
                  eventStartAt: item.eventStartAt,
                  location: item.location,
                  status: competitionStatus(item.eventStartAt, item.eventEndAt),
                }}
              />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
