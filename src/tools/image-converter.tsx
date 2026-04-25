"use client";

import { useState, useCallback, useRef } from "react";

export function ImageConverter() {
  const [imageUrl, setImageUrl] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("webp");
  const [quality, setQuality] = useState(0.92);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [filename, setFilename] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    setFilename(file.name.replace(/\.[^.]+$/, ""));
    setOriginalSize(file.size);
    setResultUrl("");
    setResultSize(0);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    convert(url, format, quality);
  }, []);

  const convert = useCallback((url: string, fmt: string, q: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      if (fmt === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (resultUrl) URL.revokeObjectURL(resultUrl);
            setResultUrl(URL.createObjectURL(blob));
            setResultSize(blob.size);
          }
        },
        `image/${fmt}`,
        fmt === "png" ? undefined : q
      );
    };
    img.src = url;
  }, [resultUrl]);

  const handleConvert = useCallback(() => {
    if (imageUrl) convert(imageUrl, format, quality);
  }, [imageUrl, format, quality, convert]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${filename}.${format}`;
    a.click();
  }, [resultUrl, filename, format]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {!imageUrl ? (
        <div className="glass-card mb-6">
          <div className="upload-zone">
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-400 mb-1">拖拽图片到此处</p>
            <label className="btn btn-secondary text-sm cursor-pointer">
              选择图片
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-card mb-6">
            <span className="field-label mb-3 block">输出格式</span>
            <div className="flex gap-2">
              {(["png", "jpeg", "webp"] as const).map((f) => (
                <button key={f}
                  className={`btn flex-1 ${format === f ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { setFormat(f); }}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            {format !== "png" && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">质量</span>
                  <span className="font-mono text-xs">{Math.round(quality * 100)}%</span>
                </div>
                <input type="range" min={0.1} max={1} step={0.05} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
              </div>
            )}
          </div>

          <button className="btn btn-primary w-full mb-6" onClick={handleConvert}>转换格式</button>

          <div className="glass-card mb-6">
            <span className="field-label mb-3 block">原始图片</span>
            <img src={imageUrl} alt="original" className="max-h-[200px] w-full rounded-xl object-contain bg-gray-50" />
            <p className="mt-2 text-xs text-gray-500">原始大小: {formatSize(originalSize)}</p>
          </div>

          {resultUrl && (
            <div className="glass-card mb-6">
              <span className="field-label mb-3 block">转换结果 — {format.toUpperCase()}</span>
              <img src={resultUrl} alt="converted" className="max-h-[200px] w-full rounded-xl object-contain bg-gray-50" />
              <p className="mt-2 text-xs text-gray-500">输出大小: {formatSize(resultSize)}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={handleDownload} disabled={!resultUrl}>下载</button>
            <button className="btn btn-secondary" onClick={() => { setImageUrl(""); setResultUrl(""); setResultSize(0); setOriginalSize(0); }}>
              更换图片
            </button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 WebP 格式压缩率最高且支持透明。JPEG 适合照片类图片，不支持透明。PNG 为无损格式。
      </div>
    </div>
  );
}
