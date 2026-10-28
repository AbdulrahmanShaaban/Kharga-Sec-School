import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, ArrowLeft, FileQuestion } from "lucide-react";
import { formatDateArabic, formatInCairo } from "@/lib/format-date";

/** Cover image or a calm placeholder when the item has none. */
export function CoverImage({ src, alt, ratio }: { src: string | null; alt: string; ratio?: string }) {
  return (
    <div className={`relative w-full overflow-hidden bg-muted ${ratio ?? "aspect-[16/10]"}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FileQuestion className="h-8 w-8 text-muted-foreground/40" aria-hidden />
        </div>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <p className="text-base font-bold text-foreground">{title}</p>
      {hint && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionHeading({
  title,
  href,
  hrefLabel = "عرض الكل",
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-extrabold text-primary sm:text-[1.7rem]">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-secondary transition-colors hover:text-accent"
        >
          {hrefLabel}
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export type CompetitionStatus = "open" | "upcoming" | "closed";

export function competitionStatus(eventStartAt: Date | null, eventEndAt: Date | null): CompetitionStatus {
  const now = Date.now();
  const start = eventStartAt?.getTime();
  const end = eventEndAt?.getTime();
  if (start && now < start) return "upcoming";
  if (end && now > end) return "closed";
  return "open";
}

const competitionStatusMeta: Record<CompetitionStatus, { label: string; className: string }> = {
  open: { label: "مفتوحة للتسجيل", className: "bg-success-soft text-success border-success/20" },
  upcoming: { label: "قادمة", className: "bg-secondary-soft text-secondary border-secondary/20" },
  closed: { label: "منتهية", className: "bg-muted text-muted-foreground border-border" },
};

export function CompetitionStatusBadge({ status }: { status: CompetitionStatus }) {
  const meta = competitionStatusMeta[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

type ItemCardData = {
  href: string;
  title: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  publishedAt?: Date | null;
  eventStartAt?: Date | null;
  location?: string | null;
  status?: CompetitionStatus;
};

/**
 * Unified content card used on the home page and the listing pages.
 */
export function ContentCard({ item }: { item: ItemCardData }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <Link href={item.href} className="flex h-full flex-col focus-visible:outline-none">
        <CoverImage src={item.coverUrl ?? null} alt={item.title} />
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            {item.status && <CompetitionStatusBadge status={item.status} />}
            {item.publishedAt && (
              <span className="tabular inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {formatDateArabic(item.publishedAt)}
              </span>
            )}
            {!item.publishedAt && item.eventStartAt && (
              <span className="tabular inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {formatInCairo(item.eventStartAt)}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {item.location}
              </span>
            )}
          </div>
          <h3 className="text-lg font-extrabold leading-snug text-primary transition-colors group-hover:text-secondary">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
          )}
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-accent">
            اقرأ المزيد
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}

/** Page hero shared by the inner pages (news, activities, …). */
export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
