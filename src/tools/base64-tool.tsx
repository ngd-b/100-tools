"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("请输入内容"); return; }

    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setError(mode === "decode" ? "无效的 Base64 编码" : "编码失败");
    }
  }, [input, mode]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">模式</Label>
        <div className="flex gap-3">
          <Button
            variant={mode === "encode" ? "gradient" : "secondary"}
            className="flex-1"
            onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
          >
            编码
          </Button>
          <Button
            variant={mode === "decode" ? "gradient" : "secondary"}
            className="flex-1"
            onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
          >
            解码
          </Button>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">{mode === "encode" ? "原始文本" : "Base64 编码"}</Label>
        <Textarea
          className="min-h-[120px] w-full resize-y"
          placeholder={mode === "encode" ? "输入要编码的文本..." : "粘贴 Base64 编码..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button variant="gradient" className="flex-1" onClick={handleConvert}>
          {mode === "encode" ? "编码" : "解码"}
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          清空
        </Button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {output && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <Label>{mode === "encode" ? "Base64 结果" : "解码结果"}</Label>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
              {copied ? "✓" : "复制"}
            </button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm break-all max-h-[300px] overflow-y-auto">
            {output}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 支持 Unicode 字符（中文、emoji 等），编码过程会自动处理多字节字符。
      </div>
    </div>
  );
}
