import type { MetadataRoute } from "next";
import { categories, tools } from "@/data/tools";
import { createSitemap } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return createSitemap(siteConfig, tools, categories);
}
