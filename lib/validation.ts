import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// ─── General Schemas ─────────────────────────────────────────────
export const contactInfoSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().max(20).optional(),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;

// ─── Complaint Schema ────────────────────────────────────────────
export const complaintSchema = z.object({
  subject: z.string().trim().min(1, "الموضوع مطلوب").max(200),
  category: z.string().trim().max(100).optional(),
  message: z.string().trim().min(10, "نص الشكوى قصير جدًا").max(2000),
  submitterName: z.string().trim().max(100).optional(),
  contactEmail: z.string().trim().email().max(255).optional(),
  contactPhone: z.string().trim().max(20).optional(),
  gradeClass: z.string().trim().max(50).optional(),
  consent: z.literal(true, { message: "يجب الموافقة على معالجة البيانات" }),
  hcaptcha: z.string().trim().min(1, "الVerification مطلوب"),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;

// ─── Suggestion Schema ───────────────────────────────────────────
export const suggestionSchema = z.object({
  suggestionText: z.string().trim().min(10, "نص الاقتراح قصير جدًا").max(2000),
  submitterName: z.string().trim().max(100).optional(),
  contactEmail: z.string().trim().email().max(255).optional(),
  contactPhone: z.string().trim().max(20).optional(),
  hcaptcha: z.string().trim().min(1, "الVerification مطلوب"),
});

export type SuggestionInput = z.infer<typeof suggestionSchema>;

// ─── Content Schema ──────────────────────────────────────────────
export const contentItemSchema = z.object({
  type: z.enum(["news", "activity", "competition"]),
  title: z.string().trim().min(1, "العنوان مطلوب").max(200),
  slug: z.string().trim().min(1, "الـ slug مطلوب").max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug غير صحيح"),
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
  sortOrder: z.number().int().default(0),
});

export type ContentItemInput = z.infer<typeof contentItemSchema>;

// ─── Site Settings Schema ────────────────────────────────────────
export const siteSettingsSchema = z.object({
  schoolName: z.string().trim().max(200).optional(),
  tagline: z.string().trim().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(255).optional(),
  hours: z.string().trim().max(200).optional(),
  mapUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  footerText: z.string().trim().max(500).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDesc: z.string().trim().max(500).optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ─── Cloudinary Upload ───────────────────────────────────────────
export const cloudinaryUploadSchema = z.object({
  publicId: z.string().trim().max(200),
  secureUrl: z.string().url(),
  format: z.string().trim().max(20),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mediaType: z.enum(["image", "video"]),
  altText: z.string().trim().max(200).optional(),
  folder: z.string().trim().max(100).optional(),
});

export type CloudinaryUpload = z.infer<typeof cloudinaryUploadSchema>;