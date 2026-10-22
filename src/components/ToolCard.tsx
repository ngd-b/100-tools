import { NavigationLink as Link } from "@/components/NavigationLink";
import type { Tool } from "@/types/tools";
import { ArrowUpRight, Star } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";

export function ToolCard({ tool, isFavorite, onToggleFavorite }: {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <article className="catalog-card group relative h-full">
      <Link href={tool.path} prefetch={false} className="tool-card h-full" pendingStyle="overlay">
        <span className="tool-icon" data-category={tool.category}><ToolIcon id={tool.id} category={tool.category} /></span>
        <h3 className="card-title">{tool.name}</h3>
        <p className="card-description">{tool.description}</p>
        <span className="card-meta"><span>{tool.nameEn}</span><ArrowUpRight className="size-4" aria-hidden="true" /></span>
      </Link>
      <button
        type="button"
        className="fav-star absolute top-4 right-4"
        aria-label={`${isFavorite ? "取消收藏" : "收藏"}${tool.name}`}
        aria-pressed={isFavorite}
        title={isFavorite ? "取消收藏" : "收藏"}
        onClick={onToggleFavorite}
      >
        <Star className="size-4" fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.6} />
      </button>
    </article>
  );
}
