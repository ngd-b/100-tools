"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function PercentageCalculator() {
  const [value, setValue] = useState("");
  const [percent, setPercent] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [increaseFrom, setIncreaseFrom] = useState("");
  const [increaseTo, setIncreaseTo] = useState("");

  const result1 = useMemo(() => {
    if (!value || !percent) return null;
    return (parseFloat(value) * parseFloat(percent) / 100).toFixed(4);
  }, [value, percent]);

  const result2 = useMemo(() => {
    if (!from || !to) return null;
    return ((parseFloat(to) / parseFloat(from)) * 100).toFixed(2);
  }, [from, to]);

  const result3 = useMemo(() => {
    if (!increaseFrom || !increaseTo) return null;
    const pct = ((parseFloat(increaseTo) - parseFloat(increaseFrom)) / Math.abs(parseFloat(increaseFrom))) * 100;
    return { value: pct.toFixed(2), direction: pct >= 0 ? "增加" : "减少" };
  }, [increaseFrom, increaseTo]);

  const CalcRow = ({ label, result }: { label: string; result: string | null | { value: string; direction: string } }) => (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-mono text-sm font-bold text-gray-900">
        {result ? (typeof result === "string" ? result : `${result.value}% (${result.direction})`) : "—"}
      </span>
    </div>
  );

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">X 的 Y% 是多少</Label>
        <div className="flex items-center gap-2">
          <Input className="w-24 font-mono text-sm" placeholder="数值" value={value} onChange={(e) => setValue(e.target.value)} />
          <span className="text-sm text-gray-400">的</span>
          <Input className="w-24 font-mono text-sm" placeholder="百分比" value={percent} onChange={(e) => setPercent(e.target.value)} />
          <span className="text-sm text-gray-400">%</span>
          <span className="text-sm font-bold text-blue-500 ml-auto">= {result1 ?? "—"}</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">X 是 Y 的百分之几</Label>
        <div className="flex items-center gap-2">
          <Input className="w-24 font-mono text-sm" placeholder="数值" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-sm text-gray-400">是</span>
          <Input className="w-24 font-mono text-sm" placeholder="基准值" value={to} onChange={(e) => setTo(e.target.value)} />
          <span className="text-sm text-gray-400">的</span>
          <span className="text-sm font-bold text-blue-500 ml-auto">{result2 ? `${result2}%` : "—"}</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">从 X 到 Y 变化了多少百分比</Label>
        <div className="flex items-center gap-2">
          <Input className="w-24 font-mono text-sm" placeholder="原值" value={increaseFrom} onChange={(e) => setIncreaseFrom(e.target.value)} />
          <span className="text-sm text-gray-400">→</span>
          <Input className="w-24 font-mono text-sm" placeholder="新值" value={increaseTo} onChange={(e) => setIncreaseTo(e.target.value)} />
          <span className="text-sm font-bold text-blue-500 ml-auto">
            {result3 ? `${result3.value}% (${result3.direction})` : "—"}
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 三种常用百分比计算：求百分比、占比分析、增长率/减少率。实时计算，即时显示结果。
      </div>
    </div>
  );
}
