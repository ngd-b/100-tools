"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import dart from "highlight.js/lib/languages/dart";
import kotlin from "highlight.js/lib/languages/kotlin";
import yaml from "highlight.js/lib/languages/yaml";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import lua from "highlight.js/lib/languages/lua";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("java", java);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("dart", dart);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("lua", lua);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);

const languages = [
  { value: "plaintext", label: "纯文本" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash/Shell" },
  { value: "sql", label: "SQL" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C/C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "dart", label: "Dart" },
  { value: "kotlin", label: "Kotlin" },
  { value: "yaml", label: "YAML" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "lua", label: "Lua" },
  { value: "markdown", label: "Markdown" },
];

const themeBg: Record<string, string> = {
  "github": "#ffffff", "github-dark": "#0d1117", "vs": "#ffffff",
  "atom-one-dark": "#282c34", "monokai": "#272822", "dracula": "#282a36",
  "tokyo-night-dark": "#1a1b26", "atom-one-light": "#fafafa",
  "xcode-dark": "#1e1e1e", "xcode-light": "#f5f5f5",
};

const isDarkTheme = (t: string) => ["github-dark", "atom-one-dark", "monokai", "dracula", "tokyo-night-dark", "xcode-dark"].includes(t);

export function CodeHighlight() {
  const [code, setCode] = useState(`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`);
  const [lang, setLang] = useState("javascript");
  const [theme, setTheme] = useState("github");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [highlighted, setHighlighted] = useState("");
  const [copied, setCopied] = useState<"html" | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load theme CSS dynamically
  useEffect(() => {
    const id = "hljs-theme-style";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    fetch(`/hljs/${theme}.min.css`)
      .then((r) => r.text())
      .then((css) => {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
      })
      .catch(() => {});
  }, [theme]);

  useEffect(() => {
    try {
      const result = hljs.highlight(code, { language: lang });
      setHighlighted(result.value);
    } catch {
      setHighlighted(escapeHtml(code));
    }
  }, [code, lang]);

  const handleCopyHtml = useCallback(() => {
    if (!previewRef.current) return;
    const html = previewRef.current.innerHTML;
    navigator.clipboard.writeText(html).then(() => {
      setCopied("html");
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const handleGenerateImage = useCallback(async () => {
    if (!previewRef.current) return;
    setGenerating(true);
    try {
      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        pixelRatio: 2,
        quality: 1,
        backgroundColor: themeBg[theme] ?? "#ffffff",
      });
      setImagePreview(dataUrl);
    } catch (e: unknown) {
      console.error("生成图片失败:", e);
    } finally {
      setGenerating(false);
    }
  }, [theme]);

  const handleDownloadImage = useCallback(() => {
    if (!imagePreview) return;
    const a = document.createElement("a");
    a.href = imagePreview;
    a.download = "code-snippet.png";
    a.click();
  }, [imagePreview]);

  const handleDownloadHtml = useCallback(() => {
    if (!previewRef.current) return;
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Code Snippet</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css"><style>body{margin:0;padding:20px;font-family:monospace}pre{margin:0}</style></head><body>${previewRef.current.outerHTML}</body></html>`;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code-snippet.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [theme]);

  // Build inner code HTML
  const codeHtml = showLineNumbers
    ? highlighted.split("\n").map((line, i) =>
        `<span class="line-number" style="display:inline-block;width:2.5em;text-align:right;padding-right:1em;color:#999;font-size:0.9em">${i + 1}</span>${line}\n`
      ).join("")
    : highlighted;

  return (
    <div>
      {/* Controls */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-2 block">编程语言</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">代码主题</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub Light</SelectItem>
                <SelectItem value="github-dark">GitHub Dark</SelectItem>
                <SelectItem value="vs">VS Light</SelectItem>
                <SelectItem value="atom-one-dark">Atom One Dark</SelectItem>
                <SelectItem value="monokai">Monokai</SelectItem>
                <SelectItem value="dracula">Dracula</SelectItem>
                <SelectItem value="tokyo-night-dark">Tokyo Night</SelectItem>
                <SelectItem value="atom-one-light">Atom One Light</SelectItem>
                <SelectItem value="xcode-dark">Xcode Dark</SelectItem>
                <SelectItem value="xcode-light">Xcode Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">行号</Label>
            <Button
              variant={showLineNumbers ? "gradient" : "secondary"}
              className="w-full cursor-pointer"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
            >
              {showLineNumbers ? "已开启" : "已关闭"}
            </Button>
          </div>
        </div>
      </div>

      {/* Code Input */}
      <div className="mb-6">
        <Label className="mb-2 block">输入代码</Label>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="粘贴你的代码..."
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      {/* Preview */}
      <div className="glass-card mb-6">
        <div className="mb-3 flex items-center justify-between">
          <Label>预览</Label>
          <div className="flex gap-2">
            <Button variant={copied === "html" ? "gradient" : "secondary"} className="text-xs cursor-pointer" onClick={handleCopyHtml}>
              {copied === "html" ? "已复制 ✓" : "复制 HTML"}
            </Button>
            <Button variant={imagePreview ? "gradient" : "secondary"} className="text-xs cursor-pointer" onClick={handleGenerateImage} disabled={generating}>
              {generating ? "生成中..." : imagePreview ? "重新生成" : "生成图片"}
            </Button>
            <Button variant="gradient" className="text-xs cursor-pointer" onClick={handleDownloadHtml}>
              下载 HTML
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <div ref={previewRef} className={`${isDarkTheme(theme) ? "!bg-gray-900" : "!bg-[#f5f5f5]"} px-4 py-3`}>
            <pre className="m-0 p-0" style={{ background: "transparent" }}>
              <code className={lang} dangerouslySetInnerHTML={{ __html: codeHtml }} />
            </pre>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="glass-card mb-6">
          <div className="mb-3 flex items-center justify-between">
            <Label>图片预览</Label>
            <Button variant="gradient" className="text-xs cursor-pointer" onClick={handleDownloadImage}>
              下载 PNG
            </Button>
          </div>
          <img src={imagePreview} alt="Code image" className="w-full rounded-lg border border-gray-100" />
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 支持 20+ 种编程语言，10 种代码高亮主题。生成图片使用浏览器原生渲染，和预览效果完全一致。
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
