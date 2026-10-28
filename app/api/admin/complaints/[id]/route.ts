import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

const COMPLAINT_STATUSES = ["NEW", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

type Params = { params: Promise<{ id: string }> };

function isStatus(value: unknown): value is (typeof COMPLAINT_STATUSES)[number] {
  return typeof value === "string" && (COMPLAINT_STATUSES as readonly string[]).includes(value.toUpperCase());
}

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) return NextResponse.json({ error: "الشكوى غير موجودة" }, { status: 404 });
  return NextResponse.json(complaint);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;

  try {
    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "الشكوى غير موجودة" }, { status: 404 });

    const body = (await request.json()) as { status?: string; internalNotes?: string };
    const { status, internalNotes } = body;

    if (status !== undefined && !isStatus(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }
    if (internalNotes !== undefined && internalNotes.length > 5000) {
      return NextResponse.json({ error: "الملاحظات الداخلية طويلة جدًا" }, { status: 400 });
    }

    const updateData: Prisma.ComplaintUpdateManyMutationInput = {};
    if (status) {
      updateData.status = status.toUpperCase() as Prisma.EnumComplaintStatusFilter["equals"];
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = admin.id;
      if (status.toUpperCase() === "RESOLVED" || status.toUpperCase() === "CLOSED") {
        updateData.resolvedAt = new Date();
      }
    }
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updated = await prisma.complaint.update({ where: { id }, data: updateData });

    await writeAuditLog({
      actorId: admin.id,
      action: status ? "complaint.status" : "complaint.notes",
      entityType: "complaint",
      entityId: id,
      metadata: status ? { status: status.toUpperCase() } : undefined,
    });

    return NextResponse.json(updated);
  } catch {
    console.error("[admin/complaints/[id]] update failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
