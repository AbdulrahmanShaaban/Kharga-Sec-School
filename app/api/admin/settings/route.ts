import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { siteSettingsSchema } from "@/lib/validation";
import { fieldErrorsFromZod } from "@/lib/form-guard";

/**
 * Site settings: readable only by the admin. The public site reads settings
 * directly on the server (server components), never through this endpoint.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch {
    console.error("[admin/settings] read failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = siteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existing = await prisma.siteSettings.findFirst();

    const settings = existing
      ? await prisma.siteSettings.update({
          where: { id: existing.id },
          data: { ...data, updatedBy: admin.id },
        })
      : await prisma.siteSettings.create({
          data: { ...data, updatedBy: admin.id },
        });

    await writeAuditLog({
      actorId: admin.id,
      action: "settings.update",
      entityType: "settings",
      entityId: settings.id,
      metadata: { fields: Object.keys(data).length },
    });

    return NextResponse.json(settings);
  } catch {
    console.error("[admin/settings] update failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
