import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { contentItemSchema } from "@/lib/validation";
import { fieldErrorsFromZod } from "@/lib/form-guard";
import { Prisma } from "@prisma/client";

const CONTENT_TYPE_MAP = { news: "NEWS", activity: "ACTIVITY", competition: "COMPETITION" } as const;
const CONTENT_STATUS_MAP = { draft: "DRAFT", published: "PUBLISHED", archived: "ARCHIVED", scheduled: "SCHEDULED" } as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const item = await prisma.contentItem.findUnique({
    where: { id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });
  if (!item) return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;

  try {
    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = contentItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const publishedAt =
      data.publishedAt ? new Date(data.publishedAt) : data.status === "published" && !existing.publishedAt ? new Date() : data.status === "published" ? existing.publishedAt : null;

    const updated = await prisma.contentItem.update({
      where: { id },
      data: {
        type: CONTENT_TYPE_MAP[data.type],
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        body: data.body,
        status: CONTENT_STATUS_MAP[data.status],
        publishedAt,
        eventStartAt: data.eventStartAt ? new Date(data.eventStartAt) : null,
        eventEndAt: data.eventEndAt ? new Date(data.eventEndAt) : null,
        location: data.location || null,
        conditions: data.conditions || null,
        results: data.results || null,
        pinned: data.pinned,
        sortOrder: data.sortOrder,
        updatedBy: admin.id,
      },
      include: { media: true },
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "content.update",
      entityType: "content",
      entityId: id,
      metadata: { status: data.status, type: data.type },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "يوجد محتوى آخر بنفس الرابط المختصر (slug)", fieldErrors: { slug: ["الرابط المختصر مستخدم بالفعل"] } },
        { status: 409 }
      );
    }
    console.error("[admin/content] update failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

/**
 * Soft delete: published content is archived instead of destroyed (spec §7).
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;

  try {
    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });

    const updated = await prisma.contentItem.update({
      where: { id },
      data: { status: "ARCHIVED", updatedBy: admin.id },
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "content.archive",
      entityType: "content",
      entityId: id,
    });

    return NextResponse.json(updated);
  } catch {
    console.error("[admin/content] archive failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
