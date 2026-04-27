"use client";

import { useState, useMemo, useCallback } from "react";

const presets = [
  { label: "复古", blur: 0, brightness: 90, contrast: 120, saturate: 80, hue: 0, sepia: 30 },
  { label: "冷色", blur: 0, brightness: 110, contrast: 110, saturate: 120, hue: 180, sepia: 0 },
  { label: "暖色", blur: 0, brightness: 105, contrast: 105, saturate: 140, hue: 30, sepia: 10 },
  { label: "黑白", blur: 0, brightness: 100, contrast: 110, saturate: 0, hue: 0, sepia: 0 },
  { label: "高对比", blur: 0, brightness: 100, contrast: 200, saturate: 100, hue: 0, sepia: 0 },
  { label: "柔焦", blur: 3, brightness: 110, contrast: 90, saturate: 120, hue: 0, sepia: 0 },
];

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-gray-600">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1" />
      <span className="w-12 text-right font-mono text-xs tabular-nums">{value}</span>
    </div>
  );
}

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
        <span className="field-label mb-4 block">预览效果</span>
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=200&fit=crop"
          alt="preview"
          className="rounded-xl mx-auto max-h-[200px] object-cover"
          style={{ filter: filterStr }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">预设</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {presets.map((p) => (
            <button key={p.label} className="btn btn-secondary text-xs" onClick={() => applyPreset(p)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-4 block">参数调节</span>
        <div className="flex flex-col gap-4">
          <Slider label="模糊" value={blur} min={0} max={20} onChange={setBlur} />
          <Slider label="亮度" value={brightness} min={0} max={300} onChange={setBrightness} />
          <Slider label="对比度" value={contrast} min={0} max={300} onChange={setContrast} />
          <Slider label="饱和度" value={saturate} min={0} max={300} onChange={setSaturate} />
          <Slider label="色相旋转" value={hue} min={0} max={360} onChange={setHue} />
          <Slider label="棕褐色" value={sepia} min={0} max={100} onChange={setSepia} />
        </div>
      </div>

      <div className="glass-card">
        <div className="mb-3 flex items-center justify-between">
          <span className="field-label">CSS 代码</span>
          <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>{copied ? "✓" : "复制"}</button>
        </div>
        <code className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm block">filter: {filterStr};</code>
      </div>
    </div>
  );
}
