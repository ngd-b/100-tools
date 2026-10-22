"use client";

import Link, { useLinkStatus } from "next/link";
import { useState, type ComponentProps } from "react";

function NavigationFeedback() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span className="navigation-pending sr-only" role="status">
      正在打开页面…
    </span>
  );
}

export function NavigationLink({
  children, className, prefetch, onMouseEnter, onFocus, ...props
}: ComponentProps<typeof Link>) {
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
      <NavigationFeedback />
    </Link>
  );
}
