import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { site } from "@/content/landing";

export const dynamic = "force-static";

const LAST_MODIFIED = new Date("2026-08-18");

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${site.url}/benchmarks`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${site.url}/vs/browser-use-cloud`, priority: 0.9, changeFrequency: "monthly" },
  ];

  const docs: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${site.url}${page.url}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...marketing, ...docs].map((entry) => ({
    ...entry,
    lastModified: LAST_MODIFIED,
  }));
}
