import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function statusOf(start?: Date | null, end?: Date | null) {
  const now = new Date();
  if (start && now < start) return "upcoming";
  if (end && now > end) return "closed";
  return "open";
}

export default async function CompetitionsPage() {
  let items: any[] = [];
  try {
    items = await prisma.contentItem.findMany({
      where: { type: "COMPETITION", status: "PUBLISHED" },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    });
  } catch {
    items = [];
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">المسابقات</h1>
        {items.length === 0 ? (
          <p className="text-muted-foreground">لا توجد مسابقات منشورة حتى الآن</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item: any) => {
              const s = statusOf(item.eventStartAt, item.eventEndAt);
              return (
                <Link key={item.id} href={`/competitions/${item.slug}`} className="block">
                  <article className="rounded-lg border bg-card p-4 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-bold text-lg">{item.title}</h2>
                      <Badge variant={s === "open" ? "default" : s === "upcoming" ? "secondary" : "outline"}>
                        {s === "open" ? "فتح" : s === "upcoming" ? "قريباً" : "غلق"}
                      </Badge>
                    </div>
                    {item.excerpt && <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{item.excerpt}</p>}
                    {item.conditions && <p className="text-sm line-clamp-2">{item.conditions}</p>}
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