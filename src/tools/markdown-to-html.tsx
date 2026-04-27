"use client";

import { useState, useMemo, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function simpleMarkdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="rounded-lg bg-gray-800 p-3 text-xs text-green-300"><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-pink-600">$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-h-48"/>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 underline" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/((?:<li[^>]*<\/li>\n?)+)/g, "<ul class='my-2'>$1</ul>");
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-200"/>');
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 text-gray-500 italic">$1</blockquote>');
  html = html.replace(/\n\n/g, "</p><p class='my-2'>");
  html = html.replace(/\n/g, "<br/>");
  html = `<p class="my-2">${html}</p>`;
  return html;
}

export function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n\n> A quote\n\n`inline code`");
  const [view, setView] = useState<"preview" | "html">("preview");

  const html = useMemo(() => simpleMarkdownToHtml(markdown), [markdown]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [html]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">Markdown 输入</Label>
        <Textarea
          className="min-h-[200px] w-full resize-y font-mono text-sm"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button variant={view === "preview" ? "gradient" : "secondary"} className="flex-1" onClick={() => setView("preview")}>预览</Button>
        <Button variant={view === "html" ? "gradient" : "secondary"} className="flex-1" onClick={() => setView("html")}>HTML 源码</Button>
        <Button variant="secondary" onClick={handleCopy}>{copied ? "✓" : "复制 HTML"}</Button>
      </div>

      <div className="glass-card">
        <Label className="mb-3 block">{view === "preview" ? "预览效果" : "HTML 代码"}</Label>
        {view === "preview" ? (
          <div className="rounded-xl bg-gray-50 p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="rounded-xl bg-gray-50 p-4 font-mono text-xs max-h-[400px] overflow-y-auto whitespace-pre-wrap break-all">{html}</pre>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 简易 Markdown 转 HTML，支持标题、粗体、斜体、列表、链接、图片、引用等语法。
      </div>
    </div>
  );
}
