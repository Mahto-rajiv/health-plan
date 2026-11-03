import { DAYS, type DayName } from './data/meal-plans';

// All dates are local-calendar ISO strings (YYYY-MM-DD). Never use
// toISOString() for "today": it is UTC and is wrong after midnight in India.

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000);
}

export function dayName(iso: string): DayName {
  // getDay(): 0 = Sunday
  const idx = (fromISO(iso).getDay() + 6) % 7;
  return DAYS[idx];
}

/** Monday of the week containing `iso`. */
export function weekStart(iso: string): string {
  const idx = (fromISO(iso).getDay() + 6) % 7;
  return addDays(iso, -idx);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "7 Oct" — locale-independent so server and client render identically. */
export function shortDate(iso: string): string {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function longDate(iso: string): string {
  const d = fromISO(iso);
  return `${dayName(iso)}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Program week (1-based) for a date, given the program start date. */
export function programWeek(startISO: string, iso: string): number {
  return Math.max(1, Math.floor(daysBetween(weekStart(startISO), iso) / 7) + 1);
}

/** "Starts Mon 9 Nov" before the program start date, otherwise null (show the week number). */
export function startsLabel(startISO: string, iso: string): string | null {
  return iso < startISO ? `Starts ${dayName(startISO).slice(0, 3)} ${shortDate(startISO)}` : null;
}
