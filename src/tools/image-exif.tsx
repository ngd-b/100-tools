"use client";

import { useState, useCallback } from "react";
import * as exifr from "exifr";
import { Button } from "@/components/ui/button";
import { ImageUploadZone } from "@/components/ImageUploadZone";

interface ExifGroup {
  label: string;
  icon: string;
  items: { label: string; value: string }[];
}

export function ImageExif() {
  const [imageUrl, setImageUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [exifGroups, setExifGroups] = useState<ExifGroup[]>([]);
  const [rawExif, setRawExif] = useState<Record<string, unknown> | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError("");
    setFilename(file.name);
    setExifGroups([]);
    setRawExif(null);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setProcessing(true);

    try {
      const exif = await exifr.parse(file, {
        translateKeys: true,
        translateValues: true,
        xmp: true,
        icc: false,
        tiff: true,
        ifd0: true,
        ifd1: true,
        exif: true,
        gps: true,
        interop: true,
      });

      if (!exif) {
        setError("该图片不包含 EXIF 信息");
        setProcessing(false);
        return;
      }

      setRawExif(exif);
      const groups = parseExifData(exif);
      setExifGroups(groups);
    } catch {
      setError("读取 EXIF 信息失败，图片可能不包含元数据");
    } finally {
      setProcessing(false);
    }
  }, []);

  return (
    <div>
      {/* Upload Zone */}
      <div className="glass-card mb-6">
        <ImageUploadZone
          onFile={handleFile}
          title="上传图片查看 EXIF 信息"
          icon={
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21ZM8.25 8.25h.008v.008H8.25V8.25Z" />
            </svg>
          }
        />
      </div>

      {/* Loading */}
      {processing && (
        <div className="glass-card mb-6 text-center py-8">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            读取 EXIF 信息中...
          </div>
        </div>
      )}

      {/* Error */}
      {error && !processing && (
        <div className="glass-card mb-6 py-4 text-center">
          <p className="text-sm text-amber-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {exifGroups.length > 0 && (
        <>
          {/* Image preview */}
          <div className="glass-card mb-6 text-center">
            <img src={imageUrl} alt={filename} className="mx-auto max-h-48 rounded-xl object-contain" />
            <p className="mt-2 text-xs text-gray-400">{filename}</p>
          </div>

          {/* Groups */}
          <div className="space-y-4">
            {exifGroups.map((group) => (
              <div key={group.label} className="glass-card">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">{group.icon}</span>
                  <h3 className="font-semibold">{group.label}</h3>
                  <span className="text-xs text-gray-400">({group.items.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div key={item.label} className="rounded-lg bg-gray-50/50 px-3 py-2">
                      <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{item.label}</div>
                      <div className="mt-0.5 text-sm font-medium text-gray-700">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* GPS Map link */}
          {rawExif && rawExif.latitude != null && rawExif.longitude != null && (
            <div className="glass-card mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="text-sm font-semibold">GPS 位置</div>
                    <div className="text-xs text-gray-400">{rawExif.latitude.toFixed(6)}, {rawExif.longitude.toFixed(6)}</div>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${rawExif.latitude},${rawExif.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-500 hover:text-blue-600"
                >
                  在地图查看 →
                </a>
              </div>
            </div>
          )}

          {/* Privacy warning */}
          {rawExif && (rawExif.latitude != null || rawExif.Model || rawExif.Make) && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
              ⚠️ 此图片包含位置或设备信息。分享前建议用系统自带工具的"删除属性"功能清除隐私数据。
            </div>
          )}

        </>
      )}
    </div>
  );
}

function parseExifData(exif: Record<string, unknown>): ExifGroup[] {
  const groups: ExifGroup[] = [];

  // Camera
  const cameraItems: { label: string; value: string }[] = [];
  const cameraFields: [string, string][] = [
    ["Make", "相机品牌"],
    ["Model", "相机型号"],
    ["Software", "软件"],
    ["DateTimeOriginal", "拍摄时间"],
    ["ImageDescription", "图片描述"],
    ["Artist", "摄影师"],
    ["Copyright", "版权"],
  ];
  for (const [key, label] of cameraFields) {
    if (exif[key] != null) {
      const v = exif[key];
      cameraItems.push({ label, value: typeof v === "string" ? v : String(v) });
    }
  }
  if (cameraItems.length > 0) {
    groups.push({ label: "相机信息", icon: "📷", items: cameraItems });
  }

  // Shooting
  const shootItems: { label: string; value: string }[] = [];
  const shootFields: [string, string, ((v: unknown) => string)?][] = [
    ["FNumber", "光圈", (v) => typeof v === "number" ? `f/${v.toFixed(1)}` : String(v)],
    ["ExposureTime", "快门", (v) => typeof v === "number" ? (v < 1 ? `1/${Math.round(1 / v)}s` : `${v}s`) : String(v)],
    ["ISO", "ISO", (v) => typeof v === "number" ? `ISO ${v}` : String(v)],
    ["FocalLength", "焦距", (v) => typeof v === "number" ? `${v.toFixed(1)}mm` : String(v)],
    ["FocalLengthIn35mmFormat", "等效焦距", (v) => typeof v === "number" ? `${v}mm` : String(v)],
    ["Flash", "闪光灯", (v) => {
      const n = typeof v === "number" ? v : 0;
      return (n & 1) === 0 ? "未开启" : "已开启";
    }],
    ["WhiteBalance", "白平衡"],
    ["MeteringMode", "测光模式"],
    ["ExposureProgram", "曝光模式"],
    ["ExposureBiasValue", "曝光补偿", (v) => typeof v === "number" ? `${v > 0 ? "+" : ""}${v} EV` : String(v)],
    ["DigitalZoomRatio", "数码变焦", (v) => typeof v === "number" ? `${v.toFixed(1)}x` : String(v)],
    ["LensModel", "镜头型号"],
    ["LensMake", "镜头品牌"],
  ];
  for (const [key, label, fmt] of shootFields) {
    if (exif[key] != null) {
      const v = exif[key];
      const value = fmt ? fmt(v) : (typeof v === "string" ? v : String(v));
      shootItems.push({ label, value });
    }
  }
  if (shootItems.length > 0) {
    groups.push({ label: "拍摄参数", icon: "⚙️", items: shootItems });
  }

  // Image
  const imageItems: { label: string; value: string }[] = [];
  const imageFields: [string, string, ((v: unknown) => string)?][] = [
    ["ImageWidth", "图片宽度"],
    ["ImageHeight", "图片高度"],
    ["Orientation", "方向"],
    ["XResolution", "水平分辨率", (v) => typeof v === "number" ? `${v} dpi` : String(v)],
    ["YResolution", "垂直分辨率", (v) => typeof v === "number" ? `${v} dpi` : String(v)],
    ["ResolutionUnit", "分辨率单位"],
    ["ColorSpace", "色彩空间"],
    ["BitsPerSample", "位深度"],
    ["Compression", "压缩方式"],
  ];
  for (const [key, label, fmt] of imageFields) {
    if (exif[key] != null) {
      const v = exif[key];
      const value = fmt ? fmt(v) : (typeof v === "string" ? v : String(v));
      imageItems.push({ label, value });
    }
  }
  if (imageItems.length > 0) {
    groups.push({ label: "图片信息", icon: "🖼️", items: imageItems });
  }

  // GPS
  const gpsItems: { label: string; value: string }[] = [];
  const gpsFields: [string, string, ((v: unknown) => string)?][] = [
    ["latitude", "纬度", (v) => typeof v === "number" ? v.toFixed(6) + "°" : String(v)],
    ["longitude", "经度", (v) => typeof v === "number" ? v.toFixed(6) + "°" : String(v)],
    ["GPSAltitude", "海拔", (v) => typeof v === "number" ? `${v.toFixed(1)}m` : String(v)],
    ["GPSDateStamp", "GPS 时间"],
    ["GPSTimeStamp", "GPS 时间戳"],
  ];
  for (const [key, label, fmt] of gpsFields) {
    if (exif[key] != null) {
      const v = exif[key];
      const value = fmt ? fmt(v) : (typeof v === "string" ? v : String(v));
      gpsItems.push({ label, value });
    }
  }
  if (gpsItems.length > 0) {
    groups.push({ label: "位置信息", icon: "📍", items: gpsItems });
  }

  return groups;
}
