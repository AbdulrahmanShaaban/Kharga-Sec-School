import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";
import { formatDateArabic, formatInCairo } from "@/lib/format-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prisma } from "@prisma/client";

type ContentItem = Prisma.ContentItemGetPayload<{}>;

async function fetchItems(type: "NEWS" | "ACTIVITY" | "COMPETITION") {
  return prisma.contentItem.findMany({
    where: { type, status: "PUBLISHED" },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: 3,
  });
}

export default async function HomePage() {
  const [news, activities, competitions] = await Promise.all([
    fetchItems("NEWS"),
    fetchItems("ACTIVITY"),
    fetchItems("COMPETITION"),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">مدرسة External الثانوية بنين</h1>
            <p className="text-lg opacity-90 mb-6">بوابة المدرسة الرسمية — أخبار، أنشطة، مسابقات وتواصل</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/news" className="bg-white text-primary px-4 py-2 rounded-md font-medium">الأخبار</Link>
              <Link href="/activities" className="bg-white/20 px-4 py-2 rounded-md font-medium">الأنشطة</Link>
              <Link href="/competitions" className="bg-white/20 px-4 py-2 rounded-md font-medium">المسابقات</Link>
              <Link href="/contact" className="bg-white/20 px-4 py-2 rounded-md font-medium">التواصل</Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">آخر الأخبار</h2>
              <Link href="/news" className="text-primary text-sm">عرض الكل</Link>
            </div>
            {news.length === 0 ? (
              <p className="text-muted-foreground">لا توجد أخبار منشورة حتى الآن</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {news.map((item: ContentItem) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{item.excerpt}</p>
                      {item.publishedAt && (
                        <p className="text-xs text-muted-foreground">{formatDateArabic(item.publishedAt)}</p>
                      )}
                      <Link href={`/news/${item.slug}`} className="text-primary text-sm mt-2 inline-block">اقرأ المزيد</Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">آخر الأنشطة</h2>
              <Link href="/activities" className="text-primary text-sm">عرض الكل</Link>
            </div>
            {activities.length === 0 ? (
              <p className="text-muted-foreground">لا توجد أنشطة منشورة حتى الآن</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {activities.map((item: ContentItem) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{item.excerpt}</p>
                      {item.eventStartAt && (
                        <p className="text-xs text-muted-foreground">{formatInCairo(item.eventStartAt)}</p>
                      )}
                      <Link href={`/activities/${item.slug}`} className="text-primary text-sm mt-2 inline-block">اقرأ المزيد</Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">المسابقات</h2>
              <Link href="/competitions" className="text-primary text-sm">عرض الكل</Link>
            </div>
            {competitions.length === 0 ? (
              <p className="text-muted-foreground">لا توجد مسابقات منشورة حتى الآن</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {competitions.map((item: ContentItem) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{item.excerpt}</p>
                      {item.eventStartAt && (
                        <p className="text-xs text-muted-foreground">{formatInCairo(item.eventStartAt)}</p>
                      )}
                      <Link href={`/competitions/${item.slug}`} className="text-primary text-sm mt-2 inline-block">اقرأ المزيد</Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-6">
            <Link href="/complaints" className="px-4 py-2 border rounded-md">الشكاوى</Link>
            <Link href="/suggestions" className="px-4 py-2 border rounded-md">الاقتراحات</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
