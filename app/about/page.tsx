import type { Metadata } from "next";
import { School, MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSiteSettings, schoolDisplayName } from "@/lib/settings";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PageHero } from "@/components/site/content";
import { Reveal } from "@/components/site/motion";

export const instant = false;

export const metadata: Metadata = {
  title: "عن المدرسة",
  description: "نبذة رسمية عن مدرسة الخارجة الثانوية بنين.",
};

export default async function AboutPage() {
  const [settings, copy] = await Promise.all([getSiteSettings(), getPageCopy("about")]);
  const schoolName = schoolDisplayName(settings);

  const facts = [
    settings.address ? { icon: MapPin, label: "العنوان", value: settings.address, ltr: false } : null,
    settings.phone ? { icon: Phone, label: "الهاتف", value: settings.phone, ltr: true } : null,
    settings.email ? { icon: Mail, label: "البريد الإلكتروني", value: settings.email, ltr: true } : null,
    settings.hours ? { icon: Clock, label: "مواعيد العمل", value: settings.hours, ltr: false } : null,
  ].filter((f): f is { icon: typeof MapPin; label: string; value: string; ltr: boolean } => f !== null);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PageHero title={`عن ${schoolName}`} subtitle={copy["hero.subtitle"]} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <Reveal>
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <School className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="text-xl font-extrabold text-primary">{copy["intro.heading"]}</h2>
            </div>
            {settings.tagline?.trim() ? (
              <p className="prose-arabic mt-4 text-[1.05rem]">{settings.tagline}</p>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{copy["intro.body"]}</p>
            )}
          </section>
        </Reveal>

        {facts.length > 0 && (
          <Reveal delay={0.08}>
            <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold text-primary">{copy["contact.heading"]}</h2>
              <ul className="mt-5 space-y-4">
                {facts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <li key={fact.label} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{fact.label}</p>
                        <p className="text-[15px] font-semibold text-foreground" dir={fact.ltr ? "ltr" : undefined}>
                          {fact.value}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
