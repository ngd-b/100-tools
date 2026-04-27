"use client";

import { useState, useCallback, useRef } from "react";
import { createMp3Encoder, createOggEncoder } from "@arseneyr/wasm-media-encoders";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OutputFormat = "wav" | "webm" | "ogg" | "mp3";

interface FileInfo {
  name: string;
  size: number;
  duration: number;
  sampleRate: number;
  channels: number;
}

const FORMAT_CONFIG: { value: OutputFormat; label: string; mime: string; ext: string }[] = [
  { value: "wav", label: "WAV", mime: "audio/wav", ext: "wav" },
  { value: "webm", label: "WebM", mime: "audio/webm", ext: "webm" },
  { value: "ogg", label: "OGG", mime: "audio/ogg", ext: "ogg" },
  { value: "mp3", label: "MP3", mime: "audio/mpeg", ext: "mp3" },
];

const SAMPLE_RATES = [
  { value: "auto", label: "自动（保持原样）" },
  { value: "44100", label: "44100 Hz" },
  { value: "48000", label: "48000 Hz" },
  { value: "22050", label: "22050 Hz" },
  { value: "16000", label: "16000 Hz" },
];

const BIT_DEPTHS = [
  { value: "16", label: "16-bit" },
  { value: "24", label: "24-bit" },
  { value: "32", label: "32-bit Float" },
];

const BIT_RATES = [
  { value: "128", label: "128 kbps" },
  { value: "192", label: "192 kbps" },
  { value: "256", label: "256 kbps" },
  { value: "320", label: "320 kbps" },
];

const CHANNEL_OPTIONS = [
  { value: "0", label: "保持原样" },
  { value: "1", label: "单声道" },
  { value: "2", label: "立体声" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function writeWavHeader(view: DataView, dataLen: number, sampleRate: number, channels: number, bitDepth: number) {
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;
  const totalLen = dataLen + 44 - 8;

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, totalLen, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // audio format (3=float, 1=PCM)
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLen, true);
}

function encodeWav(buffer: AudioBuffer, bitDepth: number): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = bitDepth / 8;
  const dataLen = length * numChannels * bytesPerSample;

  const ab = new ArrayBuffer(44 + dataLen);
  const view = new DataView(ab);
  writeWavHeader(view, dataLen, sampleRate, numChannels, bitDepth);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      if (bitDepth === 16) {
        view.setInt16(offset, Math.round(sample * 0x7fff), true);
      } else if (bitDepth === 24) {
        const val = Math.round(sample * 0x7fffff);
        view.setUint8(offset, val & 0xff);
        view.setUint8(offset + 1, (val >> 8) & 0xff);
        view.setUint8(offset + 2, (val >> 16) & 0xff);
      } else {
        view.setFloat32(offset, sample, true);
      }
      offset += bytesPerSample;
    }
  }

  return new Blob([ab], { type: "audio/wav" });
}

function resampleBuffer(buffer: AudioBuffer, newSampleRate: number): AudioBuffer {
  if (newSampleRate === buffer.sampleRate) return buffer;

  const ratio = buffer.sampleRate / newSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const newBuffer = new AudioContext({ sampleRate: newSampleRate }).createBuffer(
    buffer.numberOfChannels,
    newLength,
    newSampleRate
  );

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = newBuffer.getChannelData(ch);
    for (let i = 0; i < newLength; i++) {
      const srcIdx = Math.min(Math.floor(i * ratio), src.length - 1);
      dst[i] = src[srcIdx];
    }
  }

  return newBuffer;
}

function changeChannels(buffer: AudioBuffer, targetChannels: number): AudioBuffer {
  if (targetChannels === 0 || targetChannels === buffer.numberOfChannels) return buffer;

  const ctx = new AudioContext({ sampleRate: buffer.sampleRate });
  const newBuffer = ctx.createBuffer(targetChannels, buffer.length, buffer.sampleRate);

  if (targetChannels === 1) {
    // Mix all channels to mono
    const mono = new Float32Array(buffer.length);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < mono.length; i++) {
        mono[i] += data[i] / buffer.numberOfChannels;
      }
    }
    newBuffer.getChannelData(0).set(mono);
  } else if (targetChannels === 2) {
    // Duplicate mono to stereo or keep stereo
    if (buffer.numberOfChannels === 1) {
      const src = buffer.getChannelData(0);
      newBuffer.getChannelData(0).set(src);
      newBuffer.getChannelData(1).set(src);
    } else {
      newBuffer.getChannelData(0).set(buffer.getChannelData(0));
      newBuffer.getChannelData(1).set(buffer.getChannelData(1));
    }
  }

  ctx.close();
  return newBuffer;
}

const FRAME_SIZE = 4096;

async function encodeMp3(buffer: AudioBuffer, bitrate: number): Promise<Blob> {
  const encoder = await createMp3Encoder();
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;

  encoder.configure({ channels: channels === 1 ? 1 : 2, sampleRate, bitrate: bitrate as 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320 });

  const bytes: Uint8Array[] = [];
  let offset = 0;
  const length = buffer.length;

  while (offset < length) {
    const frameSize = Math.min(FRAME_SIZE, length - offset);
    const samples: Float32Array[] = [];
    for (let ch = 0; ch < channels; ch++) {
      const chData = buffer.getChannelData(ch);
      samples.push(chData.slice(offset, offset + frameSize));
    }
    bytes.push(encoder.encode(samples));
    offset += frameSize;
  }

  bytes.push(encoder.finalize());

  return new Blob([new Uint8Array(bytes.reduce((a, b) => a + b.length, 0))], { type: "audio/mpeg" });
}

async function encodeOgg(buffer: AudioBuffer, bitrate: number): Promise<Blob> {
  const encoder = await createOggEncoder();
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;

  // Map bitrate to vorbis quality (0-10)
  const quality = Math.min(10, Math.max(0, Math.round((bitrate - 64) / 38)));

  encoder.configure({ channels: channels === 1 ? 1 : 2, sampleRate, vbrQuality: quality });

  const bytes: Uint8Array[] = [];
  let offset = 0;
  const length = buffer.length;

  while (offset < length) {
    const frameSize = Math.min(FRAME_SIZE, length - offset);
    const samples: Float32Array[] = [];
    for (let ch = 0; ch < channels; ch++) {
      const chData = buffer.getChannelData(ch);
      samples.push(chData.slice(offset, offset + frameSize));
    }
    bytes.push(encoder.encode(samples));
    offset += frameSize;
  }

  bytes.push(encoder.finalize());

  return new Blob([new Uint8Array(bytes.reduce((a, b) => a + b.length, 0))], { type: "audio/ogg" });
}

async function encodeWebm(buffer: AudioBuffer, bitrate: number): Promise<Blob> {
  // WebM/Opus still uses MediaRecorder - no WASM encoder available
  const ctx = new AudioContext({ sampleRate: buffer.sampleRate });
  const dest = ctx.createMediaStreamDestination();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(dest);

  let mimeType = "audio/webm;codecs=opus";
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = "audio/webm";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      ctx.close();
      throw new Error("浏览器不支持 WebM/Opus 编码");
    }
  }

  const mr = new MediaRecorder(dest.stream, { mimeType, audioBitsPerSecond: bitrate * 1000 });
  const chunks: Blob[] = [];

  return new Promise((resolve) => {
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mr.onstop = () => {
      ctx.close();
      resolve(new Blob(chunks, { type: mr.mimeType }));
    };
    mr.start();
    source.start();
    source.onended = () => { setTimeout(() => mr.stop(), 100); };
  });
}

export function AudioConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [format, setFormat] = useState<OutputFormat>("wav");
  const [sampleRate, setSampleRate] = useState("auto");
  const [bitDepth, setBitDepth] = useState("16");
  const [bitRate, setBitRate] = useState("128");
  const [channels, setChannels] = useState("0");
  const [converting, setConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }

  const processFile = useCallback(async (f: File) => {
    setError("");
    setResultUrl("");
    setResultSize(0);
    setFile(f);

    try {
      const ctx = getAudioCtx();
      const arrayBuffer = await f.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);

      setOriginalUrl(URL.createObjectURL(f));
      setAudioBuffer(decoded);
      setFileInfo({
        name: f.name,
        size: f.size,
        duration: decoded.duration,
        sampleRate: decoded.sampleRate,
        channels: decoded.numberOfChannels,
      });
    } catch {
      setError("无法解码该音频文件，请尝试其他格式");
      setFile(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("audio/")) {
      processFile(f);
    } else {
      setError("请上传音频文件");
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleConvert = useCallback(async () => {
    if (!audioBuffer) return;
    setConverting(true);
    setError("");

    try {
      let buffer = audioBuffer;

      // Apply sample rate change
      const targetSampleRate = sampleRate === "auto" ? audioBuffer.sampleRate : parseInt(sampleRate);
      if (targetSampleRate !== audioBuffer.sampleRate) {
        buffer = resampleBuffer(buffer, targetSampleRate);
      }

      // Apply channel change
      const targetChannels = parseInt(channels);
      if (targetChannels !== 0) {
        buffer = changeChannels(buffer, targetChannels);
      }

      // Encode
      let blob: Blob | null = null;
      const br = parseInt(bitRate);

      if (format === "wav") {
        blob = encodeWav(buffer, parseInt(bitDepth));
      } else if (format === "mp3") {
        blob = await encodeMp3(buffer, br);
      } else if (format === "ogg") {
        blob = await encodeOgg(buffer, br);
      } else {
        blob = await encodeWebm(buffer, br);
      }

      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      prevUrlRef.current = url;
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err) {
      setError("转换失败，请重试");
    } finally {
      setConverting(false);
    }
  }, [audioBuffer, sampleRate, bitDepth, bitRate, channels, format]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !fileInfo) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${fileInfo.name.replace(/\.[^.]+$/, "")}_converted.${format}`;
    a.click();
  }, [resultUrl, fileInfo, format]);

  const handleReset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(null);
    setFileInfo(null);
    setAudioBuffer(null);
    setOriginalUrl("");
    setResultUrl("");
    setResultSize(0);
    setError("");
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
  }, [originalUrl]);

  return (
    <div>
      {/* Upload Zone */}
      {!file ? (
        <div className="glass-card mb-6">
          <div
            className="upload-zone"
            onDragOver={(e) => { e.preventDefault(); }}
            onDragLeave={() => {}}
            onDrop={handleDrop}
          >
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm2 1.473V10m-6 6v-2m2.25-5.25L12 3m0 0L7.5 8.75" />
            </svg>
            <p className="text-sm text-gray-400 mb-1">拖拽音频文件到此处，或</p>
            <Button variant="secondary" className="text-sm cursor-pointer">
              选择文件
              <input type="file" accept="audio/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={handleFileInput} />
            </Button>
            <p className="mt-3 text-xs text-gray-300">支持 MP3 / WAV / OGG / WebM / M4A / FLAC</p>
          </div>
        </div>
      ) : (
        <>
          {/* File Info */}
          {fileInfo && (
            <div className="glass-card mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                    ♪
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{fileInfo.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(fileInfo.size)}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>更换</Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-400">时长</span>
                  <p className="font-mono font-semibold">{formatTime(fileInfo.duration)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-400">采样率</span>
                  <p className="font-mono font-semibold">{fileInfo.sampleRate} Hz</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-400">声道</span>
                  <p className="font-mono font-semibold">{fileInfo.channels === 1 ? "单声道" : fileInfo.channels === 2 ? "立体声" : `${fileInfo.channels}ch`}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-400">格式</span>
                  <p className="font-mono font-semibold uppercase">{fileInfo.name.split(".").pop() || "未知"}</p>
                </div>
              </div>
              {originalUrl && (
                <div className="mt-3">
                  <Label className="text-xs text-gray-500 mb-2 block">试听原音频</Label>
                  <audio controls src={originalUrl} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Conversion Settings */}
          <div className="glass-card mb-6">
            <Label className="mb-4 block">转换配置</Label>

            {/* Output Format */}
            <div className="mb-4">
              <span className="text-xs text-gray-500 mb-2 block">输出格式</span>
              <div className="flex gap-2">
                {FORMAT_CONFIG.map((f) => (
                  <Button key={f.value} variant={format === f.value ? "gradient" : "secondary"} className="flex-1 text-sm"
                    onClick={() => setFormat(f.value)}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sample Rate & Channels */}
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-gray-500">采样率</Label>
                <Select value={sampleRate} onValueChange={(v) => { if (v) setSampleRate(v); }}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAMPLE_RATES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">声道数</Label>
                <Select value={channels} onValueChange={(v) => { if (v) setChannels(v); }}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Format-specific options */}
            {format === "wav" && (
              <div className="mb-4">
                <Label className="text-xs text-gray-500">位深度</Label>
                <Select value={bitDepth} onValueChange={(v) => { if (v) setBitDepth(v); }}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BIT_DEPTHS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(format === "webm" || format === "ogg" || format === "mp3") && (
              <div className="mb-4">
                <Label className="text-xs text-gray-500">比特率</Label>
                <Select value={bitRate} onValueChange={(v) => { if (v) setBitRate(v); }}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BIT_RATES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <Button variant="gradient" className="w-full mb-6" onClick={handleConvert} disabled={converting}>
            {converting ? "转换中..." : "开始转换"}
          </Button>

          {/* Error */}
          {error && <p className="mb-6 text-sm text-red-500 text-center">{error}</p>}

          {/* Result */}
          {resultUrl && fileInfo && (
            <div className="glass-card">
              <Label className="mb-3 block">转换结果</Label>
              <audio controls src={resultUrl} className="w-full mb-3" />
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-400">
                  {formatFileSize(fileInfo.size)} → {formatFileSize(resultSize)}
                  {resultSize > 0 && (
                    <span className={resultSize < fileInfo.size ? "text-green-600" : "text-orange-500"}>
                      {resultSize < fileInfo.size ? ` 减少 ${((1 - resultSize / fileInfo.size) * 100).toFixed(1)}%` : ` 增加 ${((resultSize / fileInfo.size - 1) * 100).toFixed(1)}%`}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="gradient" className="flex-1" onClick={handleDownload}>下载</Button>
                <Button variant="secondary" onClick={handleConvert}>再次转换</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
