"use client";

import { useState } from "react";
import { hexToRgb, rgbToHsl } from "@/utils/color";

export default function ColorPickerPage() {
  const [color, setColor] = useState("#3b82f6");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Header */}
      <div className="page-header">
        <a href="/" className="back-link">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </a>
        <h1 className="page-title">颜色拾取</h1>
        <p className="page-desc">拾取颜色值，支持 HEX、RGB、HSL 格式</p>
      </div>

      {/* Color Input */}
      <div className="glass-card mb-6">
        <div className="flex items-center gap-4">
          <label className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-full w-full cursor-pointer"
            />
          </label>
          <div className="min-w-0 flex-1">
            <span className="field-label">HEX 值</span>
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => setColor(e.target.value)}
              className="input font-mono text-lg uppercase tracking-wider"
            />
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div
        className="mb-6 h-36 w-full rounded-2xl border border-gray-100 shadow-sm transition-colors duration-300"
        style={{ backgroundColor: color }}
      />

      {/* Color Values */}
      <div className="fade-in flex flex-col gap-3">
        <ColorValueRow label="HEX" value={color.toUpperCase()} />
        {rgb && (
          <>
            <ColorValueRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
            <ColorValueRow label="RGBA" value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`} />
          </>
        )}
        {hsl && (
          <>
            <ColorValueRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
            <ColorValueRow label="HSLA" value={`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`} />
          </>
        )}
      </div>
    </div>
  );
}

function ColorValueRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="value-row">
      <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </span>
      <span className="font-mono text-sm text-gray-700">{value}</span>
      <button onClick={handleCopy} className="copy-btn">
        {copied ? "✓ 已复制" : "复制"}
      </button>
    </div>
  );
}
