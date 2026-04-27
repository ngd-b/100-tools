"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const presets = [
  { label: "复古", blur: 0, brightness: 90, contrast: 120, saturate: 80, hue: 0, sepia: 30 },
  { label: "冷色", blur: 0, brightness: 110, contrast: 110, saturate: 120, hue: 180, sepia: 0 },
  { label: "暖色", blur: 0, brightness: 105, contrast: 105, saturate: 140, hue: 30, sepia: 10 },
  { label: "黑白", blur: 0, brightness: 100, contrast: 110, saturate: 0, hue: 0, sepia: 0 },
  { label: "高对比", blur: 0, brightness: 100, contrast: 200, saturate: 100, hue: 0, sepia: 0 },
  { label: "柔焦", blur: 3, brightness: 110, contrast: 90, saturate: 120, hue: 0, sepia: 0 },
];

export function CssFilterGenerator() {
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [hue, setHue] = useState(0);
  const [sepia, setSepia] = useState(0);

  const filterStr = useMemo(() => {
    const parts: string[] = [];
    if (blur) parts.push(`blur(${blur}px)`);
    if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
    if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
    if (saturate !== 100) parts.push(`saturate(${saturate}%)`);
    if (hue) parts.push(`hue-rotate(${hue}deg)`);
    if (sepia) parts.push(`sepia(${sepia}%)`);
    return parts.length ? parts.join(" ") : "none";
  }, [blur, brightness, contrast, saturate, hue, sepia]);

  const applyPreset = (p: typeof presets[0]) => {
    setBlur(p.blur); setBrightness(p.brightness); setContrast(p.contrast);
    setSaturate(p.saturate); setHue(p.hue); setSepia(p.sepia);
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`filter: ${filterStr};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [filterStr]);

  return (
    <div>
      <div className="glass-card mb-6 text-center" style={{ minHeight: "140px" }}>
        <Label className="mb-4 block">预览效果</Label>
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=200&fit=crop"
          alt="preview"
          className="rounded-xl mx-auto max-h-[200px] object-cover"
          style={{ filter: filterStr }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">预设</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {presets.map((p) => (
            <Button key={p.label} variant="secondary" className="text-xs" onClick={() => applyPreset(p)}>{p.label}</Button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-4 block">参数调节</Label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-600">模糊</span>
            <Slider value={[blur]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setBlur(val as number) }} min={0} max={20} className="flex-1" />
            <span className="w-12 text-right font-mono text-xs tabular-nums">{blur}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-600">亮度</span>
            <Slider value={[brightness]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setBrightness(val as number) }} min={0} max={300} className="flex-1" />
            <span className="w-12 text-right font-mono text-xs tabular-nums">{brightness}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-600">对比度</span>
            <Slider value={[contrast]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setContrast(val as number) }} min={0} max={300} className="flex-1" />
            <span className="w-12 text-right font-mono text-xs tabular-nums">{contrast}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-600">饱和度</span>
            <Slider value={[saturate]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setSaturate(val as number) }} min={0} max={300} className="flex-1" />
            <span className="w-12 text-right font-mono text-xs tabular-nums">{saturate}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-600">色相旋转</span>
            <Slider value={[hue]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setHue(val as number) }} min={0} max={360} className="flex-1" />
            <span className="w-12 text-right font-mono text-xs tabular-nums">{hue}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-600">棕褐色</span>
            <Slider value={[sepia]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setSepia(val as number) }} min={0} max={100} className="flex-1" />
            <span className="w-12 text-right font-mono text-xs tabular-nums">{sepia}</span>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="mb-3 flex items-center justify-between">
          <Label>CSS 代码</Label>
          <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>{copied ? "✓" : "复制"}</button>
        </div>
        <code className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm block">filter: {filterStr};</code>
      </div>
    </div>
  );
}
