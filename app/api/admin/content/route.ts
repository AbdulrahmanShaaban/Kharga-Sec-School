import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { contentItemSchema } from "@/lib/validation";
import { z } from "zod";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: Prisma.ContentItemWhereInput = {};
    if (type) where.type = type.toUpperCase() as never;
    if (status) where.status = status.toUpperCase() as never;

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ pinned: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        include: { media: true },
      }),
      prisma.contentItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const parsed = contentItemSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const created = await prisma.contentItem.create({
      data: {
        type: data.type.toUpperCase() as any,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        body: data.body,
        status: (data.status || "draft").toUpperCase() as any,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        eventStartAt: data.eventStartAt ? new Date(data.eventStartAt) : null,
        eventEndAt: data.eventEndAt ? new Date(data.eventEndAt) : null,
        location: data.location || null,
        conditions: data.conditions || null,
        results: data.results || null,
        pinned: data.pinned || false,
        sortOrder: data.sortOrder || 0,
        createdBy: (session.user as any).id,
        updatedBy: (session.user as any).id,
      },
      include: { media: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
