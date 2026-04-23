"use client";

import { useState } from "react";
import { parseColor, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, generateComplementaryColor } from "@/utils/color";

export function ColorTools() {
  const [pickerColor, setPickerColor] = useState("#3b82f6");
  const [converterInput, setConverterInput] = useState("#f59e0b");
  const [paletteColor, setPaletteColor] = useState("#8b5cf6");

  const rgb = hexToRgb(pickerColor);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const parsedRgb = parseColor(converterInput);

  const palette = generateComplementaryColor(paletteColor);
  const pHsl = hexToHslLocal(paletteColor);

  return (
    <div>
      {/* ---- 拾取 ---- */}
      <Section title="颜色拾取">
        <div className="flex items-center gap-4">
          <label className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <input
              type="color"
              value={pickerColor}
              onChange={(e) => setPickerColor(e.target.value)}
              className="h-full w-full cursor-pointer"
            />
          </label>
          <div className="min-w-0 flex-1">
            <span className="field-label">HEX 值</span>
            <input
              type="text"
              value={pickerColor.toUpperCase()}
              onChange={(e) => setPickerColor(e.target.value)}
              className="input font-mono text-lg uppercase tracking-wider"
            />
          </div>
        </div>

        <div
          className="mt-4 h-24 w-full rounded-2xl border border-gray-100 shadow-sm transition-colors duration-300"
          style={{ backgroundColor: pickerColor }}
        />

        <div className="mt-4 flex flex-col gap-3">
          <ColorValueRow label="HEX" value={pickerColor.toUpperCase()} />
          {rgb && <ColorValueRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />}
          {rgb && <ColorValueRow label="RGBA" value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`} />}
          {hsl && <ColorValueRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />}
          {hsl && <ColorValueRow label="HSLA" value={`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`} />}
        </div>
      </Section>

      {/* ---- 转换 ---- */}
      <Section title="格式转换">
        <input
          type="text"
          value={converterInput}
          onChange={(e) => setConverterInput(e.target.value)}
          placeholder="#3b82f6 或 rgb(59,130,246) 或 hsl(217,91%,60%)"
          className="input font-mono"
        />

        {parsedRgb ? (
          <>
            <div
              className="mt-4 h-20 w-full rounded-2xl border border-gray-100 shadow-sm transition-colors duration-300"
              style={{ backgroundColor: `rgb(${parsedRgb.r}, ${parsedRgb.g}, ${parsedRgb.b})` }}
            />
            <div className="mt-4 flex flex-col gap-3">
              <ResultRow label="HEX" value={rgbToHex(parsedRgb.r, parsedRgb.g, parsedRgb.b)} />
              <ResultRow label="RGB" value={`rgb(${parsedRgb.r}, ${parsedRgb.g}, ${parsedRgb.b})`} />
              <ResultRow label="RGBA" value={`rgba(${parsedRgb.r}, ${parsedRgb.g}, ${parsedRgb.b}, 1)`} />
              {(() => {
                const hsl2 = rgbToHsl(parsedRgb.r, parsedRgb.g, parsedRgb.b);
                return (
                  <>
                    <ResultRow label="HSL" value={`hsl(${hsl2.h}, ${hsl2.s}%, ${hsl2.l}%)`} />
                    <ResultRow label="HSLA" value={`hsla(${hsl2.h}, ${hsl2.s}%, ${hsl2.l}%, 1)`} />
                  </>
                );
              })()}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-500">
            无法识别的颜色值，请检查输入
          </div>
        )}
      </Section>

      {/* ---- 调色板 ---- */}
      <Section title="调色板">
        <div className="flex items-center gap-4">
          <label className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <input
              type="color"
              value={paletteColor}
              onChange={(e) => setPaletteColor(e.target.value)}
              className="h-full w-full cursor-pointer"
            />
          </label>
          <div className="min-w-0 flex-1">
            <span className="field-label">主色</span>
            <input
              type="text"
              value={paletteColor.toUpperCase()}
              onChange={(e) => setPaletteColor(e.target.value)}
              className="input font-mono uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="mt-4">
          <span className="field-label mb-3 block">配色方案</span>
          <div className="flex h-14 overflow-hidden rounded-xl">
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

        <div className="mt-6">
          <span className="field-label mb-3 block">明度渐变</span>
          <div className="flex h-10 overflow-hidden rounded-xl">
            {[5, 15, 30, 50, 70, 85, 95].map((l, i) => (
              <div
                key={i}
                className="flex-1 first:rounded-l-xl last:rounded-r-xl"
                style={{ backgroundColor: `hsl(${pHsl.h}, ${pHsl.s}%, ${l}%)` }}
              />
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ---- Shared Components ---- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card mb-6 last:mb-0">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-300">
        {title}
      </h3>
      {children}
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

function ResultRow({ label, value }: { label: string; value: string }) {
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

function hexToHslLocal(hex: string) {
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
