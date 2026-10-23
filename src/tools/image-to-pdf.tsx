"use client";
import {
  ToolPanel,
  ToolHint,
  ToolFeedback,
  ToolSuccess,
  BusyIcon,
} from "@/components/ToolWorkspace";
import { Download, Sparkles } from "lucide-react";

import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocalFileQueue } from "@/components/LocalFileQueue";
import {
  validateImageFiles,
  readBitmap,
  canvasBlob,
  downloadBlob,
} from "@/lib/local-images";
export function ImageToPdf() {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "auto">("a4");
  const [landscape, setLandscape] = useState(false);
  const [margin, setMargin] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  function reset() {
    setResult(null);
    setError("");
  }
  function change(next: File[]) {
    setFiles(next);
    reset();
  }
  async function generate() {
    reset();
    setBusy(true);
    try {
      validateImageFiles(files);
      if (!margin.trim())
        throw new Error("请检查页面尺寸和页边距（0–50 毫米）。");
      const { imagesToPdf } = await import("@/lib/image-pdf");
      async function* pngImages() {
        let pixels = 0;
        for (const file of files) {
          const im = await readBitmap(file);
          try {
            pixels += im.width * im.height;
            if (pixels > 60000000)
              throw new Error("图片总像素超过 6000 万，请减少图片或缩小尺寸。");
            const canvas = document.createElement("canvas");
            canvas.width = im.width;
            canvas.height = im.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("图片导出失败，请减小尺寸后重试。");
            ctx.drawImage(im, 0, 0);
            const blob = await canvasBlob(canvas);
            canvas.width = 0;
            canvas.height = 0;
            yield new Uint8Array(await blob.arrayBuffer());
          } finally {
            im.close();
          }
        }
      }
      const bytes = await imagesToPdf(pngImages(), {
        pageSize,
        landscape,
        margin: Number(margin),
      });
      setResult(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="tool-workspace">
      <fieldset disabled={busy}>
        <ToolPanel
          title={t("文件与顺序")}
          detail={t("添加文件后，按需要调整排列顺序")}
        >
          <LocalFileQueue
            files={files}
            onChange={change}
            accept="image/png,image/jpeg,image/webp"
            onAdd={(added) => {
              if (!added.length) return;
              try {
                const next = [...files, ...added];
                validateImageFiles(next);
                change(next);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
        </ToolPanel>
        <ToolPanel title={t("排版设置")}>
          <div className="workspace-fields">
            <label>
              {t("页面尺寸")}
              <select
                className="block"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value as "a4" | "auto");
                  reset();
                }}
              >
                <option value="a4">A4</option>
                <option value="auto">{t("自适应图片")}</option>
              </select>
            </label>
            {pageSize === "a4" && (
              <label>
                {t("页面方向")}
                <select
                  className="block"
                  value={landscape ? "landscape" : "portrait"}
                  onChange={(e) => {
                    setLandscape(e.target.value === "landscape");
                    reset();
                  }}
                >
                  <option value="portrait">{t("纵向")}</option>
                  <option value="landscape">{t("横向")}</option>
                </select>
              </label>
            )}
            <label>
              {t("页边距（毫米）")}
              <Input
                type="number"
                min={0}
                max={50}
                value={margin}
                onChange={(e) => {
                  setMargin(e.target.value);
                  reset();
                }}
              />
            </label>
          </div>
          <ToolHint>
            {t(
              "每张图片生成一页，保持比例并居中。自适应按 96 DPI 计算纸张大小。最多 20 张、30 MB、总计 6000 万像素；文件仅在本地处理。",
            )}
          </ToolHint>
          <div className="workspace-actionbar">
            <Button
              variant="gradient"
              disabled={!files.length}
              onClick={generate}
            >
              <BusyIcon busy={busy} />
              {!busy && <Sparkles size={16} />}
              {t(busy ? "处理中…" : "生成 PDF")}
            </Button>
          </div>
        </ToolPanel>
      </fieldset>
      <ToolFeedback error>{t(error)}</ToolFeedback>
      {result && (
        <ToolSuccess
          title={t("已生成 {0} 页 PDF", [files.length])}
          detail={t("文件已准备好，可以下载保存")}
        >
          <Button
            variant="gradient"
            onClick={() => downloadBlob(result, "images.pdf")}
          >
            <Download size={16} />
            {t("下载 PDF")}
          </Button>
        </ToolSuccess>
      )}
    </div>
  );
}
