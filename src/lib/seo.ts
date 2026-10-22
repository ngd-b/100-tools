import type { Metadata, MetadataRoute } from "next";
import type { Tool } from "@/types/tools";
import type { SiteConfig } from "./site-config";

import { localePath, locales, type Locale } from "./i18n/locale.ts";

type PageDetails = { title: string; description: string; path: string };
type Category = { id: string; name: string };

export const homeSeo = {
  title: "免费在线工具合集：图片压缩、JSON 格式化、文本处理",
  description: "100-tools 提供免费的图片压缩与裁剪、二维码生成、JSON 格式化、时间戳转换、文本整理和生活办公工具。无需注册，按分类查找，打开即可使用。",
};

export function absoluteUrl(path: string, site: SiteConfig): string | undefined {
  if (!site.url) return undefined;
  const url = new URL(path, `${site.url}/`);
  // Next.js metadata normalizes the root canonical to the bare origin.
  return url.pathname === "/" && !url.search && !url.hash ? url.origin : url.href;
}

export function createPageMetadata(page: PageDetails, site: SiteConfig, locale: Locale = "zh"): Metadata {
  const url = absoluteUrl(localePath(page.path, locale), site);
  const image = absoluteUrl("/opengraph-image", site);
  return {
    title: page.title,
    description: page.description,
    alternates: url ? { canonical: url, languages: Object.fromEntries(locales.map((language) => [language === "zh" ? "zh-CN" : "en", absoluteUrl(localePath(page.path, language), site)!])) } : undefined,
    openGraph: {
      type: "website",
      title: `${page.title} — ${site.name}`,
      description: page.description,
      siteName: site.name,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? ["en_US"] : ["zh_CN"],
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: locale === "zh" ? "100-tools 免费在线工具合集" : "100-tools free online tools" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} — ${site.name}`,
      description: page.description,
      images: image ? [image] : undefined,
    },
  };
}

export function createSitemap(site: SiteConfig, tools: Tool[], categories: Category[]): MetadataRoute.Sitemap {
  if (!site.url || !site.indexable) return [];
  const paths = ["/", ...categories.map((category) => `/category/${category.id}`), ...tools.map((tool) => tool.path)];
  return locales.flatMap((locale) => [...new Set(paths)].map((path) => ({
    url: absoluteUrl(localePath(path, locale), site)!,
    alternates: { languages: Object.fromEntries(locales.map((language) => [language === "zh" ? "zh-CN" : "en", absoluteUrl(localePath(path, language), site)!])) },
  })));
}

export function createRobots(site: SiteConfig): MetadataRoute.Robots {
  return {
    rules: site.indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: site.indexable ? absoluteUrl("/sitemap.xml", site) : undefined,
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function createCollectionSchema(page: PageDetails, items: Tool[], site: SiteConfig, locale: Locale = "zh") {
  if (!site.url) return null;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(localePath(page.path, locale), site),
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    isPartOf: { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: absoluteUrl(localePath("/", locale), site) },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.name, url: absoluteUrl(localePath(tool.path, locale), site) })),
    },
  };
}

export function createToolSchema(tool: Tool, category: Category, description: string, site: SiteConfig, locale: Locale = "zh") {
  if (!site.url) return null;
  const applicationCategories: Record<string, string> = { color: "DesignApplication", image: "MultimediaApplication", audio: "MultimediaApplication", text: "UtilitiesApplication", dev: "DeveloperApplication", daily: "ProductivityApplication" };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${absoluteUrl(localePath(tool.path, locale), site)}#application`,
        name: tool.name,
        alternateName: tool.nameEn,
        description,
        url: absoluteUrl(localePath(tool.path, locale), site),
        applicationCategory: applicationCategories[tool.category] ?? "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        inLanguage: locale === "zh" ? "zh-CN" : "en",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "zh" ? "全部工具" : "All tools", item: absoluteUrl(localePath("/", locale), site) },
          { "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(localePath(`/category/${category.id}`, locale), site) },
          { "@type": "ListItem", position: 3, name: tool.name, item: absoluteUrl(localePath(tool.path, locale), site) },
        ],
      },
    ],
  };
}
