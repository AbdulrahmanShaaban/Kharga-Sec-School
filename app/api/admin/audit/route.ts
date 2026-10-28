import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

/**
 * Admin audit trail (read-only). Entries never contain complaint/suggestion
 * text or personal data — only actor, action, entity ids, and safe metadata.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const items = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ items });
  } catch {
    console.error("[admin/audit] list failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
