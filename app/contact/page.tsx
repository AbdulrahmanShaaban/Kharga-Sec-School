import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PageHero, EmptyState } from "@/components/site/content";
import { Reveal } from "@/components/site/motion";

export const instant = false;

export const metadata: Metadata = {
  title: "التواصل",
  description: "بيانات التواصل الرسمية مع مدرسة الخارجة الثانوية بنين.",
};

export default async function ContactPage() {
  const [settings, copy] = await Promise.all([getSiteSettings(), getPageCopy("contact")]);

  const channels = [
    settings.address
      ? { icon: MapPin, label: "العنوان", value: settings.address, href: settings.mapUrl || null, ltr: false }
      : null,
    settings.phone
      ? { icon: Phone, label: "الهاتف", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, ltr: true }
      : null,
    settings.email
      ? { icon: Mail, label: "البريد الإلكتروني", value: settings.email, href: `mailto:${settings.email}`, ltr: true }
      : null,
    settings.hours ? { icon: Clock, label: "مواعيد العمل", value: settings.hours, href: null, ltr: false } : null,
  ].filter((c): c is { icon: typeof MapPin; label: string; value: string; href: string | null; ltr: boolean } => c !== null);

  const socials = [
    settings.facebookUrl ? { label: "فيسبوك", href: settings.facebookUrl } : null,
    settings.instagramUrl ? { label: "إنستجرام", href: settings.instagramUrl } : null,
    settings.twitterUrl ? { label: "تويتر / X", href: settings.twitterUrl } : null,
  ].filter((s): s is { label: string; href: string } => s !== null);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PageHero title={copy["hero.title"] || "التواصل معنا"} subtitle={copy["hero.subtitle"]} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        {channels.length === 0 ? (
          <EmptyState
            title="لم تُضف بيانات التواصل بعد"
            hint="تُضاف بيانات التواصل الرسمية (العنوان والهاتف والبريد ومواعيد العمل) من لوحة التحكم بعد اعتمادها من إدارة المدرسة."
          />
        ) : (
          <Reveal>
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <ul className="space-y-5">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const content = (
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {channel.label}
                      </span>
                      <span className="block text-[15px] font-semibold text-foreground" dir={channel.ltr ? "ltr" : undefined}>
                        {channel.value}
                      </span>
                    </span>
                    {channel.href && <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
                  </span>
                );
                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        target={channel.href.startsWith("http") ? "_blank" : undefined}
                        rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="block rounded-xl transition-colors hover:bg-muted"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>

            {socials.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">حسابات التواصل</h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-bold text-primary transition-colors hover:border-primary/30"
                    >
                      {s.label}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
          </Reveal>
        )}

        <Reveal delay={0.06}>
          <section className="mt-8 rounded-2xl border border-secondary/25 bg-secondary-soft p-6">
            <h2 className="text-lg font-extrabold text-secondary">لديك شكوى أو مقترح؟</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy["note"]}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/complaints"
                className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                تقديم شكوى
              </a>
              <a
                href="/suggestions"
                className="inline-flex rounded-xl border-2 border-secondary px-5 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                تقديم مقترح
              </a>
            </div>
          </section>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
