import type { Tool } from "@/types/tools";

export const tools: Tool[] = [
  {
    id: "color-tools",
    name: "颜色工具箱",
    nameEn: "Color Tools",
    category: "color",
    icon: "🎨",
    description: "颜色拾取、格式转换、调色板，一站式颜色工具",
    path: "/color/tools",
    tags: ["颜色", "拾取", "转换", "调色板", "hex", "rgb", "hsl"],
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
