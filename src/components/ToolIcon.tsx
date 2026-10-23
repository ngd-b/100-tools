import {
  ArrowLeftRight, AudioLines, Binary, Braces, CalendarDays, Calculator,
  CaseSensitive, CirclePercent, Clock3, Code2, Columns3, Contrast, Crop,
  Dices, Droplets, Eraser, FileCode2, FileImage, FileText, Fingerprint,
  GitCompareArrows, Globe2, Hash, Image, ImageDown, KeyRound, Layers,
  Link2, ListFilter, Mic, Palette, Pipette, QrCode, Ruler, ScanLine,
  Scissors, Search, ShieldCheck, SlidersHorizontal, Smile, Sparkles,
  Timer, Type, Volume2, Waves, type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  document: FileText, color: Palette, image: Image, audio: AudioLines, text: Type, dev: Code2, daily: Calculator,
};

const toolIcons: Record<string, LucideIcon> = {
  "color-tools": Pipette, "image-cutout": Scissors, "text-to-speech": Volume2,
  "base64-tool": Binary, "text-stats": CaseSensitive, "json-formatter": Braces,
  "timestamp-converter": Clock3, "css-shadow": Layers, "gradient-generator": Palette,
  "contrast-checker": Contrast, "image-compressor": ImageDown, "image-watermark": Droplets,
  "audio-tools": Mic, "url-encoder": Link2, "html-entities": Code2,
  "regex-tester": Search, "password-generator": KeyRound, "image-converter": FileImage,
  "image-resizer": Ruler, "lorem-ipsum": FileText, "css-filter": SlidersHorizontal,
  "random-palette": Dices, "white-noise": Waves, "audio-wave": AudioLines,
  "markdown-preview": FileText, "jwt-decoder": ShieldCheck, "image-crop": Crop,
  "gif-maker": Columns3, "qr-code": QrCode, "unit-converter": Ruler,
  "currency-converter": ArrowLeftRight, "timer-tool": Timer, "bmi-calculator": Calculator,
  "pomodoro-timer": Timer, "scientific-calculator": Calculator, "world-clock": Globe2,
  "uuid-generator": Fingerprint, "hash-generator": Hash, "diff-checker": GitCompareArrows,
  "xml-formatter": FileCode2, "cron-generator": CalendarDays, "json-compare": GitCompareArrows,
  "number-converter": Binary, "morse-code": AudioLines, "emoji-picker": Smile,
  "svg-placeholder": Image, "percentage-calculator": CirclePercent, "loan-calculator": Calculator,
  "date-diff": CalendarDays, "image-color-picker": Pipette, "image-exif": ScanLine,
  "code-highlight": Sparkles, "json-to-ts": Braces, "text-workbench": ListFilter,
};

export function ToolIcon({ id, category, className = "size-5" }: {
  id?: string; category: string; className?: string;
}) {
  const Icon = (id && toolIcons[id]) || categoryIcons[category] || Eraser;
  return <Icon className={className} strokeWidth={1.65} aria-hidden="true" />;
}
