import type { BodyEntry, CheckInLog, MealLog } from './storage';
import { addDays, daysBetween, weekStart } from './dates';
import { DAILY, type PhaseId } from './config';

// ─── Weight decision system ───────────────────────────────────────────────────
// Phases and rates are in lib/config.ts; the reasoning is on the Nutrition page.
//  • Phase 0/1: the first goal is to STOP the loss (weekly average within
//    ±0.5 kg of the start). Still falling after 2 weeks → +200 kcal and see a
//    doctor about unexplained weight loss.
//  • Phase 2: +0.5–1.0 kg/month (Iraki 2019: 0.25–0.5%/week for novices; larger
//    surpluses add mostly fat — Helms 2023; Garthe 2013). After ~6 months of
//    gaining, +0.3–0.7 kg/month.
//  • Waist limits are derived from height: 50% of height = stop gaining, 47% =
//    slow down. At 180 cm the stop line (90 cm) is also the Asian-Indian cut-off
//    for men (Misra 2009).
//  • Checkpoint at the pre-loss weight (68 kg): reassess the 75 kg goal there.
// Daily weight swings by 0.5–1.5 kg, so only weekly averages are compared.
// Recalled weights (e.g. "68 kg six months ago") are charted but never used here.

export interface WeeklyPoint {
  weekStart: string;
  weight?: number;
  waist?: number;
  n: number;
}

const measured = (entries: BodyEntry[]) => entries.filter((e) => !e.recalled);

export function weeklyAverages(entries: BodyEntry[]): WeeklyPoint[] {
  const map = new Map<string, { w: number[]; c: number[] }>();
  for (const e of measured(entries)) {
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

export interface WeightLoss {
  /** Weight before the loss: the earliest recalled weight, else Settings. */
  before: number;
  /** Latest weekly-average weigh-in, else the start weight in Settings. */
  now: number;
  loss: number;
  /** True once at least one real weigh-in is logged in Progress. */
  confirmed: boolean;
}

/** How much weight was lost, from your own log (nothing hard-coded). */
export function weightLoss(entries: BodyEntry[], settings: { startWeightKg: number; preLossWeightKg: number }): WeightLoss {
  const weeks = weeklyAverages(entries).filter((w) => w.weight !== undefined);
  const recalled = recalledWeights(entries);
  const now = weeks.length ? weeks[weeks.length - 1].weight! : settings.startWeightKg;
  const before = recalled.length ? recalled[0].weightKg! : settings.preLossWeightKg;
  return { before, now, loss: before - now, confirmed: weeks.length > 0 };
}

/** 7-day trailing average for each measured weight; recalled weights are returned with `recalled`. */
export function rollingAverage(entries: BodyEntry[]) {
  const sorted = measured(entries).filter((e) => typeof e.weightKg === 'number').sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((e) => {
    const window = sorted.filter((x) => {
      const d = daysBetween(x.date, e.date);
      return d >= 0 && d < 7;
    });
    const avg = window.reduce((s, x) => s + (x.weightKg as number), 0) / window.length;
    return { date: e.date, weight: e.weightKg as number, avg: Math.round(avg * 10) / 10 };
  });
}

export function recalledWeights(entries: BodyEntry[]) {
  return entries.filter((e) => e.recalled && typeof e.weightKg === 'number').sort((a, b) => a.date.localeCompare(b.date));
}

/** Waist lines derived from height. */
export function waistLimits(heightCm: number) {
  return { review: Math.round(heightCm * 0.47), stop: Math.round(heightCm * 0.5) };
}

export type GainStatus =
  | 'not-enough-data'
  | 'still-losing'
  | 'stable'
  | 'too-slow'
  | 'on-track'
  | 'too-fast'
  | 'waist-watch'
  | 'waist-stop'
  | 'checkpoint';

export interface GainAssessment {
  status: GainStatus;
  ratePerMonth?: number;
  waistChange?: number;
  latestWeight?: number;
  latestWaist?: number;
  /** Change of the weekly average since the start (kg). */
  sinceStart?: number;
  targetRange: [number, number];
  headline: string;
  action: string;
  /** Show the "discuss unexplained weight loss with a doctor" prompt. */
  doctor?: boolean;
}

export interface AssessOptions {
  heightCm: number;
  startWeightKg: number;
  preLossWeightKg: number;
  phase: PhaseId;
  /** Whole weeks since the program started (0 in week 1). */
  weeksIn: number;
  /** Months spent in Phase 2 (for the slower late-stage rate). */
  monthsGaining: number;
}

export function assessGain(entries: BodyEntry[], opts: AssessOptions): GainAssessment {
  const all = weeklyAverages(entries);
  const weeks = all.filter((w) => w.weight !== undefined);
  const targetRange: [number, number] = opts.monthsGaining >= 6 ? [0.3, 0.7] : [DAILY.gainPerMonth[0], DAILY.gainPerMonth[1]];
  const latest = weeks[weeks.length - 1];
  const waistWeeks = all.filter((w) => w.waist !== undefined);
  const latestWaist = waistWeeks[waistWeeks.length - 1]?.waist;
  const limits = waistLimits(opts.heightCm);
  const sinceStart = latest?.weight !== undefined ? latest.weight - opts.startWeightKg : undefined;

  const base: Pick<GainAssessment, 'targetRange' | 'latestWeight' | 'latestWaist' | 'sinceStart'> = {
    targetRange,
    latestWeight: latest?.weight,
    latestWaist,
    sinceStart,
  };

  // Hard limits first.
  if (latestWaist !== undefined && latestWaist >= limits.stop) {
    return {
      ...base,
      status: 'waist-stop',
      headline: 'Waist has reached half your height',
      action: 'Stop the surplus: go back to Phase 1 quantities (Settings → Phase) for 6–8 weeks. Keep lifting. Reassess the 75 kg target with your waist and photos.',
    };
  }

  if (weeks.length < 2) {
    return {
      ...base,
      status: 'not-enough-data',
      headline: 'Building a baseline',
      action: 'Weigh 3–4 mornings a week (after the toilet, before food) and measure your waist weekly. Decisions start after 2 weeks of weigh-ins.',
    };
  }

  // Phase 0 and 1: has the loss stopped?
  if (opts.phase < 2) {
    const change = sinceStart as number;
    if (opts.weeksIn >= 2 && change < -0.5) {
      return {
        ...base,
        status: 'still-losing',
        headline: 'Still losing weight',
        action: 'You are still losing after 2 weeks. If you ate the plan on most days, add ~200 kcal: move to the next phase now (Settings → Phase), or add 350 ml milk a day. Re-check in 2 weeks.',
        doctor: true,
      };
    }
    if (change > 1.0) {
      return {
        ...base,
        status: 'too-fast',
        headline: 'Weight rising quickly',
        action: 'Early rises are mostly water and food in the gut from eating more. Stay in this phase; don’t add food. Re-check next week.',
      };
    }
    return {
      ...base,
      status: 'stable',
      headline: change >= -0.5 && change <= 0.5 ? 'Loss has stopped' : 'Weight is rising',
      action: opts.weeksIn >= 2 ? 'This is the Phase 0/1 goal. Move to the next phase on schedule.' : 'Keep eating all four meals. The first decision is at the end of week 2.',
    };
  }

  if (latest?.weight !== undefined && latest.weight >= opts.preLossWeightKg && latest.weight < opts.preLossWeightKg + 1) {
    return {
      ...base,
      status: 'checkpoint',
      headline: `${opts.preLossWeightKg} kg checkpoint — reassess the goal`,
      action: 'You are back at your pre-loss weight. Spend 4–6 weeks at Phase 1 quantities, compare photos, waist and lifts with your start, then decide whether to continue toward 75 kg.',
    };
  }

  if (weeks.length < 4) {
    return {
      ...base,
      status: 'not-enough-data',
      headline: 'Building a gain trend',
      action: `A gain rate needs about 4 weekly averages — ${4 - weeks.length} more to go. Don’t change food before then.`,
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

  if (latestWaist !== undefined && latestWaist >= limits.review) {
    return {
      ...base,
      status: 'waist-watch',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Waist is approaching the limit',
      action: 'Slow down: remove ~150–200 kcal (e.g. a third of the dinner rice) and hold for 4 weeks. If your waist keeps rising, go back to Phase 1 quantities.',
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
  if (ratePerMonth < 0) {
    return {
      ...base,
      status: 'still-losing',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Losing weight again',
      action: 'If you are eating all four meals, add ~200 kcal (e.g. +350 ml milk a day) and re-check in 2–3 weeks.',
      doctor: true,
    };
  }
  if (ratePerMonth < targetRange[0]) {
    return {
      ...base,
      status: 'too-slow',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Gaining slower than planned',
      action: 'First check you are eating all 4 meals on most days. If you are, add ~150 kcal (e.g. +250 ml milk at Meal 1, or +1 roti at dinner) and re-check in 3–4 weeks.',
    };
  }
  if (ratePerMonth > targetRange[1] + 0.2) {
    return {
      ...base,
      status: 'too-fast',
      ratePerMonth: rounded,
      waistChange,
      headline: 'Gaining faster than planned',
      action: 'Remove ~150 kcal a day (e.g. one roti or a third of the dinner rice) and re-check in 3–4 weeks.',
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

export const DOCTOR_WEIGHT_LOSS = 'Discuss unexplained weight loss with a doctor, especially if you are eating the plan, or if you also have tiredness, fever, night sweats, or changes in appetite or bowel habit.';

// ─── Nutrition adherence ───────────────────────────────────────────

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

export function averageSleep(checkins: CheckInLog, today: string, days = 7) {
  const vals: number[] = [];
  for (let i = 0; i < days; i++) {
    const v = checkins[addDays(today, -i)]?.sleepHours;
    if (typeof v === 'number') vals.push(v);
  }
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}
