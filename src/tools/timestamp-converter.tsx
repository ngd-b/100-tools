"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

function pad(n: number, d = 2) { return String(n).padStart(d, "0"); }

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function TimestampConverter() {
  const [now, setNow] = useState(Date.now());
  const [inputTs, setInputTs] = useState(Math.floor(now / 1000).toString());
  const [inputDate, setInputDate] = useState("");
  const [convertedTs, setConvertedTs] = useState<string | null>(null);
  const [convertedDate, setConvertedDate] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentInfo = useMemo(() => {
    const current = new Date(now);
    return {
      ms: now.toString(),
      s: Math.floor(now / 1000).toString(),
      date: formatDate(current),
      iso: current.toISOString(),
    };
  }, [now]);

  const handleTsToDate = useCallback(() => {
    setError("");
    setConvertedDate(null);
    const raw = inputTs.trim();
    if (!raw) { setError("请输入时间戳"); return; }

    let ts = Number(raw);
    if (isNaN(ts)) { setError("无效的数字"); return; }
    if (ts < 1e12) ts *= 1000;

    const d = new Date(ts);
    if (isNaN(d.getTime())) { setError("时间戳超出有效范围"); return; }

    setConvertedDate(formatDate(d));
  }, [inputTs]);

  const handleDateToTs = useCallback(() => {
    setError("");
    setConvertedTs(null);
    if (!inputDate) { setError("请选择日期时间"); return; }

    const d = new Date(inputDate);
    if (isNaN(d.getTime())) { setError("无效的日期格式"); return; }

    setConvertedTs(d.getTime().toString());
  }, [inputDate]);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">当前时间</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="value-row">
            <span className="text-xs text-gray-500">秒级</span>
            <span className="font-mono text-sm font-semibold">{currentInfo.s}</span>
          </div>
          <div className="value-row">
            <span className="text-xs text-gray-500">毫秒</span>
            <span className="font-mono text-sm font-semibold">{currentInfo.ms}</span>
          </div>
          <div className="value-row">
            <span className="text-xs text-gray-500">本地</span>
            <span className="font-mono text-sm">{currentInfo.date}</span>
          </div>
          <div className="value-row">
            <span className="text-xs text-gray-500">UTC</span>
            <span className="font-mono text-sm">{currentInfo.iso}</span>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">时间戳 → 日期</span>
        <div className="flex gap-3">
          <input
            className="input flex-1 font-mono text-sm"
            placeholder="输入时间戳（秒或毫秒）"
            value={inputTs}
            onChange={(e) => setInputTs(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleTsToDate}>转换</button>
        </div>
        {convertedDate && (
          <div className="value-row mt-3">
            <span className="text-xs text-gray-500">结果</span>
            <span className="font-mono text-sm">{convertedDate}</span>
          </div>
        )}
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">日期 → 时间戳</span>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            type="datetime-local"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleDateToTs}>转换</button>
        </div>
        {convertedTs && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="value-row">
              <span className="text-xs text-gray-500">秒级</span>
              <span className="font-mono text-sm">{Math.floor(Number(convertedTs) / 1000)}</span>
            </div>
            <div className="value-row">
              <span className="text-xs text-gray-500">毫秒</span>
              <span className="font-mono text-sm">{convertedTs}</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 顶部时钟每秒自动更新。支持秒级和毫秒级时间戳自动识别。
      </div>
    </div>
  );
}
