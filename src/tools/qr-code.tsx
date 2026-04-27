"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import qrcode from "qrcode-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Tool Component ---
export function QrCodeGenerator() {
  const [text, setText] = useState("https://github.com/ngd-b/100-tools");
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(() => {
    if (!text.trim()) { setError("请输入内容"); setQrUrl(""); return; }
    setError("");

    try {
      // Type number 0 = auto, Error correction M
      const qr = qrcode(0, "M");
      qr.addData(text);
      qr.make();

      const moduleCount = qr.getModuleCount();
      const cellSize = 8;
      const margin = 4;
      const size = (moduleCount + margin * 2) * cellSize;

      const canvas = canvasRef.current!;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#000000";
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect((c + margin) * cellSize, (r + margin) * cellSize, cellSize, cellSize);
          }
        }
      }
      setQrUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      console.error("QR generation error:", e);
      setError("生成失败，请尝试较短的内容");
      setQrUrl("");
    }
  }, [text]);

  useEffect(() => { generate(); }, []);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="glass-card mb-6">
        <Label>输入内容</Label>
        <Input
          className="w-full mb-3"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
          placeholder="输入网址、文本或其他内容..."
        />
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>字符数: {text.length}</span>
          <span>EC Level M（中等纠错）</span>
        </div>
        <Button variant="gradient" className="w-full" onClick={generate}>
          生成二维码
        </Button>
      </div>

      {error && (
        <div className="glass-card mb-6 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {qrUrl && (
        <div className="glass-card mb-6">
          <Label className="mb-4 block">二维码预览</Label>
          <div className="flex flex-col items-center gap-4">
            <img
              src={qrUrl}
              alt="QR Code"
              className="rounded-xl border border-gray-200 bg-white"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <Button variant="gradient" className="w-full mt-4" onClick={handleDownload}>
            下载 PNG
          </Button>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 使用 qrcode-generator 库，支持自动选择版本、EC Level M 纠错，本地生成无需外部 API。
      </div>
    </div>
  );
}
