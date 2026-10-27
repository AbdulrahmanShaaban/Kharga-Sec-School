import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function CompetitionDetailPage({ params }: { params: { slug: string } }) {
  const item = await prisma.contentItem.findFirst({
    where: { slug: params.slug, type: "COMPETITION", status: "PUBLISHED" },
  });
  if (!item) notFound();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
          <div className="space-y-2 mb-6">
            {item.location && <p><span className="font-semibold">الموقع:</span> {item.location}</p>}
            {item.eventStartAt && <p><span className="font-semibold">بداية:</span> {format(item.eventStartAt, "yyyy-MM-dd")}</p>}
            {item.eventEndAt && <p><span className="font-semibold">نهاية:</span> {format(item.eventEndAt, "yyyy-MM-dd")}</p>}
          </div>
          {item.conditions && (
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">الشروط</h2>
              <p className="whitespace-pre-wrap">{item.conditions}</p>
            </section>
          )}
          <div className="prose prose-lg max-w-none whitespace-pre-wrap mb-6">{item.body}</div>
          {item.results && item.results.trim() !== "" && (
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">النتائج</h2>
              <p className="whitespace-pre-wrap">{item.results}</p>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
