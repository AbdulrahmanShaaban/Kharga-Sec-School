import { z } from "zod";
import { constants } from "./constants";

const MAX_LENGTHS = {
  subject: 200,
  name: 100,
  email: 255,
  phone: 20,
  gradeClass: 50,
  category: 100,
  text: constants.SUGGESTION_MAX_LENGTH,
};

/** Hidden anti-bot honeypot field. Bots that fill it are rejected silently. */
const honeypotField = z.string().max(200).optional();

const optionalText = (max: number) => z.string().trim().max(max).optional();

const optionalEmail = z.union([
  z.string().trim().email("البريد الإلكتروني غير صحيح").max(MAX_LENGTHS.email),
  z.literal(""),
]);

// ─── Complaint Schema ────────────────────────────────────────────
export const complaintSchema = z.object({
  subject: z.string().trim().min(1, "الموضوع مطلوب").max(MAX_LENGTHS.subject),
  category: z.string().trim().max(MAX_LENGTHS.category).optional(),
  message: z
    .string()
    .trim()
    .min(10, "نص الشكوى قصير جدًا")
    .max(constants.COMPLAINT_MAX_LENGTH, `نص الشكوى يتجاوز ${constants.COMPLAINT_MAX_LENGTH} حرفًا`),
  submitterName: optionalText(MAX_LENGTHS.name),
  contactEmail: optionalEmail.optional(),
  contactPhone: optionalText(MAX_LENGTHS.phone),
  gradeClass: optionalText(MAX_LENGTHS.gradeClass),
  consent: z.literal(true, { message: "يجب الموافقة على معالجة البيانات" }),
  website: honeypotField,
});

export type ComplaintInput = z.infer<typeof complaintSchema>;

// ─── Suggestion Schema ───────────────────────────────────────────
export const suggestionSchema = z.object({
  suggestionText: z
    .string()
    .trim()
    .min(10, "نص الاقتراح قصير جدًا")
    .max(MAX_LENGTHS.text, `نص الاقتراح يتجاوز ${MAX_LENGTHS.text} حرفًا`),
  submitterName: optionalText(MAX_LENGTHS.name),
  contactEmail: optionalEmail.optional(),
  contactPhone: optionalText(MAX_LENGTHS.phone),
  website: honeypotField,
});

export type SuggestionInput = z.infer<typeof suggestionSchema>;

// ─── Content Schema ──────────────────────────────────────────────
export const contentItemSchema = z.object({
  type: z.enum(["news", "activity", "competition"]),
  title: z.string().trim().min(1, "العنوان مطلوب").max(MAX_LENGTHS.subject),
  slug: z
    .string()
    .trim()
    .min(1, "الرابط المختصر (slug) مطلوب")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط المختصر يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط"),
  excerpt: z.string().trim().max(500).optional(),
  body: z.string().trim().min(1, "المحتوى مطلوب").max(50000),
  status: z.enum(["draft", "published", "archived", "scheduled"]).default("draft"),
  publishedAt: z.string().datetime().optional(),
  eventStartAt: z.string().datetime().optional(),
  eventEndAt: z.string().datetime().optional(),
  location: z.string().trim().max(200).optional(),
  conditions: z.string().trim().max(2000).optional(),
  results: z.string().trim().max(5000).optional(),
  pinned: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(10000).default(0),
});

export type ContentItemInput = z.infer<typeof contentItemSchema>;

// ─── Site Settings Schema ────────────────────────────────────────
const optionalUrl = z.union([z.string().url("الرابط غير صحيح").max(500), z.literal("")]);

export const siteSettingsSchema = z.object({
  schoolName: z.string().trim().max(200).optional(),
  tagline: z.string().trim().max(500).optional(),
  logoUrl: optionalUrl.optional(),
  heroImageUrl: optionalUrl.optional(),
  address: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.union([z.string().trim().email("البريد الإلكتروني غير صحيح").max(MAX_LENGTHS.email), z.literal("")]).optional(),
  hours: z.string().trim().max(200).optional(),
  mapUrl: optionalUrl.optional(),
  facebookUrl: optionalUrl.optional(),
  twitterUrl: optionalUrl.optional(),
  instagramUrl: optionalUrl.optional(),
  footerText: z.string().trim().max(500).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDesc: z.string().trim().max(500).optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ─── Media ───────────────────────────────────────────────────────
/** Folders the admin may upload into (public, school-approved images only). */
export const MEDIA_FOLDERS = ["school/content", "school/site"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const mediaFolderSchema = z.object({
  folder: z.enum(MEDIA_FOLDERS),
});

/** Persisting a completed Cloudinary upload into Neon. */
export const mediaAssetSchema = z.object({
  publicId: z.string().trim().min(1).max(300),
  secureUrl: z.string().url().max(1000),
  format: z.string().trim().max(20),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
  bytes: z.number().int().positive().max(constants.MAX_IMAGE_SIZE).optional(),
  altText: z.string().trim().max(300).optional(),
  contentItemId: z.string().trim().max(100).optional(),
  isCover: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;
