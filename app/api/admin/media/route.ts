import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { mediaFolderSchema, mediaAssetSchema } from "@/lib/validation";
import { fieldErrorsFromZod } from "@/lib/form-guard";
import { assetExistsInCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { constants } from "@/lib/constants";

/**
 * Media library (admin only).
 *
 * Upload model (spec §7): Vercel Functions cap request bodies at 4.5 MB, so
 * image bytes never pass through this server.
 *   1. POST /api/admin/media/sign  -> short-lived signed params (server only)
 *   2. browser uploads directly to Cloudinary with those params
 *   3. POST /api/admin/media       -> server verifies the asset really exists
 *                                     in OUR cloud, then stores metadata in Neon
 */

/** List the media library. */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const contentItemId = searchParams.get("contentItemId");

    const items = await prisma.contentMedia.findMany({
      where: contentItemId ? { contentItemId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { contentItem: { select: { id: true, title: true } } },
    });

    return NextResponse.json({ items });
  } catch {
    console.error("[admin/media] list failed");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

/** Step 1: issue signed upload parameters for a direct browser -> Cloudinary upload. */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "خدمة الرفع غير مفعلة حاليًا. يرجى ضبط إعدادات Cloudinary على الخادم." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const action = typeof body?.action === "string" ? body.action : "sign";

    // ── Step 1: sign an upload ────────────────────────────────────────────
    if (action === "sign") {
      const parsed = mediaFolderSchema.safeParse({ folder: body?.folder });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "مجلد الرفع غير صحيح", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
          { status: 400 }
        );
      }

      const { v2: cloudinary } = await import("cloudinary");
      const { configureCloudinary, getCloudinaryCloudName } = await import("@/lib/cloudinary");
      configureCloudinary();
      const cloudName = getCloudinaryCloudName();

      const timestamp = Math.round(Date.now() / 1000);
      // Only the random part here: the client also sends `folder`, and Cloudinary
      // prepends it — prefixing both would store school/content/school/content/…
      const publicId = randomBytes(8).toString("hex");

      // The signature covers exactly these parameters — the browser cannot
      // upload to another folder, another public_id, or with extra transforms.
      const paramsToSign = { timestamp, folder: parsed.data.folder, public_id: publicId };
      const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

      return NextResponse.json({
        cloudName,
        // The API key is not a secret on its own; the signature is what authorizes
        // the upload. It is only ever returned to an authenticated admin.
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        timestamp,
        signature,
        publicId,
        folder: parsed.data.folder,
        maxBytes: constants.MAX_IMAGE_SIZE,
        allowedTypes: constants.SUPPORTED_IMAGE_TYPES,
      });
    }

    // ── Step 2: register a completed upload ───────────────────────────────
    if (action === "register") {
      const parsed = mediaAssetSchema.safeParse(body?.asset);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "بيانات الصورة غير صحيحة", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
          { status: 400 }
        );
      }
      const asset = parsed.data;

      // The public_id must live in an allowed folder for this site.
      const inAllowedFolder = ["school/content/", "school/site/"].some((f) => asset.publicId.startsWith(f));
      if (!inAllowedFolder) {
        return NextResponse.json({ error: "مسار الصورة غير مسموح به" }, { status: 400 });
      }

      // Server-side verification: the asset must actually exist in our cloud.
      const remote = await assetExistsInCloudinary(asset.publicId);
      if (!remote.exists) {
        return NextResponse.json({ error: "تعذر التحقق من الصورة المرفوعة" }, { status: 400 });
      }
      if (remote.bytes && remote.bytes > constants.MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح (5MB)" }, { status: 400 });
      }

      if (asset.contentItemId) {
        const contentExists = await prisma.contentItem.findUnique({ where: { id: asset.contentItemId } });
        if (!contentExists) {
          return NextResponse.json({ error: "المحتوى المرتبط غير موجود" }, { status: 400 });
        }
      }

      const created = await prisma.contentMedia.create({
        data: {
          contentItemId: asset.contentItemId || null,
          publicId: asset.publicId,
          secureUrl: asset.secureUrl || remote.secureUrl || "",
          format: asset.format || remote.format || null,
          bytes: remote.bytes ?? null,
          altText: asset.altText || null,
          width: remote.width ?? asset.width,
          height: remote.height ?? asset.height,
          mediaType: "IMAGE",
          isCover: asset.isCover ?? false,
          sortOrder: asset.sortOrder ?? 0,
        },
      });

      // If this asset is the cover of a content item, unset other covers.
      if (created.isCover && created.contentItemId) {
        await prisma.contentMedia.updateMany({
          where: { contentItemId: created.contentItemId, id: { not: created.id }, isCover: true },
          data: { isCover: false },
        });
      }

      await writeAuditLog({
        actorId: admin.id,
        action: "media.upload",
        entityType: "media",
        entityId: created.id,
        metadata: { folder: asset.publicId.split("/")[0] },
      });

      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (err) {
    console.error("[admin/media] failed", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
