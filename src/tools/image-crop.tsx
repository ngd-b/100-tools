"use client";

import { useState, useCallback, useRef, useLayoutEffect } from "react";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ImageCrop() {
  const [imageUrl, setImageUrl] = useState("");
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drawing = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const naturalSizeRef = useRef({ w: 0, h: 0 });

  // Draw crop overlay on transparent canvas
  const drawCropOverlay = useCallback((c: CropRect) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Semi-transparent dark overlay outside crop
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area (transparent - shows image underneath)
    ctx.clearRect(c.x, c.y, c.w, c.h);

    // Dashed white border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.setLineDash([]);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const rect = containerRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    drawing.current = true;
    startRef.current = pos;
    setCrop({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const s = startRef.current;
    const x = Math.min(s.x, pos.x);
    const y = Math.min(s.y, pos.y);
    const w = Math.abs(pos.x - s.x);
    const h = Math.abs(pos.y - s.y);
    setCrop({ x, y, w, h });
    drawCropOverlay({ x, y, w, h });
  };

  const onPointerUp = () => {
    drawing.current = false;
    if (crop && crop.w > 5 && crop.h > 5) {
      // Convert display coordinates to natural image coordinates
      const displayRect = containerRef.current!.getBoundingClientRect();
      const scaleX = naturalSizeRef.current.w / displayRect.width;
      const scaleY = naturalSizeRef.current.h / displayRect.height;
      const canvas = cropCanvasRef.current;
      if (!canvas) return;
      canvas.width = Math.round(crop.w * scaleX);
      canvas.height = Math.round(crop.h * scaleY);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        imgRef.current!,
        crop.x * scaleX, crop.y * scaleY,
        crop.w * scaleX, crop.h * scaleY,
        0, 0, canvas.width, canvas.height
      );
      canvas.toBlob((blob) => {
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
      });
    }
  };

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop(null);
    setPreviewUrl("");
  }, []);

  // Sync canvas size to displayed image after image loads
  useLayoutEffect(() => {
    if (!imageUrl) return;
    const img = imgRef.current;
    const canvas = overlayCanvasRef.current;
    if (!img || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      if (w === 0 || h === 0) return;
      naturalSizeRef.current = { w: img.naturalWidth, h: img.naturalHeight };
      canvas.width = w;
      canvas.height = h;
    });

    resizeObserver.observe(img);
    return () => resizeObserver.disconnect();
  }, [imageUrl]);

  // Redraw crop overlay when crop changes
  useLayoutEffect(() => {
    if (crop && crop.w > 0 && crop.h > 0) drawCropOverlay(crop);
  }, [crop, drawCropOverlay]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "cropped.png";
    a.click();
  };

  const displayRect = containerRef.current?.getBoundingClientRect();
  const cropPx = crop && crop.w > 5 && crop.h > 5 && displayRect
    ? {
        w: Math.round(crop.w * (naturalSizeRef.current.w / displayRect.width)),
        h: Math.round(crop.h * (naturalSizeRef.current.h / displayRect.height)),
      }
    : null;

  return (
    <div>
      {/* Hidden canvas for crop output */}
      <canvas ref={cropCanvasRef} className="hidden" />

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
            <span className="field-label mb-3 block">裁剪区域</span>
            <p className="text-xs text-gray-400 mb-3">在图片上拖拽鼠标选择裁剪区域</p>
            <div className="flex justify-center">
              <div
                ref={containerRef}
                className="relative inline-flex cursor-crosshair items-center justify-center overflow-hidden rounded-xl bg-gray-50"
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="crop"
                className="block max-h-100 max-w-full select-none object-contain"
                draggable={false}
              />
              <canvas
                ref={overlayCanvasRef}
                className="pointer-events-none absolute inset-0"
              />
              </div>
            </div>
            {cropPx && (
              <p className="mt-2 font-mono text-xs text-gray-400">
                裁剪区域: {cropPx.w} x {cropPx.h} px
              </p>
            )}
          </div>

          {previewUrl && (
            <div className="glass-card mb-6">
              <span className="field-label mb-4 block">裁剪预览</span>
              <div className="flex flex-col items-center gap-4">
                <img src={previewUrl} alt="cropped" className="max-h-62.5 rounded-xl object-contain bg-gray-50" />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={handleDownload} disabled={!previewUrl}>下载</button>
            <button className="btn btn-secondary" onClick={() => {
              setImageUrl(""); setCrop(null); setPreviewUrl("");
            }}>
              更换图片
            </button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 在图片上按住鼠标拖拽，即可选择裁剪区域。松开后自动预览裁剪效果。
      </div>
    </div>
  );
}
