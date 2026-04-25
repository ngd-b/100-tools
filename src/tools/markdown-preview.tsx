"use client";

import { useState, useCallback } from "react";

const defaultMd = `# 标题

这是一段 **粗体** 和 *斜体* 文本。

## 列表

- 项目一
- 项目二
- 项目三

## 代码

\`\`\`js
console.log("Hello World");
\`\`\`

## 引用

> 这是一段引用文字

---

| 表头1 | 表头2 |
|-------|-------|
| 单元格 | 单元格 |
`;

function simpleMarkdown(md: string): string {
  let html = md;

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-gray-100 rounded-lg p-3 font-mono text-sm overflow-x-auto mb-4"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 py-2 my-3 text-gray-600 italic">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-200" />');

  // Unordered list
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="mb-4 space-y-1">$1</ul>');

  // Ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Table
  html = html.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, (match) => {
    const rows = match.trim().split("\n");
    const headerCells = rows[0].split("|").filter((c) => c.trim());
    const dataRows = rows.slice(2);
    let tableHtml = '<table class="w-full border-collapse border border-gray-300 mb-4"><thead><tr>';
    headerCells.forEach((cell) => {
      tableHtml += `<th class="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold">${cell.trim()}</th>`;
    });
    tableHtml += "</tr></thead><tbody>";
    dataRows.forEach((row) => {
      const cells = row.split("|").filter((c) => c.trim());
      tableHtml += "<tr>";
      cells.forEach((cell) => {
        tableHtml += `<td class="border border-gray-300 px-3 py-2">${cell.trim()}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</tbody></table>";
    return tableHtml;
  });

  // Paragraphs
  html = html.replace(/^(?!<[a-z/])((?!<br).+)$/gm, (match) => {
    if (match.trim()) return `<p class="mb-3">${match}</p>`;
    return match;
  });

  html = html.replace(/\n{2,}/g, "");
  return html;
}

export function MarkdownPreview() {
  const [md, setMd] = useState(defaultMd);

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(simpleMarkdown(md));
  }, [md]);

  const html = simpleMarkdown(md);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <span className="field-label mb-3 block">Markdown 编辑</span>
          <textarea
            className="input font-mono text-sm min-h-[300px] w-full resize-y"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="field-label mb-0">预览</span>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopyHtml}>复制 HTML</button>
          </div>
          <div
            className="rounded-xl bg-gray-50 p-4 min-h-[300px] max-h-[400px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 支持标题、列表、粗体、斜体、代码块、引用、表格等常用语法。
      </div>
    </div>
  );
}
