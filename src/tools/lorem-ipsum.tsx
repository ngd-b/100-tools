"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const words = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et",
  "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis",
  "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

function generateWord(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join(" ");
}

function generateParagraph(minWords: number, maxWords: number): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const text = generateWord(count);
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

export function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordCount, setWordCount] = useState(50);
  const [result, setResult] = useState("");

  const handleGenerate = useCallback(() => {
    const lines: string[] = [];
    for (let i = 0; i < paragraphs; i++) {
      if (i === 0) {
        lines.push("Lorem ipsum dolor sit amet, " + generateWord(Math.max(1, wordCount - 5)) + ".");
      } else {
        lines.push(generateParagraph(Math.max(10, wordCount - 10), wordCount + 10));
      }
    }
    setResult(lines.join("\n\n"));
  }, [paragraphs, wordCount]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (result) navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">段落数</Label>
        <div className="flex items-center gap-3">
          <Slider
            value={[paragraphs]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setParagraphs(val as number) }}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono text-lg font-bold">{paragraphs}</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">每段大约字数</Label>
        <div className="flex items-center gap-3">
          <Slider
            value={[wordCount]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setWordCount(val as number) }}
            min={20}
            max={200}
            step={1}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono text-lg font-bold">{wordCount}</span>
        </div>
      </div>

      <Button variant="gradient" className="w-full mb-6" onClick={handleGenerate}>
        生成文本
      </Button>

      {result && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <Label>生成结果</Label>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>{copied ? "✓" : "复制"}</button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {result}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {result.split(/\s+/).length} 词 · {result.length} 字符 · {paragraphs} 段落
          </p>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 适用于设计稿、原型、页面占位等场景，生成的 Lorem Ipsum 文本符合传统排版习惯。
      </div>
    </div>
  );
}
