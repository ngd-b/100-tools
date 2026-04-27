"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const TIMEZONES = [
  { city: "北京", flag: "🇨🇳", timezone: "Asia/Shanghai" },
  { city: "东京", flag: "🇯🇵", timezone: "Asia/Tokyo" },
  { city: "首尔", flag: "🇰🇷", timezone: "Asia/Seoul" },
  { city: "新加坡", flag: "🇸🇬", timezone: "Asia/Singapore" },
  { city: "悉尼", flag: "🇦🇺", timezone: "Australia/Sydney" },
  { city: "伦敦", flag: "🇬🇧", timezone: "Europe/London" },
  { city: "巴黎", flag: "🇫🇷", timezone: "Europe/Paris" },
  { city: "莫斯科", flag: "🇷🇺", timezone: "Europe/Moscow" },
  { city: "纽约", flag: "🇺🇸", timezone: "America/New_York" },
  { city: "洛杉矶", flag: "🇺🇸", timezone: "America/Los_Angeles" },
  { city: "芝加哥", flag: "🇺🇸", timezone: "America/Chicago" },
  { city: "迪拜", flag: "🇦🇪", timezone: "Asia/Dubai" },
  { city: "孟买", flag: "🇮🇳", timezone: "Asia/Kolkata" },
  { city: "曼谷", flag: "🇹🇭", timezone: "Asia/Bangkok" },
];

function getTime(timezone: string) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("zh-CN", { timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("zh-CN", { timeZone: timezone, weekday: "short", month: "short", day: "numeric" });
  return { timeStr, dateStr };
}

export function WorldClock() {
  const [selected, setSelected] = useState<string[]>(["Asia/Shanghai", "America/New_York", "Europe/London", "Asia/Tokyo"]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const addClock = useCallback((tz: string) => {
    setSelected((prev) => prev.includes(tz) ? prev : [...prev, tz]);
  }, []);

  const removeClock = useCallback((tz: string) => {
    setSelected((prev) => prev.filter((t) => t !== tz));
  }, []);

  const available = TIMEZONES.filter((tz) => !selected.includes(tz.timezone));

  return (
    <div>
      {/* Add Clock */}
      {available.length > 0 && (
        <div className="glass-card mb-6">
          <Label>添加城市</Label>
          <div className="flex gap-2 mt-3">
            <Select onValueChange={(v) => {
              if (typeof v === "string") addClock(v);
            }}>
              <SelectTrigger><SelectValue placeholder="选择城市..." /></SelectTrigger>
              <SelectContent>
                {available.map((tz) => (
                  <SelectItem key={tz.timezone} value={tz.timezone}>{tz.flag} {tz.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Clocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {selected.map((tz) => {
          const info = TIMEZONES.find((t) => t.timezone === tz);
          const { timeStr, dateStr } = getTime(tz);
          const isLocal = tz === Intl.DateTimeFormat().resolvedOptions().timeZone;

          return (
            <div key={tz} className="glass-card relative">
              <button
                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 text-xs"
                onClick={() => removeClock(tz)}
              >
                ×
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{info?.flag}</span>
                <div>
                  <div className="text-sm font-semibold">{info?.city}</div>
                  {isLocal && <Badge variant="secondary" className="text-xs px-1 py-0 h-auto">本地</Badge>}
                </div>
              </div>
              <div className="font-mono text-2xl font-bold">{timeStr}</div>
              <div className="text-xs text-gray-400 mt-1">{dateStr}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
