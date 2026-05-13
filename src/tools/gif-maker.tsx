"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// --- Tool Component ---
interface GifFrame {
  url: string;
  name: string;
  delay: number;
}

export function GifMaker() {
  const [frames, setFrames] = useState<GifFrame[]>([]);
  const [frameDelay, setFrameDelay] = useState(500);
  const [loopCount, setLoopCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [gifUrl, setGifUrl] = useState("");
  const [gifSize, setGifSize] = useState(0);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("../workers/gif-encoder.worker.ts", import.meta.url));
    }
    return workerRef.current;
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newFrames: GifFrame[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      newFrames.push({ url, name: file.name, delay: frameDelay });
    }
    if (newFrames.length > 0) {
      setFrames((prev) => [...prev, ...newFrames]);
    }
  }, [frameDelay]);

  // Auto-play preview
  useEffect(() => {
    if (frames.length <= 1 || !playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const delay = frames[activeFrame]?.delay || frameDelay;
    timerRef.current = setTimeout(() => {
      setActiveFrame((prev) => (prev + 1) % frames.length);
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, activeFrame, frames, frameDelay]);

  // Draw active frame on canvas
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || frames.length === 0) return;
    const img = new Image();
    img.onload = () => {
      const maxSize = 400;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = frames[activeFrame].url;
  }, [activeFrame, frames]);

  const moveFrame = (index: number, dir: -1 | 1) => {
    setFrames((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeFrame = (index: number) => {
    setFrames((prev) => prev.filter((_, i) => i !== index));
  };

  const generateGif = async () => {
    if (frames.length === 0) return;
    setGenerating(true);
    setGifUrl("");

    // Load all images and extract pixel data on main thread
    const frameBuffers: { data: ArrayBuffer; width: number; height: number }[] = [];
    let width = 0, height = 0;

    for (const frame of frames) {
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = frame.url;
      });
      if (width === 0) {
        width = img.width;
        height = img.height;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.min(width / img.width, height / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh);
      const imageData = ctx.getImageData(0, 0, width, height);
      frameBuffers.push({
        data: imageData.data.buffer.slice(0) as ArrayBuffer,
        width,
        height,
      });
    }

    // Offload GIF encoding to Web Worker
    const worker = getWorker();
    const gifBytes = await new Promise<ArrayBuffer>((resolve) => {
      worker.onmessage = (e: MessageEvent<{ buffer: ArrayBuffer }>) => resolve(e.data.buffer);
      worker.postMessage(
        { frames: frameBuffers, delayMs: frameDelay, loop: loopCount === 0 },
        frameBuffers.map((f) => f.data),
      );
    });

    const blob = new Blob([gifBytes], { type: "image/gif" });
    setGifSize(blob.size);
    setGifUrl(URL.createObjectURL(blob));
    setGenerating(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div>
      <canvas ref={previewRef} className="hidden" />

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">上传帧图片</span>
        <ImageUploadZone
          onFiles={handleFiles}
          multiple
          title="上传多张图片作为 GIF 帧"
          icon={
            <svg className="mb-3 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        />
      </div>

      {frames.length > 0 && (
        <>
          {/* Frame list */}
          <div className="glass-card mb-6">
            <Label className="mb-3 block">帧列表 ({frames.length} 帧)</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {frames.map((frame, i) => (
                <div
                  key={i}
                  className={`relative flex-shrink-0 cursor-pointer rounded-lg border-2 overflow-hidden ${i === activeFrame ? "border-blue-500" : "border-transparent"}`}
                  onClick={() => setActiveFrame(i)}
                >
                  <img src={frame.url} alt={`frame ${i + 1}`} className="h-16 w-16 object-cover" />
                  <span className="absolute top-0.5 left-1 text-[10px] font-bold text-white drop-shadow">
                    {i + 1}
                  </span>
                  <div className="absolute top-0.5 right-1 flex gap-0.5">
                    <button className="text-[10px] text-white drop-shadow hover:text-blue-300"
                      onClick={(e) => { e.stopPropagation(); moveFrame(i, -1); }}>◀</button>
                    <button className="text-[10px] text-white drop-shadow hover:text-red-300"
                      onClick={(e) => { e.stopPropagation(); removeFrame(i); }}>×</button>
                    <button className="text-[10px] text-white drop-shadow hover:text-blue-300"
                      onClick={(e) => { e.stopPropagation(); moveFrame(i, 1); }}>▶</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="glass-card mb-6">
            <Label className="mb-3 block">动画预览</Label>
            <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4 min-h-[150px]">
              {frames.length > 0 && (
                <img
                  src={frames[activeFrame].url}
                  alt="preview"
                  className="max-h-[250px] rounded-xl object-contain"
                />
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant={playing ? "gradient" : "secondary"}
                className="flex-1"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? "⏸ 暂停" : "▶ 播放"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setActiveFrame(0); setPlaying(false); }}
              >
                ⏮ 重置
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="glass-card mb-6">
            <Label className="mb-4 block">GIF 设置</Label>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">帧延迟</span>
                  <span className="font-mono text-xs">{frameDelay} ms</span>
                </div>
                <Slider value={[frameDelay]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setFrameDelay(val as number) }} min={50} max={2000} step={50} className="w-full" />
              </div>
              <div>
                <span className="text-xs text-gray-500 mb-2 block">循环次数</span>
                <Select value={String(loopCount)} onValueChange={(v) => setLoopCount(Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">无限循环</SelectItem>
                    <SelectItem value="1">1 次</SelectItem>
                    <SelectItem value="2">2 次</SelectItem>
                    <SelectItem value="3">3 次</SelectItem>
                    <SelectItem value="5">5 次</SelectItem>
                    <SelectItem value="10">10 次</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="gradient" onClick={generateGif} disabled={generating}>
                {generating ? "生成中..." : "生成 GIF"}
              </Button>
            </div>
          </div>

          {/* Result */}
          {gifUrl && (
            <div className="glass-card mb-6">
              <Label className="mb-4 block">生成结果</Label>
              <div className="flex flex-col items-center gap-3">
                <img src={gifUrl} alt="gif" className="max-h-[300px] rounded-xl object-contain bg-gray-50" />
                <span className="font-mono text-xs text-gray-400">
                  文件大小: {formatSize(gifSize)}
                </span>
              </div>
              <Button variant="gradient" className="w-full mt-4"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = gifUrl;
                  a.download = "animation.gif";
                  a.click();
                }}>
                下载 GIF
              </Button>
            </div>
          )}
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 上传多张图片作为 GIF 帧，可以拖拽排序、调节帧速和循环次数。生成的 GIF 使用内置编码器，无需上传到服务器。
      </div>
    </div>
  );
}
