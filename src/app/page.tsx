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

const iconBg: Record<string, string> = {
  color: "linear-gradient(135deg, #f59e0b, #f97316)",
  image: "linear-gradient(135deg, #10b981, #14b8a6)",
  audio: "linear-gradient(135deg, #8b5cf6, #a855f7)",
  text: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
  dev: "linear-gradient(135deg, #6b7280, #4b5563)",
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
};

const ANIM_DURATION = 500;

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // View state
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

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
      const matchCat = activeCategory === "all" || t.category === activeCategory;
      const matchSearch =
        !search ||
        t.name.includes(search) ||
        t.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        t.description.includes(search) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  // ---- OPEN ----
  const selectTool = useCallback((id: string) => {
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
                  className="input pl-11"
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
                    <ToolCard tool={tool} onSelect={selectTool} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-3 text-3xl text-gray-300">🔍</div>
                <p className="text-sm text-gray-400">没有找到匹配的工具</p>
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

      {/* ---- SIDEBAR ---- */}
      <div className={`sidebar-section ${sidebarClass}`}>
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

          <div className="sidebar-filters">
            <button
              onClick={() => setActiveCategory("all")}
              className={`sidebar-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              全部
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

          <div className="sidebar-list">
            {filtered.map((tool, index) => {
              const bg = iconBg[tool.category] ?? iconBg.text;
              const isActive = tool.id === selectedId;

              return (
                <button
                  key={tool.id}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  style={{ "--slide-index": index } as React.CSSProperties}
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
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-white"
                style={{ background: iconBg[selectedTool.category] ?? iconBg.text }}
              >
                {selectedTool.icon}
              </div>
              <div>
                <h2 className="tool-title">{selectedTool.name}</h2>
                <p className="tool-subtitle">{selectedTool.nameEn}</p>
              </div>
            </div>
            <button className="close-btn" onClick={closeTool} title="关闭">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="tool-content">
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
}: {
  tool: Tool;
  onSelect: (id: string) => void;
}) {
  const bg = iconBg[tool.category] ?? iconBg.text;

  return (
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
  );
}
