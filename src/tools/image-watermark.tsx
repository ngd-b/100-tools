"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Settings {
  text: string;
  fontSize: number;
  opacity: number;
  position: string;
}

function renderWatermark(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  settings: Settings
): Promise<string> {
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const { text, fontSize, opacity, position } = settings;
  const scale = Math.max(img.width, img.height) / 500;
  const size = Math.round(fontSize * scale);

  ctx.font = `bold ${size}px sans-serif`;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = Math.max(2, Math.round(size * 0.08));
  ctx.lineJoin = "round";
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(text);
  const w = metrics.width;
  const pad = 20 * scale;
  let x = 0, y = 0;

  switch (position) {
    case "bottom-left": x = pad; y = img.height - pad; break;
    case "bottom-right": x = img.width - w - pad; y = img.height - pad; break;
    case "top-left": x = pad; y = pad; break;
    case "top-right": x = img.width - w - pad; y = pad; break;
    case "center": x = (img.width - w) / 2; y = img.height / 2; break;
  }

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(URL.createObjectURL(blob));
    });
  });
}

export function ImageWatermark() {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("© 100-tools");
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<"center" | "bottom-left" | "bottom-right" | "top-left" | "top-right">("bottom-right");
  const [resultUrl, setResultUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const settingsRef = useRef<Settings>({ text: "© 100-tools", fontSize: 24, opacity: 0.5, position: "bottom-right" });
  const prevResultRef = useRef<string | null>(null);

  settingsRef.current = { text, fontSize, opacity, position };

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    if (prevResultRef.current) { URL.revokeObjectURL(prevResultRef.current); prevResultRef.current = null; }
    const url = await renderWatermark(canvas, img, settingsRef.current);
    prevResultRef.current = url;
    setResultUrl(url);
  }, []);

  const handleFile = useCallback((file: File) => {
    setResultUrl("");
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setTimeout(() => draw(), 50);
    };
    img.src = url;
  }, [draw]);

  // Redraw when settings change and image is loaded
  useEffect(() => {
    if (imgRef.current) draw();
  }, [draw]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "watermarked.png";
    a.click();
  }, [resultUrl]);

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
            <Button variant="secondary" className="text-sm cursor-pointer">
              选择图片
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-card mb-6">
            <Label className="mb-3 block">水印文字</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="输入水印文字..." />
          </div>

          <div className="glass-card mb-6">
            <Label className="mb-4 block">参数调节</Label>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">字号</span>
                  <span className="font-mono text-xs">{fontSize}px</span>
                </div>
                <Slider value={[fontSize]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setFontSize(val as number) }} min={12} max={200} step={1} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">透明度</span>
                  <span className="font-mono text-xs">{Math.round(opacity * 100)}%</span>
                </div>
                <Slider value={[opacity]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setOpacity(val as number) }} min={0.1} max={1} step={0.05} className="w-full" />
              </div>
              <div>
                <span className="text-xs text-gray-500 mb-2 block">位置</span>
                <div className="flex flex-wrap gap-2">
                  {positions.map((p) => (
                    <Button key={p.value} variant={position === p.value ? "gradient" : "secondary"} className="text-xs"
                      onClick={() => setPosition(p.value)}>{p.label}</Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card mb-6">
            <Label className="mb-4 block">对比预览</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="text-center">
                <p className="mb-2 text-xs text-gray-400">原始图片</p>
                <img src={imageUrl} alt="original" className="max-h-[250px] w-full rounded-xl object-contain bg-gray-50" />
              </div>
              <div className="text-center">
                <p className="mb-2 text-xs text-gray-400">水印效果</p>
                {resultUrl ? (
                  <img src={resultUrl} alt="watermarked" className="max-h-[250px] w-full rounded-xl object-contain bg-gray-50" />
                ) : (
                  <div className="flex h-[100px] items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                    渲染中...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1" onClick={handleDownload} disabled={!resultUrl}>下载</Button>
            <Button variant="secondary" onClick={() => {
              setImageUrl(""); setResultUrl(""); imgRef.current = null;
            }}>
              更换图片
            </Button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 水印为白色文字 + 黑色描边，会根据图片尺寸自动缩放字号，确保在明暗背景上都清晰可见。
      </div>
    </div>
  );
}
