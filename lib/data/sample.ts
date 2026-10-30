import type { BodyEntry, CheckInLog, LoggedSet, MealLog, WorkoutRecord } from '../storage';
import { SESSION_ORDER, type SessionId } from './training';
import { addDays } from '../dates';

// ─── Illustrative sample data ─────────────────────────────────────────────────
// Shown ONLY until you have logged enough real data, and always labelled
// "Sample". It models a realistic first 12 weeks for a beginner: ~0.7 kg/month
// weight gain with daily water noise, a deload in week 9, a couple of missed
// sessions, and typical beginner strength gains. Deterministic (seeded) so the
// server and browser render identical charts.

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
    const trend = 64 + (d / 30) * 0.7;
    const noise = (r() - 0.5) * 1.0;
    const entry: BodyEntry = { date: addDays(SAMPLE_START, d), weightKg: Math.round((trend + noise) * 10) / 10 };
    if (d % 7 === 0) entry.waistCm = Math.round((77 + (d / 84) * 0.8 + (r() - 0.5) * 0.4) * 10) / 10;
    out.push(entry);
  }
  return out;
}

const START_LOADS: Record<string, number> = { bench: 35, squat: 40, ohp: 22.5, pullup: -30, deadlift: 60 };
const WEEKLY_GAIN: Record<string, number> = { bench: 1.25, squat: 2.5, ohp: 0.6, pullup: 2, deadlift: 3.5 };

function buildWorkouts(): WorkoutRecord[] {
  const out: WorkoutRecord[] = [];
  const skip = new Set(['3-1', '6-3', '10-2']); // a few missed sessions
  let rot = 0;
  for (let w = 0; w < WEEKS; w++) {
    const liftDays = [0, 1, 3, 4];
    for (let i = 0; i < liftDays.length; i++) {
      if (skip.has(`${w}-${i}`)) continue;
      const sessionId = SESSION_ORDER[rot % 4] as SessionId;
      rot++;
      const date = addDays(SAMPLE_START, w * 7 + liftDays[i]);
      const deload = w === 8;
      const sets: Record<string, LoggedSet[]> = {};
      for (const [lift, start] of Object.entries(START_LOADS)) {
        const inSession =
          (lift === 'bench' && sessionId === 'upperA') ||
          (lift === 'squat' && sessionId === 'lowerA') ||
          ((lift === 'ohp' || lift === 'pullup') && sessionId === 'upperB') ||
          (lift === 'deadlift' && sessionId === 'lowerB');
        if (!inSession) continue;
        // Linear gains, paused for the deload week (week index 8).
        const progressWeeks = w > 8 ? w - 1 : w;
        const load = Math.round((start + WEEKLY_GAIN[lift] * progressWeeks) * 2) / 2;
        const kg = deload ? Math.round(load * 0.9 * 2) / 2 : load;
        const reps = lift === 'deadlift' ? 5 : lift === 'pullup' ? 6 : 6 + (w % 3);
        const n = w < 2 || deload ? 2 : 3;
        sets[lift] = Array.from({ length: n }, (_, k) => ({ kg, reps: Math.max(1, reps - (k === n - 1 ? 1 : 0)), done: true }));
      }
      out.push({ id: `sample-${w}-${i}`, date, sessionId, sets, completedAt: `${date}T19:30:00` });
    }
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
export const SAMPLE_WORKOUTS = buildWorkouts();
export const SAMPLE_MEALS = buildMeals();
export const SAMPLE_CHECKINS = buildCheckIns();
export const SAMPLE_END = addDays(SAMPLE_START, WEEKS * 7 - 1);
