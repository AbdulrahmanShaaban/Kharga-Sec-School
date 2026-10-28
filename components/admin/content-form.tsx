"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";

type ContentPayload = {
  id?: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: string;
  publishedAt: string | null;
  eventStartAt: string | null;
  eventEndAt: string | null;
  location: string;
  conditions: string;
  results: string;
  pinned: boolean;
  sortOrder: number;
};

type ApiFailure = { error?: string; fieldErrors?: Record<string, string[]> };

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Latin slug from the title; falls back to a readable random slug for Arabic titles. */
function slugify(title: string): string {
  const latin = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (latin) return latin.slice(0, 180);
  const stamp = Date.now().toString(36);
  return `item-${stamp}`;
}

/** ISO string (API) -> value for <input type="datetime-local">. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Value of <input type="datetime-local"> -> ISO string (API). */
function toIso(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function ContentForm({ initial }: { initial?: Partial<ContentPayload> }) {
  const isEdit = Boolean(initial?.id);
  const [type, setType] = React.useState(initial?.type ?? "news");
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [body, setBody] = React.useState(initial?.body ?? "");
  const [status, setStatus] = React.useState(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = React.useState(toLocalInput(initial?.publishedAt ?? null));
  const [eventStartAt, setEventStartAt] = React.useState(toLocalInput(initial?.eventStartAt ?? null));
  const [eventEndAt, setEventEndAt] = React.useState(toLocalInput(initial?.eventEndAt ?? null));
  const [location, setLocation] = React.useState(initial?.location ?? "");
  const [conditions, setConditions] = React.useState(initial?.conditions ?? "");
  const [results, setResults] = React.useState(initial?.results ?? "");
  const [pinned, setPinned] = React.useState(initial?.pinned ?? false);
  const [sortOrder, setSortOrder] = React.useState(initial?.sortOrder ?? 0);

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      type,
      title,
      slug,
      excerpt: excerpt || undefined,
      body,
      status,
      publishedAt: toIso(publishedAt),
      eventStartAt: toIso(eventStartAt),
      eventEndAt: toIso(eventEndAt),
      location: location || undefined,
      conditions: conditions || undefined,
      results: results || undefined,
      pinned,
      sortOrder,
    };

    try {
      const response = await fetch(isEdit ? `/api/admin/content/${initial?.id}` : "/api/admin/content", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.assign("/admin/content");
        return;
      }

      const data = (await response.json().catch(() => ({}))) as ApiFailure;
      setFieldErrors(data.fieldErrors ?? {});
      setError(data.error || "تعذر حفظ المحتوى. تحقق من البيانات وأعد المحاولة.");
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  const showCompetitionFields = type === "competition";
  const showEventFields = type !== "news";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="content-type" className="mb-1.5 block text-sm font-bold text-foreground">
            نوع المحتوى
          </label>
          <select id="content-type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="news">خبر</option>
            <option value="activity">نشاط</option>
            <option value="competition">مسابقة</option>
          </select>
        </div>
        <div>
          <label htmlFor="content-status" className="mb-1.5 block text-sm font-bold text-foreground">
            الحالة
          </label>
          <select id="content-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
            <option value="scheduled">مجدول</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content-title" className="mb-1.5 block text-sm font-bold text-foreground">
          العنوان
        </label>
        <input
          id="content-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
          maxLength={200}
          className={inputClass}
        />
        {fieldErrors.title && <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="content-slug" className="mb-1.5 block text-sm font-bold text-foreground">
          الرابط المختصر (Slug)
        </label>
        <input
          id="content-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
          maxLength={200}
          dir="ltr"
          placeholder="my-news-title"
          className={`${inputClass} text-left`}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          أحرف لاتينية صغيرة وأرقام وشرطات فقط — يُستخدم في رابط الصفحة. لو العنوان عربي يُولَّد slug تلقائيًا.
        </p>
        {fieldErrors.slug && <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.slug[0]}</p>}
      </div>

      <div>
        <label htmlFor="content-excerpt" className="mb-1.5 block text-sm font-bold text-foreground">
          مقتطف قصير <span className="font-medium text-muted-foreground">(يظهر في البطاقات)</span>
        </label>
        <textarea
          id="content-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={500}
          className={inputClass}
        />
        {fieldErrors.excerpt && <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.excerpt[0]}</p>}
      </div>

      <div>
        <label htmlFor="content-body" className="mb-1.5 block text-sm font-bold text-foreground">
          المحتوى الكامل
        </label>
        <textarea
          id="content-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={12}
          maxLength={50000}
          className={inputClass}
        />
        {fieldErrors.body && <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.body[0]}</p>}
      </div>

      <div>
        <label htmlFor="content-publishedAt" className="mb-1.5 block text-sm font-bold text-foreground">
          تاريخ النشر <span className="font-medium text-muted-foreground">(اختياري)</span>
        </label>
        <input
          id="content-publishedAt"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className={`${inputClass} max-w-xs`}
        />
      </div>

      {showEventFields && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="content-eventStartAt" className="mb-1.5 block text-sm font-bold text-foreground">
              بداية الفعالية
            </label>
            <input
              id="content-eventStartAt"
              type="datetime-local"
              value={eventStartAt}
              onChange={(e) => setEventStartAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="content-eventEndAt" className="mb-1.5 block text-sm font-bold text-foreground">
              نهاية الفعالية
            </label>
            <input
              id="content-eventEndAt"
              type="datetime-local"
              value={eventEndAt}
              onChange={(e) => setEventEndAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="content-location" className="mb-1.5 block text-sm font-bold text-foreground">
              المكان <span className="font-medium text-muted-foreground">(اختياري)</span>
            </label>
            <input
              id="content-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {showCompetitionFields && (
        <>
          <div>
            <label htmlFor="content-conditions" className="mb-1.5 block text-sm font-bold text-foreground">
              شروط المشاركة <span className="font-medium text-muted-foreground">(اختياري)</span>
            </label>
            <textarea
              id="content-conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              rows={4}
              maxLength={2000}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="content-results" className="mb-1.5 block text-sm font-bold text-foreground">
              النتائج <span className="font-medium text-muted-foreground">(تظهر للزوار فقط عند كتابتها)</span>
            </label>
            <textarea
              id="content-results"
              value={results}
              onChange={(e) => setResults(e.target.value)}
              rows={4}
              maxLength={5000}
              className={inputClass}
            />
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-6 rounded-xl bg-muted px-4 py-3">
        <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 accent-primary" />
          تثبيت في الأعلى
        </label>
        <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <span>الترتيب</span>
          <input
            type="number"
            min={0}
            max={10000}
            value={sortOrder}
            onChange={(e) => setSortOrder(Math.max(0, Math.min(10000, parseInt(e.target.value, 10) || 0)))}
            className="w-24 rounded-lg border border-input bg-card px-2.5 py-1.5 text-sm"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-destructive-soft px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الحفظ…" : isEdit ? "حفظ التعديلات" : "إنشاء المحتوى"}
      </button>
    </form>
  );
}
