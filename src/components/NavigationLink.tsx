"use client";

import { useI18n } from "@/components/LanguageProvider";

import Link, { useLinkStatus } from "next/link";
import { useState, type ComponentProps } from "react";
import { localePath } from "@/lib/i18n/locale";

function NavigationFeedback() {
  const { t } = useI18n();
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span className="navigation-pending sr-only" role="status">
      {t("正在打开页面…")}</span>
  );
}

export function NavigationLink({
  children, className, href, prefetch, onMouseEnter, onFocus, ...props
}: ComponentProps<typeof Link>) {
  const { locale } = useI18n();
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      href={typeof href === "string" ? localePath(href, locale) : { ...href, pathname: href.pathname ? localePath(href.pathname, locale) : href.pathname }}
      className={`navigation-link ${className ?? ""}`}
      prefetch={prefetch === false && intent ? null : prefetch}
      onMouseEnter={(event) => { setIntent(true); onMouseEnter?.(event); }}
      onFocus={(event) => { setIntent(true); onFocus?.(event); }}
    >
      {children}
      <NavigationFeedback />
    </Link>
  );
}
