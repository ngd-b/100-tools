"use client";

import { useState, useCallback } from "react";

const entityMap: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  "'": "&#39;", "/": "&#x2F;", "`": "&#96;",
  "©": "&copy;", "®": "&reg;", "™": "&trade;",
  "€": "&euro;", "£": "&pound;", "¥": "&yen;",
  "—": "&mdash;", "–": "&ndash;", "·": "&middot;",
  "•": "&bull;", "…": "&hellip;",
};

const reverseMap: Record<string, string> = {};
Object.entries(entityMap).forEach(([k, v]) => { reverseMap[v] = k; });

export function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleEncode = useCallback(() => {
    setError("");
    setOutput("");
    if (!input) { setError("请输入内容"); return; }
    setOutput(input.replace(/[&<>"'/`©®™€£¥—–·•…]/g, (c) => entityMap[c] || c));
  }, [input]);

  const handleDecode = useCallback(() => {
    setError("");
    setOutput("");
    if (!input) { setError("请输入内容"); return; }
    setOutput(input.replace(/&[a-zA-Z0-9#]+;/g, (entity) => reverseMap[entity] || entity));
  }, [input]);

  const handleCopy = useCallback(() => {
    if (output) navigator.clipboard.writeText(output);
  }, [output]);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">输入内容</span>
        <textarea
          className="input min-h-[120px] w-full resize-y font-mono text-sm"
          placeholder='输入含 <> & " 等特殊字符的文本...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <button className="btn btn-primary flex-1" onClick={handleEncode}>编码</button>
        <button className="btn btn-secondary flex-1" onClick={handleDecode}>解码</button>
        <button className="btn btn-secondary" onClick={() => { setInput(""); setOutput(""); setError(""); }}>清空</button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {output && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="field-label">结果</span>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>复制</button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm break-all whitespace-pre-wrap">{output}</div>
        </div>
      )}

      <div className="glass-card mt-6">
        <span className="field-label mb-3 block">常用实体对照</span>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[["<", "&lt;"], [">", "&gt;"], ["&", "&amp;"], ['"', "&quot;"],
            ["'", "&#39;"], ["©", "&copy;"], ["®", "&reg;"], ["…", "&hellip;"],
          ].map(([char, entity]) => (
            <div key={char} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
              <span className="font-mono">{char}</span>
              <span className="font-mono text-xs text-gray-500">{entity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 编码可防止 XSS 攻击中的特殊字符被浏览器解析。适用于安全输出用户输入。
      </div>
    </div>
  );
}
