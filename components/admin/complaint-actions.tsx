"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
import { complaintStatusOptions } from "./status-meta";

type ApiFailure = { error?: string };

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Status + internal notes editor for one complaint (admin only). */
export function ComplaintActions({
  id,
  status,
  internalNotes,
}: {
  id: string;
  status: string;
  internalNotes: string;
}) {
  const [newStatus, setNewStatus] = React.useState(status);
  const [notes, setNotes] = React.useState(internalNotes);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, internalNotes: notes }),
      });
      if (response.ok) {
        setMessage({ kind: "ok", text: "تم حفظ التغييرات." });
      } else {
        const data = (await response.json().catch(() => ({}))) as ApiFailure;
        setMessage({ kind: "err", text: data.error || "تعذر حفظ التغييرات." });
      }
    } catch {
      setMessage({ kind: "err", text: "تعذر الاتصال بالخادم." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-primary">إدارة الشكوى</h2>

      <div>
        <label htmlFor="complaint-status" className="mb-1.5 block text-sm font-bold text-foreground">
          الحالة
        </label>
        <select
          id="complaint-status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className={inputClass}
        >
          {complaintStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="complaint-notes" className="mb-1.5 block text-sm font-bold text-foreground">
          ملاحظات داخلية <span className="font-medium text-muted-foreground">(لا تظهر للزوار)</span>
        </label>
        <textarea
          id="complaint-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          maxLength={5000}
          className={inputClass}
        />
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

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الحفظ…" : "حفظ التغييرات"}
      </button>
    </div>
  );
}
