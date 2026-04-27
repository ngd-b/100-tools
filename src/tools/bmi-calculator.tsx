"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { label: "偏瘦", min: 0, max: 18.5, color: "bg-blue-400", range: "< 18.5" },
  { label: "正常", min: 18.5, max: 24.9, color: "bg-green-500", range: "18.5 - 24.9" },
  { label: "偏胖", min: 25, max: 29.9, color: "bg-yellow-500", range: "25.0 - 29.9" },
  { label: "肥胖", min: 30, max: 50, color: "bg-red-500", range: "≥ 30.0" },
];

export function BmiCalculator() {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");

  const bmi = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return null;
    return w / (h * h);
  }, [height, weight]);

  const category = useMemo(() => {
    if (bmi === null) return null;
    return CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? CATEGORIES[3];
  }, [bmi]);

  const percent = useMemo(() => {
    if (bmi === null) return 0;
    return Math.min(Math.max(((bmi - 15) / 35) * 100, 0), 100);
  }, [bmi]);

  return (
    <div>
      <div className="glass-card mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>身高 (cm)</Label>
            <Input type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value)} className="mt-3" />
          </div>
          <div>
            <Label>体重 (kg)</Label>
            <Input type="number" min={1} value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-3" />
          </div>
        </div>
      </div>

      {bmi !== null && category && (
        <>
          {/* Result */}
          <div className="glass-card mb-6 text-center">
            <div className="text-5xl font-bold font-mono mb-1">{bmi.toFixed(1)}</div>
            <div className="text-sm text-gray-400">BMI</div>
            <div className={`mt-3 inline-block px-4 py-1 rounded-full text-sm font-semibold text-white ${category.color}`}>
              {category.label}
            </div>
          </div>

          {/* BMI Scale */}
          <div className="glass-card">
            <Label>BMI 刻度</Label>
            <div className="mt-4 relative">
              <div className="h-4 w-full rounded-full overflow-hidden flex">
                <div className="bg-blue-400" style={{ width: `${((18.5 - 15) / 35) * 100}%` }} />
                <div className="bg-green-500" style={{ width: `${((24.9 - 18.5) / 35) * 100}%` }} />
                <div className="bg-yellow-500" style={{ width: `${((29.9 - 25) / 35) * 100}%` }} />
                <div className="bg-red-500 flex-1" />
              </div>
              {/* Pointer */}
              <div className="absolute top-0 transition-all duration-300" style={{ left: `${percent}%` }}>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-800 mx-auto -translate-x-1/2" />
              </div>
            </div>
            <div className="mt-8 flex justify-between text-xs text-gray-400">
              {CATEGORIES.map((c) => (
                <div key={c.label} className="text-center">
                  <div className={`inline-block w-3 h-3 rounded-full ${c.color} mb-1`} />
                  <div>{c.label}</div>
                  <div className="text-gray-300 mt-0.5">{c.range}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs leading-relaxed text-gray-500">
        💡 BMI（身体质量指数）= 体重(kg) / 身高²(m²)，仅供参考，不能替代专业医疗建议。
      </div>
    </div>
  );
}
