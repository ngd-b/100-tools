import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ToolPage } from "@/components/ToolPage";
import { getToolByPath, toolPathRedirects, tools } from "@/data/tools";
import { getToolGuide, localizeTool } from "@/lib/i18n/content";
import { isLocale, localePath } from "@/lib/i18n/locale";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ toolPath: string[]; locale: string }> };

export function generateStaticParams() {
  return [...tools.map((tool) => tool.path), ...Object.keys(toolPathRedirects)]
    .map((path) => ({ toolPath: path.slice(1).split("/") }));
}

async function resolveTool(params: Props["params"]) {
  const { toolPath, locale } = await params;
  if (!isLocale(locale)) notFound();
  const path = `/${toolPath.join("/")}`;
  if (Object.hasOwn(toolPathRedirects, path)) permanentRedirect(localePath(toolPathRedirects[path], locale));
  const tool = getToolByPath(path);
  if (!tool) notFound();
  return tool;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const tool = await resolveTool(params);
  const guide = getToolGuide(tool.id, locale);
  return createPageMetadata({ title: guide.title, description: guide.description, path: tool.path }, siteConfig, locale);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const tool = await resolveTool(params);
  return <ToolPage tool={localizeTool(tool, locale)} locale={locale} />;
}
