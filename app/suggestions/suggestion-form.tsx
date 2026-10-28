"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";

type ApiSuccess = { success: true; message?: string };
type ApiFailure = { error?: string; fieldErrors?: Record<string, string[]> };

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function SuggestionForm() {
  const [body, setBody] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [honeypot, setHoneypot] = React.useState(""); // hidden from real users
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [done, setDone] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/public/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionText: body,
          // A single optional contact field, mapped to email or phone by shape.
          ...(contact
            ? contact.includes("@")
              ? { contactEmail: contact }
              : { contactPhone: contact }
            : {}),
          website: honeypot,
        }),
      });

      if (response.ok) {
        const data = (await response.json().catch(() => null)) as ApiSuccess | null;
        if (data?.success) {
          setDone(true);
          return;
        }
      }

      const data = (await response.json().catch(() => ({}))) as ApiFailure;
      setFieldErrors(data.fieldErrors ?? {});
      setError(data.error || "تعذر إرسال المقترح. يرجى المحاولة مرة أخرى.");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وأعد المحاولة.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success-soft p-6 text-center" role="status">
        <p className="text-lg font-extrabold text-success">تم استلام مقترحك بنجاح</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          شكرًا لمساهمتك. سيُراجع المقترح من الإدارة المختصة، وعند الموافقة يُنشر بنصّه فقط في صفحة المقترحات.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="suggestion-body" className="mb-1.5 block text-sm font-bold text-foreground">
          نص المقترح
        </label>
        <textarea
          id="suggestion-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={7}
          maxLength={2000}
          placeholder="اكتب مقترحك بوضوح…"
          className={inputClass}
        />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {fieldErrors.suggestionText ? (
            <p className="text-xs font-semibold text-destructive">{fieldErrors.suggestionText[0]}</p>
          ) : (
            <span />
          )}
          <span className="tabular text-xs text-muted-foreground">{body.length.toLocaleString("ar-EG")} / ٢٬٠٠٠</span>
        </div>
      </div>

      <div>
        <label htmlFor="suggestion-contact" className="mb-1.5 block text-sm font-bold text-foreground">
          وسيلة تواصل <span className="font-medium text-muted-foreground">(اختياري)</span>
        </label>
        <input
          id="suggestion-contact"
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

      {/* Honeypot — visually hidden, never filled by a real visitor */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="suggestion-website">لا تملأ هذا الحقل</label>
        <input
          id="suggestion-website"
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-secondary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الإرسال…" : "إرسال المقترح"}
      </button>
    </form>
  );
}
