import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";

type ContentItemWithMedia = Prisma.ContentItemGetPayload<{ include: { media: true } }>;

export default async function ActivitiesPage() {
  let items: ContentItemWithMedia[] = [];
  try {
    items = await prisma.contentItem.findMany({
      where: { type: "ACTIVITY", status: "PUBLISHED" },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      include: { media: true },
    });
  } catch {
    items = [];
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">النشطة</h1>
        {items.length === 0 ? (
          <p className="text-muted-foreground">لا توجد أنشطة منشورة حتى الآن</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: ContentItemWithMedia) => {
              const cover = item.media.find((m: ContentItemWithMedia["media"][number]) => m.isCover);
              return (
                <Link key={item.id} href={`/activities/${item.slug}`} className="block">
                  <article className="rounded-lg border bg-card overflow-hidden hover:shadow-lg transition">
                    {cover && (
                      <div className="relative h-48 w-full">
                        <Image src={cover.secureUrl} alt={item.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="font-bold text-lg mb-2">{item.title}</h2>
                      {item.excerpt && <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{item.excerpt}</p>}
                      {item.eventStartAt && (
                        <p className="text-xs text-muted-foreground">{format(item.eventStartAt, "yyyy-MM-dd")}</p>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}