"use client";

import { useState, useMemo, useCallback } from "react";

const presetGradients = [
  { label: "日落", colors: ["#f97316", "#ef4444", "#a855f7"], angle: 135 },
  { label: "海洋", colors: ["#0ea5e9", "#3b82f6", "#8b5cf6"], angle: 135 },
  { label: "森林", colors: ["#10b981", "#14b8a6", "#06b6d4"], angle: 90 },
  { label: "火焰", colors: ["#fbbf24", "#f97316", "#dc2626"], angle: 180 },
  { label: "紫霞", colors: ["#a855f7", "#ec4899", "#f43f5e"], angle: 135 },
  { label: "极光", colors: ["#34d399", "#3b82f6", "#a855f7"], angle: 45 },
];

export function GradientGenerator() {
  const [colors, setColors] = useState(["#3b82f6", "#8b5cf6"]);
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");

  const cssValue = useMemo(() => {
    const stops = colors.join(", ");
    if (type === "radial") return `radial-gradient(circle, ${stops})`;
    return `linear-gradient(${angle}deg, ${stops})`;
  }, [colors, angle, type]);

  const previewStyle: React.CSSProperties = { background: cssValue };

  const addColor = () => {
    if (colors.length < 6) setColors([...colors, "#ffffff"]);
  };

  const removeColor = (i: number) => {
    if (colors.length > 2) setColors(colors.filter((_, idx) => idx !== i));
  };

  const updateColor = (i: number, v: string) => {
    const next = [...colors];
    next[i] = v;
    setColors(next);
  };

  const applyPreset = (p: typeof presetGradients[0]) => {
    setColors([...p.colors]);
    setAngle(p.angle);
    setType("linear");
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`background: ${cssValue};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [cssValue]);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">类型</span>
        <div className="flex gap-3">
          <button className={`btn flex-1 ${type === "linear" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setType("linear")}>线性渐变</button>
          <button className={`btn flex-1 ${type === "radial" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setType("radial")}>径向渐变</button>
        </div>
      </div>

      {type === "linear" && (
        <div className="glass-card mb-6">
          <span className="field-label mb-3 block">角度</span>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1" />
            <span className="w-12 text-right font-mono text-sm">{angle}°</span>
          </div>
        </div>
      )}

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">颜色节点</span>
        <div className="flex flex-col gap-3">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="color" value={c} onChange={(e) => updateColor(i, e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0" />
              <input className="input flex-1 font-mono text-sm" value={c}
                onChange={(e) => updateColor(i, e.target.value)} />
              {colors.length > 2 && (
                <button className="text-xs text-red-400 hover:text-red-500" onClick={() => removeColor(i)}>移除</button>
              )}
            </div>
          ))}
        </div>
        {colors.length < 6 && (
          <button className="btn btn-secondary mt-3 w-full text-sm" onClick={addColor}>+ 添加颜色</button>
        )}
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">预设</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {presetGradients.map((p) => (
            <button key={p.label} className="btn btn-secondary text-xs" onClick={() => applyPreset(p)}
              style={{ background: `linear-gradient(135deg, ${p.colors.join(", ")})`, color: "#fff" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6 text-center" style={{ minHeight: "140px" }}>
        <span className="field-label mb-4 block">实时预览</span>
        <div className="mx-auto h-24 w-full rounded-2xl" style={{ maxWidth: "400px", ...previewStyle }} />
      </div>

      <div className="glass-card">
        <div className="mb-3 flex items-center justify-between">
          <span className="field-label">CSS 代码</span>
          <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>{copied ? "✓" : "复制"}</button>
        </div>
        <code className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm block">background: {cssValue};</code>
      </div>
    </div>
  );
}
