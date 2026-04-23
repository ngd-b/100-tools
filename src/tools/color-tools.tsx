"use client";

import { useState } from "react";
import { parseColor, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, generateComplementaryColor, generateHarmony } from "@/utils/color";

export function ColorTools() {
  const [color, setColor] = useState("#3b82f6");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const palette = generateComplementaryColor(color);
  const pHsl = hsl ?? { h: 0, s: 0, l: 50 };

  // Color harmonies
  const complementary = rgb ? generateHarmony(color, "complementary") : [];
  const analogous = rgb ? generateHarmony(color, "analogous") : [];
  const triadic = rgb ? generateHarmony(color, "triadic") : [];
  const split = rgb ? generateHarmony(color, "split") : [];

  // Saturation steps
  const satSteps = [10, 25, 40, 55, 70, 85, 100];

  return (
    <div className="flex flex-col gap-6">
      {/* ===== Row 1: Picker + Large Preview ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.2fr]">
        {/* Picker column */}
        <div className="glass-card">
          <span className="field-label mb-3 block">选择颜色</span>
          <div className="flex items-center gap-3">
            <label className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-inner">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-full w-full"
              />
            </label>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
                className="input font-mono text-sm font-semibold uppercase tracking-widest"
              />
            </div>
          </div>
        </div>

        {/* Large preview */}
        <div
          className="flex items-end justify-end overflow-hidden rounded-2xl p-4 shadow-inner transition-colors duration-500"
          style={{ backgroundColor: color }}
        >
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-300"
            style={{
              color: isLight(color) ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
              background: isLight(color) ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)",
            }}
          >
            {color.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ===== Row 2: Value Cards (2-col grid) ===== */}
      {rgb && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SwatchCard
            label="HEX"
            value={rgbToHex(rgb.r, rgb.g, rgb.b)}
            preview={rgbToHex(rgb.r, rgb.g, rgb.b)}
          />
          <SwatchCard label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          <SwatchCard label="RGBA" value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`} />
          {hsl && <SwatchCard label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />}
          {hsl && <SwatchCard label="HSLA" value={`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`} />}
          {rgb && (
            <SwatchCard
              label="CMYK"
              value={rgbToCmyk(rgb.r, rgb.g, rgb.b)}
            />
          )}
        </div>
      )}

      {/* ===== Row 3: Palette Strip ===== */}
      <div className="glass-card">
        <span className="field-label mb-3 block">推荐配色</span>
        <div className="flex h-14 gap-1.5 overflow-hidden rounded-xl">
          {palette.map((c, i) => (
            <SwatchButton key={i} color={c} />
          ))}
        </div>
      </div>

      {/* ===== Row 4: Color Harmonies ===== */}
      <HarmonySection label="互补色" colors={complementary} />
      <HarmonySection label="邻近色" colors={analogous} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HarmonySection label="三角色" colors={triadic} />
        <HarmonySection label="分裂互补" colors={split} />
      </div>

      {/* ===== Row 5: Lightness + Saturation ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-card">
          <span className="field-label mb-3 block">明度</span>
          <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg">
            {[3, 10, 20, 35, 50, 65, 80, 90, 97].map((l, i) => (
              <div
                key={i}
                className="flex-1 first:rounded-l-lg last:rounded-r-lg"
                style={{ backgroundColor: `hsl(${pHsl.h}, ${pHsl.s}%, ${l}%)` }}
                title={`${l}%`}
              />
            ))}
          </div>
        </div>
        <div className="glass-card">
          <span className="field-label mb-3 block">饱和度</span>
          <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg">
            {satSteps.map((s, i) => (
              <div
                key={i}
                className="flex-1 first:rounded-l-lg last:rounded-r-lg"
                style={{ backgroundColor: `hsl(${pHsl.h}, ${s}%, ${pHsl.l}%)` }}
                title={`${s}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Utility ---- */

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 160;
}

function rgbToCmyk(r: number, g: number, b: number): string {
  if (r === 0 && g === 0 && b === 0) return "cmyk(0, 0, 0, 100)";
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);
  const C = Math.round(((c - k) / (1 - k)) * 100);
  const M = Math.round(((m - k) / (1 - k)) * 100);
  const Y = Math.round(((y - k) / (1 - k)) * 100);
  const K = Math.round(k * 100);
  return `cmyk(${C}, ${M}, ${Y}, ${K})`;
}

/* ---- Components ---- */

function SwatchCard({ label, value, preview }: { label: string; value: string; preview?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="glass-card flex items-center gap-3 !p-4">
      {preview && (
        <div
          className="h-9 w-9 shrink-0 rounded-lg border border-gray-100 shadow-sm"
          style={{ backgroundColor: preview }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          {label}
        </div>
        <div className="truncate font-mono text-xs font-medium text-gray-700">
          {value}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-50"
      >
        {copied ? "✓" : "复制"}
      </button>
    </div>
  );
}

function SwatchButton({ color }: { color: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      onClick={handleCopy}
      className="group relative flex-1 overflow-hidden rounded-lg transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
      title={`${color} — 点击复制`}
    >
      <span
        className="absolute inset-x-0 bottom-1 mx-auto truncate text-[9px] font-medium opacity-0 transition-opacity group-hover:opacity-70"
        style={{ color: isLight(color) ? "#000" : "#fff" }}
      >
        {color}
      </span>
      {copied && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
          ✓
        </span>
      )}
    </button>
  );
}

function HarmonySection({ label, colors }: { label: string; colors: string[] }) {
  if (!colors.length) return null;

  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="field-label">{label}</span>
      </div>
      <div className="flex h-12 gap-1.5 overflow-hidden rounded-lg">
        {colors.map((c, i) => (
          <SwatchButton key={i} color={c} />
        ))}
      </div>
    </div>
  );
}
