"use client";

import { useState, useRef, useCallback } from "react";
import { createMp3Encoder, createOggEncoder } from "@arseneyr/wasm-media-encoders";
import { Encoder } from "@evan/wasm/target/opus/deno.js";
import { Muxer, ArrayBufferTarget } from "webm-muxer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OutputFormat = "wav" | "webm" | "ogg" | "mp3";
type SourceMode = "record" | "upload";

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

function detectOutputFormat(filename: string): OutputFormat {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "mp3") return "mp3";
  if (ext === "ogg" || ext === "oga" || ext === "opus") return "ogg";
  if (ext === "webm") return "webm";
  return "wav";
}

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

// ---- Encoding utilities ----

function writeWavHeader(view: DataView, dataLen: number, sampleRate: number, channels: number, bitDepth: number) {
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;
  const totalLen = dataLen + 44 - 8;

  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, totalLen, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  view.setUint32(36, 0x64617461, false);
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
    const mono = new Float32Array(buffer.length);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < mono.length; i++) {
        mono[i] += data[i] / buffer.numberOfChannels;
      }
    }
    newBuffer.getChannelData(0).set(mono);
  } else if (targetChannels === 2) {
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

  encoder.configure({ channels: channels === 1 ? 1 : 2, sampleRate: buffer.sampleRate, bitrate: bitrate as 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320 });

  const chunks: Uint8Array[] = [];
  let offset = 0;
  const length = buffer.length;

  while (offset < length) {
    const frameSize = Math.min(FRAME_SIZE, length - offset);
    const samples: Float32Array[] = [];
    for (let ch = 0; ch < channels; ch++) {
      samples.push(buffer.getChannelData(ch).slice(offset, offset + frameSize));
    }
    chunks.push(new Uint8Array(encoder.encode(samples)));
    offset += frameSize;
  }

  chunks.push(encoder.finalize());
  const totalLen = chunks.reduce((a, b) => a + b.byteLength, 0);
  if (totalLen === 0) throw new Error("MP3 encoder produced no output");
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) { result.set(c, pos); pos += c.byteLength; }
  return new Blob([result.buffer], { type: "audio/mpeg" });
}

async function encodeOgg(buffer: AudioBuffer, bitrate: number): Promise<Blob> {
  const encoder = await createOggEncoder();
  const channels = buffer.numberOfChannels;
  const quality = Math.min(10, Math.max(0, Math.round((bitrate - 64) / 38)));

  encoder.configure({ channels: channels === 1 ? 1 : 2, sampleRate: buffer.sampleRate, vbrQuality: quality });

  const chunks: Uint8Array[] = [];
  let offset = 0;
  const length = buffer.length;

  while (offset < length) {
    const frameSize = Math.min(FRAME_SIZE, length - offset);
    const samples: Float32Array[] = [];
    for (let ch = 0; ch < channels; ch++) {
      samples.push(buffer.getChannelData(ch).slice(offset, offset + frameSize));
    }
    chunks.push(new Uint8Array(encoder.encode(samples)));
    offset += frameSize;
  }

  chunks.push(encoder.finalize());
  const totalLen = chunks.reduce((a, b) => a + b.byteLength, 0);
  if (totalLen === 0) throw new Error("OGG encoder produced no output");
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) { result.set(c, pos); pos += c.byteLength; }
  return new Blob([result.buffer], { type: "audio/ogg" });
}

function createOpusHead(channels: 1 | 2, sampleRate: number, preSkip: number): Uint8Array {
  const head = new Uint8Array(19);
  head.set([0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], 0);
  head[8] = 1;
  head[9] = channels;
  head[10] = preSkip & 0xff;
  head[11] = (preSkip >> 8) & 0xff;
  head[12] = sampleRate & 0xff;
  head[13] = (sampleRate >> 8) & 0xff;
  head[14] = (sampleRate >> 16) & 0xff;
  head[15] = (sampleRate >> 24) & 0xff;
  head[16] = 0;
  head[17] = 0;
  head[18] = 0;
  return head;
}

function floatToInt16Interleaved(buffer: AudioBuffer, start: number, len: number): Int16Array {
  const ch = buffer.numberOfChannels;
  const pcm = new Int16Array(len * ch);
  for (let c = 0; c < ch; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) {
      const sample = Math.max(-1, Math.min(1, data[start + i]));
      pcm[i * ch + c] = Math.round(sample * 32767);
    }
  }
  return pcm;
}

const OPUS_FRAME_SIZE = 960; // 20ms at 48000Hz
const OPUS_SAMPLE_RATE = 48000;

async function encodeWebm(buffer: AudioBuffer, bitrate: number): Promise<Blob> {
  let processed = buffer;

  if (processed.sampleRate !== OPUS_SAMPLE_RATE) {
    processed = resampleBuffer(processed, OPUS_SAMPLE_RATE);
  }
  if (processed.numberOfChannels > 2) {
    processed = changeChannels(processed, 2);
  }

  const channels = processed.numberOfChannels as 1 | 2;

  const encoder = new Encoder({ channels, sample_rate: OPUS_SAMPLE_RATE });
  encoder.bitrate = bitrate * 1000;

  const lookahead = encoder.lookahead;
  const opusHead = createOpusHead(channels, buffer.sampleRate, lookahead);

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    audio: { codec: "A_OPUS", numberOfChannels: channels, sampleRate: OPUS_SAMPLE_RATE },
  });

  const totalSamples = processed.length;
  let frameStart = 0;

  while (frameStart < totalSamples) {
    const remaining = totalSamples - frameStart;
    const actualLen = Math.min(OPUS_FRAME_SIZE, remaining);
    let pcm: Int16Array;

    if (actualLen < OPUS_FRAME_SIZE) {
      const padded = new Int16Array(OPUS_FRAME_SIZE * channels);
      padded.set(floatToInt16Interleaved(processed, frameStart, actualLen));
      pcm = padded;
    } else {
      pcm = floatToInt16Interleaved(processed, frameStart, OPUS_FRAME_SIZE);
    }

    const opusData = encoder.encode(pcm);
    const ts = frameStart / OPUS_SAMPLE_RATE * 1_000_000;

    if (frameStart === 0) {
      muxer.addAudioChunkRaw(new Uint8Array(opusData), "key", ts, {
        decoderConfig: {
          codec: "opus",
          numberOfChannels: channels,
          sampleRate: OPUS_SAMPLE_RATE,
          description: opusHead,
        } as AudioDecoderConfig,
      });
    } else {
      muxer.addAudioChunkRaw(new Uint8Array(opusData), "key", ts);
    }

    frameStart += OPUS_FRAME_SIZE;
  }

  muxer.finalize();
  return new Blob([target.buffer], { type: "audio/webm" });
}

async function encodeAudio(buffer: AudioBuffer, format: OutputFormat, bitDepth: number, bitRate: number): Promise<Blob> {
  if (format === "wav") return encodeWav(buffer, bitDepth);
  if (format === "mp3") return encodeMp3(buffer, bitRate);
  if (format === "ogg") return encodeOgg(buffer, bitRate);
  return encodeWebm(buffer, bitRate);
}

// ---- Main component ----

export function AudioTools() {
  const [mode, setMode] = useState<SourceMode>("record");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recordError, setRecordError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  // Shared audio buffer (from either recording or upload)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [sourceInfo, setSourceInfo] = useState<{ name: string; size: number; duration: number; sampleRate: number; channels: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [processing, setProcessing] = useState(false);

  // Upload state
  const [uploadError, setUploadError] = useState("");

  // Conversion settings
  const [format, setFormat] = useState<OutputFormat>("wav");
  const [sampleRate, setSampleRate] = useState("auto");
  const [bitDepth, setBitDepth] = useState("16");
  const [bitRate, setBitRate] = useState("128");
  const [channels, setChannels] = useState("0");

  // Conversion result
  const [converting, setConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [convertError, setConvertError] = useState("");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevResultUrlRef = useRef<string | null>(null);
  const prevPreviewUrlRef = useRef<string | null>(null);

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }

  function clearResult() {
    if (prevResultUrlRef.current) { URL.revokeObjectURL(prevResultUrlRef.current); prevResultUrlRef.current = null; }
    setResultUrl("");
    setResultSize(0);
  }

  function clearAll() {
    clearResult();
    if (prevPreviewUrlRef.current) { URL.revokeObjectURL(prevPreviewUrlRef.current); prevPreviewUrlRef.current = null; }
    setAudioBuffer(null);
    setSourceInfo(null);
    setPreviewUrl("");
    setConvertError("");
    // Clean up recording if still in progress
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  // ---- Recording ----

  const startRecording = useCallback(async () => {
    setRecordError("");
    clearAll();
    setFormat("wav");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // MediaRecorder for WebM preview blob
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      recordChunksRef.current = [];

      // Web Audio capture for raw PCM (reliable conversion source)
      const audioCtx = getAudioCtx();
      await audioCtx.resume();
      const pcmSampleRate = audioCtx.sampleRate;
      const pcmChunks: Float32Array[] = [];
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;
      source.connect(processor);
      processor.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      processor.onaudioprocess = (e) => {
        pcmChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };

      mr.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        // Disconnect PCM capture
        processor.disconnect();
        source.disconnect();
        gainNode.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(recordChunksRef.current, { type: "audio/webm" });
        if (blob.size < 1024 && pcmChunks.length === 0) {
          setRecordError("未录制到有效音频数据，请检查麦克风权限");
          return;
        }

        // Preview URL immediately
        const url = URL.createObjectURL(blob);
        if (prevPreviewUrlRef.current) URL.revokeObjectURL(prevPreviewUrlRef.current);
        prevPreviewUrlRef.current = url;
        setPreviewUrl(url);
        setSourceInfo({
          name: `录音_${Date.now()}`,
          size: blob.size,
          duration: 0,
          sampleRate: 0,
          channels: 0,
        });
        // Show processing state before heavy PCM buffer build
        setProcessing(true);

        // Defer PCM buffer build so the UI updates first
        requestAnimationFrame(() => {
          try {
            if (pcmChunks.length === 0) {
              setRecordError("未捕获到音频数据");
              setProcessing(false);
              return;
            }

            const totalLen = pcmChunks.reduce((s, c) => s + c.length, 0);
            const ctx = getAudioCtx();
            const buffer = ctx.createBuffer(1, totalLen, pcmSampleRate);
            const channelData = buffer.getChannelData(0);
            let offset = 0;
            for (const chunk of pcmChunks) {
              channelData.set(chunk, offset);
              offset += chunk.length;
            }

            setAudioBuffer(buffer);
            setSourceInfo({
              name: `录音_${Date.now()}`,
              size: totalLen * 4, // PCM Float32 byte size
              duration: totalLen / pcmSampleRate,
              sampleRate: pcmSampleRate,
              channels: 1,
            });
          } catch {
            setRecordError("音频数据处理失败");
          } finally {
            setProcessing(false);
          }
        });
      };

      mr.start(1000);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setRecordError("无法访问麦克风，请检查浏览器权限");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  // ---- Upload ----

  const processFile = useCallback(async (f: File) => {
    clearAll();
    setFormat(detectOutputFormat(f.name));
    setUploadError("");
    try {
      const ctx = getAudioCtx();
      const arrayBuffer = await f.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      const url = URL.createObjectURL(f);
      if (prevPreviewUrlRef.current) URL.revokeObjectURL(prevPreviewUrlRef.current);
      prevPreviewUrlRef.current = url;
      setPreviewUrl(url);
      setAudioBuffer(decoded);
      setSourceInfo({
        name: f.name,
        size: f.size,
        duration: decoded.duration,
        sampleRate: decoded.sampleRate,
        channels: decoded.numberOfChannels,
      });
    } catch {
      setUploadError("无法解码该音频文件，请尝试其他格式");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("audio/")) processFile(f);
    else setUploadError("请上传音频文件");
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  // ---- Conversion ----

  const handleConvert = useCallback(async () => {
    if (!audioBuffer) return;
    setConverting(true);
    setProcessing(true);
    setConvertError("");
    clearResult();

    try {
      let buffer = audioBuffer;

      const targetSampleRate = sampleRate === "auto" ? audioBuffer.sampleRate : parseInt(sampleRate);
      if (targetSampleRate !== audioBuffer.sampleRate) {
        buffer = resampleBuffer(buffer, targetSampleRate);
      }

      const targetChannels = parseInt(channels);
      if (targetChannels !== 0) {
        buffer = changeChannels(buffer, targetChannels);
      }

      const blob = await encodeAudio(buffer, format, parseInt(bitDepth), parseInt(bitRate));

      const url = URL.createObjectURL(blob);
      prevResultUrlRef.current = url;
      setResultUrl(url);
      setResultSize(blob.size);
    } catch {
      setConvertError("转换失败，请重试");
    } finally {
      setConverting(false);
      setProcessing(false);
    }
  }, [audioBuffer, format, sampleRate, bitDepth, bitRate, channels]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !sourceInfo) return;
    const baseName = sourceInfo.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${baseName}.${format}`;
    a.click();
  }, [resultUrl, sourceInfo, format]);

  // ---- Derive origin size for comparison ----
  const originalSize = sourceInfo?.size ?? 0;

  return (
    <div>
      {/* ---- Source Selector ---- */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("record"); clearAll(); setRecordError(""); setUploadError(""); }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            mode === "record"
              ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          🎙️ 录制
        </button>
        <button
          onClick={() => { setMode("upload"); clearAll(); setRecordError(""); setUploadError(""); }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            mode === "upload"
              ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          📁 上传文件
        </button>
      </div>

      {/* ---- Source Input ---- */}
      {!sourceInfo && (
        <>
          {mode === "record" ? (
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
          ) : (
            <div className="glass-card mb-6">
              <div
                className="upload-zone"
                onDragOver={(e) => { e.preventDefault(); }}
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
          )}

          {recordError && <p className="mb-6 text-sm text-red-500 text-center">{recordError}</p>}
          {uploadError && <p className="mb-6 text-sm text-red-500 text-center">{uploadError}</p>}
        </>
      )}

      {/* ---- Source Info + Preview (shown after recording or upload) ---- */}
      {sourceInfo && (
        <>
          <div className="glass-card mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white text-lg">
                  {mode === "record" ? "🎙️" : "♪"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{sourceInfo.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(sourceInfo.size)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearAll}>
                {mode === "record" ? "重新录制" : "更换"}
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-400">时长</span>
                <p className="font-mono font-semibold">{sourceInfo.duration > 0 ? formatTime(sourceInfo.duration) : "--"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-400">采样率</span>
                <p className="font-mono font-semibold">{sourceInfo.sampleRate > 0 ? `${sourceInfo.sampleRate} Hz` : "--"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-400">声道</span>
                <p className="font-mono font-semibold">{sourceInfo.channels === 1 ? "单声道" : sourceInfo.channels === 2 ? "立体声" : sourceInfo.channels > 0 ? `${sourceInfo.channels}ch` : "--"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-400">来源</span>
                <p className="font-mono font-semibold">{mode === "record" ? "录制" : sourceInfo.name.split(".").pop()?.toUpperCase() || "未知"}</p>
              </div>
            </div>
            {previewUrl && (
              <div className="mt-3">
                <Label className="text-xs text-gray-500 mb-2 block">预览</Label>
                <audio controls src={previewUrl} className="w-full" />
              </div>
            )}
          </div>

          {recordError && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4">
              <p className="text-sm text-amber-700 mb-3">{recordError}</p>
              {previewUrl && (
                <Button variant="secondary" size="sm" onClick={() => {
                  const a = document.createElement("a");
                  a.href = previewUrl;
                  a.download = `recording_${Date.now()}.webm`;
                  a.click();
                }}>下载 WebM 原文件</Button>
              )}
            </div>
          )}

          {/* ---- Processing indicator ---- */}
          {processing && !audioBuffer && (
            <div className="glass-card mb-6 text-center py-8">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <p className="text-sm text-gray-500">处理中...</p>
            </div>
          )}

          {/* ---- Conversion Settings ---- */}
          {audioBuffer && (
            <>
              <div className="glass-card mb-6">
                <Label className="mb-4 block">输出设置</Label>

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

              {/* ---- Convert Button ---- */}
              {converting && (
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  <p className="text-xs text-gray-400">正在编码，请稍候...</p>
                </div>
              )}
              <Button variant="gradient" className="w-full mb-6" onClick={handleConvert} disabled={converting}>
                {converting ? "转换中..." : "转换并导出"}
              </Button>

              {convertError && <p className="mb-6 text-sm text-red-500 text-center">{convertError}</p>}

              {/* ---- Result ---- */}
              {resultUrl && (
                <div className="glass-card">
                  <Label className="mb-3 block">导出结果</Label>
                  <audio controls src={resultUrl} className="w-full mb-3" />
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-400">
                      {formatFileSize(originalSize)} → {formatFileSize(resultSize)}
                      {resultSize > 0 && (
                        <span className={resultSize < originalSize ? "text-green-600" : "text-orange-500"}>
                          {resultSize < originalSize ? ` 减少 ${((1 - resultSize / originalSize) * 100).toFixed(1)}%` : ` 增加 ${((resultSize / originalSize - 1) * 100).toFixed(1)}%`}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400 uppercase">{format}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="gradient" className="flex-1" onClick={handleDownload}>下载</Button>
                    <Button variant="secondary" onClick={handleConvert}>再次转换</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
