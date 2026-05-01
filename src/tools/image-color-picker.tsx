"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { hexToRgb, rgbToHex, rgbToHsl } from "@/utils/color";

const CANVAS_W = 560;
const CANVAS_H = 380;
const LOUPE_SIZE = 100;

interface ColorEntry {
  hex: string;
  r: number;
  g: number;
  b: number;
}

export function ImageColorPicker() {
  const [imageUrl, setImageUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pickedColors, setPickedColors] = useState<ColorEntry[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Pick feedback: small toast near the image
  const [pickToast, setPickToast] = useState<{ hex: string } | null>(null);

  // Cursor state
  const [cursorColor, setCursorColor] = useState<string | null>(null);
  const [loupeX, setLoupeX] = useState(0);
  const [loupeY, setLoupeY] = useState(0);
  const [hasCursor, setHasCursor] = useState(false);

  // Image info
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [displayW, setDisplayW] = useState(0);
  const [displayH, setDisplayH] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Drag-to-pan state
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const isDragging = useRef(false); // ref for non-async access

  // Refs for stale-closure-free access
  const zoomRef = useRef(1);
  const displayWRef = useRef(0);
  const displayHRef = useRef(0);

  const panXRef = useRef(0);
  const panYRef = useRef(0);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { displayWRef.current = displayW; }, [displayW]);
  useEffect(() => { displayHRef.current = displayH; }, [displayH]);
  useEffect(() => { panXRef.current = panX; }, [panX]);
  useEffect(() => { panYRef.current = panY; }, [panY]);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    // Don't clear pickedColors — preserve them across image changes
    setZoom(1);
    setHasCursor(false);
    setCursorColor(null);
    setPickToast(null);
    setPanX(0);
    setPanY(0);
    setDragging(false);
    isDragging.current = false;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setOrigW(img.width);
      setOrigH(img.height);

      const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      setDisplayW(w);
      setDisplayH(h);

      const canvas = canvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    };
    img.src = url;
  }, []);

  const getPixelColor = useCallback((x: number, y: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const px = Math.floor(x);
    const py = Math.floor(y);
    if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) return null;
    const pixel = canvas.getContext("2d")!.getImageData(px, py, 1, 1).data;
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
  }, []);

  const drawLoupe = useCallback((canvasX: number, canvasY: number, color: string) => {
    const canvas = loupeCanvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d")!;
    const size = LOUPE_SIZE;
    canvas.width = size;
    canvas.height = size;

    const img = imageRef.current;
    const z = zoomRef.current;
    const halfSrc = Math.floor(size / (2 * z));
    const sx = canvasX * (img.width / displayWRef.current) - halfSrc;
    const sy = canvasY * (img.height / displayHRef.current) - halfSrc;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, halfSrc * 2, halfSrc * 2, 0, 0, size, size);

    // Crosshair
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, []);

  // Update cursor position from client coords
  const updateCursor = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const x = (clientX - rect.left) / (rect.width / displayWRef.current);
    const y = (clientY - rect.top) / (rect.height / displayHRef.current);

    if (x < 0 || y < 0 || x >= displayWRef.current || y >= displayHRef.current) {
      setHasCursor(false);
      setCursorColor(null);
      return;
    }

    const color = getPixelColor(x, y);
    if (!color) return;

    setLoupeX(clientX - cRect.left - LOUPE_SIZE / 2);
    setLoupeY(clientY - cRect.top - LOUPE_SIZE / 2);
    setHasCursor(true);
    setCursorColor(color);
    drawLoupe(x, y, color);
  }, [getPixelColor, drawLoupe]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) return;
    updateCursor(e.clientX, e.clientY);
  }, [updateCursor]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      updateCursor(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateCursor]);

  // Drag-to-pan (mouse)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || zoomRef.current <= 1) return;
    isDragging.current = true;
    setDragging(true);
    hasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: panXRef.current, y: panYRef.current };
  }, []);

  // Global mousemove for panning (even when cursor leaves canvas)
  useEffect(() => {
    function handleGlobalMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged.current = true;
      }
      setPanX(panStart.current.x + dx);
      setPanY(panStart.current.y + dy);
    }
    function handleGlobalMouseUp() {
      isDragging.current = false;
      setDragging(false);
    }
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Pick with toast feedback
  const handlePick = useCallback(() => {
    if (!cursorColor) return;
    const rgb = hexToRgb(cursorColor);
    if (!rgb) return;
    setPickedColors((prev) => {
      if (prev.find((c) => c.hex === cursorColor)) return prev;
      return [...prev, { hex: cursorColor, ...rgb }];
    });
    setPickToast({ hex: cursorColor });
    setTimeout(() => setPickToast(null), 1200);
  }, [cursorColor]);

  // Wheel zoom handler — bound to image container only
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      const z = zoomRef.current;
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newZoom = Math.max(0.5, Math.min(10, Math.round((z + delta) * 10) / 10));
      zoomRef.current = newZoom;
      setZoom(newZoom);
      if (newZoom === 1) {
        setPanX(0);
        setPanY(0);
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [imageUrl]); // re-bind when container appears

  // Canvas click: pick color only if not dragging
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    // Use current cursor color for picking
    handlePick();
  }, [handlePick]);

  // Touch pinch-to-zoom
  const touchDist = useRef(0);
  const touchStartZoom = useRef(1);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist.current = Math.sqrt(dx * dx + dy * dy);
      touchStartZoom.current = zoomRef.current;
    } else if (e.touches.length === 1) {
      updateCursor(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateCursor]);

  const handleTouchMovePinch = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / touchDist.current;
      const newZoom = Math.max(0.5, Math.min(10, Math.round(touchStartZoom.current * ratio * 10) / 10));
      zoomRef.current = newZoom;
      setZoom(newZoom);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && e.touches.length === 0 && cursorColor) {
      handlePick();
    }
    if (e.touches.length < 2) {
      touchDist.current = 0;
    }
  }, [cursorColor, handlePick]);

  // Keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || !imageUrl) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => Math.min(10, Math.round((z + 0.5) * 10) / 10));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, Math.round((z - 0.5) * 10) / 10));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [imageUrl]);

  const copyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 800);
  }, []);

  const removeColor = useCallback((hex: string) => {
    setPickedColors((prev) => prev.filter((c) => c.hex !== hex));
  }, []);

  const downloadPalette = useCallback(() => {
    if (pickedColors.length === 0) return;
    const c = document.createElement("canvas");
    c.width = pickedColors.length * 80;
    c.height = 80;
    const ctx = c.getContext("2d")!;
    pickedColors.forEach((p, i) => {
      ctx.fillStyle = p.hex;
      ctx.fillRect(i * 80, 0, 80, 80);
    });
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "palette.png";
    a.click();
  }, [pickedColors]);

  return (
    <div>
      {/* Hidden file input — always present so "更换图片" works anytime */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {!imageUrl ? (
        <div className="glass-card mb-6">
          <div
            className="upload-zone cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-400 mb-1">上传图片提取颜色</p>
            <Button variant="secondary" className="text-sm cursor-pointer" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              选择图片
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Pick Toast */}
          {pickToast && (
            <div className="pointer-events-none fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-black/80 px-4 py-2 text-white shadow-lg backdrop-blur">
              <div className="h-5 w-5 rounded-md border border-white/40" style={{ backgroundColor: pickToast.hex }} />
              <span className="font-mono text-sm font-semibold uppercase">{pickToast.hex}</span>
              <span className="text-xs text-white/60">已拾取</span>
            </div>
          )}

          {/* Zoom Badge */}
          <div className="glass-card mb-4 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">取色</span>
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-mono font-bold text-blue-600">
                {zoom.toFixed(1)}x
              </span>
              <span className="text-xs text-gray-400 hidden md:inline">
                滚轮 / ± 键缩放 · 拖拽平移 · 悬停取色 · 点击拾取
              </span>
              <span className="text-xs text-gray-400 md:hidden">
                双指缩放 · 点击拾取
              </span>
            </div>
            <Button variant="secondary" className="text-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              更换图片
            </Button>
          </div>

          {/* Image */}
          <div
            ref={containerRef}
            className="glass-card mb-6 relative overflow-hidden rounded-xl"
          >
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ height: CANVAS_H + 16, minHeight: CANVAS_H + 16, userSelect: dragging ? "none" : undefined }}
            >
              <canvas
                ref={canvasRef}
                className="rounded-lg transition-transform duration-150 ease-out"
                style={{
                  cursor: dragging ? "grabbing" : "default",
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  flexShrink: 0,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { if (!isDragging.current) { setHasCursor(false); setCursorColor(null); } }}
                onClick={handleCanvasClick}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => {
                  if (e.touches.length === 2) handleTouchMovePinch(e);
                  else handleTouchMove(e);
                }}
                onTouchEnd={handleTouchEnd}
              />
            </div>

            {/* Loupe */}
            {hasCursor && cursorColor && (
              <div
                className="pointer-events-none absolute rounded-full border-2 border-white/80 shadow-xl"
                style={{
                  width: LOUPE_SIZE,
                  height: LOUPE_SIZE,
                  left: loupeX,
                  top: loupeY,
                  zIndex: 10,
                }}
              >
                <canvas
                  ref={loupeCanvasRef}
                  className="h-full w-full rounded-full"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            )}

            {/* Color tooltip */}
            {hasCursor && cursorColor && (
              <div
                className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/70 px-3 py-1.5 backdrop-blur"
                style={{ zIndex: 20 }}
              >
                <div className="h-4 w-4 rounded-md border border-white/30" style={{ backgroundColor: cursorColor }} />
                <span className="font-mono text-xs font-semibold text-white uppercase">{cursorColor}</span>
                <span className="text-[10px] text-white/50">点击拾取</span>
              </div>
            )}
          </div>

          {/* Image info */}
          {origW > 0 && (
            <div className="mb-4 text-center text-xs text-gray-400">
              原图 {origW} × {origH}px · 显示 {displayW} × {displayH}px
            </div>
          )}

          {/* Picked Colors */}
          {pickedColors.length > 0 && (
            <>
              <div className="glass-card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Label>已拾取颜色 ({pickedColors.length})</Label>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs cursor-pointer" onClick={downloadPalette}>
                      导出调色板
                    </Button>
                    <Button variant="secondary" className="text-xs cursor-pointer" onClick={() => setPickedColors([])}>
                      清空
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {pickedColors.map((c) => (
                    <div key={c.hex} className="group relative">
                      <div
                        className="h-14 w-full cursor-pointer rounded-lg border border-gray-100 shadow-sm transition-transform hover:scale-105 relative"
                        style={{ backgroundColor: c.hex }}
                        onClick={() => copyColor(c.hex)}
                        title={`点击复制 ${c.hex}`}
                      >
                        {copiedHex === c.hex && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-xs font-bold text-white">
                            ✓ 已复制
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-center">
                        <span className="font-mono text-[10px] text-gray-500 uppercase">{c.hex}</span>
                      </div>
                      <button
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeColor(c.hex)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pickedColors.slice(-6).map((c) => {
                  const hsl = rgbToHsl(c.r, c.g, c.b);
                  return (
                    <div key={c.hex + "-detail"} className="glass-card !p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg border border-gray-100" style={{ backgroundColor: c.hex }} />
                        <div>
                          <div className="font-mono text-sm font-semibold">{c.hex.toUpperCase()}</div>
                          <div className="text-xs text-gray-400">RGB({c.r}, {c.g}, {c.b})</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-500">
                        HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </>
      )}
    </div>
  );
}

