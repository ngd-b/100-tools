"use client";

import { useState, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NumberConverter() {
  const [input, setInput] = useState("255");
  const [base, setBase] = useState<"10" | "2" | "16" | "8">("10");

  const results = useMemo(() => {
    const num = parseInt(input, parseInt(base));
    if (isNaN(num)) return null;
    return {
      decimal: num.toString(10),
      binary: num.toString(2),
      octal: num.toString(8),
      hexadecimal: num.toString(16).toUpperCase(),
    };
  }, [input, base]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const ResultRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`flex items-center justify-between rounded-xl p-3 ${highlight ? "bg-blue-50" : "bg-gray-50"}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold">{value}</span>
        <button className="copy-btn text-xs text-blue-500" onClick={() => handleCopy(value)}>{copied ? "✓" : "复制"}</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">输入数值</Label>
        <div className="flex gap-3">
          <Input
            className="flex-1 font-mono"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
            placeholder="输入数字..."
          />
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">输入进制</Label>
        <div className="flex gap-2">
          {[
            { id: "10" as const, label: "十进制" },
            { id: "2" as const, label: "二进制" },
            { id: "16" as const, label: "十六进制" },
            { id: "8" as const, label: "八进制" },
          ].map((b) => (
            <Button key={b.id} variant={base === b.id ? "gradient" : "secondary"} className="flex-1 text-xs" onClick={() => setBase(b.id)}>
              {b.label}
            </Button>
          ))}
        </div>
      </div>

      {results && (
        <div className="glass-card space-y-2">
          <Label className="mb-2 block">转换结果</Label>
          <ResultRow label="十进制 (DEC)" value={results.decimal} highlight={base === "10"} />
          <ResultRow label="二进制 (BIN)" value={results.binary} highlight={base === "2"} />
          <ResultRow label="八进制 (OCT)" value={results.octal} highlight={base === "8"} />
          <ResultRow label="十六进制 (HEX)" value={"0x" + results.hexadecimal} highlight={base === "16"} />
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 适用于计算机网络、嵌入式开发、颜色值计算等场景的进制转换。
      </div>
    </div>
  );
}
