"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Timer {
  id: string;
  mode: "countdown" | "stopwatch";
  hours: number;
  minutes: number;
  seconds: number;
  elapsed: number; // in ms
  isRunning: boolean;
  startedAt: number | null; // timestamp when started
  pausedElapsed: number; // ms accumulated before last pause
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 500);
  } catch { /* ignore */ }
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function formatRemaining(totalMs: number, elapsedMs: number): string {
  const remaining = Math.max(0, totalMs - elapsedMs);
  return formatTime(remaining);
}

export function TimerTool() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.startedAt === null) return t;
          const currentElapsed = t.pausedElapsed + (Date.now() - t.startedAt);
          return { ...t, elapsed: currentElapsed };
        })
      );
    }, 50);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const addCountdown = useCallback(() => {
    const id = generateId();
    setTimers((prev) => [...prev, { id, mode: "countdown", hours: 0, minutes: 5, seconds: 0, elapsed: 0, isRunning: false, startedAt: null, pausedElapsed: 0 }]);
  }, []);

  const addStopwatch = useCallback(() => {
    const id = generateId();
    setTimers((prev) => [...prev, { id, mode: "stopwatch", hours: 0, minutes: 0, seconds: 0, elapsed: 0, isRunning: false, startedAt: null, pausedElapsed: 0 }]);
  }, []);

  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.isRunning) {
          return { ...t, isRunning: false, pausedElapsed: t.elapsed, startedAt: null };
        } else {
          return { ...t, isRunning: true, startedAt: Date.now(), pausedElapsed: t.elapsed };
        }
      })
    );
  }, []);

  const resetTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, elapsed: 0, isRunning: false, startedAt: null, pausedElapsed: 0 } : t))
    );
  }, []);

  const setTime = useCallback((id: string, field: "hours" | "minutes" | "seconds", value: number) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: Math.max(0, value) } : t)));
  }, []);

  return (
    <div>
      {/* Add Timer Buttons */}
      <div className="glass-card mb-6">
        <Label>添加计时器</Label>
        <div className="flex gap-3 mt-3">
          <Button variant="gradient" className="flex-1" onClick={addCountdown}>+ 倒计时</Button>
          <Button variant="secondary" className="flex-1" onClick={addStopwatch}>+ 秒表</Button>
        </div>
      </div>

      {/* Timer List */}
      {timers.length === 0 && (
        <div className="glass-card text-center py-12 text-gray-400">
          <p>点击上方按钮添加计时器</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {timers.map((t) => {
          const targetMs = (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000;
          const isFinished = t.mode === "countdown" && t.elapsed >= targetMs && targetMs > 0;

          return (
            <div key={t.id} className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={t.mode === "countdown" ? "default" : "secondary"}>
                  {t.mode === "countdown" ? "倒计时" : "秒表"}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => removeTimer(t.id)} className="text-gray-400 h-6 w-6 p-0">
                  ×
                </Button>
              </div>

              {/* Countdown Setup */}
              {t.mode === "countdown" && !t.isRunning && t.elapsed === 0 && (
                <div className="flex gap-2 mb-4">
                  {(["hours", "minutes", "seconds"] as const).map((field) => (
                    <div key={field} className="flex-1">
                      <Label className="text-xs">{field === "hours" ? "时" : field === "minutes" ? "分" : "秒"}</Label>
                      <Input type="number" min={0} max={99} value={t[field]} onChange={(e) => setTime(t.id, field, parseInt(e.target.value) || 0)} className="mt-1 text-center font-mono text-lg" />
                    </div>
                  ))}
                </div>
              )}

              {/* Time Display */}
              <div className="text-center mb-4">
                <div className={`font-mono text-4xl font-bold tracking-wider ${isFinished ? "text-red-500 animate-pulse" : ""}`}>
                  {t.mode === "countdown" && targetMs > 0 ? formatRemaining(targetMs, t.elapsed) : formatTime(t.elapsed)}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button variant={t.isRunning ? "secondary" : "gradient"} size="sm" className="flex-1" onClick={() => toggleTimer(t.id)}>
                  {t.isRunning ? "暂停" : "开始"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => resetTimer(t.id)}>重置</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
