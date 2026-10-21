import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, tools } from "@/data/tools";
import { categoryGuides } from "@/data/category-guides";
import { toolGuides } from "@/data/tool-guides";
import { toolIconBackgrounds } from "@/data/tool-styles";
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
    <div className="mx-auto max-w-6xl px-5 py-9 sm:px-6">
      <JsonLd data={createCollectionSchema({ ...guide, path: `/category/${category.id}` }, items, siteConfig)} />
      <nav aria-label="当前位置" className="mb-6 flex gap-2 text-sm text-gray-500"><Link href="/" className="hover:text-blue-600">全部工具</Link><span aria-hidden="true">/</span><span aria-current="page">{category.name}</span></nav>
      <header className="mb-8 max-w-3xl"><p className="mb-3 text-sm text-gray-500">{items.length} 个工具 · 无需注册</p><h1 className="mb-4 text-3xl font-bold">{category.icon} {category.name}</h1><p className="text-sm leading-7 text-gray-600">{guide.intro}</p></header>
      <section aria-label={`${category.name}列表`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((tool) => <article key={tool.id}><Link href={tool.path} prefetch={false} className="tool-card h-full"><span aria-hidden="true" className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: toolIconBackgrounds[tool.category] }}>{tool.icon}</span><h2 className="mb-2 font-semibold">{tool.name}</h2><p className="text-sm leading-6 text-gray-500">{toolGuides[tool.id].description}</p></Link></article>)}
      </section>
      <nav aria-label="其他工具分类" className="mt-10 flex flex-wrap gap-3 border-t border-gray-200 pt-6">{categories.filter((item) => item.id !== category.id).map((item) => <Link key={item.id} href={`/category/${item.id}`} className="filter-pill">{item.icon} {item.name}</Link>)}</nav>
    </div>
  );
}
