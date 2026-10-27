import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");

  const [publishedNews, draftNews, totalContent, newComplaints, pendingSuggestions] = await Promise.all([
    prisma.contentItem.count({ where: { type: "NEWS", status: "PUBLISHED" } }),
    prisma.contentItem.count({ where: { type: "NEWS", status: "DRAFT" } }),
    prisma.contentItem.count(),
    prisma.complaint.count({ where: { status: "NEW" } }),
    prisma.suggestionPrivate.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "أخبار منشورة", value: publishedNews },
    { label: "أخبار مسودة", value: draftNews },
    { label: "إجمالي المحتوى", value: totalContent },
    { label: "شكاوى جديدة", value: newComplaints },
    { label: "مقترحات معلقة", value: pendingSuggestions },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-3">
        <Button asChild><Link href="/admin/content/new">إنشاء محتوى</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/complaints">عرض الشكاوى</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/suggestions">عرض المقترحات</Link></Button>
      </div>
    </div>
  );
}
