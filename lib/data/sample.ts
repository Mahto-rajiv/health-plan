import type { BodyEntry, CheckInLog, MealLog } from '../storage';
import { addDays } from '../dates';

// ─── Illustrative sample data ─────────────────────────────────────────────────
// Shown ONLY until you have logged enough real data, and always labelled
// "Sample". It models a realistic first 12 weeks for a beginner: ~0.7 kg/month
// weight gain with daily water noise and a few missed meals. Deterministic
// (seeded) so the server and browser render identical charts.

export const SAMPLE_START = '2026-07-13';
const WEEKS = 12;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildBody(): BodyEntry[] {
  const r = rng(7);
  const out: BodyEntry[] = [];
  for (let d = 0; d < WEEKS * 7; d++) {
    if (d % 7 === 2 || d % 7 === 5 || d % 7 === 6) continue; // ~4 weigh-ins a week
    const trend = 70 + (d / 30) * 0.7; // made-up start weight, not yours
    const noise = (r() - 0.5) * 1.0;
    const entry: BodyEntry = { date: addDays(SAMPLE_START, d), weightKg: Math.round((trend + noise) * 10) / 10 };
    if (d % 7 === 0) entry.waistCm = Math.round((80 + (d / 84) * 0.8 + (r() - 0.5) * 0.4) * 10) / 10;
    out.push(entry);
  }
  return out;
}

function buildMeals(): MealLog {
  const r = rng(11);
  const out: MealLog = {};
  for (let d = 0; d < WEEKS * 7; d++) {
    const miss = () => r() > 0.88;
    out[addDays(SAMPLE_START, d)] = [true, !miss(), !miss(), !miss()];
  }
  return out;
}

function buildCheckIns(): CheckInLog {
  const r = rng(23);
  const out: CheckInLog = {};
  for (let d = 0; d < WEEKS * 7; d++) {
    out[addDays(SAMPLE_START, d)] = {
      sleepHours: Math.round((6.4 + r() * 1.6 + d / 200) * 2) / 2,
      energy: (3 + Math.round(r() * 2)) as 3 | 4 | 5,
    };
  }
  return out;
}

export const SAMPLE_BODY = buildBody();
export const SAMPLE_MEALS = buildMeals();
export const SAMPLE_CHECKINS = buildCheckIns();
export const SAMPLE_END = addDays(SAMPLE_START, WEEKS * 7 - 1);
