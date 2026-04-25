"use client";

import { useState, useCallback, useRef } from "react";

export function ImageResizer() {
  const [imageUrl, setImageUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ratioRef = useRef(1);

  const handleFile = useCallback((file: File) => {
    setResultUrl("");
    setResultSize(0);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
      ratioRef.current = img.width / img.height;
    };
    img.src = url;
  }, []);

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (keepRatio) setHeight(Math.round(w / ratioRef.current));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (keepRatio) setWidth(Math.round(h * ratioRef.current));
  };

  const handleResize = useCallback(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultUrl(URL.createObjectURL(blob));
          setResultSize(blob.size);
        }
      });
    };
    img.src = imageUrl;
  }, [imageUrl, width, height, resultUrl]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `resized_${width}x${height}.png`;
    a.click();
  }, [resultUrl, width, height]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const presets = [
    { label: "50%", factor: 0.5 },
    { label: "25%", factor: 0.25 },
    { label: "10%", factor: 0.1 },
  ];

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
            <span className="field-label mb-3 block">原始尺寸</span>
            <p className="text-sm text-gray-500">{originalWidth} × {originalHeight} px</p>
          </div>

          <div className="glass-card mb-6">
            <span className="field-label mb-3 block">目标尺寸</span>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">宽度 (px)</span>
                <input type="number" className="input font-mono text-sm" value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))} />
              </div>
              <span className="mt-5 text-gray-400">×</span>
              <div className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">高度 (px)</span>
                <input type="number" className="input font-mono text-sm" value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500" />
              锁定宽高比
            </label>
          </div>

          <div className="glass-card mb-6">
            <span className="field-label mb-3 block">快速预设</span>
            <div className="flex gap-2">
              {presets.map((p) => (
                <button key={p.label} className="btn btn-secondary flex-1 text-sm"
                  onClick={() => handleWidthChange(Math.round(originalWidth * p.factor))}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary w-full mb-6" onClick={handleResize}>调整尺寸</button>

          {resultUrl && (
            <div className="glass-card mb-6">
              <span className="field-label mb-3 block">调整结果</span>
              <img src={resultUrl} alt="resized" className="max-h-[200px] w-full rounded-xl object-contain bg-gray-50" />
              <p className="mt-2 text-xs text-gray-500">
                {width} × {height} px · {formatSize(resultSize)}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={handleDownload} disabled={!resultUrl}>下载</button>
            <button className="btn btn-secondary" onClick={() => {
              setImageUrl(""); setResultUrl(""); setOriginalWidth(0); setOriginalHeight(0);
            }}>
              更换图片
            </button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 锁定宽高比后，修改宽度会自动计算对应高度，防止图片变形。
      </div>
    </div>
  );
}
