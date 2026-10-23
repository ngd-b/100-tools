"use client";
import {
  ToolPanel,
  ToolHint,
  ToolFeedback,
  ToolSuccess,
  BusyIcon,
} from "@/components/ToolWorkspace";
import { Download, FileOutput } from "lucide-react";

import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { LocalFileQueue } from "@/components/LocalFileQueue";
import { downloadBlob } from "@/lib/local-images";
export function PdfMerge() {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [counts, setCounts] = useState<Map<File, number>>(new Map());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    blob: Blob;
    pageCount: number;
  } | null>(null);
  function change(next: File[]) {
    setFiles(next);
    setCounts(
      (previous) => new Map(next.map((file) => [file, previous.get(file)!])),
    );
    setResult(null);
    setError("");
  }
  async function add(added: File[]) {
    if (!added.length) return;
    setError("");
    setResult(null);
    setBusy(true);
    let active = "";
    try {
      const { inspectPdf, validatePdfFiles } = await import("@/lib/pdf-merge");
      const next = [...files, ...added];
      validatePdfFiles(next);
      const nextCounts = new Map(counts);
      for (const file of added) {
        active = file.name;
        nextCounts.set(
          file,
          await inspectPdf(new Uint8Array(await file.arrayBuffer())),
        );
      }
      if ([...nextCounts.values()].reduce((sum, n) => sum + n, 0) > 500)
        throw new Error("PDF 页数必须在 1–500 页之间，合计不超过 500 页。");
      setFiles(next);
      setCounts(nextCounts);
    } catch (e) {
      setError(`${active ? active + ": " : ""}${t((e as Error).message)}`);
    } finally {
      setBusy(false);
    }
  }
  async function merge() {
    setResult(null);
    setError("");
    setBusy(true);
    try {
      const { mergePdfs } = await import("@/lib/pdf-merge");
      const inputs = [];
      for (const file of files)
        inputs.push(new Uint8Array(await file.arrayBuffer()));
      const output = await mergePdfs(inputs);
      setResult({
        blob: new Blob([new Uint8Array(output.bytes)], {
          type: "application/pdf",
        }),
        pageCount: output.pageCount,
      });
    } catch (e) {
      setError(t((e as Error).message));
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
            accept="application/pdf,.pdf"
            onAdd={add}
            getDetail={(file) => t("{0} 页", [counts.get(file) ?? 0])}
          />
          <ToolHint>
            {t(
              "本地合并 2–20 个 PDF，总大小不超过 50 MB、总页数不超过 500 页。不支持加密、损坏或交互表单文件；仅合并页面，不保留文档书签、附件和数字签名。",
            )}
          </ToolHint>
          <div className="workspace-actionbar">
            <Button
              variant="gradient"
              disabled={files.length < 2}
              onClick={merge}
            >
              <BusyIcon busy={busy} />
              {!busy && <FileOutput size={16} />}
              {t(busy ? "处理中…" : "合并 PDF")}
            </Button>
          </div>
        </ToolPanel>
      </fieldset>
      {busy && <ToolFeedback>{t("正在读取和处理 PDF…")}</ToolFeedback>}
      <ToolFeedback error>{error}</ToolFeedback>
      {result && (
        <ToolSuccess
          title={t("已生成 {0} 页 PDF", [result.pageCount])}
          detail={t("文件已准备好，可以下载保存")}
        >
          <Button
            variant="gradient"
            onClick={() => downloadBlob(result.blob, "merged.pdf")}
          >
            <Download size={16} />
            {t("下载 PDF")}
          </Button>
        </ToolSuccess>
      )}
    </div>
  );
}
