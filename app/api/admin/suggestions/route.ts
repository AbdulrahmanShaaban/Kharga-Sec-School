import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const suggestions = await prisma.suggestionPrivate.findMany({
      orderBy: { submittedAt: "desc" },
      include: { published: true },
    });

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, reviewNote } = body;

    if (!id) {
      return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    }

    const updateData: any = {
      reviewedAt: new Date(),
      reviewedBy: (session.user as any).id,
    };

    if (status) {
      updateData.status = status.toUpperCase();
    }
    if (reviewNote !== undefined) {
      updateData.reviewNote = reviewNote;
    }

    const suggestion = await prisma.suggestionPrivate.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "المقتراح غير موجود" }, { status: 404 });
    }

    if (status && status.toUpperCase() === "APPROVED") {
      await prisma.publishedSuggestion.upsert({
        where: { suggestionPrivateId: id },
        create: {
          suggestionText: suggestion.suggestionText,
          suggestionPrivateId: id,
        },
        update: {
          suggestionText: suggestion.suggestionText,
        },
      });
    } else if (status && (status.toUpperCase() === "REJECTED" || status.toUpperCase() === "HIDDEN")) {
      await prisma.publishedSuggestion.deleteMany({
        where: { suggestionPrivateId: id },
      });
    }

    const updated = await prisma.suggestionPrivate.update({
      where: { id },
      data: updateData,
      include: { published: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}