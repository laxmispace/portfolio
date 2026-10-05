import { useSyncExternalStore } from "react";

// Which blog posts this visitor has opened, remembered in localStorage so the
// reading trail can show progress across visits. Fails quietly if storage is blocked.
const STORAGE_KEY = "blog-read-posts";
const listeners = new Set<() => void>();

function load(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

let readIds = typeof window !== "undefined" ? load() : [];

export function markPostRead(id: number) {
  if (readIds.includes(id)) return;
  readIds = [...readIds, id];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds)); } catch { /* storage blocked */ }
  listeners.forEach((fn) => fn());
}

export function useReadPosts(): number[] {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    () => readIds,
    () => readIds,
  );
}
