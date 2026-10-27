import { randomBytes } from "crypto";

const APP_NAME = "مدرسة الخارجة الثانوية بنين";

export const constants = {
  APP_NAME,
  DEFAULT_SEO_TITLE: `${APP_NAME} - Official Website`,
  DEFAULT_SEO_DESC: "Official website of Al-Khargha Secondary School for Boys. News, activities, competitions, contact, and feedback.",
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  COMPLAINT_MAX_LENGTH: 2000,
  SUGGESTION_MAX_LENGTH: 2000,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 5,
  TZ: "Africa/Cairo",
};

export function generateReferenceCode(): string {
  return randomBytes(12).toString("hex").toUpperCase();
}

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