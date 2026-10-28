"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

/** Archive (soft-delete) a content item — server turns published items into ARCHIVED. */
export function ArchiveButton({ id }: { id: string }) {
  const [pending, setPending] = React.useState(false);

  async function handleArchive() {
    if (!window.confirm("أرشفة هذا المحتوى؟ لن يظهر للزوار بعد ذلك.")) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (response.ok) {
        window.location.reload();
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error || "تعذر أرشفة المحتوى.");
      }
    } catch {
      window.alert("تعذر الاتصال بالخادم.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={pending}
      className="text-destructive hover:underline disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : "أرشفة"}
    </button>
  );
}
