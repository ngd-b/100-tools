"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SvgPlaceholder() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState("#e5e7eb");
  const [textColor, setTextColor] = useState("#6b7280");
  const [text, setText] = useState("");
  const [radius, setRadius] = useState(8);

  const svgCode = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" rx="${radius}"/>
  ${text ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="20">${text}</text>` : `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="18">${width} × ${height}</text>`}
</svg>`;

  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgCode)}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [svgCode]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placeholder-${width}x${height}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [svgCode, width, height]);

  const previewWidth = Math.min(width, 400);

  return (
    <div>
      {/* Live Preview */}
      <div className="glass-card mb-6">
        <Label className="mb-3 block">实时预览</Label>
        <div
          className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl"
          style={{
            backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%)",
            backgroundSize: "16px 16px",
          }}
        >
          <div style={{ width: `${previewWidth}px`, maxWidth: "100%" }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <rect width="100%" height="100%" fill={bgColor} rx={radius} />
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill={textColor}
                fontFamily="sans-serif"
                fontSize={text ? 20 : 18}
              >
                {text || `${width} × ${height}`}
              </text>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div className="glass-card">
          <Label className="mb-3 block">宽度 (px)</Label>
          <div className="flex items-center gap-3">
            <Slider value={[width]} onValueChange={(v) => setWidth(Array.isArray(v) ? v[0] : v as number)} min={50} max={1920} step={10} className="flex-1" />
            <Input className="w-16 font-mono text-sm" value={width} onChange={(e) => { const n = parseInt(e.target.value); if (!isNaN(n)) setWidth(n); }} />
          </div>
        </div>
        <div className="glass-card">
          <Label className="mb-3 block">高度 (px)</Label>
          <div className="flex items-center gap-3">
            <Slider value={[height]} onValueChange={(v) => setHeight(Array.isArray(v) ? v[0] : v as number)} min={50} max={1080} step={10} className="flex-1" />
            <Input className="w-16 font-mono text-sm" value={height} onChange={(e) => { const n = parseInt(e.target.value); if (!isNaN(n)) setHeight(n); }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div className="glass-card">
          <Label className="mb-3 block">背景色</Label>
          <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full cursor-pointer" />
        </div>
        <div className="glass-card">
          <Label className="mb-3 block">文字颜色</Label>
          <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10 w-full cursor-pointer" />
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">自定义文字（留空则显示尺寸）</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="占位文字" />
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">圆角半径</Label>
        <div className="flex items-center gap-3">
          <Slider value={[radius]} onValueChange={(v) => setRadius(Array.isArray(v) ? v[0] : v as number)} min={0} max={50} step={1} className="flex-1" />
          <span className="w-12 text-right font-mono text-lg font-bold">{radius}</span>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Button variant="gradient" className="flex-1" onClick={handleCopy}>{copied ? "✓ 已复制" : "复制 SVG 代码"}</Button>
        <Button variant="secondary" onClick={handleDownload}>下载 SVG</Button>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 生成占位图片，适用于设计稿、开发测试、内容占位等场景。纯 SVG 格式，无限缩放不失真。
      </div>
    </div>
  );
}
