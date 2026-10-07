import type { BodyEntry, CheckInLog, MealLog, WorkoutRecord } from './storage';
import { addDays, daysBetween, weekStart } from './dates';
import { SESSIONS, SESSION_ORDER } from './data/training';
import { bestE1rm } from './training';

// ─── Weight-gain decision system ──────────────────────────────────────────────
// Targets (see Nutrition page for sources):
//  • +0.3–0.6 kg/month (~0.1–0.2% of body weight per week). Larger surpluses
//    add mostly fat, not more muscle or strength (Helms 2023; Garthe 2013).
//  • After ~6 months: +0.25–0.5 kg/month.
//  • Waist: < 90 cm is the Asian-Indian cut-off for men (Misra 2009) and also
//    half of 180 cm. 85 cm is the "slow down and look" line.
//  • 72 kg checkpoint: BMI 23 is the Asian action point (WHO 2004), so the
//    75 kg goal is reassessed there rather than assumed.
// Daily weight swings by 0.5–1.5 kg with water, salt and gut content, so the
// system only compares weekly averages, never single weigh-ins.

export interface WeeklyPoint {
  weekStart: string;
  weight?: number;
  waist?: number;
  n: number;
}

export function weeklyAverages(entries: BodyEntry[]): WeeklyPoint[] {
  const map = new Map<string, { w: number[]; c: number[] }>();
  for (const e of entries) {
    const k = weekStart(e.date);
    const bucket = map.get(k) ?? { w: [], c: [] };
    if (typeof e.weightKg === 'number') bucket.w.push(e.weightKg);
    if (typeof e.waistCm === 'number') bucket.c.push(e.waistCm);
    map.set(k, bucket);
  }
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : undefined);
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ weekStart: k, weight: avg(v.w), waist: avg(v.c), n: v.w.length }));
}

/** 7-day trailing average for each weight entry (for the chart's trend line). */
export function rollingAverage(entries: BodyEntry[]) {
  const sorted = entries.filter((e) => typeof e.weightKg === 'number').sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((e) => {
    const window = sorted.filter((x) => {
      const d = daysBetween(x.date, e.date);
      return d >= 0 && d < 7;
    });
    const avg = window.reduce((s, x) => s + (x.weightKg as number), 0) / window.length;
    return { date: e.date, weight: e.weightKg as number, avg: Math.round(avg * 10) / 10 };
  });
}

export type GainStatus = 'not-enough-data' | 'too-slow' | 'on-track' | 'too-fast' | 'waist-watch' | 'waist-stop' | 'checkpoint';

export interface GainAssessment {
  status: GainStatus;
  ratePerMonth?: number;
  waistChange?: number;
  latestWeight?: number;
  latestWaist?: number;
  targetRange: [number, number];
  headline: string;
  action: string;
}

export function assessGain(entries: BodyEntry[], opts: { heightCm: number; monthsIn: number }): GainAssessment {
  const weeks = weeklyAverages(entries).filter((w) => w.weight !== undefined);
  const lateStage = opts.monthsIn >= 6;
  const targetRange: [number, number] = lateStage ? [0.25, 0.5] : [0.3, 0.6];
  const latest = weeks[weeks.length - 1];
  const waistWeeks = weeklyAverages(entries).filter((w) => w.waist !== undefined);
  const latestWaist = waistWeeks[waistWeeks.length - 1]?.waist;

  const base: Pick<GainAssessment, 'targetRange' | 'latestWeight' | 'latestWaist'> = {
    targetRange,
    latestWeight: latest?.weight,
    latestWaist,
  };

  // Hard limits first.
  if (latestWaist !== undefined && latestWaist / opts.heightCm >= 0.5) {
    return {
      ...base,
      status: 'waist-stop',
      headline: 'Waist has reached half your height',
      action: 'Stop the surplus and eat at maintenance (≈ −300 kcal from the plan) for 6–8 weeks. Keep lifting. Reassess the 75 kg target with your waist and photos.',
    };
  }

  if (weeks.length < 4) {
    return {
      ...base,
      status: 'not-enough-data',
      headline: 'Building a baseline',
      action: `Weigh 3–4 mornings a week (after the toilet, before food) and measure waist weekly. A trend appears after about 4 weeks — ${Math.max(0, 4 - weeks.length)} more to go. Don’t change calories before then.`,
    };
  }

  // Compare the last week's average with the average 3 weeks earlier.
  const recent = weeks[weeks.length - 1];
  const earlier = weeks[weeks.length - 4];
  const spanWeeks = Math.max(1, daysBetween(earlier.weekStart, recent.weekStart) / 7);
  const ratePerMonth = (((recent.weight as number) - (earlier.weight as number)) / spanWeeks) * 4.35;

  const waistNow = recent.waist ?? latestWaist;
  const waistThen = earlier.waist;
  const waistChange = waistNow !== undefined && waistThen !== undefined ? waistNow - waistThen : undefined;
  const weightChange = (recent.weight as number) - (earlier.weight as number);
  const rounded = Math.round(ratePerMonth * 100) / 100;

  if (latestWaist !== undefined && latestWaist / opts.heightCm >= 0.47) {
    return {
      ...base,
      status: 'waist-watch',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Waist is approaching the limit',
      action: 'Slow down: remove ~150–200 kcal (e.g. half the rice/roti at dinner) and hold there for 4 weeks. If your waist keeps rising, move to maintenance.',
    };
  }

  if (waistChange !== undefined && weightChange > 0.3 && waistChange / weightChange > 1.2) {
    return {
      ...base,
      status: 'too-fast',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Waist is rising faster than weight',
      action: 'More of the gain is likely fat. Remove ~150 kcal a day for the next 4 weeks and check that you are progressing in the gym.',
    };
  }

  if ((latest?.weight ?? 0) >= 72 && (latest?.weight ?? 0) < 73) {
    return {
      ...base,
      status: 'checkpoint',
      ratePerMonth: rounded,
      waistChange,
      headline: '72 kg checkpoint — reassess the goal',
      action: 'Spend 4–6 weeks at maintenance. Compare photos, waist and lifts with your start. If you are happy with leanness and still progressing, resume the slow rate toward 74–76 kg. If not, stay here and recomposition will continue.',
    };
  }

  if (ratePerMonth < targetRange[0]) {
    return {
      ...base,
      status: 'too-slow',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Gaining slower than planned',
      action: 'First check you are eating all 4 meals on most days. If you are, add ~150 kcal (e.g. +200 ml milk at Meal 1, or +1 roti at dinner) and re-check in 3–4 weeks.',
    };
  }
  if (ratePerMonth > targetRange[1] + 0.2) {
    return {
      ...base,
      status: 'too-fast',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Gaining faster than planned',
      action: 'In the first month this can be water and glycogen from more food and training. After that, remove ~150 kcal a day (e.g. one roti or a third of the dinner rice) and re-check in 3–4 weeks.',
    };
  }
  return {
    ...base,
    status: 'on-track',
    ratePerMonth: rounded,
    waistChange,
    headline: 'On track',
    action: 'Keep everything the same. Re-assess every 4 weeks.',
  };
}

// ─── Training & nutrition adherence ───────────────────────────────────────────

export function sessionsPerWeek(log: WorkoutRecord[], weeks: number, today: string) {
  const out: { weekStart: string; sessions: number }[] = [];
  const thisWeek = weekStart(today);
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = addDays(thisWeek, -7 * i);
    out.push({ weekStart: ws, sessions: log.filter((w) => weekStart(w.date) === ws).length });
  }
  return out;
}

export function mealAdherence(meals: MealLog, weeks: number, today: string) {
  const out: { weekStart: string; pct: number | null }[] = [];
  const thisWeek = weekStart(today);
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = addDays(thisWeek, -7 * i);
    let eaten = 0;
    let days = 0;
    for (let d = 0; d < 7; d++) {
      const iso = addDays(ws, d);
      if (iso > today) break;
      const day = meals[iso];
      if (day) {
        days++;
        eaten += day.filter(Boolean).length;
      }
    }
    out.push({ weekStart: ws, pct: days ? Math.round((eaten / (days * 4)) * 100) : null });
  }
  return out;
}

export const MAIN_LIFTS = SESSION_ORDER.flatMap((id) =>
  SESSIONS[id].exercises.filter((e) => e.isMainLift).map((e) => ({ id: e.id, name: e.name })),
);

export function strengthSeries(log: WorkoutRecord[]) {
  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date));
  return MAIN_LIFTS.map((lift) => ({
    ...lift,
    points: sorted
      .map((w) => ({ date: w.date, e1rm: Math.round(bestE1rm(w.sets[lift.id] ?? []) * 10) / 10 }))
      .filter((p) => p.e1rm > 0),
  }));
}

export function averageSleep(checkins: CheckInLog, today: string, days = 7) {
  const vals: number[] = [];
  for (let i = 0; i < days; i++) {
    const v = checkins[addDays(today, -i)]?.sleepHours;
    if (typeof v === 'number') vals.push(v);
  }
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}
