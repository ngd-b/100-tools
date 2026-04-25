"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function AudioVisualizer() {
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<"waveform" | "bars" | "circle">("bars");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    if (mode === "bars") {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, W, H);

      const barWidth = (W / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * H * 0.9;
        const hue = (i / bufferLength) * 240;
        ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
        ctx.fillRect(x, H - barHeight, barWidth - 1, barHeight);
        x += barWidth;
        if (x > W) break;
      }
    } else if (mode === "waveform") {
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, W, H);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#3b82f6";
      ctx.beginPath();

      const sliceWidth = W / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
    } else {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.min(W, H) / 2 - 20;

      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const r = (dataArray[i] / 255) * maxR + 20;
        const x1 = cx + Math.cos(angle) * 20;
        const y1 = cy + Math.sin(angle) * 20;
        const x2 = cx + Math.cos(angle) * r;
        const y2 = cy + Math.sin(angle) * r;
        const hue = (i / bufferLength) * 360;

        ctx.strokeStyle = `hsl(${hue}, 70%, 55%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [mode]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsListening(true);
    } catch {
      alert("无法访问麦克风");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("点击开始监听麦克风", canvas.width / 2, canvas.height / 2);
    }
  }, []);

  useEffect(() => {
    if (isListening) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isListening, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("点击开始监听麦克风", canvas.width / 2, canvas.height / 2);
  }, []);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">可视化模式</span>
        <div className="flex gap-2">
          {(["bars", "waveform", "circle"] as const).map((m) => (
            <button key={m}
              className={`btn flex-1 ${mode === m ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setMode(m)}>
              {m === "bars" ? "频谱柱状" : m === "waveform" ? "波形" : "圆形"}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6 text-center">
        <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: "250px" }} />
        <button
          className={`btn mt-4 ${isListening ? "bg-red-500 text-white" : "btn-primary"}`}
          onClick={isListening ? stopListening : startListening}>
          {isListening ? "停止监听" : "开始监听"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 需要浏览器麦克风权限。频谱柱状显示频率分布，波形显示振幅变化，圆形为极坐标可视化。
      </div>
    </div>
  );
}
