"use client";

import { useI18n } from "@/components/LanguageProvider";
export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" /><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" /><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" /><path d="M17.5 13v9m-4.5-4.5h9" stroke="currentColor" strokeWidth="2.5" /></svg>
      </span>
      <span className="brand-name">100<span>tools</span><span className="sr-only"> {t(" — 免费在线工具")}</span></span>
      {!compact && <span className="brand-caption">{t("日常小事，顺手解决。")}</span>}
    </span>
  );
}
