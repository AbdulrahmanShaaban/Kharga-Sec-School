"use client";

import * as React from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";

type Field = {
  key: string;
  label: string;
  textarea: boolean;
  value: string;
  isDefault: boolean;
};

type Block = {
  page: string;
  title: string;
  hint: string | null;
  fields: Field[];
};

export type PageCopyEditorProps = {
  initialBlocks: Block[];
};

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function PageCopyEditor({ initialBlocks }: PageCopyEditorProps) {
  const [blocks, setBlocks] = React.useState<Block[]>(initialBlocks);
  const [activePage, setActivePage] = React.useState(initialBlocks[0]?.page ?? "");
  const [pending, setPending] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Merge saved values from the admin API over the declared defaults.
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/page-copy")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.blocks) setBlocks(data.blocks);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const active = blocks.find((b) => b.page === activePage);

  function setValue(key: string, value: string) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.page === activePage
          ? { ...b, fields: b.fields.map((f) => (f.key === key ? { ...f, value } : f)) }
          : b
      )
    );
    setMessage(null);
  }

  async function handleSave() {
    if (!active) return;
    setPending(true);
    setMessage(null);
    try {
      const values = Object.fromEntries(active.fields.map((f) => [f.key, f.value]));
      const response = await fetch("/api/admin/page-copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: active.page, values }),
      });
      if (response.ok) {
        setMessage({ kind: "ok", text: "تم حفظ النصوص وستظهر في الموقع فورًا." });
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setMessage({ kind: "err", text: data.error || "تعذر حفظ النصوص." });
      }
    } catch {
      setMessage({ kind: "err", text: "تعذر الاتصال بالخادم." });
    } finally {
      setPending(false);
    }
  }

  function resetField(key: string) {
    // Revert locally to the built-in default (saved on next save as empty).
    setBlocks((prev) =>
      prev.map((b) =>
        b.page === activePage
          ? {
              ...b,
              fields: b.fields.map((f) => (f.key === key ? { ...f, value: "", isDefault: true } : f)),
            }
          : b
      )
    );
  }

  return (
    <div className="space-y-6">
      {!loaded && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          جارٍ تحميل النصوص…
        </p>
      )}

      {/* Page picker */}
      <div>
        <p className="mb-2 text-sm font-bold text-foreground">اختر صفحة</p>
        <div className="flex flex-wrap gap-2">
          {blocks.map((b) => (
            <button
              key={b.page}
              type="button"
              onClick={() => {
                setActivePage(b.page);
                setMessage(null);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                b.page === activePage
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {b.title}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <section className="space-y-5">
          {active.hint && <p className="text-sm text-muted-foreground">{active.hint}</p>}
          {active.fields.map((field) => (
            <div key={field.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor={`${active.page}-${field.key}`} className="text-sm font-bold text-foreground">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  {field.isDefault && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      النص الافتراضي
                    </span>
                  )}
                  {!field.isDefault && (
                    <button
                      type="button"
                      onClick={() => resetField(field.key)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden />
                      استعادة الافتراضي
                    </button>
                  )}
                </div>
              </div>
              {field.textarea ? (
                <textarea
                  id={`${active.page}-${field.key}`}
                  value={field.value}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  rows={4}
                  className={inputClass}
                />
              ) : (
                <input
                  id={`${active.page}-${field.key}`}
                  type="text"
                  value={field.value}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </section>
      )}

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
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الحفظ…" : "حفظ النصوص"}
      </button>
    </div>
  );
}
