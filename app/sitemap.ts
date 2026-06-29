import type { MetadataRoute } from "next";
import { SITE, NAV, LEGAL_NAV } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...NAV, ...LEGAL_NAV].map((item) => ({
    url: new URL(item.href, SITE.url).toString(),
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
