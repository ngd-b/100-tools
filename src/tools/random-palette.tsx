"use client";

import { useState, useCallback } from "react";

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(baseHue: number, count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const h = (baseHue + i * 30) % 360;
    const s = 60 + Math.random() * 30;
    const l = 45 + Math.random() * 25;
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}

const palettes = [
  { label: "春", hue: 120 },
  { label: "夏", hue: 200 },
  { label: "秋", hue: 30 },
  { label: "冬", hue: 210 },
  { label: "日落", hue: 15 },
  { label: "海洋", hue: 195 },
];

export function RandomPalette() {
  const [colors, setColors] = useState(() => generatePalette(Math.random() * 360, 6));
  const [count, setCount] = useState(6);

  const handleGenerate = useCallback(() => {
    setColors(generatePalette(Math.random() * 360, count));
  }, [count]);

  const applyTheme = (hue: number) => {
    setColors(generatePalette(hue, count));
  };

  return (
    <div>
      <div className="glass-card mb-6 text-center">
        <span className="field-label mb-4 block">生成调色板</span>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {colors.map((c, i) => (
            <button
              key={i}
              className="h-20 rounded-xl transition-transform hover:scale-105 cursor-pointer flex flex-col items-center justify-end pb-2"
              style={{ backgroundColor: c }}
              onClick={() => navigator.clipboard.writeText(c)}
            >
              <span className="font-mono text-xs bg-white/70 rounded px-1">{c}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleGenerate}>🎲 随机生成</button>
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">主题预设</span>
        <div className="flex flex-wrap gap-2">
          {palettes.map((p) => {
            const previewColors = generatePalette(p.hue, 5);
            return (
              <button key={p.label}
                className="btn btn-secondary text-sm"
                onClick={() => applyTheme(p.hue)}
                style={{
                  background: `linear-gradient(90deg, ${previewColors[0]}, ${previewColors[2]}, ${previewColors[4]})`,
                  color: "#fff",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">颜色数量</span>
        <div className="flex gap-2">
          {[3, 4, 5, 6, 8].map((n) => (
            <button key={n}
              className={`btn flex-1 text-sm ${count === n ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { setCount(n); setColors(generatePalette(Math.random() * 360, n)); }}>
              {n} 色
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">CSS 变量</span>
        <code className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-xs block whitespace-pre-wrap">
          {colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}
        </code>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 点击任意颜色即可复制 HEX 值。CSS 变量格式可直接粘贴到 :root 中使用。
      </div>
    </div>
  );
}
