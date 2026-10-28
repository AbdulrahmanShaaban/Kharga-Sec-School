"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";

const categories = [
  { value: "academic", label: "أكاديمي / تعليمي" },
  { value: "administrative", label: "إداري" },
  { value: "conduct", label: "سلوك" },
  { value: "facilities", label: "مرافق ومبنى" },
  { value: "transportation", label: "مواصلات" },
  { value: "other", label: "أخرى" },
];

type ApiSuccess = { referenceCode: string };
type ApiFailure = { error?: string; fieldErrors?: Record<string, string[]> };

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function ComplaintForm() {
  const [subject, setSubject] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState(""); // hidden from real users
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [referenceCode, setReferenceCode] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/public/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          category,
          message,
          // A single optional contact field, mapped to email or phone by shape.
          ...(contact
            ? contact.includes("@")
              ? { contactEmail: contact }
              : { contactPhone: contact }
            : {}),
          consent,
          website: honeypot,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as ApiSuccess;
        setReferenceCode(data.referenceCode);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as ApiFailure;
      setFieldErrors(data.fieldErrors ?? {});
      setError(data.error || "تعذر إرسال الشكوى. يرجى المحاولة مرة أخرى.");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وأعد المحاولة.");
    } finally {
      setPending(false);
    }
  }

  if (referenceCode) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success-soft p-6 text-center" role="status">
        <p className="text-lg font-extrabold text-success">تم استلام شكواك بنجاح</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          سيتم التواصل معك من الإدارة المختصة خلال مدة المراجعة المعتادة.
        </p>
        <p className="tabular mt-4 inline-block rounded-xl bg-card px-4 py-2 text-sm font-bold text-primary ring-1 ring-success/20">
          رقم المتابعة: {referenceCode}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="complaint-subject" className="mb-1.5 block text-sm font-bold text-foreground">
          موضوع الشكوى
        </label>
        <input
          id="complaint-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={200}
          placeholder="عنوان مختصر يوضّح الشكوى"
          className={inputClass}
        />
        {fieldErrors.subject && <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.subject[0]}</p>}
      </div>

      <div>
        <label htmlFor="complaint-category" className="mb-1.5 block text-sm font-bold text-foreground">
          نوع الشكوى
        </label>
        <select
          id="complaint-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          <option value="">اختر نوع الشكوى…</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {fieldErrors.category && <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.category[0]}</p>}
      </div>

      <div>
        <label htmlFor="complaint-message" className="mb-1.5 block text-sm font-bold text-foreground">
          تفاصيل الشكوى
        </label>
        <textarea
          id="complaint-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={7}
          maxLength={2000}
          placeholder="اشرح الشكوى بوضوح واذكر التفاصيل المهمة…"
          className={inputClass}
        />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {fieldErrors.message ? (
            <p className="text-xs font-semibold text-destructive">{fieldErrors.message[0]}</p>
          ) : (
            <span />
          )}
          <span className="tabular text-xs text-muted-foreground">{message.length.toLocaleString("ar-EG")} / ٢٬٠٠٠</span>
        </div>
      </div>

      <div>
        <label htmlFor="complaint-contact" className="mb-1.5 block text-sm font-bold text-foreground">
          وسيلة تواصل <span className="font-medium text-muted-foreground">(اختياري)</span>
        </label>
        <input
          id="complaint-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={255}
          dir="ltr"
          placeholder="رقم هاتف أو بريد إلكتروني للتواصل"
          className={`${inputClass} text-left`}
        />
        {fieldErrors.contactEmail && (
          <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.contactEmail[0]}</p>
        )}
        {fieldErrors.contactPhone && (
          <p className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.contactPhone[0]}</p>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span>
          أوافق على معالجة بيانات هذه الشكوى من قبل إدارة المدرسة لغرض المتابعة فقط.
          {fieldErrors.consent && <span className="mt-1 block text-xs font-semibold text-destructive">{fieldErrors.consent[0]}</span>}
        </span>
      </label>

      {/* Honeypot — visually hidden, never filled by a real visitor */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="complaint-website">لا تملأ هذا الحقل</label>
        <input
          id="complaint-website"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-destructive-soft px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الإرسال…" : "إرسال الشكوى"}
      </button>
    </form>
  );
}
