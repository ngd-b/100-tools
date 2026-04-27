"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function DateDiff() {
  const [date1, setDate1] = useState("2024-01-01");
  const [date2, setDate2] = useState("");

  const result = useMemo(() => {
    const d1 = new Date(date1);
    const d2 = date2 ? new Date(date2) : new Date();
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Years and months
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    if (months < 0 || (months === 0 && d2.getDate() < d1.getDate())) {
      years--;
      months += 12;
    }
    if (years < 0) {
      years += 1;
      months = Math.abs(months);
    }
    const remainingDays = Math.floor((d2.getTime() - new Date(d1.getFullYear() + years, d1.getMonth() + months, d1.getDate()).getTime()) / (1000 * 60 * 60 * 24));

    const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    return {
      diffDays, diffWeeks, diffHours, diffMinutes,
      years, months, remainingDays,
      day1: dayNames[d1.getDay()],
      day2: dayNames[d2.getDay()],
      earlier: d1 < d2 ? date1 : date2,
      later: d1 < d2 ? date2 : date1,
    };
  }, [date1, date2]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-card">
          <Label className="mb-3 block">起始日期</Label>
          <Input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="w-full" />
        </div>
        <div className="glass-card">
          <Label className="mb-3 block">结束日期（留空则为今天）</Label>
          <Input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="w-full" />
        </div>
      </div>

      {result && (
        <>
          <div className="glass-card mb-6 mt-6 text-center">
            <div className="text-5xl font-extrabold text-blue-600">{result.diffDays.toLocaleString()}</div>
            <div className="mt-1 text-sm text-gray-500">天</div>
            <div className="mt-2 text-sm text-gray-400">
              {result.earlier} ({result.day1}) → {result.later} ({result.day2})
            </div>
          </div>

          <div className="glass-card mb-6">
            <Label className="mb-4 block">精确时间差</Label>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">{result.years}</div>
                <div className="mt-1 text-xs text-gray-500">年</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">{result.months}</div>
                <div className="mt-1 text-xs text-gray-500">月</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">{result.remainingDays}</div>
                <div className="mt-1 text-xs text-gray-500">天</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <Label className="mb-4 block">其他单位</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "总周数", value: result.diffWeeks.toLocaleString() + " 周" },
                { label: "总小时", value: result.diffHours.toLocaleString() + " 小时" },
                { label: "总分钟", value: result.diffMinutes.toLocaleString() + " 分钟" },
                { label: "总秒数", value: (result.diffMinutes * 60).toLocaleString() + " 秒" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center rounded-xl bg-gray-50 p-4">
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  <span className="mt-1 text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 计算两个日期之间的天数、周数、年月日差等。结束日期留空则自动使用当天日期。
      </div>
    </div>
  );
}
