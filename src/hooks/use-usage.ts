"use client";

import { useSyncExternalStore } from "react";

type Counts = Record<string, number>;

const EMPTY: Counts = {};
const listeners = new Set<() => void>();
let counts: Counts | null = null;
let loaded = false;
let request: Promise<void> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function load(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (request) return request;
  request = (async () => {
    try {
      const response = await fetch("/api/usage", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { counts?: unknown };
      if (data && typeof data.counts === "object" && data.counts !== null) {
        counts = data.counts as Counts;
        loaded = true;
      }
    } catch {
      // Usage counts are optional; the tools keep working without them.
    } finally {
      request = null;
      emit();
    }
  })();
  return request;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
}

function snapshot() {
  return counts;
}

function serverSnapshot() {
  return null;
}

export function useUsageCounts(): Counts {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot) ?? EMPTY;
}

export async function recordUsage(toolId: string): Promise<void> {
  try {
    // Load the current counts first so a slower GET cannot overwrite the increment.
    await load();
    const response = await fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { count?: unknown };
    if (typeof data.count !== "number") return;
    counts = { ...(counts ?? {}), [toolId]: data.count };
    emit();
  } catch {
    // Counting is best-effort and must never break a tool.
  }
}
