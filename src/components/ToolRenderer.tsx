"use client";

import { useI18n } from "@/components/LanguageProvider";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ToolLoading } from "@/components/ToolLoading";

// Keep imports explicit so Next.js can create a separate chunk for each tool.
export const toolComponents: Record<string, ComponentType> = {
  "color-tools": dynamic(() => import("@/tools/color-tools").then((mod) => mod.ColorTools), { loading: ToolLoading, ssr: false }),
  "image-cutout": dynamic(() => import("@/tools/image-cutout").then((mod) => mod.ImageCutoutTool), { loading: ToolLoading, ssr: false }),
  "text-to-speech": dynamic(() => import("@/tools/text-to-speech").then((mod) => mod.TextToSpeechTool), { loading: ToolLoading, ssr: false }),
  "base64-tool": dynamic(() => import("@/tools/base64-tool").then((mod) => mod.Base64Tool), { loading: ToolLoading, ssr: false }),
  "text-stats": dynamic(() => import("@/tools/text-stats").then((mod) => mod.TextStats), { loading: ToolLoading, ssr: false }),
  "json-formatter": dynamic(() => import("@/tools/json-formatter").then((mod) => mod.JsonFormatter), { loading: ToolLoading, ssr: false }),
  "timestamp-converter": dynamic(() => import("@/tools/timestamp-converter").then((mod) => mod.TimestampConverter), { loading: ToolLoading, ssr: false }),
  "css-shadow": dynamic(() => import("@/tools/css-shadow").then((mod) => mod.CssShadowGenerator), { loading: ToolLoading, ssr: false }),
  "gradient-generator": dynamic(() => import("@/tools/gradient-generator").then((mod) => mod.GradientGenerator), { loading: ToolLoading, ssr: false }),
  "contrast-checker": dynamic(() => import("@/tools/contrast-checker").then((mod) => mod.ContrastChecker), { loading: ToolLoading, ssr: false }),
  "image-compressor": dynamic(() => import("@/tools/image-compressor").then((mod) => mod.ImageCompressor), { loading: ToolLoading, ssr: false }),
  "image-watermark": dynamic(() => import("@/tools/image-watermark").then((mod) => mod.ImageWatermark), { loading: ToolLoading, ssr: false }),
  "audio-tools": dynamic(() => import("@/tools/audio-tools").then((mod) => mod.AudioTools), { loading: ToolLoading, ssr: false }),
  "url-encoder": dynamic(() => import("@/tools/url-encoder").then((mod) => mod.UrlEncoder), { loading: ToolLoading, ssr: false }),
  "html-entities": dynamic(() => import("@/tools/html-entities").then((mod) => mod.HtmlEntities), { loading: ToolLoading, ssr: false }),
  "regex-tester": dynamic(() => import("@/tools/regex-tester").then((mod) => mod.RegexTester), { loading: ToolLoading, ssr: false }),
  "password-generator": dynamic(() => import("@/tools/password-generator").then((mod) => mod.PasswordGenerator), { loading: ToolLoading, ssr: false }),
  "image-converter": dynamic(() => import("@/tools/image-converter").then((mod) => mod.ImageConverter), { loading: ToolLoading, ssr: false }),
  "image-resizer": dynamic(() => import("@/tools/image-resizer").then((mod) => mod.ImageResizer), { loading: ToolLoading, ssr: false }),
  "lorem-ipsum": dynamic(() => import("@/tools/lorem-ipsum").then((mod) => mod.LoremIpsumGenerator), { loading: ToolLoading, ssr: false }),
  "css-filter": dynamic(() => import("@/tools/css-filter").then((mod) => mod.CssFilterGenerator), { loading: ToolLoading, ssr: false }),
  "random-palette": dynamic(() => import("@/tools/random-palette").then((mod) => mod.RandomPalette), { loading: ToolLoading, ssr: false }),
  "white-noise": dynamic(() => import("@/tools/white-noise").then((mod) => mod.WhiteNoiseGenerator), { loading: ToolLoading, ssr: false }),
  "audio-wave": dynamic(() => import("@/tools/audio-wave").then((mod) => mod.AudioVisualizer), { loading: ToolLoading, ssr: false }),
  "markdown-preview": dynamic(() => import("@/tools/markdown-preview").then((mod) => mod.MarkdownPreview), { loading: ToolLoading, ssr: false }),
  "jwt-decoder": dynamic(() => import("@/tools/jwt-decoder").then((mod) => mod.JwtDecoder), { loading: ToolLoading, ssr: false }),
  "image-crop": dynamic(() => import("@/tools/image-crop").then((mod) => mod.ImageCrop), { loading: ToolLoading, ssr: false }),
  "gif-maker": dynamic(() => import("@/tools/gif-maker").then((mod) => mod.GifMaker), { loading: ToolLoading, ssr: false }),
  "qr-code": dynamic(() => import("@/tools/qr-code").then((mod) => mod.QrCodeGenerator), { loading: ToolLoading, ssr: false }),
  "unit-converter": dynamic(() => import("@/tools/unit-converter").then((mod) => mod.UnitConverter), { loading: ToolLoading, ssr: false }),
  "currency-converter": dynamic(() => import("@/tools/currency-converter").then((mod) => mod.CurrencyConverter), { loading: ToolLoading, ssr: false }),
  "timer-tool": dynamic(() => import("@/tools/timer-tool").then((mod) => mod.TimerTool), { loading: ToolLoading, ssr: false }),
  "bmi-calculator": dynamic(() => import("@/tools/bmi-calculator").then((mod) => mod.BmiCalculator), { loading: ToolLoading, ssr: false }),
  "pomodoro-timer": dynamic(() => import("@/tools/pomodoro-timer").then((mod) => mod.PomodoroTimer), { loading: ToolLoading, ssr: false }),
  "scientific-calculator": dynamic(() => import("@/tools/scientific-calculator").then((mod) => mod.ScientificCalculator), { loading: ToolLoading, ssr: false }),
  "world-clock": dynamic(() => import("@/tools/world-clock").then((mod) => mod.WorldClock), { loading: ToolLoading, ssr: false }),
  "uuid-generator": dynamic(() => import("@/tools/uuid-generator").then((mod) => mod.UuidGenerator), { loading: ToolLoading, ssr: false }),
  "hash-generator": dynamic(() => import("@/tools/hash-generator").then((mod) => mod.HashGenerator), { loading: ToolLoading, ssr: false }),
  "diff-checker": dynamic(() => import("@/tools/diff-checker").then((mod) => mod.DiffChecker), { loading: ToolLoading, ssr: false }),
  "xml-formatter": dynamic(() => import("@/tools/xml-formatter").then((mod) => mod.XmlFormatter), { loading: ToolLoading, ssr: false }),
  "cron-generator": dynamic(() => import("@/tools/cron-generator").then((mod) => mod.CronGenerator), { loading: ToolLoading, ssr: false }),
  "json-compare": dynamic(() => import("@/tools/json-compare").then((mod) => mod.JsonCompare), { loading: ToolLoading, ssr: false }),
  "number-converter": dynamic(() => import("@/tools/number-converter").then((mod) => mod.NumberConverter), { loading: ToolLoading, ssr: false }),
  "morse-code": dynamic(() => import("@/tools/morse-code").then((mod) => mod.MorseCode), { loading: ToolLoading, ssr: false }),
  "emoji-picker": dynamic(() => import("@/tools/emoji-picker").then((mod) => mod.EmojiPicker), { loading: ToolLoading, ssr: false }),
  "svg-placeholder": dynamic(() => import("@/tools/svg-placeholder").then((mod) => mod.SvgPlaceholder), { loading: ToolLoading, ssr: false }),
  "percentage-calculator": dynamic(() => import("@/tools/percentage-calculator").then((mod) => mod.PercentageCalculator), { loading: ToolLoading, ssr: false }),
  "loan-calculator": dynamic(() => import("@/tools/loan-calculator").then((mod) => mod.LoanCalculator), { loading: ToolLoading, ssr: false }),
  "date-diff": dynamic(() => import("@/tools/date-diff").then((mod) => mod.DateDiff), { loading: ToolLoading, ssr: false }),
  "image-color-picker": dynamic(() => import("@/tools/image-color-picker").then((mod) => mod.ImageColorPicker), { loading: ToolLoading, ssr: false }),
  "image-exif": dynamic(() => import("@/tools/image-exif").then((mod) => mod.ImageExif), { loading: ToolLoading, ssr: false }),
  "code-highlight": dynamic(() => import("@/tools/code-highlight").then((mod) => mod.CodeHighlight), { loading: ToolLoading, ssr: false }),
  "json-to-ts": dynamic(() => import("@/tools/json-to-ts").then((mod) => mod.JsonToTs), { loading: ToolLoading, ssr: false }),
  "text-workbench": dynamic(() => import("@/tools/text-workbench").then((mod) => mod.TextWorkbench), { loading: ToolLoading, ssr: false }),
};

export function ToolRenderer({ id }: { id: string }) {
  const { t } = useI18n();
  const Component = toolComponents[id];
  return Component ? <Component key={id} /> : <p role="alert">{t("工具暂时无法加载，请返回首页重试。")}</p>;
}
