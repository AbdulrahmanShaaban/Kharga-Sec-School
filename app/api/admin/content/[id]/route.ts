import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contentItemSchema } from "@/lib/validation";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const parsed = contentItemSchema.partial().safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
      return NextResponse.json(
        { error: "بيانات غير صالحة", fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: any = {
      updatedBy: (session.user as any).id,
    };

    if (data.type !== undefined) updateData.type = data.type.toUpperCase();
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.status !== undefined) updateData.status = (data.status || "draft").toUpperCase();
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
    if (data.eventStartAt !== undefined) updateData.eventStartAt = data.eventStartAt ? new Date(data.eventStartAt) : null;
    if (data.eventEndAt !== undefined) updateData.eventEndAt = data.eventEndAt ? new Date(data.eventEndAt) : null;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.conditions !== undefined) updateData.conditions = data.conditions || null;
    if (data.results !== undefined) updateData.results = data.results || null;
    if (data.pinned !== undefined) updateData.pinned = data.pinned;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const updated = await prisma.contentItem.update({
      where: { id },
      data: updateData,
      include: { media: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const archived = await prisma.contentItem.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        updatedBy: (session.user as any).id,
      },
    });

    return NextResponse.json(archived);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}