"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categories, getToolById, quickToolIds, tools } from "@/data/tools";
import { useFavorites } from "@/hooks/use-favorites";
import { ToolCard } from "@/components/ToolCard";

export function ToolCatalog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { favorites, toggle } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    function migrateHash() {
      try {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const tool = getToolById(id);
        if (tool) router.replace(tool.path);
      } catch { /* Ignore malformed or unrelated hash fragments. */ }
    }
    migrateHash();
    window.addEventListener("hashchange", migrateHash);
    return () => window.removeEventListener("hashchange", migrateHash);
  }, [router]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === "all"
        || (activeCategory === "favorites" ? favorites.has(tool.id) : tool.category === activeCategory);
      return matchesCategory && [tool.name, tool.nameEn, tool.description, ...tool.tags]
        .some((value) => value.toLocaleLowerCase().includes(query));
    });
  }, [search, activeCategory, favorites]);

  const shortcuts = quickToolIds.flatMap((id) => {
    const tool = getToolById(id);
    return tool ? [tool] : [];
  });
  const showShortcuts = activeCategory === "all" && !search.trim();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <span className="badge mb-5"><span className="badge-dot" />{tools.length} 个工具 · 持续更新</span>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
          日常小事，<span className="gradient-text">顺手解决。</span>
        </h1>
        <p className="text-base leading-7 text-gray-500">处理图片、整理文本、调试代码。无需注册，找到工具就能开始。</p>
      </header>

      <section aria-label="查找工具" className="mb-9">
        <label htmlFor="tool-search" className="sr-only">搜索工具</label>
        <div className="relative mb-5">
          <span aria-hidden="true" className="pointer-events-none absolute top-3 left-4 text-gray-400">⌕</span>
          <input id="tool-search" type="search" className="input" placeholder="搜索工具或用途，例如：压缩、去重、JSON…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="工具分类">
          <button className={`filter-pill ${activeCategory === "all" ? "active" : ""}`} aria-pressed={activeCategory === "all"} onClick={() => setActiveCategory("all")}>全部 {tools.length}</button>
          <button className={`filter-pill ${activeCategory === "favorites" ? "active" : ""}`} aria-pressed={activeCategory === "favorites"} onClick={() => setActiveCategory("favorites")}>★ 收藏 {favorites.size}</button>
          {categories.map((category) => (
            <button key={category.id} className={`filter-pill ${activeCategory === category.id ? "active" : ""}`} aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>
              {category.icon} {category.name} {tools.filter((tool) => tool.category === category.id).length}
            </button>
          ))}
        </div>
      </section>

      {showShortcuts && (
        <section className="mb-12" aria-labelledby="shortcuts-title">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="shortcuts-title" className="text-lg font-semibold">快捷入口</h2>
            <p className="text-xs text-gray-500">从图片、文本和开发场景开始</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {shortcuts.map((tool) => <Link key={tool.id} prefetch={false} href={tool.path} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600"><span aria-hidden="true">{tool.icon}</span>{tool.name}</Link>)}
          </div>
        </section>
      )}

      <section aria-labelledby="catalog-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="catalog-title" className="text-lg font-semibold">{activeCategory === "favorites" ? "我的收藏" : search.trim() ? "搜索结果" : activeCategory === "all" ? "全部工具" : categories.find((category) => category.id === activeCategory)?.name}</h2>
          <span className="text-sm text-gray-500" role="status">{filtered.length} 个工具</span>
        </div>
        {filtered.length ? (
          <div className="tools-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => <ToolCard key={tool.id} tool={tool} isFavorite={favorites.has(tool.id)} onToggleFavorite={() => toggle(tool.id)} />)}
          </div>
        ) : (
          <div className="glass-card py-14 text-center">
            <p className="mb-4 text-sm text-gray-500">{activeCategory === "favorites" ? "还没有匹配的收藏，点击工具卡片上的星标即可收藏。" : "没有找到匹配的工具，试试其他关键词。"}</p>
            <button className="copy-btn" onClick={() => { setSearch(""); setActiveCategory("all"); }}>查看全部工具</button>
          </div>
        )}
      </section>
    </div>
  );
}
