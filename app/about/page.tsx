import { SiteHeader, SiteFooter } from "@/components/layout";
import { prisma } from "@/lib/db";

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findFirst().catch(() => null);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">{settings?.schoolName ?? "مدرسة External الثانوية بنين"}</h1>
        <p className="text-lg text-muted-foreground mb-6">{settings?.tagline ?? "نبذة عن المدرسة"}</p>
        <section className="prose prose-lg max-w-none">
          <p>هذه صفحة تعريفية بالمدرسة. سيتم تحديث المحتوى قريباً.</p>
          {settings?.address && <p>العنوان: {settings.address}</p>}
          {settings?.phone && <p>الهاتف: {settings.phone}</p>}
          {settings?.email && <p>البريد: {settings.email}</p>}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
