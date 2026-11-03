'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { PlanId } from './data/meal-plans';

// ─── Persisted data shape ─────────────────────────────────────────────────────
// The app is view-only. The one thing it remembers, in localStorage, is which
// meal plan you picked. Nothing you type is stored.

export interface Settings {
  planId: PlanId;
}

export const DEFAULT_SETTINGS: Settings = { planId: 'vegetarian' };

const VALID_PLANS: PlanId[] = ['vegetarian', 'egg', 'nonveg'];

/** Older versions saved more fields under the same key (weights, phase, start date…): only the plan is read. */
function migrateSettings(s: Partial<Settings>): Settings {
  return { planId: s.planId && VALID_PLANS.includes(s.planId) ? s.planId : 'vegetarian' };
}

const PREFIX = 'hp:v2:';
export const KEYS = {
  settings: `${PREFIX}settings`,
} as const;
export type StoreKey = (typeof KEYS)[keyof typeof KEYS];

// ─── Tiny external store over localStorage ────────────────────────────────────

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) {
      cache.clear();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      // Merge objects with the fallback so new settings fields get defaults.
      value =
        fallback && typeof fallback === 'object' && !Array.isArray(fallback) && parsed && typeof parsed === 'object'
          ? ({ ...fallback, ...parsed } as T)
          : (parsed as T);
    } catch {
      value = fallback;
    }
  }
  if (key === KEYS.settings) value = migrateSettings(value as Partial<Settings>) as T;
  cache.set(key, { raw, value });
  return value;
}

function writeStore<T>(key: StoreKey, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the UI keeps working in memory.
    cache.set(key, { raw: JSON.stringify(value), value });
  }
  emit();
}

/**
 * Persistent state. The server render and the first client render use the
 * fallback (no hydration mismatch); the stored value appears right after.
 */
export function useStore<T>(key: StoreKey, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeStore(key, resolved);
    },
    // fallback objects are module constants at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}

export const useSettings = () => useStore<Settings>(KEYS.settings, DEFAULT_SETTINGS);
