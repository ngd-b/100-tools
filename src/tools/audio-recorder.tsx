"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    setError("");
    setAudioUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError("无法访问麦克风，请检查浏览器权限");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const handleDownload = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
  }, [audioUrl]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="glass-card mb-6 text-center">
        <Label className="mb-6 block">录音</Label>

        <div className="flex items-center justify-center mb-6">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-100"}`}>
            {isRecording ? (
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V20h2v-2.08A7 7 0 0019 11h-2z" />
              </svg>
            )}
          </div>
        </div>

        <p className={`font-mono text-3xl font-bold mb-4 ${isRecording ? "text-red-500" : "text-gray-700"}`}>
          {formatTime(duration)}
        </p>

        {!isRecording ? (
          <Button variant="gradient" className="w-40" onClick={startRecording}>开始录音</Button>
        ) : (
          <Button variant="gradient" className="w-40" onClick={stopRecording}>停止录音</Button>
        )}
      </div>

      {error && <p className="mb-6 text-sm text-red-500 text-center">{error}</p>}

      {audioUrl && (
        <div className="glass-card mb-6">
          <Label className="mb-3 block">录音回放</Label>
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-3 mt-3">
            <Button variant="gradient" className="flex-1" onClick={handleDownload}>下载录音</Button>
            <Button variant="secondary" onClick={() => { setAudioUrl(""); setDuration(0); }}>
              重新录制
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 录音导出为 WebM 格式，浏览器原生支持。请使用 Chrome/Edge/Firefox 以获得最佳兼容性。
      </div>
    </div>
  );
}
