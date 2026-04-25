"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function ImageWatermark() {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("© 100-tools");
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<"center" | "bottom-left" | "bottom-right" | "top-left" | "top-right">("bottom-right");
  const [resultUrl, setResultUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => { imgRef.current = img; applyWatermark(img); };
    img.src = url;
  }, []);

  const applyWatermark = useCallback((img?: HTMLImageElement) => {
    const image = img || imgRef.current;
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);

    const scale = Math.max(image.width, image.height) / 500;
    const size = Math.round(fontSize * scale);
    ctx.font = `bold ${size}px sans-serif`;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = Math.max(2, Math.round(2 * scale));

    const metrics = ctx.measureText(text);
    const w = metrics.width;
    const h = size;
    const pad = 20 * scale;
    let x = 0, y = 0;

    switch (position) {
      case "bottom-left": x = pad; y = image.height - pad - h / 2; break;
      case "bottom-right": x = image.width - w - pad; y = image.height - pad - h / 2; break;
      case "top-left": x = pad; y = pad + h; break;
      case "top-right": x = image.width - w - pad; y = pad + h; break;
      case "center": x = (image.width - w) / 2; y = image.height / 2; break;
    }

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    canvas.toBlob((blob) => {
      if (blob) setResultUrl(URL.createObjectURL(blob));
    });
  }, [text, fontSize, opacity, position]);

  useEffect(() => {
    if (imgRef.current) applyWatermark();
  }, [text, fontSize, opacity, position, applyWatermark]);

  const handleDownload = useCallback(() => {
    if (!resultURL) return;
    const a = document.createElement("a");
    a.href = resultURL;
    a.download = "watermarked.png";
    a.click();
  }, [resultURL]);

  const positions: { label: string; value: typeof position }[] = [
    { label: "左上", value: "top-left" }, { label: "中", value: "center" }, { label: "右上", value: "top-right" },
    { label: "左下", value: "bottom-left" }, { label: "右下", value: "bottom-right" },
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
            <span className="field-label mb-3 block">水印文字</span>
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="输入水印文字..." />
          </div>

          <div className="glass-card mb-6">
            <span className="field-label mb-4 block">参数调节</span>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">字号</span>
                  <span className="font-mono text-xs">{fontSize}px</span>
                </div>
                <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">透明度</span>
                  <span className="font-mono text-xs">{Math.round(opacity * 100)}%</span>
                </div>
                <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <span className="text-xs text-gray-500 mb-2 block">位置</span>
                <div className="flex flex-wrap gap-2">
                  {positions.map((p) => (
                    <button key={p.value} className={`btn text-xs ${position === p.value ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setPosition(p.value)}>{p.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card mb-6 text-center">
            <span className="field-label mb-4 block">预览</span>
            {imageUrl && <img src={imageUrl} alt="preview" className="max-h-[300px] rounded-xl mx-auto object-contain" />}
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={handleDownload}>下载</button>
            <button className="btn btn-secondary" onClick={() => { setImageUrl(""); setResultUrl(""); imgRef.current = null; }}>
              更换图片
            </button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 水印会根据图片尺寸自动缩放。字号基于 500px 基准面自动等比适配。
      </div>
    </div>
  );
}
