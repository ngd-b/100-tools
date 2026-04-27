"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function ContrastChecker() {
  const [fg, setFg] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState<"normal" | "large">("normal");

  const result = useMemo(() => {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;

    const fgLum = relativeLuminance(...fgRgb);
    const bgLum = relativeLuminance(...bgRgb);
    const ratio = contrastRatio(fgLum, bgLum);

    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3;
    const aaaNormal = ratio >= 7;
    const aaaLarge = ratio >= 4.5;

    return {
      ratio,
      aa: size === "normal" ? aaNormal : aaLarge,
      aaa: size === "normal" ? aaaNormal : aaaLarge,
    };
  }, [fg, bg, size]);

  const level = result ? (result.aaa ? "AAA" : result.aa ? "AA" : "Fail") : "—";
  const levelColor = level === "AAA" ? "text-green-600" : level === "AA" ? "text-yellow-600" : "text-red-500";

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">前景色</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)}
            className="h-12 w-12 cursor-pointer rounded-lg border-0 p-0" />
          <Input className="flex-1 font-mono text-sm" value={fg} onChange={(e) => setFg(e.target.value)} />
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">背景色</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
            className="h-12 w-12 cursor-pointer rounded-lg border-0 p-0" />
          <Input className="flex-1 font-mono text-sm" value={bg} onChange={(e) => setBg(e.target.value)} />
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">文字大小</Label>
        <div className="flex gap-3">
          <Button variant={size === "normal" ? "gradient" : "secondary"}
            className="flex-1"
            onClick={() => setSize("normal")}>普通文字 (≥14px)</Button>
          <Button variant={size === "large" ? "gradient" : "secondary"}
            className="flex-1"
            onClick={() => setSize("large")}>大字 (≥18px / 粗体≥14px)</Button>
        </div>
      </div>

      {result && (
        <div className="glass-card mb-6">
          <Label className="mb-4 block">检测结果</Label>
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold ${levelColor}`}>{level}</div>
            <p className="mt-2 text-sm text-gray-500">对比度: {result.ratio.toFixed(2)}:1</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`value-row ${result.aa ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}>
              <span className="text-sm">WCAG AA</span>
              <span className={`text-lg font-bold ${result.aa ? "text-green-600" : "text-red-500"}`}>
                {result.aa ? "通过" : "不通过"}
              </span>
            </div>
            <div className={`value-row ${result.aaa ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}>
              <span className="text-sm">WCAG AAA</span>
              <span className={`text-lg font-bold ${result.aaa ? "text-green-600" : "text-red-500"}`}>
                {result.aaa ? "通过" : "不通过"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card text-center" style={{ minHeight: "120px" }}>
        <Label className="mb-4 block">预览</Label>
        <div className="rounded-2xl p-6 text-lg font-medium" style={{ color: fg, backgroundColor: bg }}>
          The quick brown fox jumps over the lazy dog. 快速棕色狐狸跳过懒狗。
        </div>
      </div>
    </div>
  );
}
