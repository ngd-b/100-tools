"use client";

import { useState, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function CronGenerator() {
  const [preset, setPreset] = useState<"minute" | "hourly" | "daily" | "weekly" | "monthly" | "yearly">("daily");
  const [minute, setMinute] = useState(0);
  const [hour, setHour] = useState(3);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const cronExpr = useMemo(() => {
    switch (preset) {
      case "minute": return "* * * * *";
      case "hourly": return "0 * * * *";
      case "daily": return `${minute} ${hour} * * *`;
      case "weekly": return `${minute} ${hour} * * ${dayOfWeek}`;
      case "monthly": return `${minute} ${hour} ${dayOfMonth} * *`;
      case "yearly": return `${minute} ${hour} ${dayOfMonth} 1 *`;
      default: return "* * * * *";
    }
  }, [preset, minute, hour, dayOfWeek, dayOfMonth]);

  const description = useMemo(() => {
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    switch (preset) {
      case "minute": return "每分钟执行一次";
      case "hourly": return "每小时整点执行";
      case "daily": return `每天 ${hour}:${String(minute).padStart(2, "0")} 执行`;
      case "weekly": return `每周${weekDays[dayOfWeek]} ${hour}:${String(minute).padStart(2, "0")} 执行`;
      case "monthly": return `每月 ${dayOfMonth} 日 ${hour}:${String(minute).padStart(2, "0")} 执行`;
      case "yearly": return `每年 ${dayOfMonth} 月 1 日 ${hour}:${String(minute).padStart(2, "0")} 执行`;
      default: return "";
    }
  }, [preset, minute, hour, dayOfWeek, dayOfMonth]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [cronExpr]);

  const presets = [
    { id: "minute" as const, label: "每分钟" },
    { id: "hourly" as const, label: "每小时" },
    { id: "daily" as const, label: "每天" },
    { id: "weekly" as const, label: "每周" },
    { id: "monthly" as const, label: "每月" },
    { id: "yearly" as const, label: "每年" },
  ];

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">预设模板</Label>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => (
            <Button
              key={p.id}
              variant={preset === p.id ? "gradient" : "secondary"}
              className="text-xs"
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {preset !== "minute" && preset !== "hourly" && (
        <>
          <div className="glass-card mb-6">
            <Label className="mb-3 block">分钟</Label>
            <div className="flex items-center gap-3">
              <Slider value={[minute]} onValueChange={(v) => setMinute(Array.isArray(v) ? v[0] : v as number)} min={0} max={59} step={1} className="flex-1" />
              <span className="w-12 text-right font-mono text-lg font-bold">{minute}</span>
            </div>
          </div>

          <div className="glass-card mb-6">
            <Label className="mb-3 block">小时</Label>
            <div className="flex items-center gap-3">
              <Slider value={[hour]} onValueChange={(v) => setHour(Array.isArray(v) ? v[0] : v as number)} min={0} max={23} step={1} className="flex-1" />
              <span className="w-12 text-right font-mono text-lg font-bold">{hour}</span>
            </div>
          </div>

          {preset === "weekly" && (
            <div className="glass-card mb-6">
              <Label className="mb-3 block">星期</Label>
              <div className="flex gap-2 flex-wrap">
                {weekDays.map((d, i) => (
                  <Button
                    key={i}
                    variant={dayOfWeek === i ? "gradient" : "secondary"}
                    className="text-xs"
                    onClick={() => setDayOfWeek(i)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(preset === "monthly" || preset === "yearly") && (
            <div className="glass-card mb-6">
              <Label className="mb-3 block">日期</Label>
              <div className="flex items-center gap-3">
                <Slider value={[dayOfMonth]} onValueChange={(v) => setDayOfMonth(Array.isArray(v) ? v[0] : v as number)} min={1} max={28} step={1} className="flex-1" />
                <span className="w-12 text-right font-mono text-lg font-bold">{dayOfMonth}</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="glass-card mb-6">
        <div className="mb-3 flex items-center justify-between">
          <Label>Cron 表达式</Label>
          <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
            {copied ? "✓" : "复制"}
          </button>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 font-mono text-center text-xl font-bold text-gray-900">
          {cronExpr}
        </div>
        <p className="mt-3 text-center text-sm text-gray-500">{description}</p>
        <div className="mt-3 flex justify-center gap-1 text-xs text-gray-400">
          <span>分</span><span className="mx-1">·</span>
          <span>时</span><span className="mx-1">·</span>
          <span>日</span><span className="mx-1">·</span>
          <span>月</span><span className="mx-1">·</span>
          <span>周</span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 Cron 表达式用于定时任务调度，格式为：分 时 日 月 周。适用于 Linux crontab、GitHub Actions 等场景。
      </div>
    </div>
  );
}
