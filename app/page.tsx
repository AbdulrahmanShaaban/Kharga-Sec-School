import Link from "next/link";
import Image from "next/image";
import { BookOpen, Trophy, MessageSquare, Lightbulb, ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSiteSettings, schoolDisplayName } from "@/lib/settings";
import { getPageCopy } from "@/lib/page-copy";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ContentCard, EmptyState, SectionHeading, competitionStatus } from "@/components/site/content";
import { LottieAnimation } from "@/components/site/lottie";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion";

// Content must always be fresh for a live school portal.
export const instant = false;

async function fetchLatest(type: "NEWS" | "ACTIVITY" | "COMPETITION") {
  try {
    return await prisma.contentItem.findMany({
      where: { type, status: "PUBLISHED" },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: { media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
    });
  } catch {
    return [];
  }
}

function coverOf(item: { media: Array<{ isCover: boolean; secureUrl: string }> }): string | null {
  return item.media[0]?.secureUrl ?? null;
}

export default async function HomePage() {
  const [settings, copy, news, activities, competitions] = await Promise.all([
    getSiteSettings(),
    getPageCopy("home"),
    fetchLatest("NEWS"),
    fetchLatest("ACTIVITY"),
    fetchLatest("COMPETITION"),
  ]);

  const schoolName = schoolDisplayName(settings);

  const quickLinks = [
    { href: "/news", label: copy["hero.ctaNews"], icon: BookOpen, primary: true },
    { href: "/competitions", label: copy["hero.ctaCompetitions"], icon: Trophy, primary: false },
    { href: "/suggestions", label: copy["hero.ctaSuggestions"], icon: Lightbulb, primary: false },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, #E97824 0, transparent 40%), radial-gradient(circle at 88% 82%, #0C6266 0, transparent 44%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
          {/* Text column (RTL → right) */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              البوابة الرسمية
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-balance md:text-[2.75rem]">
              {schoolName}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {copy["hero.subtitle"]}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      link.primary
                        ? "inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-lg transition-transform hover:-translate-y-0.5"
                        : "inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {(settings.address || settings.phone || settings.email) && (
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                {settings.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent" aria-hidden />
                    {settings.address}
                  </span>
                )}
                {settings.phone && (
                  <span className="tabular inline-flex items-center gap-1.5" dir="ltr">
                    <Phone className="h-4 w-4 text-accent" aria-hidden />
                    {settings.phone}
                  </span>
                )}
                {settings.email && (
                  <span className="inline-flex items-center gap-1.5" dir="ltr">
                    <Mail className="h-4 w-4 text-accent" aria-hidden />
                    {settings.email}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Animation column (RTL → left) */}
          <div className="relative mx-auto w-full max-w-sm">
            <LottieAnimation
              src="/lottie/hero-knowledge.json"
              label="رسم متحرك رمزي للتعلّم والمعرفة"
              className="h-64 w-full md:h-80"
            />
            {settings.logoUrl && (
              <span className="absolute inset-0 m-auto h-20 w-20 overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-xl ring-1 ring-white/30">
                <Image src={settings.logoUrl} alt={`شعار ${schoolName}`} fill sizes="80px" className="object-cover" />
              </span>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* ── Latest content ─────────────────────────────────── */}
        <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6">
          <section>
            <Reveal>
              <SectionHeading title={copy["news.heading"]} href="/news" />
            </Reveal>
            {news.length === 0 ? (
              <Reveal delay={0.05}>
                <EmptyState title="لا توجد أخبار منشورة حاليًا" hint="ستظهر هنا آخر الأخبار والإعلانات الرسمية بمجرد نشرها من لوحة التحكم." />
              </Reveal>
            ) : (
              <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <StaggerItem key={item.id}>
                    <ContentCard
                      item={{
                        href: `/news/${item.slug}`,
                        title: item.title,
                        excerpt: item.excerpt,
                        coverUrl: coverOf(item),
                        publishedAt: item.publishedAt,
                      }}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>

          <section>
            <Reveal>
              <SectionHeading title={copy["activities.heading"]} href="/activities" />
            </Reveal>
            {activities.length === 0 ? (
              <Reveal delay={0.05}>
                <EmptyState title="لا توجد أنشطة منشورة حاليًا" hint="تُعرض الأنشطة المدرسية المعتمدة هنا فور نشرها." />
              </Reveal>
            ) : (
              <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((item) => (
                  <StaggerItem key={item.id}>
                    <ContentCard
                      item={{
                        href: `/activities/${item.slug}`,
                        title: item.title,
                        excerpt: item.excerpt,
                        coverUrl: coverOf(item),
                        eventStartAt: item.eventStartAt,
                        location: item.location,
                      }}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>

          <section>
            <Reveal>
              <SectionHeading title={copy["competitions.heading"]} href="/competitions" />
            </Reveal>
            {competitions.length === 0 ? (
              <Reveal delay={0.05}>
                <EmptyState title="لا توجد مسابقات منشورة حاليًا" hint="ستظهر هنا المسابقات وشروط المشاركة ومواعيدها ونتائجها المعتمدة." />
              </Reveal>
            ) : (
              <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {competitions.map((item) => (
                  <StaggerItem key={item.id}>
                    <ContentCard
                      item={{
                        href: `/competitions/${item.slug}`,
                        title: item.title,
                        excerpt: item.excerpt,
                        coverUrl: coverOf(item),
                        eventStartAt: item.eventStartAt,
                        location: item.location,
                        status: competitionStatus(item.eventStartAt, item.eventEndAt),
                      }}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        </div>

        {/* ── Feedback band ─────────────────────────────────── */}
        <section className="border-y border-border bg-secondary-soft">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto]">
            <div>
              <Reveal>
                <h2 className="text-2xl font-extrabold text-secondary sm:text-3xl">{copy["feedback.title"]}</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {copy["feedback.body"]}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/complaints"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    {copy["feedback.ctaComplaint"]}
                  </Link>
                  <Link
                    href="/suggestions"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-secondary px-6 py-3 text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <Lightbulb className="h-4 w-4" aria-hidden />
                    {copy["feedback.ctaSuggestion"]}
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="mx-auto w-full max-w-[13rem] md:mx-0">
              <LottieAnimation
                src="/lottie/empty-folder.json"
                label="رسم متحرك لمشاركة الرأي"
                className="h-40 w-full"
                speed={0.9}
              />
            </div>
          </div>
        </section>

        {/* ── School info strip ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-8 md:grid-cols-[auto_1fr] md:p-10">
              <span className="relative mx-auto block h-24 w-24 overflow-hidden rounded-2xl bg-muted ring-1 ring-border md:mx-0">
                <Image src="/logo.jpg" alt={`شعار ${schoolName}`} fill sizes="96px" className="object-cover" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-primary sm:text-2xl">
                  {copy["about.heading"]} {schoolName}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {settings.tagline?.trim() || "تُضاف نبذة المدرسة الرسمية من لوحة التحكم بعد اعتمادها من إدارة المدرسة."}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  {settings.address && <span>📍 {settings.address}</span>}
                  {settings.phone && (
                    <span className="tabular" dir="ltr">
                      ☎ {settings.phone}
                    </span>
                  )}
                  {settings.email && (
                    <span dir="ltr">
                      ✉ {settings.email}
                    </span>
                  )}
                </div>
                <Link
                  href="/about"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-secondary transition-colors hover:text-accent"
                >
                  {copy["about.linkLabel"]}
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
