"use client";

import { useState, useCallback } from "react";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<"pretty" | "compact">("pretty");

  const handleFormat = useCallback((compact: boolean) => {
    setError("");
    setOutput("");
    if (!input.trim()) { setError("请输入 JSON 内容"); return; }

    try {
      const parsed = JSON.parse(input.trim());
      setOutput(compact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setError(`JSON 格式错误: ${e.message}`);
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (output) navigator.clipboard.writeText(output);
  }, [output]);

  const handleMinify = useCallback(() => handleFormat(true), [handleFormat]);
  const handlePrettify = useCallback(() => handleFormat(false), [handleFormat]);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">JSON 输入</span>
        <textarea
          className="input min-h-[140px] w-full resize-y font-mono text-sm"
          placeholder='粘贴 JSON，如 {"name": "工具"}...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <button className="btn btn-primary flex-1" onClick={handlePrettify}>
          格式化
        </button>
        <button className="btn btn-secondary flex-1" onClick={handleMinify}>
          压缩
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => { setInput(""); setOutput(""); setError(""); }}
        >
          清空
        </button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {output && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="field-label">
              {indent === "pretty" ? "格式化结果" : "压缩结果"}
              <span className="ml-2 text-xs text-gray-400 normal-case font-normal">
                ({(new Blob([output]).size / 1024).toFixed(1)} KB)
              </span>
            </span>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
              复制
            </button>
          </div>
          <pre className="rounded-xl bg-gray-50 p-4 font-mono text-xs max-h-[400px] overflow-y-auto whitespace-pre-wrap break-all">
            {output}
          </pre>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 格式化以 2 空格缩进，压缩移除所有空白字符。支持任意合法的 JSON 内容。
      </div>
    </div>
  );
}
