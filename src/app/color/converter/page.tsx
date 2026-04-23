"use client";

import { useState } from "react";
import { parseColor, hexToRgb, rgbToHex, rgbToHsl } from "@/utils/color";

export default function ColorConverterPage() {
  const [input, setInput] = useState("#3b82f6");
  const rgb = parseColor(input);

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
        <h1 className="page-title">颜色转换</h1>
        <p className="page-desc">在 HEX、RGB、HSL 之间自由转换</p>
      </div>

      {/* Input */}
      <div className="glass-card mb-6">
        <span className="field-label">输入颜色值</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#3b82f6 或 rgb(59,130,246) 或 hsl(217,91%,60%)"
          className="input font-mono"
        />
      </div>

      {rgb ? (
        <>
          {/* Preview */}
          <div
            className="mb-6 h-24 w-full rounded-2xl border border-gray-100 shadow-sm transition-colors duration-300"
            style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
          />

          {/* Results */}
          <div className="fade-in flex flex-col gap-3">
            <ResultRow label="HEX" value={rgbToHex(rgb.r, rgb.g, rgb.b)} />
            <ResultRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
            <ResultRow label="RGBA" value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`} />
            {(() => {
              const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
              return (
                <>
                  <ResultRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
                  <ResultRow label="HSLA" value={`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`} />
                </>
              );
            })()}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-500">
          无法识别的颜色值，请检查输入
        </div>
      )}
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
