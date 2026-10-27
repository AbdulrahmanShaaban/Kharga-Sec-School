import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export default async function AdminSuggestionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");
  const items = await prisma.suggestionPrivate.findMany({ where: { status: "PENDING" }, orderBy: { submittedAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">المقترحات المعلقة</h1>
      <ul className="space-y-2">
        {items.map((s: Prisma.SuggestionPrivateGetPayload<{}>) => (
          <li key={s.id} className="border p-3 rounded">
            <p className="line-clamp-2">{s.suggestionText}</p>
            <Link href={`/admin/suggestions/${s.id}`} className="text-blue-600 text-sm">عرض</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
