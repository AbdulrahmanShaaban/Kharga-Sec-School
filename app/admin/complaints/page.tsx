import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Prisma, ComplaintStatus } from "@prisma/client";

export default async function AdminComplaintsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");
  const sp = await searchParams;
  const where: Prisma.ComplaintWhereInput = {};
  if (sp.status) where.status = sp.status as ComplaintStatus;
  const items = await prisma.complaint.findMany({ where, orderBy: { submittedAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">الشكاوى</h1>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="p-2 text-right">المرجع</th><th className="p-2 text-right">الموضوع</th>
          <th className="p-2 text-right">الفئة</th><th className="p-2 text-right">الحالة</th>
          <th className="p-2 text-right">التاريخ</th><th className="p-2 text-right">تفاصيل</th>
        </tr></thead>
        <tbody>
          {items.map((c: Prisma.ComplaintGetPayload<{}>) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.referenceCode}</td>
              <td className="p-2">{c.subject}</td>
              <td className="p-2">{c.category}</td>
              <td className="p-2">{c.status}</td>
              <td className="p-2">{c.submittedAt?.toISOString().slice(0, 10)}</td>
              <td className="p-2"><Link href={`/admin/complaints/${c.id}`} className="text-blue-600">عرض</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
