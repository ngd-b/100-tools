"use client";

import { useI18n } from "@/components/LanguageProvider";
export function ToolLoading() {
  const { t } = useI18n();
  return (
    <div className="tool-loading" role="status" aria-busy="true">
      <span className="sr-only">{t("正在加载工具…")}</span>
    </div>
  );
}
