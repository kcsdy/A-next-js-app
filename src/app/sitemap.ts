import type { MetadataRoute } from "next";
import { serviceSlugs } from "@/content/services";
import { siteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const base = siteUrl;

function url(locale: string, href: string) {
  return `${base}${getPathname({ locale, href })}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/o-kancelarii",
    "/uslugi",
    "/kontakt",
    "/schedule-appointment",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: url(locale, path),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const locale of routing.locales) {
      entries.push({
        url: url(locale, `/uslugi/${slug}`),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
