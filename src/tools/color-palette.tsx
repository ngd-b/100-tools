"use client";

import { useState } from "react";
import { generateComplementaryColor } from "@/utils/color";

export function ColorPaletteTool() {
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const palette = generateComplementaryColor(baseColor);
  const hsl = hexToHsl(baseColor);

  return (
    <div>
      {/* Color Input */}
      <div className="glass-card mb-6">
        <div className="flex items-center gap-4">
          <label className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="h-full w-full cursor-pointer"
            />
          </label>
          <div className="min-w-0 flex-1">
            <span className="field-label">主色</span>
            <input
              type="text"
              value={baseColor.toUpperCase()}
              onChange={(e) => setBaseColor(e.target.value)}
              className="input font-mono uppercase tracking-wider"
            />
          </div>
        </div>
      </div>

      {/* Complementary Palette */}
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">配色方案</span>
        <div className="flex h-16 overflow-hidden rounded-xl">
          {palette.map((c, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard.writeText(c)}
              className="flex-1 transition-opacity hover:opacity-80 first:rounded-l-xl last:rounded-r-xl"
              style={{ backgroundColor: c }}
              title={`${c} — 点击复制`}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          {palette.map((c, i) => (
            <span key={i} className="flex-1 text-center font-mono text-xs text-gray-400">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Lightness Gradient */}
      <div className="glass-card">
        <span className="field-label mb-3 block">明度渐变</span>
        <div className="flex h-12 overflow-hidden rounded-xl">
          {[5, 15, 30, 50, 70, 85, 95].map((l, i) => (
            <div
              key={i}
              className="flex-1 first:rounded-l-xl last:rounded-r-xl"
              style={{ backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${l}%)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
