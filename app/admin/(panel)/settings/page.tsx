import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const instant = false;

export const metadata: Metadata = { title: "الإعدادات" };

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findFirst().catch(() => null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">إعدادات الموقع</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          كل الحقول اختيارية — لا يُعرض شيء للزوار إلا بعد حفظه واعتماده من الإدارة.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <SettingsForm
          initial={{
            schoolName: settings?.schoolName ?? "",
            tagline: settings?.tagline ?? "",
            logoUrl: settings?.logoUrl ?? "",
            heroImageUrl: settings?.heroImageUrl ?? "",
            address: settings?.address ?? "",
            phone: settings?.phone ?? "",
            email: settings?.email ?? "",
            hours: settings?.hours ?? "",
            mapUrl: settings?.mapUrl ?? "",
            facebookUrl: settings?.facebookUrl ?? "",
            twitterUrl: settings?.twitterUrl ?? "",
            instagramUrl: settings?.instagramUrl ?? "",
            footerText: settings?.footerText ?? "",
            seoTitle: settings?.seoTitle ?? "",
            seoDesc: settings?.seoDesc ?? "",
          }}
        />
      </div>
    </div>
  );
}
