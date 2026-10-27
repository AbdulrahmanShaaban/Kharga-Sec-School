import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";

type ContentItemWithMedia = Prisma.ContentItemGetPayload<{ include: { media: true } }>;

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const item = await prisma.contentItem.findFirst({
    where: { slug: params.slug, type: "ACTIVITY", status: "PUBLISHED" },
    include: { media: true },
  });
  if (!item) notFound();

  const coverMedia = item.media.find((m: ContentItemWithMedia["media"][number]) => m.isCover);
  const gallery = item.media.filter((m: ContentItemWithMedia["media"][number]) => !m.isCover);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
          {item.publishedAt && <p className="text-sm text-muted-foreground mb-4">{format(item.publishedAt, "yyyy-MM-dd")}</p>}
          {coverMedia && (
            <div className="relative h-64 w-full mb-6">
              <Image src={coverMedia.secureUrl} alt={item.title} fill className="object-cover rounded" />
            </div>
          )}
          <div className="space-y-2 mb-4">
            {item.location && <p><span className="font-semibold">الموقع:</span> {item.location}</p>}
            {item.eventStartAt && <p><span className="font-semibold">بداية الحدث:</span> {format(item.eventStartAt, "yyyy-MM-dd")}</p>}
            {item.eventEndAt && <p><span className="font-semibold">نهاية الحدث:</span> {format(item.eventEndAt, "yyyy-MM-dd")}</p>}
          </div>
          {item.conditions && (
            <section className="mb-4">
              <h2 className="text-xl font-bold mb-2">الشروط</h2>
              <p className="whitespace-pre-wrap">{item.conditions}</p>
            </section>
          )}
          <div className="prose prose-lg max-w-none whitespace-pre-wrap">{item.body}</div>
          {gallery.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold mb-3">معرض الوسائط</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((m: ContentItemWithMedia["media"][number]) => (
                  <div key={m.id} className="relative h-40 w-full">
                    <Image src={m.secureUrl} alt={m.altText || ""} fill className="object-cover rounded" />
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
