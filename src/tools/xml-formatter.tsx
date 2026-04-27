"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function formatXml(xml: string): string {
  let formatted = "";
  let indent = 0;
  const tab = "  ";

  // Remove existing whitespace
  xml = xml.replace(/>\s*</g, "><").trim();

  for (let i = 0; i < xml.length; i++) {
    let char = xml[i];
    if (char === "<") {
      // Check if it's a closing tag
      const nextChar = xml[i + 1];
      if (nextChar === "/") {
        indent--;
        formatted += "\n" + tab.repeat(Math.max(0, indent));
      } else if (nextChar !== "!" && nextChar !== "?") {
        // Opening tag
        if (indent > 0) formatted += "\n" + tab.repeat(indent);
      } else {
        // Comment or processing instruction
        formatted += "\n" + tab.repeat(indent);
      }
    }
    formatted += char;
  }
  return formatted.trim();
}

function minifyXml(xml: string): string {
  return xml.replace(/\s*\n\s*/g, "").replace(/>\s+</g, "><").trim();
}

export function XmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("请输入 XML 内容"); return; }
    try {
      setOutput(mode === "format" ? formatXml(input.trim()) : minifyXml(input.trim()));
    } catch {
      setError("XML 格式错误，请检查输入");
    }
  }, [input, mode]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handleClear = useCallback(() => { setInput(""); setOutput(""); setError(""); }, []);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">模式</Label>
        <div className="flex gap-3">
          <Button variant={mode === "format" ? "gradient" : "secondary"} className="flex-1" onClick={() => { setMode("format"); setOutput(""); setError(""); }}>
            格式化
          </Button>
          <Button variant={mode === "minify" ? "gradient" : "secondary"} className="flex-1" onClick={() => { setMode("minify"); setOutput(""); setError(""); }}>
            压缩
          </Button>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">输入 XML</Label>
        <Textarea
          className="min-h-[150px] w-full resize-y font-mono text-sm"
          placeholder="粘贴 XML 内容..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button variant="gradient" className="flex-1" onClick={handleConvert}>
          {mode === "format" ? "格式化" : "压缩"}
        </Button>
        <Button variant="secondary" onClick={handleClear}>
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
          <pre className="rounded-xl bg-gray-50 p-4 font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 支持 XML 格式化（美化缩进）和压缩（去除多余空白），适用于配置文件、SOAP 报文等场景。
      </div>
    </div>
  );
}
