"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const noiseTypes = [
  { label: "白噪音", type: "white" },
  { label: "粉红噪音", type: "pink" },
  { label: "棕噪音", type: "brown" },
  { label: "风扇", type: "fan" },
  { label: "雨声", type: "rain" },
  { label: "海浪", type: "waves" },
];

export function WhiteNoiseGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentType, setCurrentType] = useState("white");
  const [volume, setVolume] = useState(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch {} sourceRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    gainRef.current = null;
    setIsPlaying(false);
  }, []);

  const play = useCallback(async () => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0;

      for (let i = 0; i < length; i++) {
        let sample = Math.random() * 2 - 1;

        switch (currentType) {
          case "pink":
            lastOut = (lastOut + (0.02 * sample)) / 1.02;
            sample = lastOut * 3.5;
            break;
          case "brown":
            lastOut = (lastOut + (0.02 * sample)) / 2;
            sample = lastOut * 5;
            break;
          case "fan":
            lastOut = (lastOut + (0.02 * sample)) / 1.02;
            sample = lastOut * 3.5;
            sample = Math.sin(i * 0.001) * sample * 0.5 + sample * 0.5;
            break;
          case "rain":
            sample = Math.random() > 0.7 ? sample : sample * 0.3;
            lastOut = (lastOut + (0.02 * sample)) / 1.02;
            sample = lastOut * 3.5;
            break;
          case "waves":
            const wave = Math.sin(i / sampleRate * Math.PI * 0.1) * 0.5 + 0.5;
            sample *= wave;
            lastOut = (lastOut + (0.02 * sample)) / 1.02;
            sample = lastOut * 3.5;
            break;
        }
        data[i] = sample;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
  }, [currentType, volume]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setCurrentType(type);
    if (isPlaying) { stop(); setTimeout(() => play(), 100); }
  }, [isPlaying, stop, play]);

  return (
    <div>
      <div className="glass-card mb-6 text-center">
        <Label className="mb-4 block">播放控制</Label>
        <Button
          variant={isPlaying ? "destructive" : "gradient"}
          className="text-lg px-12 py-4"
          onClick={isPlaying ? stop : play}>
          {isPlaying ? "停止" : "播放"}
        </Button>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">音量</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm">🔈</span>
          <Slider min={0} max={1} step={0.01} value={[volume]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; handleVolumeChange(val as number) }} className="flex-1" />
          <span className="text-sm">🔊</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">声音类型</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {noiseTypes.map((n) => (
            <Button
              key={n.type}
              variant={currentType === n.type ? "gradient" : "secondary"}
              className="flex-1"
              onClick={() => handleTypeChange(n.type)}>
              {n.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 使用 Web Audio API 实时生成噪音，无需加载音频文件。适合专注/助眠/白噪音场景。
      </div>
    </div>
  );
}
