import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");
  const sp = await searchParams;
  const where: any = {};
  if (sp.type) where.type = sp.type;
  if (sp.status) where.status = sp.status;
  const items = await prisma.contentItem.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المحتوى</h1>
        <Button asChild><Link href="/admin/content/new">إنشاء جديد</Link></Button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-right">العنوان</th>
            <th className="p-2 text-right">النوع</th>
            <th className="p-2 text-right">الحالة</th>
            <th className="p-2 text-right">تاريخ النشر</th>
            <th className="p-2 text-right">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.title}</td>
              <td className="p-2">{item.type}</td>
              <td className="p-2">{item.status}</td>
              <td className="p-2">{item.publishedAt?.toISOString().slice(0, 10) ?? "-"}</td>
              <td className="p-2">
                <Link href={`/admin/content/${item.id}`} className="text-blue-600">تعديل</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
