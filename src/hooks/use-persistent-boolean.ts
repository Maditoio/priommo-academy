"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(key: string, callback: () => void) {
  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === key) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Reads/writes a boolean flag from localStorage without causing hydration
 * mismatches — the server snapshot is always `false`, and the real value is
 * synced in via `useSyncExternalStore` right after mount.
 */
export function usePersistentBoolean(key: string) {
  const value = useSyncExternalStore(
    useCallback((callback) => subscribe(key, callback), [key]),
    () => window.localStorage.getItem(key) === "1",
    () => false
  );

  const setValue = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const current = window.localStorage.getItem(key) === "1";
      const resolved = typeof next === "function" ? next(current) : next;
      window.localStorage.setItem(key, resolved ? "1" : "0");
      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key]
  );

  return [value, setValue] as const;
}
