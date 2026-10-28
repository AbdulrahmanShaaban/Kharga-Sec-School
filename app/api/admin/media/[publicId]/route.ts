import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { deleteCloudinaryAsset, isCloudinaryConfigured } from "@/lib/cloudinary";

type Params = { params: Promise<{ publicId: string }> };

/**
 * Delete a media asset — admin only.
 *
 * Safety rules (spec §7):
 * - The asset must not be referenced by any content item.
 * - The Cloudinary original is deleted through the server; the browser can
 *   never issue deletions itself.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { publicId } = await params;
  if (!publicId || (!publicId.startsWith("school/content/") && !publicId.startsWith("school/site/"))) {
    return NextResponse.json({ error: "مسار الصورة غير مسموح به" }, { status: 400 });
  }

  try {
    const asset = await prisma.contentMedia.findUnique({ where: { publicId } });
    if (!asset) return NextResponse.json({ error: "الصورة غير موجودة" }, { status: 404 });

    if (asset.contentItemId) {
      const item = await prisma.contentItem.findUnique({ where: { id: asset.contentItemId } });
      if (item) {
        return NextResponse.json(
          { error: "الصورة مستخدمة في محتوى منشور. افصلها أولًا ثم أعد المحاولة." },
          { status: 409 }
        );
      }
    }

    if (isCloudinaryConfigured()) {
      await deleteCloudinaryAsset(publicId, "image");
    }

    await prisma.contentMedia.delete({ where: { publicId } });

    await writeAuditLog({
      actorId: admin.id,
      action: "media.delete",
      entityType: "media",
      entityId: asset.id,
    });

    return NextResponse.json({ success: true });
  } catch {
    console.error("[admin/media] delete failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
