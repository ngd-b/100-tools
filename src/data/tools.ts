import type { Tool } from "@/types/tools";

export const tools: Tool[] = [
  {
    id: "color-picker",
    name: "颜色拾取",
    nameEn: "Color Picker",
    category: "color",
    icon: "🎨",
    description: "拾取颜色值，支持 HEX、RGB、HSL 格式",
    path: "/color/picker",
    tags: ["颜色", "拾取", "hex", "rgb", "hsl"],
  },
  {
    id: "color-converter",
    name: "颜色转换",
    nameEn: "Color Converter",
    category: "color",
    icon: "🔄",
    description: "在 HEX、RGB、HSL 等颜色格式之间互相转换",
    path: "/color/converter",
    tags: ["颜色", "转换", "hex", "rgb", "hsl"],
  },
  {
    id: "color-palette",
    name: "调色板",
    nameEn: "Color Palette",
    category: "color",
    icon: "🌈",
    description: "输入主色，自动生成互补色、渐变色等配色方案",
    path: "/color/palette",
    tags: ["颜色", "调色板", "配色", "渐变"],
  },
  {
    id: "image-cutout",
    name: "图片抠图",
    nameEn: "Image Cutout",
    category: "image",
    icon: "✂️",
    description: "一键去除图片背景，支持 PNG 透明背景导出",
    path: "/image/cutout",
    tags: ["图片", "抠图", "去背景", "png"],
  },
  {
    id: "text-to-speech",
    name: "文本转语音",
    nameEn: "Text to Speech",
    category: "audio",
    icon: "🔊",
    description: "将文字转换为语音，支持多语言和语速调节",
    path: "/audio/tts",
    tags: ["文本", "语音", "tts", "朗读"],
  },
];

export const categories = [
  { id: "color", name: "颜色工具", icon: "🎨" },
  { id: "image", name: "图片工具", icon: "🖼️" },
  { id: "audio", name: "音频工具", icon: "🔊" },
  { id: "text", name: "文本工具", icon: "📝" },
  { id: "dev", name: "开发工具", icon: "💻" },
];
