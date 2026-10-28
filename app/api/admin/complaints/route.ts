import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

const COMPLAINT_STATUSES = ["NEW", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

function isStatus(value: unknown): value is (typeof COMPLAINT_STATUSES)[number] {
  return typeof value === "string" && (COMPLAINT_STATUSES as readonly string[]).includes(value.toUpperCase());
}

/**
 * Admin-only complaint listing (spec §6 privacy: never exposed publicly).
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: Prisma.ComplaintWhereInput = {};
    if (isStatus(status)) where.status = status.toUpperCase() as Prisma.EnumComplaintStatusFilter["equals"];
    if (category) where.category = category;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      // Full rows are fine here: this endpoint is admin-only.
    });

    return NextResponse.json({ items: complaints });
  } catch {
    console.error("[admin/complaints] list failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

/**
 * Bulk-ish status/notes update kept for backward compatibility;
 * prefer PUT /api/admin/complaints/[id].
 */
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const body = (await request.json()) as { id?: string; status?: string; internalNotes?: string };
    const { id, status, internalNotes } = body;
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    if (status !== undefined && !isStatus(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "الشكوى غير موجودة" }, { status: 404 });

    const updateData: Prisma.ComplaintUpdateManyMutationInput = { updatedAt: new Date() };
    if (status) {
      updateData.status = status.toUpperCase() as Prisma.EnumComplaintStatusFilter["equals"];
      if (status.toUpperCase() === "RESOLVED" || status.toUpperCase() === "CLOSED") {
        updateData.resolvedAt = new Date();
      }
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = admin.id;
    }
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updated = await prisma.complaint.update({ where: { id }, data: updateData });

    // Audit WITHOUT copying the message or contact data (spec §6).
    await writeAuditLog({
      actorId: admin.id,
      action: status ? "complaint.status" : "complaint.notes",
      entityType: "complaint",
      entityId: id,
      metadata: status ? { status: status.toUpperCase() } : undefined,
    });

    return NextResponse.json(updated);
  } catch {
    console.error("[admin/complaints] update failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
