"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Lazy import pdfjs-dist to avoid SSR issues
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function ensurePdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

export function PdfToImage() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [pages, setPages] = useState<{ url: string; pageNum: number }[]>([]);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(1);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") return;
    setFilename(file.name.replace(/\.pdf$/i, ""));
    setPages([]);
    setTotalPages(0);

    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    const lib = await ensurePdfjs();
    const typedArray = new Uint8Array(await file.arrayBuffer());
    const pdf = await lib.getDocument({ data: typedArray }).promise;
    setTotalPages(pdf.numPages);
  }, []);

  const handleRender = useCallback(async () => {
    if (!pdfUrl) return;
    setProcessing(true);
    setPages([]);

    try {
      const lib = await ensurePdfjs();
      const pdf = await lib.getDocument(pdfUrl).promise;
      const rendered: { url: string; pageNum: number }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        rendered.push({ url: dataUrl, pageNum: i });
      }

      setPages(rendered);
    } catch (err) {
      console.error("PDF render error:", err);
    } finally {
      setProcessing(false);
    }
  }, [pdfUrl, scale, format, quality]);

  const handleDownload = useCallback(async (pageNum: number, url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_page_${pageNum}.${format}`;
    a.click();
  }, [filename, format]);

  const handleDownloadAll = useCallback(async () => {
    for (const p of pages) {
      await handleDownload(p.pageNum, p.url);
      await new Promise((r) => setTimeout(r, 200));
    }
  }, [pages, handleDownload]);

  const formatSize = (dataUrl: string) => {
    const bytes = Math.round((dataUrl.length - "data:image/xxx;base64,".length) * 3 / 4);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div>
      {!pdfUrl ? (
        <div className="glass-card mb-6">
          <div
            className="upload-zone cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm text-gray-400 mb-1">上传 PDF 文件</p>
            <Button variant="secondary" className="text-sm cursor-pointer" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              选择 PDF 文件
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Settings */}
          <div className="glass-card mb-6">
            <Label className="mb-3 block">渲染设置</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <span className="text-xs text-gray-500 mb-1 block">输出格式</span>
                <div className="flex gap-2">
                  {(["png", "jpeg"] as const).map((f) => (
                    <Button key={f} variant={format === f ? "gradient" : "secondary"} className="flex-1 text-sm cursor-pointer"
                      onClick={() => setFormat(f)}>
                      {f.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">清晰度</span>
                  <span className="font-mono text-xs">{scale}x</span>
                </div>
                <Slider value={[scale]} onValueChange={(v) => setScale(Array.isArray(v) ? v[0] : v)} min={1} max={4} step={0.5} />
              </div>
              {format === "jpeg" && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">质量</span>
                    <span className="font-mono text-xs">{Math.round(quality * 100)}%</span>
                  </div>
                  <Slider value={[quality]} onValueChange={(v) => setQuality(Array.isArray(v) ? v[0] : v)} min={0.3} max={1} step={0.1} />
                </div>
              )}
            </div>
            <Button variant="gradient" className="mt-4 w-full cursor-pointer" onClick={handleRender} disabled={processing}>
              {processing ? "渲染中..." : `渲染 ${totalPages} 页为图片`}
            </Button>
          </div>

          {/* Pages */}
          {pages.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">共 {pages.length} 页</span>
                <Button variant="secondary" className="text-sm cursor-pointer" onClick={handleDownloadAll}>
                  下载全部
                </Button>
              </div>
              <div className="space-y-6">
                {pages.map((p) => (
                  <div key={p.pageNum} className="glass-card">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">第 {p.pageNum} 页</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{formatSize(p.url)}</span>
                        <Button variant="gradient" className="text-xs cursor-pointer" onClick={() => handleDownload(p.pageNum, p.url)}>
                          下载
                        </Button>
                      </div>
                    </div>
                    <img src={p.url} alt={`Page ${p.pageNum}`} className="w-full rounded-lg border border-gray-100" />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={() => { setPdfUrl(""); setPages([]); setTotalPages(0); }}>
              更换文件
            </Button>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 清晰度越高渲染越慢。2x 适合大多数场景，4x 适合打印输出。PDF 渲染完全在本地进行，不上传数据。
      </div>
    </div>
  );
}
