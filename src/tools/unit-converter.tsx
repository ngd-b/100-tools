"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Unit = { name: string; key: string; toBase: (v: number) => number; fromBase: (v: number) => number };
type Category = { name: string; key: string; units: Unit[] };

const CATEGORIES: Category[] = [
  {
    name: "长度",
    key: "length",
    units: [
      { name: "米 (m)", key: "m", toBase: (v) => v, fromBase: (v) => v },
      { name: "千米 (km)", key: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "厘米 (cm)", key: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { name: "毫米 (mm)", key: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "英里 (mi)", key: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { name: "码 (yd)", key: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { name: "英尺 (ft)", key: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { name: "英寸 (in)", key: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ],
  },
  {
    name: "重量",
    key: "weight",
    units: [
      { name: "千克 (kg)", key: "kg", toBase: (v) => v, fromBase: (v) => v },
      { name: "克 (g)", key: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "毫克 (mg)", key: "mg", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { name: "吨 (t)", key: "t", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "磅 (lb)", key: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { name: "盎司 (oz)", key: "oz", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { name: "斤", key: "jin", toBase: (v) => v * 0.5, fromBase: (v) => v / 0.5 },
    ],
  },
  {
    name: "温度",
    key: "temp",
    units: [
      { name: "摄氏度 (°C)", key: "C", toBase: (v) => v, fromBase: (v) => v },
      { name: "华氏度 (°F)", key: "F", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { name: "开尔文 (K)", key: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    name: "面积",
    key: "area",
    units: [
      { name: "平方米 (m²)", key: "m2", toBase: (v) => v, fromBase: (v) => v },
      { name: "平方千米 (km²)", key: "km2", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { name: "公顷 (ha)", key: "ha", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      { name: "亩", key: "mu", toBase: (v) => v * 666.667, fromBase: (v) => v / 666.667 },
      { name: "平方英尺 (ft²)", key: "ft2", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { name: "英亩 (acre)", key: "acre", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    ],
  },
  {
    name: "体积",
    key: "volume",
    units: [
      { name: "升 (L)", key: "L", toBase: (v) => v, fromBase: (v) => v },
      { name: "毫升 (mL)", key: "mL", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "立方米 (m³)", key: "m3", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "加仑 (gal)", key: "gal", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { name: "夸脱 (qt)", key: "qt", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    ],
  },
  {
    name: "速度",
    key: "speed",
    units: [
      { name: "米/秒 (m/s)", key: "ms", toBase: (v) => v, fromBase: (v) => v },
      { name: "千米/时 (km/h)", key: "kmh", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { name: "英里/时 (mph)", key: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { name: "节 (kn)", key: "kn", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  {
    name: "时间",
    key: "time",
    units: [
      { name: "秒 (s)", key: "s", toBase: (v) => v, fromBase: (v) => v },
      { name: "毫秒 (ms)", key: "ms2", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "分钟 (min)", key: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { name: "小时 (h)", key: "h", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { name: "天 (d)", key: "d", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { name: "周", key: "week", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    ],
  },
];

function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-8 && n !== 0)) return n.toExponential(6);
  return parseFloat(n.toPrecision(10)).toString();
}

export function UnitConverter() {
  const [catIdx, setCatIdx] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [value, setValue] = useState("1");

  const cat = CATEGORIES[catIdx];

  const result = useMemo(() => {
    const n = parseFloat(value);
    if (isNaN(n)) return null;
    const fromUnit = cat.units[fromIdx];
    const toUnit = cat.units[toIdx];
    const base = fromUnit.toBase(n);
    return formatNumber(toUnit.fromBase(base));
  }, [value, cat, fromIdx, toIdx]);

  function handleCategoryChange(idx: number) {
    setCatIdx(idx);
    setFromIdx(0);
    setToIdx(1);
    setValue("1");
  }

  return (
    <div>
      {/* Category Selection */}
      <div className="glass-card mb-6">
        <Label>分类</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORIES.map((c, i) => (
            <Button key={c.key} variant={catIdx === i ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange(i)}>
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversion */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>从</Label>
            <Select value={cat.units[fromIdx].key} onValueChange={(v) => { const idx = cat.units.findIndex((u) => u.key === v); setFromIdx(idx); }}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cat.units.map((u, i) => <SelectItem key={u.key} value={u.key}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="mt-3" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div>
            <Label>到</Label>
            <Select value={cat.units[toIdx].key} onValueChange={(v) => { const idx = cat.units.findIndex((u) => u.key === v); setToIdx(idx); }}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cat.units.map((u) => <SelectItem key={u.key} value={u.key}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="mt-3 h-10 flex items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono font-semibold">
              {result !== null ? result : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* All conversions */}
      {value && !isNaN(parseFloat(value)) && (
        <div className="glass-card">
          <Label>全部换算</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {cat.units.map((u, i) => {
              const fromUnit = cat.units[fromIdx];
              const base = fromUnit.toBase(parseFloat(value));
              const val = u.fromBase(base);
              return i === fromIdx ? null : (
                <div key={u.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="text-gray-500">{u.name}</span>
                  <span className="font-mono font-semibold">{formatNumber(val)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
