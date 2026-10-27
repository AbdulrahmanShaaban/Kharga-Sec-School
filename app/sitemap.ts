import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type ContentItem = Prisma.ContentItemGetPayload<{}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await prisma.contentItem.findMany({ where: { status: "PUBLISHED" } });
  const base = "https://example.com";
  return [
    { url: base, lastModified: new Date() },
    ...items.map((i: ContentItem) => ({ url: `${base}/${i.type.toLowerCase()}s/${i.slug}`, lastModified: i.updatedAt })),
  ];
}
