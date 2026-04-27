"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export function CssShadowGenerator() {
  const [shadowType, setShadowType] = useState<"box" | "text">("box");
  const [x, setX] = useState(4);
  const [y, setY] = useState(4);
  const [blur, setBlur] = useState(12);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);

  const shadowValue = useMemo(() => {
    const c = `rgba(0, 0, 0, ${opacity / 100})`;
    const vals = `${x}px ${y}px ${blur}px ${spread}px ${c}`;
    return inset ? `inset ${vals}` : vals;
  }, [x, y, blur, spread, opacity, inset]);

  const previewStyle = useMemo(() => {
    if (shadowType === "text") return { textShadow: shadowValue };
    return { boxShadow: shadowValue };
  }, [shadowType, shadowValue]);

  const cssCode = useMemo(() => {
    return shadowType === "text"
      ? `text-shadow: ${shadowValue};`
      : `box-shadow: ${shadowValue};`;
  }, [shadowType, shadowValue]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [cssCode]);

  const presets = [
    { label: "柔和", x: 0, y: 2, blur: 8, spread: 0, opacity: 10 },
    { label: "卡片", x: 0, y: 4, blur: 16, spread: 0, opacity: 15 },
    { label: "深度", x: 0, y: 8, blur: 32, spread: 0, opacity: 25 },
    { label: "凸起", x: 0, y: 12, blur: 24, spread: -4, opacity: 12 },
    { label: "内凹", x: 0, y: 2, blur: 4, spread: 0, opacity: 20, inset: true },
    { label: "发光", x: 0, y: 0, blur: 20, spread: 4, opacity: 30 },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setX(p.x); setY(p.y); setBlur(p.blur); setSpread(p.spread); setOpacity(p.opacity);
    if (p.inset) setInset(true);
  };

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">类型</Label>
        <div className="flex gap-3">
          <Button
            variant={shadowType === "box" ? "gradient" : "secondary"}
            className="flex-1"
            onClick={() => setShadowType("box")}
          >
            box-shadow
          </Button>
          <Button
            variant={shadowType === "text" ? "gradient" : "secondary"}
            className="flex-1"
            onClick={() => setShadowType("text")}
          >
            text-shadow
          </Button>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-4 block">参数调节</Label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-gray-600">X</span>
            <Slider value={[x]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setX(val as number) }} min={-50} max={50} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums">{x}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-gray-600">Y</span>
            <Slider value={[y]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setY(val as number) }} min={-50} max={50} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums">{y}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-gray-600">模糊</span>
            <Slider value={[blur]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setBlur(val as number) }} min={0} max={100} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums">{blur}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-gray-600">扩展</span>
            <Slider value={[spread]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setSpread(val as number) }} min={-50} max={50} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums">{spread}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-gray-600">透明</span>
            <Slider value={[opacity]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setOpacity(val as number) }} min={0} max={100} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums">{opacity}%</span>
          </div>
          {shadowType === "box" && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Checkbox checked={inset} onCheckedChange={(v) => setInset(v as boolean)} />
              inset（内阴影）
            </label>
          )}
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-4 block">预设</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="secondary"
              className="text-xs"
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6 text-center" style={{ minHeight: "160px" }}>
        <Label className="mb-4 block">实时预览</Label>
        {shadowType === "text" ? (
          <span className="text-4xl font-bold text-gray-800" style={previewStyle}>
            Shadow Text
          </span>
        ) : (
          <div
            className="mx-auto h-24 w-32 rounded-2xl bg-white"
            style={{ maxWidth: "160px", ...previewStyle }}
          />
        )}
      </div>

      <div className="glass-card">
        <div className="mb-3 flex items-center justify-between">
          <Label>CSS 代码</Label>
          <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
            {copied ? "✓" : "复制"}
          </button>
        </div>
        <code className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm block">
          {cssCode}
        </code>
      </div>
    </div>
  );
}
