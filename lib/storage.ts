'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { PlanId } from './data/meal-plans';
import { PROFILE, type PhaseId } from './config';

// ─── Persisted data shapes ────────────────────────────────────────────────────
// Everything lives in localStorage under versioned keys. The shapes are plain
// JSON so they can later be sent to a backend unchanged.

export interface Settings {
  planId: PlanId;
  /** ISO date (YYYY-MM-DD) the program started — drives the week number and the phase. */
  programStart: string;
  /** 'auto' follows the program week; a number pins that phase. */
  phase: 'auto' | PhaseId;
  startWeightKg: number;
  /** Weight before the recent loss; the first checkpoint. */
  preLossWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  /** Optional self-estimate of what you eat now (before starting the plan). */
  intakeKcal?: number;
  intakeProtein?: number;
  /** Monday (YYYY-MM-DD) of a week the user marked as a deload week. */
  deloadWeek?: string | null;
  /** Optional first name shown in the dashboard greeting. */
  firstName?: string;
}

export interface BodyEntry {
  date: string; // YYYY-MM-DD
  weightKg?: number;
  waistCm?: number;
  /** A weight remembered or from an old record, not a weigh-in: charted, never used for decisions. */
  recalled?: boolean;
  /** A progress photo was taken this day (the photo stays on your phone). */
  photo?: boolean;
}

/** Four booleans per date: did you eat Meal 1–4 as planned? */
export type MealLog = Record<string, [boolean, boolean, boolean, boolean]>;

export interface CheckIn {
  sleepHours?: number;
  energy?: 1 | 2 | 3 | 4 | 5;
  soreness?: 1 | 2 | 3 | 4 | 5;
  cardioMin?: number;
  steps?: number;
}
export type CheckInLog = Record<string, CheckIn>;

/** The owner starts the program on Monday 9 Nov 2026 (nothing was done before). */
const PROGRAM_START = '2026-11-09';

export const DEFAULT_SETTINGS: Settings = {
  planId: 'vegetarian',
  programStart: PROGRAM_START,
  phase: 'auto',
  startWeightKg: PROFILE.weightKg,
  preLossWeightKg: PROFILE.preLossWeightKg,
  targetWeightKg: PROFILE.longTermTargetKg,
  heightCm: PROFILE.heightCm,
  deloadWeek: null,
};

/** Price overrides, ₹ per kg by food id. Missing foods use lib/data/prices.ts. */
export type PriceOverrides = Partial<Record<string, number>>;

const VALID_PLANS: PlanId[] = ['vegetarian', 'egg', 'nonveg'];

/**
 * Settings saved by older versions: the "Preferred" plan no longer exists, and
 * 66 kg was the old default start weight (the real figure is 64 kg). The training
 * time and season settings no longer exist. Older versions defaulted the start to
 * 6 Oct 2026, which made the app show week 5 before anything had started: a saved
 * start before 9 Nov moves to 9 Nov, and a phase pinned under it goes back to Auto.
 */
function migrateSettings(s: Settings & { trainingTime?: unknown; season?: unknown }): Settings {
  const { trainingTime: _drop, season: _season, ...rest } = s;
  void _drop;
  void _season;
  const early = !rest.programStart || rest.programStart < PROGRAM_START;
  return {
    ...rest,
    ...(early ? { programStart: PROGRAM_START } : {}),
    planId: VALID_PLANS.includes(rest.planId) ? rest.planId : 'vegetarian',
    startWeightKg: rest.startWeightKg === 66 ? PROFILE.weightKg : rest.startWeightKg,
    phase: early ? 'auto' : rest.phase === 'auto' || rest.phase === 0 || rest.phase === 1 || rest.phase === 2 ? rest.phase : 'auto',
  };
}

const PREFIX = 'hp:v2:';
export const KEYS = {
  settings: `${PREFIX}settings`,
  body: `${PREFIX}body`,
  // Workout logs are no longer written. The keys stay so Reset and backups still cover data saved by older versions.
  workouts: `${PREFIX}workouts`,
  draft: `${PREFIX}draft`,
  meals: `${PREFIX}meals`,
  checkins: `${PREFIX}checkins`,
  prices: `${PREFIX}prices`,
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
  if (key === KEYS.settings) value = migrateSettings(value as Settings) as T;
  cache.set(key, { raw, value });
  return value;
}

/** Direct read for client-only code paths (event handlers, lazy initialisers). */
export function readStore<T>(key: StoreKey, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  return read(key, fallback);
}

export function writeStore<T>(key: StoreKey, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the UI keeps working in memory.
    cache.set(key, { raw: JSON.stringify(value), value });
  }
  emit();
}

export function removeStore(key: StoreKey) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  cache.delete(key);
  emit();
}

/**
 * Persistent state. The server render and the first client render use the
 * fallback (no hydration mismatch); the stored value appears right after.
 * `hydrated` tells components when the stored value is available.
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

const noopSubscribe = () => () => {};
/** False during SSR and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

// Convenience hooks with stable fallbacks
const EMPTY_ARRAY: never[] = [];
const EMPTY_OBJECT = {};

export const useSettings = () => useStore<Settings>(KEYS.settings, DEFAULT_SETTINGS);
export const useBodyLog = () => useStore<BodyEntry[]>(KEYS.body, EMPTY_ARRAY);
export const useMealLog = () => useStore<MealLog>(KEYS.meals, EMPTY_OBJECT as MealLog);
export const useCheckIns = () => useStore<CheckInLog>(KEYS.checkins, EMPTY_OBJECT as CheckInLog);
export const usePriceOverrides = () => useStore<PriceOverrides>(KEYS.prices, EMPTY_OBJECT as PriceOverrides);


export function exportAll(): string {
  const out: Record<string, unknown> = {};
  for (const k of Object.values(KEYS)) {
    const raw = readRaw(k);
    if (raw !== null) out[k] = JSON.parse(raw);
  }
  return JSON.stringify({ app: 'health-plan', version: 2, exportedAt: new Date().toISOString(), data: out }, null, 2);
}

export function importAll(json: string) {
  const parsed = JSON.parse(json) as { data?: Record<string, unknown> };
  if (!parsed?.data || typeof parsed.data !== 'object') throw new Error('Not a Health Plan export file');
  const allowed = new Set<string>(Object.values(KEYS));
  for (const [k, v] of Object.entries(parsed.data)) {
    if (allowed.has(k)) window.localStorage.setItem(k, JSON.stringify(v));
  }
  cache.clear();
  emit();
}

export function clearAll() {
  for (const k of Object.values(KEYS)) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  cache.clear();
  emit();
}
