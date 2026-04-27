"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// --- Minimal GIF Encoder (GIF89a) ---
function encodeGIF(frames: ImageData[], delayMs: number, loop: boolean): Uint8Array {
  const w = frames[0].width;
  const h = frames[0].height;
  const parts: Uint8Array[] = [];

  const palette = buildPalette(frames);
  const globalColorTable = paletteToTable(palette);

  // Header + LSD
  parts.push(strBytes("GIF89a"));
  const lsd = new Uint8Array(7);
  lsd[0] = w & 0xff; lsd[1] = (w >> 8) & 0xff;
  lsd[2] = h & 0xff; lsd[3] = (h >> 8) & 0xff;
  lsd[4] = 0xf7; // global color table flag, 8 bits, sorted
  lsd[5] = 0; lsd[6] = 0; // bg, pixel aspect
  parts.push(lsd);
  parts.push(globalColorTable); // 768 bytes

  if (loop) {
    parts.push(new Uint8Array([0x21, 0xff, 0x0b]));
    parts.push(strBytes("NETSCAPE2.0"));
    const appData = new Uint8Array([3, 1, 0, 0, 0]);
    parts.push(appData);
  }

  for (const frame of frames) {
    const indexed = indexFrame(frame, palette);
    // Graphic Control Extension
    parts.push(new Uint8Array([0x21, 0xf9, 0x04, 0x00]));
    const delay = Math.round(delayMs / 10);
    parts.push(new Uint8Array([delay & 0xff, (delay >> 8) & 0xff]));
    parts.push(new Uint8Array([0, 0]));
    // Image Descriptor
    parts.push(new Uint8Array([0x2c]));
    const imgDesc = new Uint8Array(9);
    imgDesc[4] = w & 0xff; imgDesc[5] = (w >> 8) & 0xff;
    imgDesc[6] = h & 0xff; imgDesc[7] = (h >> 8) & 0xff;
    imgDesc[8] = 0; // no local color table
    parts.push(imgDesc);
    // Image Data (LZW)
    const lzw = lzwEncode(indexed, 8);
    parts.push(lzw);
  }

  // Trailer
  parts.push(new Uint8Array([0x3b]));

  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) { result.set(p, offset); offset += p.length; }
  return result;
}

function strBytes(s: string): Uint8Array {
  const arr = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i);
  return arr;
}

function buildPalette(frames: ImageData[]): [number, number, number][] {
  const colorCount = new Map<number, number>();
  for (const frame of frames) {
    const d = frame.data;
    for (let i = 0; i < d.length; i += 4) {
      // Quantize to reduce colors
      const r = d[i] >> 3 << 3;
      const g = d[i + 1] >> 3 << 3;
      const b = d[i + 2] >> 3 << 3;
      const key = (r << 16) | (g << 8) | b;
      colorCount.set(key, (colorCount.get(key) || 0) + 1);
    }
  }
  // Get top 256 colors
  const sorted = [...colorCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 256);
  const palette: [number, number, number][] = sorted.map(([k]) => [(k >> 16) & 0xff, (k >> 8) & 0xff, k & 0xff]);
  while (palette.length < 256) palette.push([0, 0, 0]);
  return palette;
}

function paletteToTable(palette: [number, number, number][]): Uint8Array {
  const table = new Uint8Array(768);
  for (let i = 0; i < 256; i++) {
    table[i * 3] = palette[i][0];
    table[i * 3 + 1] = palette[i][1];
    table[i * 3 + 2] = palette[i][2];
  }
  return table;
}

function indexFrame(frame: ImageData, palette: [number, number, number][]): Uint8Array {
  const result = new Uint8Array(frame.width * frame.height);
  const d = frame.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    result[i / 4] = nearestColor(r, g, b, palette);
  }
  return result;
}

function nearestColor(r: number, g: number, b: number, palette: [number, number, number][]): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const dr = r - palette[i][0];
    const dg = g - palette[i][1];
    const db = b - palette[i][2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    if (dist === 0) break;
  }
  return bestIdx;
}

function lzwEncode(data: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  const output: number[] = [];
  // Sub-blocks output
  const subBlocks: number[][] = [];
  let currentBlock: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  function writeBits(code: number, size: number) {
    bitBuffer |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      currentBlock.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
      if (currentBlock.length === 255) {
        subBlocks.push(currentBlock);
        currentBlock = [];
      }
    }
  }

  writeBits(clearCode, codeSize);

  // Build dictionary
  const dict = new Map<string, number>();
  for (let i = 0; i < clearCode; i++) dict.set(String.fromCharCode(i), i);

  let prefix = String.fromCharCode(data[0]);
  for (let i = 1; i < data.length; i++) {
    const c = String.fromCharCode(data[i]);
    const combo = prefix + c;
    if (dict.has(combo)) {
      prefix = combo;
    } else {
      writeBits(dict.get(prefix)!, codeSize);
      if (nextCode < 4096) {
        dict.set(combo, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        writeBits(clearCode, codeSize);
        dict.clear();
        for (let j = 0; j < clearCode; j++) dict.set(String.fromCharCode(j), j);
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }
      prefix = c;
    }
  }
  writeBits(dict.get(prefix)!, codeSize);
  writeBits(eoiCode, codeSize);

  // Flush remaining bits
  if (bitCount > 0) {
    currentBlock.push(bitBuffer & 0xff);
  }
  if (currentBlock.length > 0) subBlocks.push(currentBlock);

  // Build output with sub-block structure
  const result: number[] = [];
  result.push(minCodeSize);
  for (const block of subBlocks) {
    result.push(block.length);
    result.push(...block);
  }
  result.push(0); // block terminator

  return new Uint8Array(result);
}

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

    // Load all images as ImageData
    const imageDatas: ImageData[] = [];
    let width = 0, height = 0;

    for (const frame of frames) {
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = frame.url;
      });
      if (width === 0) {
        // Use first frame dimensions
        width = img.width;
        height = img.height;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      // Draw centered/fitted
      const scale = Math.min(width / img.width, height / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh);
      imageDatas.push(ctx.getImageData(0, 0, width, height));
    }

    const gifBytes = encodeGIF(imageDatas, frameDelay, loopCount === 0);
    const blob = new Blob([gifBytes.buffer.slice(0) as ArrayBuffer], { type: "image/gif" });
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
        <div className="upload-zone">
          <svg className="mb-3 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <p className="text-sm text-gray-400 mb-2">上传多张图片作为 GIF 帧</p>
          <Button variant="secondary" className="text-sm cursor-pointer">
            选择图片
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
          </Button>
        </div>
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
