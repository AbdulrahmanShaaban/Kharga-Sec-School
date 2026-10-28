"use client";

import * as React from "react";
import { Loader2, Check, X, EyeOff, StickyNote } from "lucide-react";

type ApiFailure = { error?: string };

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * Review actions for one suggestion.
 * Approving publishes ONLY the text (spec §6); rejecting/hiding removes any
 * previously published copy.
 */
export function SuggestionActions({
  id,
  status,
  reviewNote,
}: {
  id: string;
  status: string;
  reviewNote: string;
}) {
  const [note, setNote] = React.useState(reviewNote);
  const [pending, setPending] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function decide(nextStatus: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setPending(nextStatus);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus, reviewNote: note }),
      });
      if (response.ok) {
        setMessage({
          kind: "ok",
          text:
            nextStatus === "APPROVED"
              ? "تم الاعتماد ونشر نص المقترح في صفحة المقترحات."
              : nextStatus === "REJECTED"
                ? "تم رفض المقترح وإزالة أي نسخة منشورة منه."
                : "تم إخفاء المقترح وإزالة أي نسخة منشورة منه.",
        });
        window.setTimeout(() => window.location.reload(), 800);
      } else {
        const data = (await response.json().catch(() => ({}))) as ApiFailure;
        setMessage({ kind: "err", text: data.error || "تعذر تنفيذ الإجراء." });
      }
    } catch {
      setMessage({ kind: "err", text: "تعذر الاتصال بالخادم." });
    } finally {
      setPending(null);
    }
  }

  async function saveNote() {
    setPending("note");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reviewNote: note }),
      });
      if (response.ok) {
        setMessage({ kind: "ok", text: "تم حفظ الملاحظة." });
      } else {
        const data = (await response.json().catch(() => ({}))) as ApiFailure;
        setMessage({ kind: "err", text: data.error || "تعذر حفظ الملاحظة." });
      }
    } catch {
      setMessage({ kind: "err", text: "تعذر الاتصال بالخادم." });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-primary">مراجعة المقترح</h2>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => decide("APPROVED", "اعتماد هذا المقترح ونشر نصه في صفحة المقترحات؟")}
          disabled={pending !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending === "APPROVED" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
          اعتماد ونشر النص
        </button>
        <button
          type="button"
          onClick={() => decide("REJECTED", "رفض هذا المقترح؟ سيتم إزالة أي نسخة منشورة منه.")}
          disabled={pending !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-destructive px-4 py-2.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-white disabled:pointer-events-none disabled:opacity-60"
        >
          {pending === "REJECTED" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
          رفض
        </button>
        <button
          type="button"
          onClick={() => decide("HIDDEN", "إخفاء هذا المقترح من صفحة المقترحات؟")}
          disabled={pending !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
        >
          {pending === "HIDDEN" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
          إخفاء من الموقع
        </button>
      </div>

      <div>
        <label htmlFor="suggestion-note" className="mb-1.5 block text-sm font-bold text-foreground">
          ملاحظة مراجعة <span className="font-medium text-muted-foreground">(داخلية)</span>
        </label>
        <textarea
          id="suggestion-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={5000}
          className={inputClass}
        />
        <button
          type="button"
          onClick={saveNote}
          disabled={pending !== null}
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
        >
          {pending === "note" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <StickyNote className="h-4 w-4" aria-hidden />}
          حفظ الملاحظة
        </button>
      </div>

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
    </div>
  );
}
