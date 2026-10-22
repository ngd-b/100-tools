"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationLink as Link } from "@/components/NavigationLink";
import { categories, getToolById, quickToolIds, tools } from "@/data/tools";
import { useFavorites } from "@/hooks/use-favorites";
import { ToolCard } from "@/components/ToolCard";
import { ToolIcon } from "@/components/ToolIcon";
import { ArrowDown, ArrowUpRight, Check, Command, Grid2X2, Search, ShieldCheck, Star, X } from "lucide-react";

export function ToolCatalog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { favorites, toggle } = useFavorites();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

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

  const heading = activeCategory === "favorites" ? "我的收藏" : search.trim() ? "搜索结果" : activeCategory === "all" ? "全部工具" : categories.find((category) => category.id === activeCategory)?.name;

  return (
    <div className="site-container catalog-page">
      <header className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR EVERYDAY TOOLKIT</p>
          <h1>小工具，<br />让事情<span className="hero-emphasis">简单一点。</span></h1>
          <p className="hero-description">从一张图片到一段代码，<br className="sm:hidden" />把琐碎交给工具，把时间留给创造。</p>
          <div className="hero-actions">
            <a href="#tool-library" className="btn btn-primary">探索全部工具 <ArrowDown className="size-4" aria-hidden="true" /></a>
            <span className="hero-reassurance"><Check className="size-4" aria-hidden="true" /> 免费使用，无需注册</span>
          </div>
        </div>
        <div className="hero-workbench">
          <div className="workbench-heading"><span className="eyebrow">灵感不等，随手开工</span><span className="workbench-dots" aria-hidden="true"><i /><i /><i /></span></div>
          <div className="workbench-preview" aria-hidden="true"><span className="preview-braces">&#123; &#125;</span><span className="preview-line" /><span className="preview-crop"><span /></span><span className="preview-swatches"><i /><i /><i /></span></div>
          <div className="workbench-links">
            {["image-compressor", "json-formatter", "text-workbench"].map((id) => {
              const tool = getToolById(id)!;
              return <Link key={id} href={tool.path} prefetch={false}><ToolIcon id={id} category={tool.category} className="size-4" /><span>{id === "text-workbench" ? "文本整理" : tool.name}</span><ArrowUpRight className="size-4" aria-hidden="true" /></Link>;
            })}
          </div>
          <div className="workbench-caption"><span className="status-dot" /> {tools.length} 个在线工具，随时就绪</div>
        </div>
      </header>

      <div className="library-layout" id="tool-library">
        <aside className="catalog-sidebar" aria-label="工具分类">
          <p className="eyebrow sidebar-label">工具目录 <span> / {String(tools.length).padStart(2, "0")}</span></p>
          <div className="category-nav">
            <button className={`category-button ${activeCategory === "all" ? "active" : ""}`} aria-pressed={activeCategory === "all"} onClick={() => setActiveCategory("all")}><Grid2X2 className="size-4" aria-hidden="true" /><span>全部工具</span><span className="category-count">{tools.length}</span></button>
            <button className={`category-button ${activeCategory === "favorites" ? "active" : ""}`} aria-pressed={activeCategory === "favorites"} onClick={() => setActiveCategory("favorites")}><Star className="size-4" aria-hidden="true" /><span>我的收藏</span><span className="category-count">{favorites.size}</span></button>
            <span className="nav-divider" />
            {categories.map((category) => (
              <button key={category.id} className={`category-button ${activeCategory === category.id ? "active" : ""}`} aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}><ToolIcon category={category.id} className="size-4" /><span>{category.name}</span><span className="category-count">{tools.filter((tool) => tool.category === category.id).length}</span></button>
            ))}
          </div>
          <div className="sidebar-note"><ShieldCheck className="size-5" aria-hidden="true" /><p>轻装上阵，安心使用。</p><span>无需账号，多数处理<br />在你的浏览器内完成。</span></div>
        </aside>

        <div className="library-content">
          <section aria-label="查找工具" className="catalog-search">
            <label htmlFor="tool-search" className="sr-only">搜索工具</label>
            <Search className="size-5" aria-hidden="true" />
            <input ref={searchRef} id="tool-search" type="search" placeholder="搜索工具，例如：图片压缩、JSON、文本去重…" value={search} onChange={(event) => setSearch(event.target.value)} />
            {search ? <button type="button" aria-label="清空搜索" onClick={() => { setSearch(""); searchRef.current?.focus(); }}><X className="size-4" /></button> : <kbd><Command className="size-3" aria-hidden="true" /> K</kbd>}
          </section>

          {showShortcuts && (
            <section className="quick-section" aria-labelledby="shortcuts-title">
              <h2 id="shortcuts-title">快捷入口</h2>
              <div className="quick-links">{shortcuts.map((tool) => <Link key={tool.id} prefetch={false} href={tool.path}><ToolIcon id={tool.id} category={tool.category} className="size-3.5" />{tool.name}</Link>)}</div>
            </section>
          )}

          <section aria-labelledby="catalog-title">
            <div className="section-heading"><div><p className="eyebrow">THE COLLECTION</p><h2 id="catalog-title">{heading}<span className="heading-count">{filtered.length}</span></h2></div><span className="collection-hint">小而实用，打开即用</span><span className="sr-only" role="status">{filtered.length} 个工具</span></div>
            {filtered.length ? (
              <div className="tools-grid">{filtered.map((tool) => <ToolCard key={tool.id} tool={tool} isFavorite={favorites.has(tool.id)} onToggleFavorite={() => toggle(tool.id)} />)}</div>
            ) : (
              <div className="empty-state"><Search className="size-7" aria-hidden="true" /><h3>{activeCategory === "favorites" ? "把常用工具放在这里" : "暂时没有找到相关工具"}</h3><p>{activeCategory === "favorites" ? "点击工具卡片右上角的星标，下次就能更快找到。" : "换个关键词试试，或者浏览全部工具。"}</p><button className="btn btn-secondary" onClick={() => { setSearch(""); setActiveCategory("all"); }}>查看全部工具</button></div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
