"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { Slider } from "@/components/ui/slider";

export function ImageCompressor() {
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<"webp" | "jpeg" | "png">("webp");
  const [originalUrl, setOriginalUrl] = useState("");
  const [compressedUrl, setCompressedUrl] = useState("");
  const [filename, setFilename] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    setFilename(file.name.replace(/\.[^.]+$/, ""));
    setOriginalSize(file.size);
    setCompressedSize(0);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setCompressedUrl("");

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      compress(canvas, quality, format, file.name);
    };
    img.src = url;
  }, [quality, format]);

  const compress = useCallback((canvas: HTMLCanvasElement, q: number, fmt: string, origName: string) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCompressedSize(blob.size);
        setCompressedUrl(URL.createObjectURL(blob));
      },
      `image/${fmt}`,
      q
    );
  }, []);

  const recompress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalUrl) return;
    compress(canvas, quality, format, filename);
  }, [quality, format, originalUrl, compress, filename]);

  const handleDownload = useCallback(() => {
    if (!compressedUrl) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `${filename}_compressed.${format}`;
    a.click();
  }, [compressedUrl, filename, format]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const reduction = originalSize > 0 && compressedSize > 0
    ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1)
    : null;

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {!originalUrl ? (
        <div className="glass-card mb-6">
          <ImageUploadZone onFile={handleFile} />
        </div>
      ) : (
        <>
          <div className="glass-card mb-6">
            <Label className="mb-3 block">压缩设置</Label>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-gray-500 mb-1 block">格式</span>
                <div className="flex gap-2">
                  {(["webp", "jpeg", "png"] as const).map((f) => (
                    <Button key={f} variant={format === f ? "gradient" : "secondary"} className="flex-1 text-sm"
                      onClick={() => { setFormat(f); setTimeout(() => recompress(), 50); }}>
                      {f.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              {format !== "png" && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">质量</span>
                    <span className="font-mono text-xs">{Math.round(quality * 100)}%</span>
                  </div>
                  <Slider value={[quality]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setQuality(val as number) }} min={0.1} max={1} step={0.05} className="w-full" />
                </div>
              )}
              <Button variant="gradient" onClick={recompress}>重新压缩</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            <div className="glass-card text-center">
              <span className="text-xs text-gray-500">原始大小</span>
              <p className="text-lg font-bold font-mono mt-1">{formatSize(originalSize)}</p>
              {originalUrl && (
                <img src={originalUrl} alt="original" className="mt-3 rounded-xl max-h-32 object-contain mx-auto" />
              )}
            </div>
            <div className="glass-card text-center">
              <span className="text-xs text-gray-500">压缩后</span>
              <p className={`text-lg font-bold font-mono mt-1 ${reduction ? "text-green-600" : ""}`}>
                {compressedSize > 0 ? formatSize(compressedSize) : "—"}
              </p>
              {reduction && (
                <span className="text-xs font-medium text-green-500">减少 {reduction}%</span>
              )}
              {compressedUrl && (
                <img src={compressedUrl} alt="compressed" className="mt-3 rounded-xl max-h-32 object-contain mx-auto" />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1" onClick={handleDownload} disabled={!compressedSize}>
              下载
            </Button>
            <Button variant="secondary" onClick={() => {
              setOriginalUrl(""); setCompressedUrl(""); setOriginalSize(0); setCompressedSize(0);
            }}>
              更换图片
            </Button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 WebP 格式压缩率最高且浏览器兼容性良好。PNG 为无损格式，不支持质量调节。
      </div>
    </div>
  );
}
