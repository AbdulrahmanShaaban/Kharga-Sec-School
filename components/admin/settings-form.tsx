"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";

type SettingsPayload = {
  schoolName: string;
  tagline: string;
  logoUrl: string;
  heroImageUrl: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  footerText: string;
  seoTitle: string;
  seoDesc: string;
};

type ApiFailure = { error?: string; fieldErrors?: Record<string, string[]> };

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  ltr,
  type,
  textarea,
  rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  ltr?: boolean;
  type?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows ?? 3}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          type={type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={ltr ? "ltr" : undefined}
          className={`${inputClass} ${ltr ? "text-left" : ""}`}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsPayload }) {
  const [form, setForm] = React.useState<SettingsPayload>(initial);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  function set<K extends keyof SettingsPayload>(key: K, value: SettingsPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setMessage({ kind: "ok", text: "تم حفظ الإعدادات وستظهر في الموقع فورًا." });
        return;
      }

      const data = (await response.json().catch(() => ({}))) as ApiFailure;
      setFieldErrors(data.fieldErrors ?? {});
      setMessage({ kind: "err", text: data.error || "تعذر حفظ الإعدادات." });
    } catch {
      setMessage({ kind: "err", text: "تعذر الاتصال بالخادم." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <section className="space-y-5">
        <h2 className="text-base font-extrabold text-primary">هوية المدرسة</h2>
        <Field id="schoolName" label="اسم المدرسة" value={form.schoolName} onChange={(v) => set("schoolName", v)} />
        <Field
          id="tagline"
          label="الوصف الرسمي"
          value={form.tagline}
          onChange={(v) => set("tagline", v)}
          hint="يظهر في الرئيسية وصفحة «عن المدرسة»."
          textarea
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="logoUrl"
            label="رابط الشعار"
            value={form.logoUrl}
            onChange={(v) => set("logoUrl", v)}
            hint="رابط صورة مباشرة (HTTPS). اتركه فارغًا لاستخدام /logo.jpg الافتراضي."
            ltr
          />
          <Field
            id="heroImageUrl"
            label="رابط صورة الواجهة"
            value={form.heroImageUrl}
            onChange={(v) => set("heroImageUrl", v)}
            ltr
          />
        </div>
      </section>

      <section className="space-y-5 border-t border-border pt-8">
        <h2 className="text-base font-extrabold text-primary">بيانات التواصل</h2>
        <p className="text-sm text-muted-foreground">
          تظهر هذه البيانات في الفوتر وصفحة التواصل فقط بعد حفظها هنا — ولا يُخترع أي بيان.
        </p>
        <Field id="address" label="العنوان" value={form.address} onChange={(v) => set("address", v)} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="phone" label="رقم الهاتف" value={form.phone} onChange={(v) => set("phone", v)} ltr />
          <Field id="email" label="البريد الإلكتروني" value={form.email} onChange={(v) => set("email", v)} type="email" ltr />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="hours" label="مواعيد العمل" value={form.hours} onChange={(v) => set("hours", v)} />
          <Field
            id="mapUrl"
            label="رابط الخريطة"
            value={form.mapUrl}
            onChange={(v) => set("mapUrl", v)}
            hint="رابط Google Maps لفتح العنوان على الخريطة."
            ltr
          />
        </div>
      </section>

      <section className="space-y-5 border-t border-border pt-8">
        <h2 className="text-base font-extrabold text-primary">حسابات التواصل الاجتماعي</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="facebookUrl" label="فيسبوك" value={form.facebookUrl} onChange={(v) => set("facebookUrl", v)} ltr />
          <Field id="twitterUrl" label="تويتر / X" value={form.twitterUrl} onChange={(v) => set("twitterUrl", v)} ltr />
          <Field id="instagramUrl" label="إنستجرام" value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} ltr />
        </div>
      </section>

      <section className="space-y-5 border-t border-border pt-8">
        <h2 className="text-base font-extrabold text-primary">النصوص العامة وSEO</h2>
        <Field
          id="footerText"
          label="نص الفوتر"
          value={form.footerText}
          onChange={(v) => set("footerText", v)}
          textarea
        />
        <Field id="seoTitle" label="عنوان SEO" value={form.seoTitle} onChange={(v) => set("seoTitle", v)} />
        <Field id="seoDesc" label="وصف SEO" value={form.seoDesc} onChange={(v) => set("seoDesc", v)} textarea />
      </section>

      {message && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            message.kind === "ok" ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}
      {Object.keys(fieldErrors).length > 0 && (
        <ul className="rounded-xl bg-destructive-soft px-4 py-3 text-sm font-semibold text-destructive">
          {Object.entries(fieldErrors).map(([field, messages]) => (
            <li key={field}>
              {field}: {messages[0]}
            </li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
