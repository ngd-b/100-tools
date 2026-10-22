"use client";

import Link, { useLinkStatus } from "next/link";
import { useState, type ComponentProps } from "react";

type PendingStyle = "inline" | "overlay";

function NavigationFeedback({ style }: { style: PendingStyle }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span className={`navigation-pending navigation-pending--${style}`} role="status">
      <span className="loading-spinner" aria-hidden="true" />
      <span className={style === "inline" ? "sr-only" : undefined}>正在打开…</span>
    </span>
  );
}

export function NavigationLink({
  children, className, pendingStyle = "inline", prefetch, onMouseEnter, onFocus, ...props
}: ComponentProps<typeof Link> & { pendingStyle?: PendingStyle }) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      className={`navigation-link ${className ?? ""}`}
      prefetch={prefetch === false && intent ? null : prefetch}
      onMouseEnter={(event) => { setIntent(true); onMouseEnter?.(event); }}
      onFocus={(event) => { setIntent(true); onFocus?.(event); }}
    >
      {children}
      <NavigationFeedback style={pendingStyle} />
    </Link>
  );
}
