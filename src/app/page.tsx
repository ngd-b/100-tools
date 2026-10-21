import type { Metadata } from "next";
import Link from "next/link";
import { ToolCatalog } from "@/components/ToolCatalog";
import { categories, tools } from "@/data/tools";
import { categoryGuides } from "@/data/category-guides";
import { JsonLd } from "@/components/JsonLd";
import { createCollectionSchema, createPageMetadata, homeSeo } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({ ...homeSeo, path: "/" }, siteConfig);

export default function Home() {
  return (
    <>
      <JsonLd data={createCollectionSchema({ ...homeSeo, path: "/" }, tools, siteConfig)} />
      <ToolCatalog />
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-6" aria-labelledby="browse-categories">
        <h2 id="browse-categories" className="mb-4 text-xl font-semibold">按使用场景浏览工具</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => <article key={category.id} className="glass-card"><h3 className="mb-2 font-semibold"><Link href={`/category/${category.id}`} className="text-blue-600 hover:underline">{category.icon} {category.name}</Link></h3><p className="text-sm leading-6 text-gray-500">{categoryGuides[category.id].description}</p></article>)}
        </div>
        <div className="mt-8 max-w-3xl text-sm leading-7 text-gray-600">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">如何选择合适的在线工具</h2>
          <p>100-tools 将图片、文本、开发、颜色与样式、音频和生活办公任务分开整理。知道工具名称时可以直接搜索；只知道要完成的任务时，可以按分类查看说明，选择对应的输入与输出方式。</p>
          <p className="mt-3">所有工具无需注册即可使用，多数计算与文件处理在浏览器中完成。各工具页提供使用步骤与适用范围；录音需要权限，语音、媒体格式和文件处理能力取决于浏览器支持。常用工具可以收藏，也可以复制独立页面链接。</p>
        </div>
      </section>
    </>
  );
}
