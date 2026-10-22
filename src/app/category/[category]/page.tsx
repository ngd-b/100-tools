import type { Metadata } from "next";
import { NavigationLink as Link } from "@/components/NavigationLink";
import { notFound } from "next/navigation";
import { categories, tools } from "@/data/tools";
import { categoryGuides } from "@/data/category-guides";
import { toolGuides } from "@/data/tool-guides";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { createCollectionSchema, createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ category: string }> };

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
  const category = await resolveCategory(params);
  return createPageMetadata({ ...categoryGuides[category.id], path: `/category/${category.id}` }, siteConfig);
}

export default async function CategoryPage({ params }: Props) {
  const category = await resolveCategory(params);
  const guide = categoryGuides[category.id];
  const items = tools.filter((tool) => tool.category === category.id);
  return (
    <div className="site-container category-page">
      <JsonLd data={createCollectionSchema({ ...guide, path: `/category/${category.id}` }, items, siteConfig)} />
      <nav aria-label="当前位置" className="breadcrumbs"><Link href="/">全部工具</Link><ChevronRight className="size-3" aria-hidden="true" /><span aria-current="page">{category.name}</span></nav>
      <header className="category-header"><div><p className="eyebrow">THE COLLECTION / {items.length} 个工具 · 无需注册</p><h1>{category.name}</h1><p>{guide.intro}</p></div><span className="tool-icon" data-category={category.id}><ToolIcon category={category.id} className="size-8" /></span></header>
      <section aria-label={`${category.name}列表`} className="category-tool-grid">
        {items.map((tool) => <article key={tool.id}><Link href={tool.path} prefetch={false} className="tool-card h-full"><span className="tool-icon" data-category={tool.category}><ToolIcon id={tool.id} category={tool.category} /></span><h2 className="card-title">{tool.name}</h2><p className="card-description">{toolGuides[tool.id].description}</p><span className="card-meta"><span>{tool.nameEn}</span><ArrowUpRight className="size-4" aria-hidden="true" /></span></Link></article>)}
      </section>
      <nav aria-label="其他工具分类" className="category-navigation">{categories.filter((item) => item.id !== category.id).map((item) => <Link key={item.id} href={`/category/${item.id}`} className="filter-pill"><ToolIcon category={item.id} className="size-3.5" />{item.name}</Link>)}</nav>
    </div>
  );
}
