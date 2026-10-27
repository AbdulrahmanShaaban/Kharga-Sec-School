import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

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
    const status = searchParams.get("status");

    const where: Prisma.ComplaintWhereInput = {};
    if (status) where.status = status.toUpperCase() as never;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(complaints);
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
const body = await request.json() as Record<string, unknown>;
const { id, status, internalNotes } = body as { id?: string; status?: string; internalNotes?: string };

    if (!id) {
      return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    }

    const updateData: Prisma.ComplaintUpdateManyMutationInput = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status.toUpperCase() as never;
      if (status.toUpperCase() === "RESOLVED" || status.toUpperCase() === "CLOSED") {
        updateData.resolvedAt = new Date();
      }
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = (session.user as any).id;
    }
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
