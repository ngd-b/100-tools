"use client";

import { useI18n } from "@/components/LanguageProvider";
import { NavigationLink as Link } from "@/components/NavigationLink";
import type { Tool } from "@/types/tools";
import { Activity, ArrowUpRight, Star } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";

export function ToolCard({ tool, isFavorite, onToggleFavorite, usage }: {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  usage?: number;
}) {
  const { t } = useI18n();
  const usageLabel = usage ? (usage === 1 ? t("已使用 1 次") : t("已使用 {0} 次", [usage])) : "";
  return (
    <article className="catalog-card group relative h-full">
      <Link href={tool.path} prefetch={false} className="tool-card h-full">
        <span className="tool-icon" data-category={tool.category}><ToolIcon id={tool.id} category={tool.category} /></span>
        <h3 className="card-title">{t(tool.name)}</h3>
        <p className="card-description">{t(tool.description)}</p>
        <span className="card-meta">
          <span>{tool.nameEn}</span>
          <span className="card-meta-actions">
            {usage ? (
              <span className="usage-badge" aria-label={usageLabel} title={usageLabel}>
                <Activity aria-hidden="true" />
                <span aria-hidden="true">{usage}</span>
              </span>
            ) : null}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </span>
      </Link>
      <button
        type="button"
        className="fav-star absolute top-4 right-4"
        aria-label={t("{0}{1}", [isFavorite ? "取消收藏" : "收藏", tool.name])}
        aria-pressed={isFavorite}
        title={t(isFavorite ? "取消收藏" : "收藏")}
        onClick={onToggleFavorite}
      >
        <Star className="size-4" fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.6} />
      </button>
    </article>
  );
}
