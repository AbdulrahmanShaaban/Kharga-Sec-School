"use client";

import * as React from "react";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { constants } from "@/lib/constants";

type MediaRow = {
  id: string;
  publicId: string;
  secureUrl: string;
  altText: string | null;
  bytes: number | null;
  isCover: boolean;
};

type SignResponse = {
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  timestamp: number;
  signature: string;
  publicId: string;
  folder: string;
  maxBytes: number;
};

type ApiFailure = { error?: string };

/**
 * Signed direct-upload flow (spec §7):
 *   1. ask the server for signed params  (POST action:"sign")
 *   2. upload the file straight to Cloudinary from the browser
 *   3. register the finished asset      (POST action:"register")
 * Image bytes never pass through the Next.js server (4.5 MB function limit).
 */
export function MediaUploader() {
  const [file, setFile] = React.useState<File | null>(null);
  const [altText, setAltText] = React.useState("");
  const [folder, setFolder] = React.useState<"school/content" | "school/site">("school/content");
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage({ kind: "err", text: "اختر صورة أولًا." });
      return;
    }
    if (!(constants.SUPPORTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setMessage({ kind: "err", text: "نوع الملف غير مدعوم. المسموح: JPG وPNG وWebP فقط." });
      return;
    }
    if (file.size > constants.MAX_IMAGE_SIZE) {
      setMessage({ kind: "err", text: "حجم الصورة يتجاوز 5MB." });
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      // 1) sign
      const signRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign", folder }),
      });
      if (!signRes.ok) {
        const data = (await signRes.json().catch(() => ({}))) as ApiFailure;
        setMessage({ kind: "err", text: data.error || "تعذر تجهيز الرفع." });
        return;
      }
      const sign = (await signRes.json()) as SignResponse;

      // 2) direct upload to Cloudinary
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("api_key", sign.apiKey);
      uploadForm.append("timestamp", String(sign.timestamp));
      uploadForm.append("signature", sign.signature);
      uploadForm.append("public_id", sign.publicId);
      uploadForm.append("folder", sign.folder);

      const uploadRes = await fetch(sign.uploadUrl, { method: "POST", body: uploadForm });
      if (!uploadRes.ok) {
        setMessage({ kind: "err", text: "فشل رفع الصورة إلى Cloudinary. حاول مرة أخرى." });
        return;
      }
      const uploaded = (await uploadRes.json()) as { secure_url: string; public_id: string; format: string; width: number; height: number };

      // 3) register server-side
      const registerRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          asset: {
            publicId: uploaded.public_id,
            secureUrl: uploaded.secure_url,
            format: uploaded.format,
            width: uploaded.width,
            height: uploaded.height,
            altText: altText || undefined,
          },
        }),
      });
      if (!registerRes.ok) {
        const data = (await registerRes.json().catch(() => ({}))) as ApiFailure;
        setMessage({ kind: "err", text: data.error || "تم الرفع لكن تعذر تسجيل الصورة." });
        return;
      }

      setMessage({ kind: "ok", text: "تم رفع الصورة وتسجيلها في مكتبة الوسائط." });
      setFile(null);
      setAltText("");
      window.setTimeout(() => window.location.reload(), 700);
    } catch {
      setMessage({ kind: "err", text: "تعذر الاتصال بالخادم أو بخدمة الرفع." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm" noValidate>
      <h2 className="text-base font-extrabold text-primary">رفع صورة جديدة</h2>

      <div>
        <label htmlFor="media-file" className="mb-1.5 block text-sm font-bold text-foreground">
          الصورة
        </label>
        <input
          id="media-file"
          type="file"
          accept={constants.SUPPORTED_IMAGE_TYPES.join(",")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted-foreground file:me-3 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          JPG أو PNG أو WebP — بحد أقصى {(constants.MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0)}MB.
        </p>
      </div>

      <div>
        <label htmlFor="media-alt" className="mb-1.5 block text-sm font-bold text-foreground">
          نص بديل (وصف الصورة لقارئ الشاشة)
        </label>
        <input
          id="media-alt"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          maxLength={300}
          placeholder="مثال: طلاب المدرسة في حفل توزيع الجوائز"
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="media-folder" className="mb-1.5 block text-sm font-bold text-foreground">
          المجلد
        </label>
        <select
          id="media-folder"
          value={folder}
          onChange={(e) => setFolder(e.target.value as "school/content" | "school/site")}
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="school/content">محتوى (أخبار/أنشطة/مسابقات)</option>
          <option value="school/site">هوية الموقع (شعار/واجهة)</option>
        </select>
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
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
        {pending ? "جارٍ الرفع…" : "رفع وتسجيل"}
      </button>
    </form>
  );
}

/** Delete one asset — server refuses when the image is still used by content. */
export function MediaDeleteButton({ publicId }: { publicId: string }) {
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    if (!window.confirm("حذف هذه الصورة نهائيًا من المكتبة وCloudinary؟")) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(publicId)}`, { method: "DELETE" });
      if (response.ok) {
        window.location.reload();
      } else {
        const data = (await response.json().catch(() => ({}))) as ApiFailure;
        window.alert(data.error || "تعذر حذف الصورة.");
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
      onClick={handleDelete}
      disabled={pending}
      aria-label="حذف الصورة"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive-soft disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
    </button>
  );
}

/** Client-side copy button for the public URL of an asset. */
export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable — ignore silently
        }
      }}
      className="text-sm font-bold text-secondary transition-colors hover:text-accent"
    >
      {copied ? "تم النسخ ✓" : "نسخ الرابط"}
    </button>
  );
}

/** Small preview tile used in the library grid. */
export function MediaThumb({ item }: { item: MediaRow }) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
      {/* Cloudinary assets are served from another origin, so a plain img is used. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.secureUrl} alt={item.altText || "صورة من مكتبة الوسائط"} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-primary/80 px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <CopyUrlButton url={item.secureUrl} />
        <MediaDeleteButton publicId={item.publicId} />
      </div>
    </div>
  );
}
