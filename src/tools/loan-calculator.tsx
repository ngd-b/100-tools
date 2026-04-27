"use client";

import { useState, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoanCalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(3.85);
  const [months, setMonths] = useState(360);
  const [type, setType] = useState<"equal" | "interest">("equal");

  const result = useMemo(() => {
    const r = rate / 100 / 12;
    const n = months;
    const p = principal;

    if (type === "equal") {
      // 等额本息
      const monthly = r === 0 ? p / n : p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = monthly * n;
      const totalInterest = total - p;
      return {
        monthly: monthly.toFixed(2),
        total: total.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        ratio: ((totalInterest / total) * 100).toFixed(1),
      };
    } else {
      // 等额本金
      const monthlyPrincipal = p / n;
      const firstMonth = monthlyPrincipal + p * r;
      const lastMonth = monthlyPrincipal + (p - monthlyPrincipal * (n - 1)) * r;
      const totalInterest = ((p * r * (n + 1)) / 2 + p / 2).toFixed(2);
      const total = (p + parseFloat(totalInterest)).toFixed(2);
      return {
        firstMonth: firstMonth.toFixed(2),
        lastMonth: lastMonth.toFixed(2),
        total,
        totalInterest,
        ratio: ((parseFloat(totalInterest) / parseFloat(total)) * 100).toFixed(1),
      };
    }
  }, [principal, rate, months, type]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">还款方式</Label>
        <div className="flex gap-3">
          <Button variant={type === "equal" ? "gradient" : "secondary"} className="flex-1" onClick={() => setType("equal")}>
            等额本息
          </Button>
          <Button variant={type === "interest" ? "gradient" : "secondary"} className="flex-1" onClick={() => setType("interest")}>
            等额本金
          </Button>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">贷款金额（元）</Label>
        <div className="flex items-center gap-3">
          <Slider value={[principal]} onValueChange={(v) => setPrincipal(Array.isArray(v) ? v[0] : v as number)} min={10000} max={10000000} step={10000} className="flex-1" />
          <Input className="w-28 font-mono text-right" value={principal.toLocaleString()} onChange={(e) => { const n = parseInt(e.target.value.replace(/,/g, "")); if (!isNaN(n)) setPrincipal(n); }} />
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">年利率（%）</Label>
        <div className="flex items-center gap-3">
          <Slider value={[rate]} onValueChange={(v) => setRate(Array.isArray(v) ? v[0] : v as number)} min={0.5} max={10} step={0.05} className="flex-1" />
          <Input className="w-20 font-mono text-right" value={rate.toFixed(2)} onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setRate(n); }} />
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">贷款期限（月）</Label>
        <div className="flex items-center gap-3">
          <Slider value={[months]} onValueChange={(v) => setMonths(Array.isArray(v) ? v[0] : v as number)} min={12} max={360} step={12} className="flex-1" />
          <span className="w-16 text-right font-mono text-sm">{months}月 ({(months / 12).toFixed(0)}年)</span>
        </div>
      </div>

      <div className="glass-card">
        <Label className="mb-4 block">计算结果</Label>
        <div className="grid grid-cols-2 gap-3">
          {type === "equal" ? (
            <>
              <div className="flex flex-col items-center rounded-xl bg-blue-50 p-4">
                <span className="text-xl font-bold text-blue-600">¥{(result as any).monthly}</span>
                <span className="mt-1 text-xs text-gray-500">每月还款</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4">
                <span className="text-xl font-bold text-gray-900">¥{parseFloat((result as any).total).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</span>
                <span className="mt-1 text-xs text-gray-500">还款总额</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-orange-50 p-4">
                <span className="text-xl font-bold text-orange-600">¥{parseFloat((result as any).totalInterest).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</span>
                <span className="mt-1 text-xs text-gray-500">利息总额</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4">
                <span className="text-xl font-bold text-gray-900">{(result as any).ratio}%</span>
                <span className="mt-1 text-xs text-gray-500">利息占比</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center rounded-xl bg-blue-50 p-4">
                <span className="text-lg font-bold text-blue-600">¥{(result as any).firstMonth}</span>
                <span className="mt-1 text-xs text-gray-500">首月还款</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-blue-50 p-4">
                <span className="text-lg font-bold text-blue-600">¥{(result as any).lastMonth}</span>
                <span className="mt-1 text-xs text-gray-500">末月还款</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4">
                <span className="text-xl font-bold text-gray-900">¥{parseFloat((result as any).total).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</span>
                <span className="mt-1 text-xs text-gray-500">还款总额</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-orange-50 p-4">
                <span className="text-xl font-bold text-orange-600">{(result as any).ratio}%</span>
                <span className="mt-1 text-xs text-gray-500">利息占比</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 等额本息每月还款额固定，等额本金首月还款最多逐月递减。利率仅供参考，实际以银行为准。
      </div>
    </div>
  );
}
