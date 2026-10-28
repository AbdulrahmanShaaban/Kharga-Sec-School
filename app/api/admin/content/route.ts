import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { contentItemSchema } from "@/lib/validation";
import { fieldErrorsFromZod } from "@/lib/form-guard";
import { Prisma } from "@prisma/client";

const CONTENT_TYPE_MAP = { news: "NEWS", activity: "ACTIVITY", competition: "COMPETITION" } as const;
const CONTENT_STATUS_MAP = { draft: "DRAFT", published: "PUBLISHED", archived: "ARCHIVED", scheduled: "SCHEDULED" } as const;

/**
 * Admin content listing (all statuses — this endpoint is admin-only).
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10));
    const typeParam = searchParams.get("type");
    const statusParam = searchParams.get("status");

    const where: Prisma.ContentItemWhereInput = {};
    if (typeParam && typeParam.toUpperCase() in CONTENT_TYPE_MAP) {
      where.type = typeParam.toUpperCase() as Prisma.EnumContentTypeFilter["equals"];
    }
    if (statusParam && statusParam.toUpperCase() in CONTENT_STATUS_MAP) {
      where.status = statusParam.toUpperCase() as Prisma.EnumContentStatusFilter["equals"];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ pinned: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        include: { media: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.contentItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    console.error("[admin/content] list failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = contentItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : data.status === "published" ? new Date() : null;

    const created = await prisma.contentItem.create({
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
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      include: { media: true },
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "content.create",
      entityType: "content",
      entityId: created.id,
      metadata: { type: data.type, status: data.status },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "يوجد محتوى آخر بنفس الرابط المختصر (slug)", fieldErrors: { slug: ["الرابط المختصر مستخدم بالفعل"] } },
        { status: 409 }
      );
    }
    console.error("[admin/content] create failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
