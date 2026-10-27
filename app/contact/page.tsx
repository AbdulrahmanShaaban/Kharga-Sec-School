import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findFirst().catch(() => null);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">الاتصال</h1>
        {!settings ? (
          <p className="text-muted-foreground">البيانات سيدخلها المدرسة من لوحة_ given</p>
        ) : (
          <div className="space-y-3">
            <p><span className="font-semibold">اسم المدرسة:</span> {settings.schoolName ?? "—"}</p>
            {settings.address && <p><span className="font-semibold">العنوان:</span> {settings.address}</p>}
            {settings.phone && <p><span className="font-semibold">الهاتف:</span> {settings.phone}</p>}
            {settings.email && <p><span className="font-semibold">البريد:</span> {settings.email}</p>}
            {settings.hours && <p><span className="font-semibold">ساعات العمل:</span> {settings.hours}</p>}
            {settings.mapUrl && (
              <div className="mt-4">
                <iframe src={settings.mapUrl} className="w-full h-64 rounded border" loading="lazy" />
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
