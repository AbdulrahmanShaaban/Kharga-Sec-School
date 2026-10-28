import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { COPY_BLOCKS } from "@/lib/page-copy";

const MAX_VALUE = 5000;

/**
 * Page copy (full CMS): school staff edit the wording of every public page.
 * GET returns all blocks with saved values merged over the defaults.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const rows = await prisma.pageCopy.findMany();
    const saved = new Map(rows.map((r: { page: string; key: string; value: string }) => [`${r.page}::${r.key}`, r.value]));

    const blocks = COPY_BLOCKS.map((block) => ({
      page: block.page,
      title: block.title,
      hint: block.hint ?? null,
      fields: block.fields.map((f) => ({
        key: f.key,
        label: f.label,
        textarea: Boolean(f.textarea),
        value: saved.get(`${block.page}::${f.key}`) ?? f.defaultValue,
        isDefault: !saved.has(`${block.page}::${f.key}`),
      })),
    }));

    return NextResponse.json({ blocks });
  } catch {
    console.error("[admin/page-copy] read failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

/**
 * Save one page's copy. Only keys declared in COPY_BLOCKS are accepted, so a
 * crafted payload can never write arbitrary rows. Empty value = revert to the
 * built-in default (the row is deleted).
 */
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const body = (await request.json().catch(() => null)) as { page?: unknown; values?: unknown } | null;
    const page = typeof body?.page === "string" ? body.page : null;
    const values = body?.values;

    const block = COPY_BLOCKS.find((b) => b.page === page);
    if (!block || !values || typeof values !== "object" || Array.isArray(values)) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const record = values as Record<string, unknown>;
    const allowed = new Set(block.fields.map((f) => f.key));
    const toSave: Array<{ key: string; value: string }> = [];

    for (const [key, raw] of Object.entries(record)) {
      if (!allowed.has(key)) continue;
      if (typeof raw !== "string") continue;
      const value = raw.trim();
      if (value.length > MAX_VALUE) {
        return NextResponse.json(
          { error: `النص طويل جدًا: ${key}` },
          { status: 400 }
        );
      }
      toSave.push({ key, value });
    }

    if (toSave.length === 0) {
      return NextResponse.json({ error: "لا توجد نصوص للحفظ" }, { status: 400 });
    }

    for (const { key, value } of toSave) {
      if (value === "") {
        // Revert to default by removing the override.
        await prisma.pageCopy.deleteMany({ where: { page: block.page, key } });
      } else {
        await prisma.pageCopy.upsert({
          where: { page_key: { page: block.page, key } },
          update: { value, updatedBy: admin.id },
          create: { page: block.page, key, value, updatedBy: admin.id },
        });
      }
    }

    await writeAuditLog({
      actorId: admin.id,
      action: "page-copy.update",
      entityType: "page-copy",
      entityId: block.page,
      metadata: { keys: toSave.length },
    });

    return NextResponse.json({ ok: true });
  } catch {
    console.error("[admin/page-copy] update failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
