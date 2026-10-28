import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { EmptyState } from "@/components/site/content";
import { MediaUploader, MediaThumb } from "@/components/admin/media-manager";

export const instant = false;

export const metadata: Metadata = { title: "مكتبة الوسائط" };

export default async function AdminMediaPage() {
  const configured = isCloudinaryConfigured();

  const items = await prisma.contentMedia
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { contentItem: { select: { title: true } } },
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">مكتبة الوسائط</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تُرفع الصور مباشرة إلى Cloudinary بمعامل موقّع من الخادم — ولا تمر عبر خوادم الموقع.
        </p>
      </div>

      {!configured && (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">
          خدمة الرفع غير مفعلة حاليًا. أضف CLOUDINARY_CLOUD_NAME وCLOUDINARY_API_KEY وCLOUDINARY_API_SECRET على الخادم
          لتفعيل رفع الصور.
        </p>
      )}

      {configured && <MediaUploader />}

      {items.length === 0 ? (
        <EmptyState title="لا توجد صور في المكتبة" hint="ارفع أول صورة من النموذج بالأعلى لتستخدمها في الأخبار والأنشطة." />
      ) : (
        <>
          <p className="text-sm font-bold text-muted-foreground">{items.length.toLocaleString("ar-EG")} صورة</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                <MediaThumb
                  item={{
                    id: item.id,
                    publicId: item.publicId,
                    secureUrl: item.secureUrl,
                    altText: item.altText,
                    bytes: item.bytes,
                    isCover: item.isCover,
                  }}
                />
                <p className="truncate text-xs text-muted-foreground" title={item.publicId}>
                  {item.contentItem?.title ?? item.publicId}
                  {item.isCover && " · غلاف"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
