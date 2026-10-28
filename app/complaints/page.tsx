import type { Metadata } from "next";
import { ShieldCheck, EyeOff, Clock } from "lucide-react";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PageHero } from "@/components/site/content";
import { Stagger, StaggerItem } from "@/components/site/motion";
import { ComplaintForm } from "./complaint-form";

// The shared header/footer read site settings from the database.
export const instant = false;

export const metadata: Metadata = {
  title: "تقديم شكوى",
  description: "نموذج تقديم الشكاوى الرسمية — مدرسة الخارجة الثانوية بنين.",
};

const privacyNotes = [
  {
    icon: EyeOff,
    title: "سرية تامة",
    text: "الشكوى خاصة ولا تُعرض للعامة. تصل إلى الإدارة المختصة فقط.",
  },
  {
    icon: ShieldCheck,
    title: "مراجعة مسؤولة",
    text: "تُراجع الشكاوى من الإدارة المختصة، وتُحفظ حالة المراجعة لضمان المعالجة.",
  },
  {
    icon: Clock,
    title: "لا تكرار المراجعة",
    text: "لا تُنشئ نسخًا من الشكوى نفسها. كل مرة ترسلها تُسجَّل كطلب مستقل.",
  },
];

export default async function ComplaintsPage() {
  const copy = await getPageCopy("complaints");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PageHero title={copy["hero.title"] || "تقديم شكوى"} subtitle={copy["hero.subtitle"]} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="mb-6 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {copy["intro"]}
            </p>
            <h2 className="mb-6 text-xl font-extrabold text-primary">نموذج الشكوى</h2>
            <ComplaintForm />
          </section>

          <aside>
            <Stagger className="space-y-4">
              {privacyNotes.map((note) => {
                const Icon = note.icon;
                return (
                  <StaggerItem key={note.title}>
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <Icon className="h-4.5 w-4.5" aria-hidden />
                        </span>
                        <h3 className="text-sm font-extrabold text-primary">{note.title}</h3>
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{note.text}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
