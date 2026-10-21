import Link from "next/link";
import type { Tool } from "@/types/tools";
import { toolIconBackgrounds } from "@/data/tool-styles";

export function ToolCard({ tool, isFavorite, onToggleFavorite }: {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const bg = toolIconBackgrounds[tool.category] ?? toolIconBackgrounds.text;

  return (
    <article className="group relative h-full">
      <Link href={tool.path} prefetch={false} className="tool-card h-full focus-visible:outline-2 focus-visible:outline-blue-500">
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
      </Link>
      <button
        type="button"
        className="fav-star absolute top-3 right-3"
        aria-label={`${isFavorite ? "取消收藏" : "收藏"}${tool.name}`}
        aria-pressed={isFavorite}
        title={isFavorite ? "取消收藏" : "收藏"}
        onClick={onToggleFavorite}
      >
        {isFavorite ? "★" : "☆"}
      </button>
    </article>
  );
}
