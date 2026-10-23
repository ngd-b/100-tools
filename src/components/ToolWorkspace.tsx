"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Info, LoaderCircle } from "lucide-react";
import "./ToolWorkspace.css";

export function ToolPanel({
  title,
  detail,
  actions,
  children,
  className = "",
}: {
  title: string;
  detail?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`workspace-panel ${className}`}>
      <div className="workspace-panel-heading">
        <div>
          <h2>{title}</h2>
          {detail && <p>{detail}</p>}
        </div>
        {actions}
      </div>
      <div className="workspace-panel-body">{children}</div>
    </section>
  );
}

export function ToolHint({ children }: { children: ReactNode }) {
  return (
    <div className="workspace-hint">
      <Info size={16} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

export function ToolFeedback({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return children ? (
    <p
      role={error ? "alert" : "status"}
      className={`workspace-feedback ${error ? "is-error" : ""}`}
    >
      {children}
    </p>
  ) : null;
}

export function ToolSegments({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="workspace-segments" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ToolEmpty({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="workspace-empty">
      <div className="workspace-empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function ToolSuccess({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
}) {
  return (
    <section className="workspace-success">
      <span className="workspace-success-icon">
        <CheckCircle2 size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 role="status">{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {children}
    </section>
  );
}

export function BusyIcon({ busy }: { busy: boolean }) {
  return busy ? (
    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
  ) : null;
}
