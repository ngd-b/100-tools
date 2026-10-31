"use client";

import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import { recordUsage, useUsageCounts } from "@/hooks/use-usage";

export function ToolUsage({ id }: { id: string }) {
  const { t } = useI18n();
  const counts = useUsageCounts();
  const reported = useRef<string | null>(null);

  useEffect(() => {
    // The ref also prevents React Strict Mode from double-counting in development.
    if (reported.current === id) return;
    reported.current = id;
    void recordUsage(id);
  }, [id]);

  const count = counts[id];
  if (count === undefined) return null;

  const label = count === 1 ? t("已使用 1 次") : t("已使用 {0} 次", [count]);

  return (
    <span className="usage-pill" title={t("使用次数")}>
      <Activity className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
