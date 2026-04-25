"use client";

import { useState, useCallback, useRef } from "react";

export function AudioConverter() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [format, setFormat] = useState<"webm" | "wav" | "mp4">("webm");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    setError("");
    setAudioUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = format === "webm" ? "audio/webm" : format === "mp4" ? "audio/mp4" : "";

      let mr: MediaRecorder;
      try {
        mr = new MediaRecorder(stream, { mimeType });
      } catch {
        mr = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const ext = mr.mimeType.includes("mp4") ? "m4a" : mr.mimeType.includes("webm") ? "webm" : "webm";
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
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
  }, [format]);

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
    a.download = `recording_${Date.now()}.${format}`;
    a.click();
  }, [audioUrl, format]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">输出格式</span>
        <div className="flex gap-2">
          {(["webm", "wav", "mp4"] as const).map((f) => (
            <button key={f}
              className={`btn flex-1 ${format === f ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFormat(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6 text-center">
        <span className="field-label mb-6 block">录音</span>
        <div className="flex items-center justify-center mb-6">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-100"}`}>
            {isRecording ? (
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
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
          <button className="btn btn-primary w-40" onClick={startRecording}>开始录音</button>
        ) : (
          <button className="btn btn-primary w-40 bg-red-500" onClick={stopRecording}>停止</button>
        )}
      </div>

      {error && <p className="mb-6 text-sm text-red-500 text-center">{error}</p>}

      {audioUrl && (
        <div className="glass-card">
          <span className="field-label mb-3 block">录音回放</span>
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-3 mt-3">
            <button className="btn btn-primary flex-1" onClick={handleDownload}>下载 ({format})</button>
            <button className="btn btn-secondary" onClick={() => { setAudioUrl(""); setDuration(0); }}>重新录制</button>
          </div>
        </div>
      )}
    </div>
  );
}
