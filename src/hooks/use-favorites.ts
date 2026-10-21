"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { legacyToolIds, tools } from "@/data/tools";
import { normalizeFavorites } from "@/lib/favorites";

const KEY = "100-tools-favorites";
const EVENT = "100-tools-favorites-change";
const validIds = new Set(tools.map((tool) => tool.id));
let memorySnapshot = "[]";
let useMemory = false;

function read() {
  if (useMemory) return memorySnapshot;
  try {
    return window.localStorage.getItem(KEY) ?? memorySnapshot;
  } catch {
    return memorySnapshot;
  }
}

function write(value: string) {
  memorySnapshot = value;
  try { window.localStorage.setItem(KEY, value); useMemory = false; }
  catch { useMemory = true; }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      memorySnapshot = "[]";
      useMemory = false;
      listener();
    }
  };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const ids = useMemo(() => normalizeFavorites(raw, validIds, legacyToolIds), [raw]);
  const favorites = useMemo(() => new Set(ids), [ids]);

  useEffect(() => {
    const normalized = JSON.stringify(ids);
    if (raw !== normalized) write(normalized);
  }, [ids, raw]);

  const toggle = useCallback((id: string) => {
    if (!validIds.has(id)) return;
    const next = new Set(normalizeFavorites(read(), validIds, legacyToolIds));
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(JSON.stringify([...next]));
  }, []);

  return { favorites, toggle };
}
