import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getDayOfWeek(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('en-US', { weekday: 'long' }) as string;
}

export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function isWeekend(dateStr?: string): boolean {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function calcProgress(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

export function calcWeightProgress(current: number, start: number, target: number): number {
  if (target <= start) return 100;
  return Math.min(100, Math.round(((current - start) / (target - start)) * 100));
}

// Epley formula for estimated 1RM
export function calc1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'optimal': return 'text-emerald-600 bg-emerald-50';
    case 'acceptable': return 'text-sky-600 bg-sky-50';
    case 'borderline': return 'text-amber-600 bg-amber-50';
    case 'low': return 'text-orange-600 bg-orange-50';
    case 'discuss': return 'text-rose-600 bg-rose-50';
    default: return 'text-slate-600 bg-slate-50';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'optimal': return 'Optimal';
    case 'acceptable': return 'Acceptable';
    case 'borderline': return 'Borderline';
    case 'low': return 'Low';
    case 'discuss': return 'Discuss with Doctor';
    default: return status;
  }
}

export function getMacroColor(macro: 'protein' | 'carbs' | 'fat' | 'fiber' | 'calories'): string {
  switch (macro) {
    case 'protein': return '#0ea5e9';
    case 'carbs': return '#f59e0b';
    case 'fat': return '#8b5cf6';
    case 'fiber': return '#10b981';
    case 'calories': return '#ef4444';
    default: return '#64748b';
  }
}

export function getRIRLabel(rir: number): string {
  switch (rir) {
    case 0: return 'Max Effort';
    case 1: return 'Near Failure';
    case 2: return '2 in Reserve';
    case 3: return '3 in Reserve';
    default: return `${rir} in Reserve`;
  }
}

export function getRPE(rir: number): number {
  return 10 - rir;
}

// localStorage helpers
export function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function removeLocal(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  SELECTED_PLAN: 'health_selected_plan',
  COMPLETED_WORKOUTS: 'health_completed_workouts',
  PROGRESS_ENTRIES: 'health_progress_entries',
  STRENGTH_ENTRIES: 'health_strength_entries',
  DAILY_LOG: 'health_daily_log',
  USER_PREFERENCES: 'health_preferences',
};

