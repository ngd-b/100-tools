import Link from "next/link";
import type { Tool } from "@/types/tools";
import { categories, tools } from "@/data/tools";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolActions } from "@/components/ToolActions";
import { ToolRenderer } from "@/components/ToolRenderer";
import { toolGuides } from "@/data/tool-guides";
import { createToolSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";

export function ToolPage({ tool }: { tool: Tool }) {
  const category = categories.find((item) => item.id === tool.category);
  const related = tools.filter((item) => item.category === tool.category && item.id !== tool.id);
  const guide = toolGuides[tool.id];

  return (
    <div className="site-container workspace-page">
      <JsonLd data={category ? createToolSchema(tool, category, guide.description, siteConfig) : null} />
      <nav aria-label="当前位置" className="breadcrumbs">
        <Link href="/">全部工具</Link><ChevronRight className="size-3" aria-hidden="true" /><Link href={`/category/${tool.category}`}>{category?.name}</Link><ChevronRight className="size-3" aria-hidden="true" /><span aria-current="page">{tool.name}</span>
      </nav>
      <div className="workspace-layout">
        <div className="min-w-0">
          <header className="workspace-header">
            <div className="workspace-title"><span className="tool-icon" data-category={tool.category}><ToolIcon id={tool.id} category={tool.category} className="size-6" /></span><div><h1>{tool.name}</h1><p>{tool.nameEn}</p></div></div>
            <p className="workspace-description">{guide.description}</p>
            <ToolActions key={tool.id} id={tool.id} path={tool.path} />
          </header>
          <ToolRenderer id={tool.id} />
          <section className="tool-instructions" aria-labelledby="tool-instructions">
            <div><h2 id="tool-instructions">如何使用{tool.name}</h2><ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>
            <div><h2>适用范围与使用说明</h2><p>{guide.note}</p></div>
          </section>
        </div>
        <aside aria-label="同类工具" className="workspace-related">
          <h2><Link href={`/category/${tool.category}`}><ToolIcon category={tool.category} className="size-4" />{category?.name}</Link></h2>
          <ul>{related.map((item) => <li key={item.id}><Link prefetch={false} href={item.path}><ToolIcon id={item.id} category={item.category} className="size-3.5 shrink-0" />{item.name}</Link></li>)}</ul>
          <Link href="/" className="related-back"><ArrowLeft className="size-3.5" aria-hidden="true" />返回全部工具</Link>
        </aside>
      </div>
    </div>
  );
}
