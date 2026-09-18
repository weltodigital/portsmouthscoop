import type { MetadataRoute } from "next";
import { SITE, NAV, LEGAL_NAV } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...NAV, { href: "/subscribe" }, ...LEGAL_NAV];
  return pages.map((item) => ({
    url: new URL(item.href, SITE.url).toString(),
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
