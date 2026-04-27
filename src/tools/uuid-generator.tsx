"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<"standard" | "uppercase" | "no-dash">("standard");
  const [results, setResults] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    const uuids = Array.from({ length: count }, () => {
      let uuid = generateUUID();
      if (format === "uppercase") uuid = uuid.toUpperCase();
      if (format === "no-dash") uuid = uuid.replace(/-/g, "");
      return uuid;
    });
    setResults(uuids);
  }, [count, format]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [results]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">格式</Label>
        <div className="flex gap-2">
          {(["standard", "uppercase", "no-dash"] as const).map((f) => (
            <Button
              key={f}
              variant={format === f ? "gradient" : "secondary"}
              className="flex-1 text-xs"
              onClick={() => setFormat(f)}
            >
              {f === "standard" ? "标准" : f === "uppercase" ? "大写" : "无横线"}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">生成数量</Label>
        <div className="flex items-center gap-3">
          <Slider
            value={[count]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setCount(val as number) }}
            min={1}
            max={50}
            step={1}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono text-lg font-bold">{count}</span>
        </div>
      </div>

      <Button variant="gradient" className="w-full mb-6" onClick={handleGenerate}>
        生成 UUID
      </Button>

      {results.length > 0 && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <Label>生成结果</Label>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
              {copied ? "✓" : "复制"}
            </button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto break-all">
            {results.map((uuid, i) => (
              <div key={i} className="py-0.5">{uuid}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 UUID v4 基于随机数生成，冲突概率极低，适用于唯一标识符、数据库主键等场景。
      </div>
    </div>
  );
}
