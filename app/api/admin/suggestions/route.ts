import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

const SUGGESTION_STATUSES = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const;

function isStatus(value: unknown): value is (typeof SUGGESTION_STATUSES)[number] {
  return typeof value === "string" && (SUGGESTION_STATUSES as readonly string[]).includes(value.toUpperCase());
}

/**
 * Admin-only suggestion review list (spec §6).
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Prisma.SuggestionPrivateWhereInput = {};
    if (isStatus(status)) where.status = status.toUpperCase() as Prisma.EnumSuggestionStatusFilter["equals"];

    const suggestions = await prisma.suggestionPrivate.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: { published: { select: { id: true, publishedAt: true } } },
    });

    return NextResponse.json({ items: suggestions });
  } catch {
    console.error("[admin/suggestions] list failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

/**
 * Review decision: approve (publish text only), reject, or hide.
 */
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const body = (await request.json()) as { id?: string; status?: string; reviewNote?: string };
    const { id, status, reviewNote } = body;
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    if (status !== undefined && !isStatus(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const suggestion = await prisma.suggestionPrivate.findUnique({ where: { id } });
    if (!suggestion) return NextResponse.json({ error: "المقتراح غير موجود" }, { status: 404 });

    const newStatus = status?.toUpperCase() as (typeof SUGGESTION_STATUSES)[number] | undefined;

    // Publish / unpublish in the same transaction as the status change.
    const updated = await prisma.$transaction(async (tx) => {
      if (newStatus === "APPROVED") {
        // Only the TEXT is published — never the submitter's data (spec §6).
        await tx.publishedSuggestion.upsert({
          where: { suggestionPrivateId: id },
          create: { suggestionText: suggestion.suggestionText, suggestionPrivateId: id },
          update: { suggestionText: suggestion.suggestionText },
        });
      } else if (newStatus === "REJECTED" || newStatus === "HIDDEN") {
        await tx.publishedSuggestion.deleteMany({ where: { suggestionPrivateId: id } });
      }

      return tx.suggestionPrivate.update({
        where: { id },
        data: {
          ...(newStatus ? { status: newStatus } : {}),
          ...(reviewNote !== undefined ? { reviewNote } : {}),
          reviewedAt: new Date(),
          reviewedBy: admin.id,
        },
        include: { published: true },
      });
    });

    await writeAuditLog({
      actorId: admin.id,
      action: newStatus ? `suggestion.${newStatus.toLowerCase()}` : "suggestion.note",
      entityType: "suggestion",
      entityId: id,
    });

    return NextResponse.json(updated);
  } catch {
    console.error("[admin/suggestions] update failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
