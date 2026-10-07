import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(v: number) {
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

/** Round to the nearest `step` (default 50) — used for budget figures. */
export function roundTo(v: number, step = 50) {
  return Math.round(v / step) * step;
}
