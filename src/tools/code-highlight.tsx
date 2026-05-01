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

const themeColors: Record<string, Record<string, string>> = {
  "github": {
    ".hljs-comment": "#6a737d", ".hljs-code": "#6a737d", ".hljs-formula": "#6a737d",
    ".hljs-keyword": "#d73a49", ".hljs-doctag": "#d73a49", ".hljs-meta .hljs-keyword": "#d73a49",
    ".hljs-template-tag": "#d73a49", ".hljs-template-variable": "#d73a49", ".hljs-type": "#d73a49", ".hljs-variable.language_": "#d73a49",
    ".hljs-title": "#6f42c1", ".hljs-title.class_": "#6f42c1", ".hljs-title.class_.inherited__": "#6f42c1",
    ".hljs-title.function_": "#6f42c1",
    ".hljs-attr": "#005cc5", ".hljs-attribute": "#005cc5", ".hljs-literal": "#005cc5",
    ".hljs-meta": "#005cc5", ".hljs-number": "#005cc5", ".hljs-operator": "#005cc5",
    ".hljs-selector-attr": "#005cc5", ".hljs-selector-class": "#005cc5",
    ".hljs-selector-id": "#005cc5", ".hljs-variable": "#005cc5",
    ".hljs-meta .hljs-string": "#032f62", ".hljs-regexp": "#032f62", ".hljs-string": "#032f62",
    ".hljs-built_in": "#e36209", ".hljs-symbol": "#e36209",
    ".hljs-name": "#22863a", ".hljs-quote": "#22863a", ".hljs-selector-pseudo": "#22863a",
    ".hljs-selector-tag": "#22863a",
    ".hljs-subst": "#24292e",
    ".hljs-section": "#005cc5",
    ".hljs-bullet": "#735c0f",
    ".hljs-emphasis": "#24292e",
    ".hljs-addition": "#22863a",
  },
  "github-dark": {
    ".hljs-comment": "#8b949e", ".hljs-code": "#8b949e", ".hljs-formula": "#8b949e",
    ".hljs-keyword": "#ff7b72", ".hljs-doctag": "#ff7b72", ".hljs-meta .hljs-keyword": "#ff7b72",
    ".hljs-template-tag": "#ff7b72", ".hljs-template-variable": "#ff7b72", ".hljs-type": "#ff7b72", ".hljs-variable.language_": "#ff7b72",
    ".hljs-title": "#d2a8ff", ".hljs-title.class_": "#d2a8ff", ".hljs-title.class_.inherited__": "#d2a8ff",
    ".hljs-title.function_": "#d2a8ff",
    ".hljs-attr": "#79c0ff", ".hljs-attribute": "#79c0ff", ".hljs-literal": "#79c0ff",
    ".hljs-meta": "#79c0ff", ".hljs-number": "#79c0ff", ".hljs-operator": "#79c0ff",
    ".hljs-selector-attr": "#79c0ff", ".hljs-selector-class": "#79c0ff",
    ".hljs-selector-id": "#79c0ff", ".hljs-variable": "#79c0ff",
    ".hljs-meta .hljs-string": "#a5d6ff", ".hljs-regexp": "#a5d6ff", ".hljs-string": "#a5d6ff",
    ".hljs-built_in": "#ffa657", ".hljs-symbol": "#ffa657",
    ".hljs-name": "#7ee787", ".hljs-quote": "#7ee787", ".hljs-selector-pseudo": "#7ee787",
    ".hljs-selector-tag": "#7ee787",
    ".hljs-subst": "#c9d1d9",
    ".hljs-section": "#1f6feb",
    ".hljs-bullet": "#f2cc60",
    ".hljs-emphasis": "#c9d1d9",
    ".hljs-addition": "#aff5b4",
  },
  "vs": {
    ".hljs-comment": "green", ".hljs-quote": "green", ".hljs-variable": "green",
    ".hljs-built_in": "#00f", ".hljs-keyword": "#00f", ".hljs-name": "#00f",
    ".hljs-selector-tag": "#00f", ".hljs-tag": "#00f",
    ".hljs-addition": "#a31515", ".hljs-attribute": "#a31515", ".hljs-literal": "#a31515",
    ".hljs-section": "#a31515", ".hljs-string": "#a31515", ".hljs-template-tag": "#a31515",
    ".hljs-template-variable": "#a31515", ".hljs-title": "#a31515", ".hljs-type": "#a31515",
    ".hljs-deletion": "#2b91af", ".hljs-meta": "#2b91af", ".hljs-selector-attr": "#2b91af",
    ".hljs-selector-pseudo": "#2b91af",
    ".hljs-doctag": "grey",
    ".hljs-attr": "red",
    ".hljs-bullet": "#00b0e8", ".hljs-link": "#00b0e8", ".hljs-symbol": "#00b0e8",
  },
  "atom-one-dark": {
    ".hljs-comment": "#5c6370", ".hljs-quote": "#5c6370",
    ".hljs-keyword": "#c678dd", ".hljs-doctag": "#c678dd", ".hljs-formula": "#c678dd",
    ".hljs-deletion": "#e06c75", ".hljs-name": "#e06c75", ".hljs-section": "#e06c75",
    ".hljs-selector-tag": "#e06c75", ".hljs-subst": "#e06c75",
    ".hljs-literal": "#56b6c2",
    ".hljs-addition": "#98c379", ".hljs-attribute": "#98c379", ".hljs-meta .hljs-string": "#98c379",
    ".hljs-regexp": "#98c379", ".hljs-string": "#98c379",
    ".hljs-attr": "#d19a66", ".hljs-number": "#d19a66", ".hljs-selector-attr": "#d19a66",
    ".hljs-selector-class": "#d19a66", ".hljs-selector-pseudo": "#d19a66",
    ".hljs-template-variable": "#d19a66", ".hljs-type": "#d19a66", ".hljs-variable": "#d19a66",
    ".hljs-bullet": "#61aeee", ".hljs-link": "#61aeee", ".hljs-meta": "#61aeee",
    ".hljs-selector-id": "#61aeee", ".hljs-symbol": "#61aeee", ".hljs-title": "#61aeee",
    ".hljs-built_in": "#e6c07b", ".hljs-class .hljs-title": "#e6c07b", ".hljs-title.class_": "#e6c07b",
  },
  "monokai": {
    ".hljs-comment": "#75715e", ".hljs-deletion": "#75715e", ".hljs-meta": "#75715e",
    ".hljs-quote": "#75715e",
    ".hljs-keyword": "#f92672", ".hljs-literal": "#f92672", ".hljs-name": "#f92672",
    ".hljs-number": "#f92672", ".hljs-selector-tag": "#f92672", ".hljs-strong": "#f92672",
    ".hljs-tag": "#f92672",
    ".hljs-code": "#66d9ef",
    ".hljs-attr": "#bf79db", ".hljs-attribute": "#bf79db", ".hljs-link": "#bf79db",
    ".hljs-regexp": "#bf79db", ".hljs-symbol": "#bf79db",
    ".hljs-addition": "#a6e22e", ".hljs-built_in": "#a6e22e", ".hljs-bullet": "#a6e22e",
    ".hljs-emphasis": "#a6e22e", ".hljs-section": "#a6e22e", ".hljs-selector-attr": "#a6e22e",
    ".hljs-selector-pseudo": "#a6e22e", ".hljs-string": "#a6e22e", ".hljs-subst": "#a6e22e",
    ".hljs-template-tag": "#a6e22e", ".hljs-template-variable": "#a6e22e",
    ".hljs-title": "#a6e22e", ".hljs-type": "#a6e22e", ".hljs-variable": "#a6e22e",
    ".hljs-class .hljs-title": "#fff", ".hljs-title.class_": "#fff",
  },
  "dracula": {
    ".hljs-comment": "#6272a4", ".hljs-quote": "#6272a4",
    ".hljs-keyword": "#ff79c6", ".hljs-selector-tag": "#ff79c6",
    ".hljs-literal": "#bd93f9", ".hljs-number": "#bd93f9",
    ".hljs-title": "#50fa7b", ".hljs-section": "#50fa7b", ".hljs-bullet": "#50fa7b",
    ".hljs-string": "#f1fa8c", ".hljs-meta .hljs-string": "#f1fa8c",
    ".hljs-emphasis": "#f8f8f2",
    ".hljs-variable": "#f8f8f2", ".hljs-template-variable": "#f8f8f2",
    ".hljs-type": "#8be9fd", ".hljs-built_in": "#8be9fd",
    ".hljs-attr": "#50fa7b",
    ".hljs-symbol": "#bd93f9", ".hljs-link": "#ff5555",
  },
  "tokyo-night-dark": {
    ".hljs-comment": "#565f89", ".hljs-meta": "#565f89",
    ".hljs-deletion": "#f7768e", ".hljs-doctag": "#f7768e", ".hljs-regexp": "#f7768e",
    ".hljs-selector-attr": "#f7768e", ".hljs-selector-class": "#f7768e",
    ".hljs-selector-id": "#f7768e", ".hljs-selector-pseudo": "#f7768e",
    ".hljs-tag": "#f7768e", ".hljs-template-tag": "#f7768e", ".hljs-variable.language_": "#f7768e",
    ".hljs-link": "#ff9e64", ".hljs-literal": "#ff9e64", ".hljs-number": "#ff9e64",
    ".hljs-params": "#ff9e64", ".hljs-template-variable": "#ff9e64", ".hljs-type": "#ff9e64",
    ".hljs-variable": "#ff9e64",
    ".hljs-attribute": "#e0af68", ".hljs-built_in": "#e0af68",
    ".hljs-keyword": "#7dcfff", ".hljs-property": "#7dcfff", ".hljs-subst": "#7dcfff",
    ".hljs-title": "#7dcfff", ".hljs-title.class_": "#7dcfff",
    ".hljs-title.class_.inherited__": "#7dcfff", ".hljs-title.function_": "#7dcfff",
    ".hljs-selector-tag": "#73daca",
    ".hljs-addition": "#9ece6a", ".hljs-bullet": "#9ece6a", ".hljs-quote": "#9ece6a",
    ".hljs-string": "#9ece6a", ".hljs-symbol": "#9ece6a",
    ".hljs-code": "#7aa2f7", ".hljs-formula": "#7aa2f7", ".hljs-section": "#7aa2f7",
    ".hljs-attr": "#bb9af7", ".hljs-char.escape_": "#bb9af7",
    ".hljs-name": "#bb9af7", ".hljs-operator": "#bb9af7",
    ".hljs-punctuation": "#c0caf5",
  },
  "atom-one-light": {
    ".hljs-comment": "#a0a1a7", ".hljs-quote": "#a0a1a7",
    ".hljs-keyword": "#a626a4", ".hljs-doctag": "#a626a4", ".hljs-formula": "#a626a4",
    ".hljs-deletion": "#e45649", ".hljs-name": "#e45649", ".hljs-section": "#e45649",
    ".hljs-selector-tag": "#e45649", ".hljs-subst": "#e45649",
    ".hljs-literal": "#0184bb",
    ".hljs-addition": "#50a14f", ".hljs-attribute": "#50a14f", ".hljs-meta .hljs-string": "#50a14f",
    ".hljs-regexp": "#50a14f", ".hljs-string": "#50a14f",
    ".hljs-attr": "#986801", ".hljs-number": "#986801", ".hljs-selector-attr": "#986801",
    ".hljs-selector-class": "#986801", ".hljs-selector-pseudo": "#986801",
    ".hljs-template-variable": "#986801", ".hljs-type": "#986801", ".hljs-variable": "#986801",
    ".hljs-bullet": "#4078f2", ".hljs-link": "#4078f2", ".hljs-meta": "#4078f2",
    ".hljs-selector-id": "#4078f2", ".hljs-symbol": "#4078f2", ".hljs-title": "#4078f2",
    ".hljs-built_in": "#c18401", ".hljs-class .hljs-title": "#c18401", ".hljs-title.class_": "#c18401",
  },
  "xcode-dark": {
    ".hljs-comment": "#6c7986", ".hljs-quote": "#6c7986",
    ".hljs-keyword": "#fc5fa3", ".hljs-selector-tag": "#fc5fa3",
    ".hljs-literal": "#787ce7", ".hljs-number": "#787ce7", ".hljs-attr": "#787ce7",
    ".hljs-symbol": "#787ce7",
    ".hljs-title": "#49a85e", ".hljs-section": "#49a85e", ".hljs-bullet": "#49a85e",
    ".hljs-string": "#ff8170",
    ".hljs-built_in": "#da7cff",
    ".hljs-emphasis": "#e1e4e8",
    ".hljs-variable": "#7aa0fa", ".hljs-template-variable": "#7aa0fa",
    ".hljs-type": "#93c964", ".hljs-link": "#7aa0fa",
  },
  "xcode-light": {
    ".hljs-comment": "#5d6c79", ".hljs-quote": "#5d6c79",
    ".hljs-keyword": "#a5238b", ".hljs-selector-tag": "#a5238b",
    ".hljs-literal": "#1c44d8", ".hljs-number": "#1c44d8", ".hljs-attr": "#1c44d8",
    ".hljs-symbol": "#1c44d8",
    ".hljs-title": "#1b5446", ".hljs-section": "#1b5446", ".hljs-bullet": "#1b5446",
    ".hljs-string": "#c4191e",
    ".hljs-built_in": "#5e3bb7",
    ".hljs-emphasis": "#000000",
    ".hljs-variable": "#0a44d8", ".hljs-template-variable": "#0a44d8",
    ".hljs-type": "#5e3bb7", ".hljs-link": "#0a44d8",
  },
};

const themeBg: Record<string, string> = {
  "github": "#ffffff", "github-dark": "#0d1117", "vs": "#ffffff",
  "atom-one-dark": "#282c34", "monokai": "#272822", "dracula": "#282a36",
  "tokyo-night-dark": "#1a1b26", "atom-one-light": "#fafafa",
  "xcode-dark": "#1e1e1e", "xcode-light": "#f5f5f5",
};

const defaultFg: Record<string, string> = {
  "github": "#24292e", "github-dark": "#c9d1d9", "vs": "#24292e",
  "atom-one-dark": "#abb2bf", "monokai": "#f8f8f2", "dracula": "#f8f8f2",
  "tokyo-night-dark": "#c0caf5", "atom-one-light": "#383a42",
  "xcode-dark": "#e1e4e8", "xcode-light": "#000000",
};

function parseHighlightedLine(htmlLine: string, colors: Record<string, string>, defaultColor: string): { text: string; color: string }[] {
  const tokens: { text: string; color: string }[] = [];
  const regex = /<span[^>]*class="([^"]*)"[^>]*>(.*?)<\/span>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(htmlLine)) !== null) {
    if (match.index > lastIndex) {
      const plain = decodeHtml(htmlLine.slice(lastIndex, match.index));
      if (plain) tokens.push({ text: plain, color: defaultColor });
    }
    const classes = match[1].split(" ");
    let color = defaultColor;
    for (const cls of classes) {
      const key = `.${cls}`;
      if (colors[key]) { color = colors[key]; break; }
    }
    const text = decodeHtml(match[2]);
    if (text) tokens.push({ text, color });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < htmlLine.length) {
    const plain = decodeHtml(htmlLine.slice(lastIndex));
    if (plain) tokens.push({ text: plain, color: defaultColor });
  }

  return tokens;
}

function decodeHtml(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

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
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load theme CSS dynamically for preview
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

  const renderCanvas = useCallback(() => {
    const colors = themeColors[theme] ?? {};
    const bg = themeBg[theme] ?? "#ffffff";
    const fg = defaultFg[theme] ?? "#24292e";

    const fontSize = 14;
    const lineHeight = fontSize * 1.6;
    const padding = 16;
    const lineNumDigits = 4;
    const lineNumWidth = lineNumDigits * fontSize * 0.6;
    const charWidth = fontSize * 0.6;

    const lines = highlighted.split("\n");

    let maxWidth = 0;
    for (const line of lines) {
      const tokens = parseHighlightedLine(line, colors, fg);
      let lineW = 0;
      for (const t of tokens) lineW += t.text.length * charWidth;
      maxWidth = Math.max(maxWidth, lineW);
    }

    if (showLineNumbers) maxWidth += lineNumWidth + fontSize;
    const totalWidth = maxWidth + padding * 2;
    const totalHeight = lines.length * lineHeight + padding * 2;

    const scale = 2;
    const canvas = canvasRef.current!;
    canvas.width = totalWidth * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    ctx.textBaseline = "top";
    ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace`;

    for (let i = 0; i < lines.length; i++) {
      const y = padding + i * lineHeight;
      let x = padding;

      if (showLineNumbers) {
        ctx.fillStyle = "#999999";
        ctx.font = `${fontSize * 0.9}px "Cascadia Code", "Fira Code", Consolas, monospace`;
        ctx.textAlign = "right";
        ctx.fillText(`${i + 1}`, x + lineNumWidth, y + (lineHeight - fontSize * 0.9) / 2);
        x += lineNumWidth + fontSize;
        ctx.textAlign = "left";
        ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace`;
      }

      const tokens = parseHighlightedLine(lines[i], colors, fg);
      for (const token of tokens) {
        ctx.fillStyle = token.color;
        ctx.fillText(token.text, x, y);
        x += ctx.measureText(token.text).width;
      }
    }

    return canvas.toDataURL("image/png");
  }, [highlighted, theme, showLineNumbers]);

  const handleCopyHtml = useCallback(() => {
    if (!previewRef.current) return;
    const html = previewRef.current.innerHTML;
    navigator.clipboard.writeText(html).then(() => {
      setCopied("html");
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const handleGenerateImage = useCallback(() => {
    const dataUrl = renderCanvas();
    setImagePreview(dataUrl);
  }, [renderCanvas]);

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
            <Button variant={imagePreview ? "gradient" : "secondary"} className="text-xs cursor-pointer" onClick={handleGenerateImage}>
              {imagePreview ? "重新生成" : "生成图片"}
            </Button>
            <Button variant="gradient" className="text-xs cursor-pointer" onClick={handleDownloadHtml}>
              下载 HTML
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <div ref={previewRef} className={`${["github-dark", "atom-one-dark", "monokai", "dracula", "tokyo-night-dark", "xcode-dark"].includes(theme) ? "!bg-gray-900" : "!bg-[#f5f5f5]"} px-4 py-3`}>
            <pre className="m-0 p-0" style={{ background: "transparent" }}>
              <code className={lang} dangerouslySetInnerHTML={{
                __html: showLineNumbers
                  ? highlighted.split("\n").map((line, i) =>
                      `<span class="line-number" style="display:inline-block;width:2.5em;text-align:right;padding-right:1em;color:#999;font-size:0.9em">${i + 1}</span>${line}\n`
                    ).join("")
                  : highlighted,
              }} />
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

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 支持 20+ 种编程语言，8 种代码高亮主题。生成图片后会自动预览，可直接下载 PNG。
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
