"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { tools, categories } from "@/data/tools";
import type { Tool } from "@/types/tools";
import { ColorTools } from "@/tools/color-tools";
import { ImageCutoutTool } from "@/tools/image-cutout";
import { TextToSpeechTool } from "@/tools/text-to-speech";
import { Base64Tool } from "@/tools/base64-tool";
import { TextStats } from "@/tools/text-stats";
import { JsonFormatter } from "@/tools/json-formatter";
import { TimestampConverter } from "@/tools/timestamp-converter";
import { CssShadowGenerator } from "@/tools/css-shadow";
import { GradientGenerator } from "@/tools/gradient-generator";
import { ContrastChecker } from "@/tools/contrast-checker";
import { ImageCompressor } from "@/tools/image-compressor";
import { ImageWatermark } from "@/tools/image-watermark";
import { AudioRecorder } from "@/tools/audio-recorder";
import { UrlEncoder } from "@/tools/url-encoder";
import { HtmlEntities } from "@/tools/html-entities";
import { RegexTester } from "@/tools/regex-tester";
import { PasswordGenerator } from "@/tools/password-generator";
import { ImageConverter } from "@/tools/image-converter";
import { ImageResizer } from "@/tools/image-resizer";
import { LoremIpsumGenerator } from "@/tools/lorem-ipsum";
import { CssFilterGenerator } from "@/tools/css-filter";
import { RandomPalette } from "@/tools/random-palette";
import { WhiteNoiseGenerator } from "@/tools/white-noise";
import { AudioConverter } from "@/tools/audio-converter";
import { AudioVisualizer } from "@/tools/audio-wave";
import { MarkdownPreview } from "@/tools/markdown-preview";
import { JwtDecoder } from "@/tools/jwt-decoder";
import { ImageCrop } from "@/tools/image-crop";
import { GifMaker } from "@/tools/gif-maker";
import { QrCodeGenerator } from "@/tools/qr-code";
import { UnitConverter } from "@/tools/unit-converter";
import { CurrencyConverter } from "@/tools/currency-converter";
import { TimerTool } from "@/tools/timer-tool";
import { BmiCalculator } from "@/tools/bmi-calculator";
import { PomodoroTimer } from "@/tools/pomodoro-timer";
import { ScientificCalculator } from "@/tools/scientific-calculator";
import { WorldClock } from "@/tools/world-clock";
import { UuidGenerator } from "@/tools/uuid-generator";
import { HashGenerator } from "@/tools/hash-generator";
import { DiffChecker } from "@/tools/diff-checker";
import { XmlFormatter } from "@/tools/xml-formatter";
import { CronGenerator } from "@/tools/cron-generator";
import { JsonMinifier } from "@/tools/json-minifier";
import { NumberConverter } from "@/tools/number-converter";
import { MorseCode } from "@/tools/morse-code";
import { EmojiPicker } from "@/tools/emoji-picker";
import { SvgPlaceholder } from "@/tools/svg-placeholder";
import { PercentageCalculator } from "@/tools/percentage-calculator";
import { LoanCalculator } from "@/tools/loan-calculator";
import { DateDiff } from "@/tools/date-diff";
import { ImageColorPicker } from "@/tools/image-color-picker";
import { PdfToImage } from "@/tools/pdf-to-image";
import { ImageExif } from "@/tools/image-exif";
import { CodeHighlight } from "@/tools/code-highlight";
import { JsonToTs } from "@/tools/json-to-ts";

const iconBg: Record<string, string> = {
  color: "linear-gradient(135deg, #f59e0b, #f97316)",
  image: "linear-gradient(135deg, #10b981, #14b8a6)",
  audio: "linear-gradient(135deg, #8b5cf6, #a855f7)",
  text: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
  dev: "linear-gradient(135deg, #6b7280, #4b5563)",
  daily: "linear-gradient(135deg, #f472b6, #fb7185)",
};

const toolComponents: Record<string, React.ReactNode> = {
  "color-tools": <ColorTools />,
  "image-cutout": <ImageCutoutTool />,
  "text-to-speech": <TextToSpeechTool />,
  "base64-tool": <Base64Tool />,
  "text-stats": <TextStats />,
  "json-formatter": <JsonFormatter />,
  "timestamp-converter": <TimestampConverter />,
  "css-shadow": <CssShadowGenerator />,
  "gradient-generator": <GradientGenerator />,
  "contrast-checker": <ContrastChecker />,
  "image-compressor": <ImageCompressor />,
  "image-watermark": <ImageWatermark />,
  "audio-recorder": <AudioRecorder />,
  "url-encoder": <UrlEncoder />,
  "html-entities": <HtmlEntities />,
  "regex-tester": <RegexTester />,
  "password-generator": <PasswordGenerator />,
  "image-converter": <ImageConverter />,
  "image-resizer": <ImageResizer />,
  "lorem-ipsum": <LoremIpsumGenerator />,
  "css-filter": <CssFilterGenerator />,
  "random-palette": <RandomPalette />,
  "white-noise": <WhiteNoiseGenerator />,
  "audio-converter": <AudioConverter />,
  "audio-wave": <AudioVisualizer />,
  "markdown-preview": <MarkdownPreview />,
  "jwt-decoder": <JwtDecoder />,
  "image-crop": <ImageCrop />,
  "gif-maker": <GifMaker />,
  "qr-code": <QrCodeGenerator />,
  "unit-converter": <UnitConverter />,
  "currency-converter": <CurrencyConverter />,
  "timer-tool": <TimerTool />,
  "bmi-calculator": <BmiCalculator />,
  "pomodoro-timer": <PomodoroTimer />,
  "scientific-calculator": <ScientificCalculator />,
  "world-clock": <WorldClock />,
  "uuid-generator": <UuidGenerator />,
  "hash-generator": <HashGenerator />,
  "diff-checker": <DiffChecker />,
  "xml-formatter": <XmlFormatter />,
  "cron-generator": <CronGenerator />,
  "json-minifier": <JsonMinifier />,
  "number-converter": <NumberConverter />,
  "morse-code": <MorseCode />,
  "emoji-picker": <EmojiPicker />,
  "svg-placeholder": <SvgPlaceholder />,
  "percentage-calculator": <PercentageCalculator />,
  "loan-calculator": <LoanCalculator />,
  "date-diff": <DateDiff />,
  "image-color-picker": <ImageColorPicker />,
  "pdf-to-image": <PdfToImage />,
  "image-exif": <ImageExif />,
  "code-highlight": <CodeHighlight />,
  "json-to-ts": <JsonToTs />,
};

const ANIM_DURATION = 500;
const FAVORITES_KEY = "100-tools-favorites";

function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { favorites, toggle };
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // View state
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Favorites
  const { favorites, toggle } = useFavorites();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showFavorites = activeCategory === "favorites";

  // Read hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && tools.find((t) => t.id === hash)) {
      setSelectedId(hash);
      setIsOpen(true);
    }
  }, []);

  // Update hash
  useEffect(() => {
    if (isOpen && selectedId) {
      window.history.replaceState(null, "", `#${selectedId}`);
    } else if (!isOpen) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [isOpen, selectedId]);

  const selectedTool = useMemo(
    () => tools.find((t) => t.id === selectedId) ?? null,
    [selectedId]
  );

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchCat = activeCategory === "all"
        ? true
        : activeCategory === "favorites"
          ? favorites.has(t.id)
          : t.category === activeCategory;
      const matchSearch =
        !search ||
        t.name.includes(search) ||
        t.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        t.description.includes(search) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory, favorites]);

  // ---- OPEN ----
  const selectTool = useCallback((id: string) => {
    setSidebarOpen(false);
    if (isOpen) {
      setSelectedId(id);
      return;
    }

    setSelectedId(id);
    setAnimating(true);
    setIsOpen(true);

    setTimeout(() => {
      setAnimating(false);
    }, ANIM_DURATION);
  }, [isOpen]);

  // ---- CLOSE ----
  const closeTool = useCallback(() => {
    setAnimating(true);
    setIsOpen(false);

    setTimeout(() => {
      setAnimating(false);
      setSelectedId(null);
    }, ANIM_DURATION);
  }, []);

  // Compute CSS classes
  const gridClass = !isOpen
    ? animating
      ? "grid-hidden"
      : ""
    : animating
      ? "grid-exit"
      : "grid-hidden";

  const sidebarClass = isOpen ? "sidebar-open" : "";
  const toolClass = isOpen ? "tool-open" : "";

  return (
    <div className="main-viewport">
      {/* ---- GRID VIEW ---- */}
      <div className={`grid-section ${gridClass}`}>
        <div className="grid-scroll">
          <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
            {/* Hero */}
            <div className="hero-section mb-12 text-center">
              <div className="badge mx-auto mb-5">
                <span className="badge-dot" />
                持续更新中
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span className="gradient-text">免费在线工具</span>
                <span className="text-gray-900">合集</span>
              </h1>
              <p className="mx-auto max-w-md text-base leading-relaxed text-gray-400">
                无需注册，打开即用。颜色、图片、音频等各类实用工具。
              </p>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索工具名称或关键词..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-10 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`filter-pill ${activeCategory === "all" ? "active" : ""}`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveCategory("favorites")}
                className={`filter-pill ${activeCategory === "favorites" ? "active" : ""}`}
              >
                ⭐ 收藏{mounted && favorites.size > 0 ? ` (${favorites.size})` : ""}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`filter-pill ${activeCategory === cat.id ? "active" : ""}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Tools Grid */}
            {filtered.length > 0 ? (
              <div className="tools-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="grid-item"
                    style={{ "--item-index": index } as React.CSSProperties}
                  >
                    <ToolCard
                      tool={tool}
                      onSelect={selectTool}
                      isFavorite={favorites.has(tool.id)}
                      onToggleFavorite={() => toggle(tool.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-3 text-3xl text-gray-300">{showFavorites ? "⭐" : "🔍"}</div>
                <p className="text-sm text-gray-400">
                  {showFavorites ? "还没有收藏任何工具" : "没有找到匹配的工具"}
                </p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("all"); }}
                  className="mt-3 text-sm font-medium text-blue-500 hover:text-blue-600"
                >
                  重置筛选
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- SIDEBAR BACKDROP (mobile only) ---- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- SIDEBAR ---- */}
      <div className={`sidebar-section ${sidebarClass} ${sidebarOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3 className="sidebar-title">工具列表</h3>
            <span className="sidebar-count">{tools.length}</span>
          </div>

          <div className="sidebar-search">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="搜索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sidebar-input pl-9"
              />
            </div>
          </div>

          <div className="sidebar-filters flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={`sidebar-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveCategory("favorites")}
              className={`sidebar-pill ${activeCategory === "favorites" ? "active" : ""}`}
            >
              ⭐
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`sidebar-pill ${activeCategory === cat.id ? "active" : ""}`}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          <div className="sidebar-list overflow-x-hidden">
            {filtered.map((tool, index) => {
              const bg = iconBg[tool.category] ?? iconBg.text;
              const isActive = tool.id === selectedId;
              const isFav = favorites.has(tool.id);

              return (
                <div
                  key={tool.id}
                  className={`sidebar-item-wrapper ${isActive ? "active" : ""}`}
                  style={{ "--slide-index": index } as React.CSSProperties}
                >
                  <button
                    className="sidebar-item flex-1"
                    onClick={() => selectTool(tool.id)}
                  >
                    <div className="sidebar-icon" style={{ background: bg }}>
                      {tool.icon}
                    </div>
                    <div className="sidebar-item-text">
                      <span className="sidebar-item-name">{tool.name}</span>
                      <span className="sidebar-item-desc">{tool.description}</span>
                    </div>
                  </button>
                  <button
                    className="sidebar-fav-btn"
                    onClick={(e) => { e.stopPropagation(); toggle(tool.id); }}
                    title={mounted && isFav ? "取消收藏" : "收藏"}
                  >
                    {mounted && isFav ? "★" : "☆"}
                  </button>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="sidebar-empty">没有找到匹配的工具</div>
            )}
          </div>
        </div>
      </div>

      {/* ---- TOOL PANEL ---- */}
      {selectedTool && (
        <div className={`tool-section ${toolClass}`}>
          <div className="tool-header">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="工具列表"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-white"
                style={{ background: iconBg[selectedTool.category] ?? iconBg.text }}
              >
                {selectedTool.icon}
              </div>
              <div>
                <h2 className="tool-title truncate">{selectedTool.name}</h2>
                <p className="tool-subtitle truncate">{selectedTool.nameEn}</p>
              </div>
            </div>
            <button className="close-btn" onClick={closeTool} title="关闭">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="tool-content overflow-x-hidden">
            {toolComponents[selectedTool.id] ?? (
              <div className="glass-card text-center text-gray-400">
                工具开发中...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({
  tool,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: {
  tool: Tool;
  onSelect: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const bg = iconBg[tool.category] ?? iconBg.text;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(tool.id)}
        className="tool-card w-full text-left"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white"
          style={{ background: bg }}
        >
          {tool.icon}
        </div>
        <h3 className="text-base font-semibold tracking-tight text-gray-900">
          {tool.name}
        </h3>
        <p className="mt-0.5 text-xs font-medium tracking-wider text-gray-400 uppercase">
          {tool.nameEn}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          {tool.description}
        </p>
      </button>
      <button
        className="fav-star absolute top-3 right-3"
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        title={mounted && isFavorite ? "取消收藏" : "收藏"}
      >
        {mounted && isFavorite ? "★" : "☆"}
      </button>
    </div>
  );
}
