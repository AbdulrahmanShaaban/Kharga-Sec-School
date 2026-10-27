import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await prisma.contentItem.findMany({ where: { status: "PUBLISHED" } });
  const base = "https://example.com";
  return [
    { url: base, lastModified: new Date() },
    ...items.map((i: any) => ({ url: `${base}/${i.type.toLowerCase()}s/${i.slug}`, lastModified: i.updatedAt })),
  ];
}
