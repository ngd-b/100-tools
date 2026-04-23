"use client";

import { useState } from "react";
import { parseColor, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, generateComplementaryColor } from "@/utils/color";

export function ColorTools() {
  const [color, setColor] = useState("#3b82f6");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const palette = generateComplementaryColor(color);
  const pHsl = hsl ?? { h: 0, s: 0, l: 50 };

  return (
    <div className="flex flex-col gap-5">
      {/* ---- 颜色输入 & 预览 ---- */}
      <div className="glass-card">
        <div className="flex items-center gap-3">
          <label className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-full w-full cursor-pointer"
            />
          </label>
          <input
            type="text"
            value={color.toUpperCase()}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#3b82f6 / rgb(59,130,246) / hsl(217,91%,60%)"
            className="input flex-1 font-mono text-sm uppercase tracking-wider"
          />
        </div>

        <div
          className="mt-3 h-16 w-full rounded-xl border border-gray-100 shadow-sm transition-colors duration-300"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* ---- 颜色值 ---- */}
      <div className="flex flex-col gap-2">
        {rgb && <ValueRow label="HEX" value={rgbToHex(rgb.r, rgb.g, rgb.b)} />}
        {rgb && <ValueRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />}
        {rgb && <ValueRow label="RGBA" value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`} />}
        {hsl && <ValueRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />}
        {hsl && <ValueRow label="HSLA" value={`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`} />}
      </div>

      {/* ---- 配色方案 ---- */}
      <div className="glass-card">
        <span className="field-label mb-2 block">配色方案</span>
        <div className="flex h-10 overflow-hidden rounded-lg">
          {palette.map((c, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard.writeText(c)}
              className="flex-1 transition-opacity hover:opacity-80 first:rounded-l-lg last:rounded-r-lg"
              style={{ backgroundColor: c }}
              title={`${c} — 点击复制`}
            />
          ))}
        </div>
      </div>

      {/* ---- 明度渐变 ---- */}
      <div className="glass-card">
        <span className="field-label mb-2 block">明度渐变</span>
        <div className="flex h-8 overflow-hidden rounded-lg">
          {[5, 15, 30, 50, 70, 85, 95].map((l, i) => (
            <div
              key={i}
              className="flex-1 first:rounded-l-lg last:rounded-r-lg"
              style={{ backgroundColor: `hsl(${pHsl.h}, ${pHsl.s}%, ${l}%)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Shared Components ---- */

function ValueRow({ label, value }: { label: string; value: string }) {
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
