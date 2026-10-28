import { randomBytes } from "crypto";

const APP_NAME = "مدرسة الخارجة الثانوية بنين";

export const constants = {
  APP_NAME,
  DEFAULT_SEO_TITLE: APP_NAME,
  DEFAULT_SEO_DESC: "البوابة الرسمية لمدرسة الخارجة الثانوية بنين — الأخبار والأنشطة والمسابقات وبيانات التواصل وخدمات الشكاوى والمقترحات.",
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/avif"] as const,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB per image (spec §7 media library)
  COMPLAINT_MAX_LENGTH: 2000,
  SUGGESTION_MAX_LENGTH: 2000,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 5,
  TZ: "Africa/Cairo",
} as const;

/**
 * Unguessable reference code shown to the submitter of a complaint.
 * 96 bits of entropy from the CSPRNG.
 */
export function generateReferenceCode(): string {
  return randomBytes(12).toString("hex").toUpperCase();
}

/**
 * Build a URL-safe slug. Arabic characters are intentionally not transliterated:
 * when a title has no Latin characters the caller should ask for an explicit slug.
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
