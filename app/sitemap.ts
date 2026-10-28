import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

/** Maps a content type to its public listing path segment. */
const pathSegment: Record<string, string> = {
  NEWS: "news",
  ACTIVITY: "activities",
  COMPETITION: "competitions",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/news",
    "/activities",
    "/competitions",
    "/about",
    "/contact",
    "/complaints",
    "/suggestions",
    "/privacy",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const }));

  let items: Array<{ slug: string; type: string; updatedAt: Date }> = [];
  try {
    items = await prisma.contentItem.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, type: true, updatedAt: true },
    });
  } catch {
    // DB unreachable: still emit the static pages instead of failing the route.
    console.error("[sitemap] failed to read content items");
  }

  const contentPages: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${base}/${pathSegment[item.type] ?? "news"}/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...contentPages];
}
