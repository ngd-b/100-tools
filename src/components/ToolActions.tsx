"use client";

import { useI18n } from "@/components/LanguageProvider";

import { Copy, Star } from "lucide-react";
import { useState } from "react";
import { localePath } from "@/lib/i18n/locale";
import { useFavorites } from "@/hooks/use-favorites";

export function ToolActions({ id, path }: { id: string; path: string }) {
  const { t, locale } = useI18n();
  const { favorites, toggle } = useFavorites();
  const [message, setMessage] = useState("");
  const favorite = favorites.has(id);

  async function share() {
    try {
      await navigator.clipboard.writeText(new URL(localePath(path, locale), window.location.origin).href);
      setMessage("链接已复制");
    } catch {
      setMessage("复制失败，请复制浏览器地址栏中的链接。");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="filter-pill" aria-pressed={favorite} onClick={() => toggle(id)}><Star className="size-3.5" fill={favorite ? "currentColor" : "none"} aria-hidden="true" />{favorite ? t("已收藏") : t("收藏工具")}</button>
      <button type="button" className="filter-pill" onClick={share}><Copy className="size-3.5" aria-hidden="true" />{t("复制链接")}</button>
      <span className="text-xs text-gray-500" role="status">{t(message)}</span>
    </div>
  );
}
