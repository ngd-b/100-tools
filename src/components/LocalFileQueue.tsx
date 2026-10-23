"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  ImagePlus,
  UploadCloud,
  X,
} from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";

function FilePreview({ file }: { file: File }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return file.type.startsWith("image/") ? (
    // Local file thumbnail, released when the file is removed.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} className="workspace-file-preview" alt="" />
  ) : (
    <span className="workspace-file-preview">
      <FileText size={20} aria-hidden="true" />
    </span>
  );
}

export function LocalFileQueue({
  files,
  onChange,
  accept,
  onAdd,
  getDetail,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  accept: string;
  onAdd: (files: File[]) => void;
  getDetail?: (file: File) => string;
}) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const images = accept.includes("image/");
  function move(index: number, delta: number) {
    const next = [...files];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  }
  return (
    <div className="space-y-4">
      <label
        className={`workspace-upload ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!event.currentTarget.closest("fieldset:disabled"))
            onAdd(Array.from(event.dataTransfer.files));
        }}
      >
        <span className="workspace-upload-icon">
          {images ? <ImagePlus size={24} /> : <UploadCloud size={24} />}
        </span>
        <strong>
          {t(images ? "点击添加图片，或拖到这里" : "点击添加 PDF，或拖到这里")}
        </strong>
        <span>
          {t(
            images
              ? "PNG、JPEG、WebP · 最多 20 张 · 共 30 MB"
              : "PDF · 最多 20 个 · 共 50 MB",
          )}
        </span>
        <input
          className="sr-only"
          aria-label={t("添加本地文件")}
          type="file"
          accept={accept}
          multiple
          onChange={(event) => {
            onAdd(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </label>
      {files.length > 0 && (
        <>
          <div className="workspace-toolbar text-xs text-muted-foreground">
            <span>{t("已添加 {0} 个文件", [files.length])}</span>
            <span>{t("按列表顺序生成，可用箭头调整")}</span>
          </div>
          <ol className="workspace-file-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="workspace-file">
                <FilePreview file={file} />
                <div className="min-w-0 flex-1">
                  <p className="workspace-file-name" title={file.name}>
                    {index + 1}. {file.name}
                  </p>
                  <p className="workspace-file-meta">
                    {file.size < 1048576
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / 1048576).toFixed(1)} MB`}
                    {getDetail ? ` · ${getDetail(file)}` : ""}
                  </p>
                </div>
                <div className="workspace-file-actions">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    aria-label={t("上移第 {0} 项", [index + 1])}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={15} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === files.length - 1}
                    aria-label={t("下移第 {0} 项", [index + 1])}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={15} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("删除第 {0} 项", [index + 1])}
                    onClick={() =>
                      onChange(files.filter((_, i) => index !== i))
                    }
                  >
                    <X size={15} />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
