"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function JsonMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"minify" | "beautify">("minify");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("请输入 JSON 内容"); return; }
    try {
      const parsed = JSON.parse(input.trim());
      setOutput(mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(`JSON 语法错误: ${(e as Error).message}`);
    }
  }, [input, mode]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">模式</Label>
        <div className="flex gap-3">
          <Button variant={mode === "minify" ? "gradient" : "secondary"} className="flex-1" onClick={() => { setMode("minify"); setOutput(""); }}>
            压缩
          </Button>
          <Button variant={mode === "beautify" ? "gradient" : "secondary"} className="flex-1" onClick={() => { setMode("beautify"); setOutput(""); }}>
            美化
          </Button>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">输入 JSON</Label>
        <Textarea
          className="min-h-[150px] w-full resize-y font-mono text-sm"
          placeholder='{"name": "test", "value": 123}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button variant="gradient" className="flex-1" onClick={handleConvert}>
          {mode === "minify" ? "压缩" : "美化"}
        </Button>
        <Button variant="secondary" onClick={() => { setInput(""); setOutput(""); setError(""); }}>
          清空
        </Button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {output && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <Label>输出结果</Label>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
              {copied ? "✓" : "复制"}
            </button>
          </div>
          <pre className="rounded-xl bg-gray-50 p-4 font-mono text-xs max-h-[400px] overflow-y-auto whitespace-pre-wrap break-all">
            {output}
          </pre>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 压缩模式去除所有空格和换行，美化模式使用 2 空格缩进。适用于 API 响应、配置文件等场景。
      </div>
    </div>
  );
}
