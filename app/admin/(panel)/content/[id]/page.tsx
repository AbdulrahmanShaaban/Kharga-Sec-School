import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ContentForm } from "@/components/admin/content-form";

export const instant = false;

export const metadata: Metadata = { title: "تعديل المحتوى" };

type Props = { params: Promise<{ id: string }> };

export default async function EditContentPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.contentItem.findUnique({ where: { id } }).catch(() => null);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-primary">تعديل المحتوى</h1>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ContentForm
          initial={{
            id: item.id,
            type: item.type.toLowerCase(),
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt ?? "",
            body: item.body,
            status: item.status.toLowerCase(),
            publishedAt: item.publishedAt?.toISOString() ?? null,
            eventStartAt: item.eventStartAt?.toISOString() ?? null,
            eventEndAt: item.eventEndAt?.toISOString() ?? null,
            location: item.location ?? "",
            conditions: item.conditions ?? "",
            results: item.results ?? "",
            pinned: item.pinned,
            sortOrder: item.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
