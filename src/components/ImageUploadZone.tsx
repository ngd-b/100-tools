"use client";

import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadZoneProps {
  onFile?: (file: File) => void;
  onFiles?: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  icon?: ReactNode;
}

const defaultIcon = (
  <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export function ImageUploadZone({ onFile, onFiles, accept = "image/*", multiple, title = "拖拽图片到此处，或", icon }: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (multiple && onFiles && e.target.files) {
            onFiles(e.target.files);
          } else if (!multiple && onFile) {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }
        }}
      />
      <div
        className="upload-zone cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {icon ?? defaultIcon}
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <Button
          variant="secondary"
          className="text-sm cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          选择图片
        </Button>
      </div>
    </>
  );
}
