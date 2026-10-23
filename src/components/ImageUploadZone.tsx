"use client";

import { useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";

interface ImageUploadZoneProps {
  onFile?: (file: File) => void;
  onFiles?: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  description?: string;
  buttonLabel?: string | null;
  inputLabel?: string;
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

const defaultIcon = (
  <svg
    className="mb-4 h-12 w-12 text-gray-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

export function ImageUploadZone({
  onFile,
  onFiles,
  accept = "image/*",
  multiple,
  title = "拖拽图片到此处，或",
  description,
  buttonLabel = "选择图片",
  inputLabel,
  className = "upload-zone",
  icon,
  disabled = false,
}: ImageUploadZoneProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function receive(files: FileList) {
    if (fileInputRef.current?.matches(":disabled")) return;
    if (multiple && onFiles) onFiles(files);
    else if (onFile && files[0]) onFile(files[0]);
  }

  return (
    <label
      className={`${className} ${dragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!fileInputRef.current?.matches(":disabled")) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        receive(event.dataTransfer.files);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-label={t(inputLabel ?? buttonLabel ?? title)}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) receive(event.target.files);
          // Allow choosing the same file again after removal or a failed read.
          event.target.value = "";
        }}
      />
      {icon ?? defaultIcon}
      <p className="upload-zone-title text-sm text-gray-400 mb-1">{t(title)}</p>
      {description && (
        <span className="text-xs text-muted-foreground">{t(description)}</span>
      )}
      {buttonLabel && (
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          className="text-sm cursor-pointer"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {t(buttonLabel)}
        </Button>
      )}
    </label>
  );
}
