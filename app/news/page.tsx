import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ContentCard, EmptyState, PageHero } from "@/components/site/content";

export const instant = false;

export const metadata: Metadata = {
  title: "الأخبار",
  description: "آخر الأخبار والإعلانات الرسمية من مدرسة الخارجة الثانوية بنين.",
};

const PAGE_SIZE = 9;

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  const where = { type: "NEWS" as const, status: "PUBLISHED" as const };
  const [items, total, copy] = await Promise.all([
    prisma.contentItem.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
    }),
    prisma.contentItem.count({ where }),
    getPageCopy("news"),
  ]).catch(() => [[], 0, {} as Record<string, string>] as const);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PageHero title={copy["hero.title"] || "أخبار المدرسة"} subtitle={copy["hero.subtitle"]} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        {items.length === 0 ? (
          <EmptyState
            title={copy["empty.title"] || "لا توجد أخبار منشورة حتى الآن"}
            hint={copy["empty.hint"]}
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  item={{
                    href: `/news/${item.slug}`,
                    title: item.title,
                    excerpt: item.excerpt,
                    coverUrl: item.media[0]?.secureUrl ?? null,
                    publishedAt: item.publishedAt,
                  }}
                />
              ))}
            </div>

            {pages > 1 && (
              <nav aria-label="تصفح صفحات الأخبار" className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={p === 1 ? "/news" : `/news?page=${p}`}
                    aria-current={p === page ? "page" : undefined}
                    className={`tabular inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${
                      p === page ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
