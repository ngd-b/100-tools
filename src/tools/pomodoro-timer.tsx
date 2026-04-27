"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function playTone(freq: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, duration);
  } catch { /* ignore */ }
}

export function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isWork, setIsWork] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);

  const tickRef = useRef<number | null>(null);

  const totalMs = (isWork ? workMin : breakMin) * 60 * 1000;

  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      if (!isRunning || startedAt === null) return;
      setElapsed(pausedElapsed + (Date.now() - startedAt));
    }, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isRunning, startedAt, pausedElapsed]);

  // Check if phase finished
  useEffect(() => {
    if (elapsed >= totalMs && isRunning) {
      setIsRunning(false);
      setElapsed(0);
      setPausedElapsed(0);
      setStartedAt(null);

      playTone(600, 300);
      setTimeout(() => playTone(800, 300), 400);

      if (isWork) {
        setCycles((c) => c + 1);
      }
      setIsWork((w) => !w);
    }
  }, [elapsed, totalMs, isRunning, isWork]);

  const remaining = Math.max(0, totalMs - elapsed);
  const totalSec = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const progress = totalMs > 0 ? (elapsed / totalMs) * 100 : 0;

  function handleStart() {
    setIsRunning(true);
    setStartedAt(Date.now());
    setPausedElapsed(elapsed);
  }

  function handlePause() {
    setIsRunning(false);
    setStartedAt(null);
    setPausedElapsed(elapsed);
  }

  function handleReset() {
    setIsRunning(false);
    setElapsed(0);
    setPausedElapsed(0);
    setStartedAt(null);
    setIsWork(true);
  }

  return (
    <div>
      {/* Settings */}
      <div className="glass-card mb-6">
        <Label>设置（分钟）</Label>
        <div className="grid grid-cols-2 gap-6 mt-3">
          <div>
            <Label className="text-xs text-gray-400">工作时长</Label>
            <Input type="number" min={1} max={90} value={workMin} onChange={(e) => { setWorkMin(parseInt(e.target.value) || 25); handleReset(); }} className="mt-1 text-center font-mono text-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-400">休息时长</Label>
            <Input type="number" min={1} max={30} value={breakMin} onChange={(e) => { setBreakMin(parseInt(e.target.value) || 5); handleReset(); }} className="mt-1 text-center font-mono text-lg" />
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="glass-card mb-6 text-center">
        <Badge variant={isWork ? "destructive" : "default"} className="mb-4">
          {isWork ? "🍅 工作中" : "☕ 休息中"}
        </Badge>

        <div className="font-mono text-6xl font-bold tracking-wider mb-4">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isWork ? "bg-red-500" : "bg-green-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 text-xs text-gray-400">已完成 {cycles} 个番茄</div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <Button variant="gradient" className="flex-1" onClick={handleStart}>
            {elapsed === 0 ? "开始" : "继续"}
          </Button>
        ) : (
          <Button variant="secondary" className="flex-1" onClick={handlePause}>暂停</Button>
        )}
        <Button variant="outline" onClick={handleReset}>重置</Button>
      </div>
    </div>
  );
}
