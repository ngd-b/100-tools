import type { Metadata } from "next";
import { NavigationLink as Link } from "@/components/NavigationLink";
import { ArrowUpRight } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolCatalog } from "@/components/ToolCatalog";
import { getCategoryGuide, localizedTools, localizedCategories } from "@/lib/i18n/content";
import { getTranslator } from "@/lib/i18n/translate";
import { isLocale } from "@/lib/i18n/locale";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { createCollectionSchema, createPageMetadata, homeSeo } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);
  return createPageMetadata({ title: t(homeSeo.title), description: t(homeSeo.description), path: "/" }, siteConfig, locale);
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);
  const tools = localizedTools(locale);
  const categories = localizedCategories(locale);
  return (
    <>
      <JsonLd data={createCollectionSchema({ title: t(homeSeo.title), description: t(homeSeo.description), path: "/" }, tools, siteConfig, locale)} />
      <ToolCatalog />
      <section className="site-container discovery-section" aria-labelledby="browse-categories">
        <div className="discovery-heading"><h2 id="browse-categories">{t("按使用场景，找到顺手的工具。")}</h2><span>{t("6 个分类，覆盖日常工作的小需求")}</span></div>
        <div className="category-discovery-grid">
          {categories.map((category) => <article key={category.id}><Link href={`/category/${category.id}`} className="category-discovery"><h3><ToolIcon category={category.id} className="size-4" />{category.name}<ArrowUpRight className="size-4" aria-hidden="true" /></h3><p>{getCategoryGuide(category.id, locale).description}</p></Link></article>)}
        </div>
        <div className="about-tools">
          <h2>{t("如何选择合适的在线工具")}<span className="mt-2 block text-[10px] tracking-widest text-muted-foreground">A LITTLE HELP, EVERY DAY.</span></h2>
          <div><p>{t("100-tools 将图片、文本、开发、颜色与样式、音频和生活办公任务分开整理。知道工具名称时可以直接搜索；只知道要完成的任务时，可以按分类查看说明，选择对应的输入与输出方式。")}</p>
          <p>{t("所有工具无需注册即可使用，多数计算与文件处理在浏览器中完成。各工具页提供使用步骤与适用范围；录音需要权限，语音、媒体格式和文件处理能力取决于浏览器支持。常用工具可以收藏，也可以复制独立页面链接。")}</p></div>
        </div>
      </section>
    </>
  );
}
