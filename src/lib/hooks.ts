"use client";

import { useCallback, useSyncExternalStore } from "react";

/** prefers-reduced-motion as an external store (SSR snapshot = false). */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((cb: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);
  return useSyncExternalStore(subscribe, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
}

/** window.scrollY > threshold as an external store. */
export function useScrolled(threshold = 24): boolean {
  const subscribe = useCallback((cb: () => void) => { window.addEventListener("scroll", cb, { passive: true }); return () => window.removeEventListener("scroll", cb); }, []);
  return useSyncExternalStore(subscribe, () => window.scrollY > threshold, () => false);
}

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const emit = (key: string) => listeners.get(key)?.forEach((l) => l());

/**
 * localStorage-backed string value as an external store. Writes notify subscribers in this tab.
 * Returns [value, setValue]; value is `fallback` on the server and when storage is unavailable.
 */
export function useLocalStorage(key: string, fallback: string): [string, (v: string) => void] {
  const subscribe = useCallback((cb: Listener) => {
    const set = listeners.get(key) ?? new Set<Listener>();
    set.add(cb); listeners.set(key, set);
    const onStorage = (e: StorageEvent) => { if (e.key === key) cb(); };
    window.addEventListener("storage", onStorage);
    return () => { set.delete(cb); window.removeEventListener("storage", onStorage); };
  }, [key]);
  const get = () => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const value = useSyncExternalStore(subscribe, get, () => fallback);
  const setValue = useCallback((v: string) => { try { localStorage.setItem(key, v); } catch {} emit(key); }, [key]);
  return [value, setValue];
}
