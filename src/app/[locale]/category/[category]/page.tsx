import type { Metadata } from "next";
import { NavigationLink as Link } from "@/components/NavigationLink";
import { notFound } from "next/navigation";
import { categories, tools } from "@/data/tools";
import { getCategoryGuide, getToolGuide, localizeTool, localizedCategories } from "@/lib/i18n/content";
import { getTranslator } from "@/lib/i18n/translate";
import { isLocale } from "@/lib/i18n/locale";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { createCollectionSchema, createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ category: string; locale: string }> };

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.id }));
}

async function resolveCategory(params: Props["params"]) {
  const { category: id } = await params;
  const category = categories.find((item) => item.id === id);
  if (!category) notFound();
  return category;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const category = await resolveCategory(params);
  return createPageMetadata({ ...getCategoryGuide(category.id, locale), path: `/category/${category.id}` }, siteConfig, locale);
}

export default async function CategoryPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);
  const category = await resolveCategory(params);
  const guide = getCategoryGuide(category.id, locale);
  const items = tools.filter((tool) => tool.category === category.id).map((tool) => localizeTool(tool, locale));
  return (
    <div className="site-container category-page">
      <JsonLd data={createCollectionSchema({ ...guide, path: `/category/${category.id}` }, items, siteConfig, locale)} />
      <nav aria-label={t("当前位置")} className="breadcrumbs"><Link href="/">{t("全部工具")}</Link><ChevronRight className="size-3" aria-hidden="true" /><span aria-current="page">{t(category.name)}</span></nav>
      <header className="category-header"><div><p className="eyebrow">{t("THE COLLECTION / {0} 个工具 · 无需注册", [items.length])}</p><h1>{t(category.name)}</h1><p>{guide.intro}</p></div><span className="tool-icon" data-category={category.id}><ToolIcon category={category.id} className="size-8" /></span></header>
      <section aria-label={t("{0}列表", [t(category.name)])} className="category-tool-grid">
        {items.map((tool) => <article key={tool.id}><Link href={tool.path} prefetch={false} className="tool-card h-full"><span className="tool-icon" data-category={tool.category}><ToolIcon id={tool.id} category={tool.category} /></span><h2 className="card-title">{tool.name}</h2><p className="card-description">{getToolGuide(tool.id, locale).description}</p><span className="card-meta"><span>{tool.nameEn}</span><ArrowUpRight className="size-4" aria-hidden="true" /></span></Link></article>)}
      </section>
      <nav aria-label={t("其他工具分类")} className="category-navigation">{localizedCategories(locale).filter((item) => item.id !== category.id).map((item) => <Link key={item.id} href={`/category/${item.id}`} className="filter-pill"><ToolIcon category={item.id} className="size-3.5" />{item.name}</Link>)}</nav>
    </div>
  );
}
