import Link from "next/link";
import type { Tool } from "@/types/tools";
import { categories, tools } from "@/data/tools";
import { toolIconBackgrounds } from "@/data/tool-styles";
import { ToolActions } from "@/components/ToolActions";
import { ToolRenderer } from "@/components/ToolRenderer";

export function ToolPage({ tool }: { tool: Tool }) {
  const category = categories.find((item) => item.id === tool.category);
  const related = tools.filter((item) => item.category === tool.category && item.id !== tool.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6">
      <nav aria-label="当前位置" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-500">全部工具</Link>
        <span aria-hidden="true">/</span><span>{category?.name}</span>
        <span aria-hidden="true">/</span><span className="text-gray-900">{tool.name}</span>
      </nav>
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <header className="mb-7">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: toolIconBackgrounds[tool.category] }}>{tool.icon}</span>
              <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1><p className="mt-1 text-xs text-gray-500">{tool.nameEn}</p></div>
            </div>
            <p className="mb-4 text-sm leading-6 text-gray-500">{tool.description}</p>
            <ToolActions key={tool.id} id={tool.id} path={tool.path} />
          </header>
          <ToolRenderer id={tool.id} />
        </div>
        <aside aria-label="同类工具" className="glass-card min-w-0 lg:sticky lg:top-24">
          <h2 className="mb-3 text-sm font-semibold">{category?.icon} {category?.name}</h2>
          <ul className="space-y-1">
            {related.map((item) => <li key={item.id}><Link prefetch={false} href={item.path} className="block rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600">{item.icon} {item.name}</Link></li>)}
          </ul>
          <Link href="/" className="mt-4 block border-t border-gray-100 px-2 pt-4 text-sm text-blue-600">← 返回全部工具</Link>
        </aside>
      </div>
    </div>
  );
}
