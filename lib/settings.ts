import { prisma } from "./db";
import { constants } from "./constants";

export type SiteSettings = {
  schoolName: string | null;
  tagline: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
  mapUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  footerText: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
};

/**
 * Read the single site-settings row. Safe under any failure: the public
 * site must keep rendering with honest placeholders instead of crashing.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings) return settings;
  } catch {
    console.error("[settings] failed to read site settings");
  }
  return {
    schoolName: null,
    tagline: null,
    logoUrl: null,
    heroImageUrl: null,
    address: null,
    phone: null,
    email: null,
    hours: null,
    mapUrl: null,
    facebookUrl: null,
    twitterUrl: null,
    instagramUrl: null,
    footerText: null,
    seoTitle: null,
    seoDesc: null,
  };
}

/** Display name with the approved default (spec §8). */
export function schoolDisplayName(settings: SiteSettings | null): string {
  return settings?.schoolName?.trim() || constants.APP_NAME;
}
