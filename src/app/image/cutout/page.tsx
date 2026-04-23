"use client";

import { useState, useCallback } from "react";

export default function CutoutPage() {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  async function handleRemoveBackground() {
    if (!image) return;
    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setResult(canvas.toDataURL("image/png"));
        setProcessing(false);
      };
      img.src = image;
    } catch {
      setError("处理失败，请重试");
      setProcessing(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "cutout.png";
    a.click();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Header */}
      <div className="page-header">
        <a href="/" className="back-link">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </a>
        <h1 className="page-title">图片抠图</h1>
        <p className="page-desc">去除图片背景，支持透明 PNG 导出</p>
      </div>

      {/* Upload Area */}
      {!image ? (
        <div className="upload-zone">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-sm">
            📁
          </div>
          <p className="text-sm font-medium text-gray-500">
            拖拽图片到这里，或点击上传
          </p>
          <p className="mt-1 text-xs text-gray-300">
            支持 JPG、PNG、WebP 格式
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <>
          {/* Preview */}
          <div className="glass-card mb-6">
            <img
              src={image}
              alt="uploaded"
              className="mx-auto max-h-80 rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={handleRemoveBackground}
              disabled={processing}
              className="btn btn-primary flex-1"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" />
                  </svg>
                  处理中...
                </span>
              ) : (
                "去除背景"
              )}
            </button>
            <button
              onClick={() => { setImage(null); setResult(null); }}
              className="btn btn-secondary"
            >
              重新选择
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="glass-card">
              <span className="field-label mb-3 block">处理结果</span>
              {/* Checkerboard for transparency */}
              <div
                className="mb-4 rounded-xl p-3"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                }}
              >
                <img src={result} alt="result" className="mx-auto max-h-64 rounded-lg" />
              </div>
              <button onClick={handleDownload} className="btn btn-primary w-full">
                下载 PNG
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}
        </>
      )}

      {/* Info Note */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 当前使用简单的白色背景移除算法。后续可集成 AI 模型实现更精确的抠图效果。
      </div>
    </div>
  );
}
