import { FLEX_WINDOWS, SESSIONS, WEEKDAY_GYM_CUTOFF, type Exercise, type SessionId } from './data/training';
import { dayName } from './dates';

/**
 * Week-dependent prescription. Weeks 1–2 are the learning phase. A deload is
 * not scheduled automatically: the user switches it on (Settings) when fatigue
 * signals appear, and it applies to that calendar week only.
 */
export function phaseFor(week: number, deload = false): 'learn' | 'build' | 'deload' {
  if (deload) return 'deload';
  if (week <= 2) return 'learn';
  return 'build';
}

export function setsFor(ex: Exercise, week: number, deload = false): number {
  const phase = phaseFor(week, deload);
  if (ex.fromWeek && week < ex.fromWeek) return 0;
  if (phase === 'learn') return ex.sets.learn;
  if (phase === 'deload') return Math.max(1, Math.ceil(ex.sets.build / 2));
  return ex.sets.build;
}

export function rirFor(ex: Exercise, week: number, deload = false): string {
  const phase = phaseFor(week, deload);
  if (phase === 'learn') return /^\d/.test(ex.rir) ? '3–4' : ex.rir;
  if (phase === 'deload') return /^\d/.test(ex.rir) ? '4+' : ex.rir;
  return ex.rir;
}

export function activeExercises(sessionId: SessionId, week: number, deload = false) {
  return SESSIONS[sessionId].exercises.filter((ex) => setsFor(ex, week, deload) > 0);
}

const FLEX: ('lowerB' | 'upperB')[] = ['lowerB', 'upperB'];

/**
 * Sessions the week plan allows on a date. Saturday is Lower A and Sunday is
 * Upper A. Lower B may fall Mon–Wed and Upper B Tue–Fri; nothing is logged, so
 * on Tuesday and Wednesday both are listed and you pick the one not done yet.
 */
export function sessionsFor(iso: string): SessionId[] {
  const day = dayName(iso);
  if (day === 'Saturday') return ['lowerA'];
  if (day === 'Sunday') return ['upperA'];
  return FLEX.filter((id) => FLEX_WINDOWS[id].includes(day));
}

/**
 * Numbers behind every session-length estimate. Change them here and the
 * Program tab, Today view, dashboard and tests all follow.
 */
export const TIME_MODEL = {
  /** Time to do one set (a normal set of 5–15 reps). */
  workSec: 40,
  /** One-side-at-a-time sets (e.g. split squat) take twice as long. */
  perSideWorkSec: 80,
  /** Loading plates, moving to the next station, setting the seat: once per exercise. */
  setupMin: 1,
  /** One lighter set before a later heavy lift (do it, change the plates). */
  rampSetMin: 1,
} as const;

export interface SessionTime {
  /** Sum of the warm-up steps. */
  warmup: number;
  /** Per exercise: sets × (work + rest) + setup + lighter sets. */
  exercises: { id: string; sets: number; minutes: number; rampSets: number }[];
  /** All lighter sets before later lifts (already inside `exercises`). */
  ramp: number;
  finisher: number;
  total: number;
}

export const warmupMinutes = (sessionId: SessionId) => SESSIONS[sessionId].warmup.reduce((t, s) => t + s.minutes, 0);

/**
 * Session length, step by step (unrounded minutes):
 * warm-up steps + Σ exercise [sets × (work + rest) + setup + lighter sets] + finisher.
 * Rest is counted after every set. A superset partner adds only its work time
 * (its rest and setup are shared with the exercise it is paired with).
 */
export function sessionTime(sessionId: SessionId, week: number, deload = false): SessionTime {
  const s = SESSIONS[sessionId];
  const exercises = activeExercises(sessionId, week, deload).map((ex) => {
    const sets = setsFor(ex, week, deload);
    const work = ex.perSide ? TIME_MODEL.perSideWorkSec : TIME_MODEL.workSec;
    const rampSets = ex.rampSets ?? 0;
    const minutes = ex.supersetWith
      ? (sets * work) / 60
      : (sets * (work + ex.restSec)) / 60 + TIME_MODEL.setupMin + rampSets * TIME_MODEL.rampSetMin;
    return { id: ex.id, sets, minutes, rampSets };
  });
  const warmup = warmupMinutes(sessionId);
  const ramp = exercises.reduce((t, e) => t + e.rampSets * TIME_MODEL.rampSetMin, 0);
  const total = warmup + exercises.reduce((t, e) => t + e.minutes, 0) + s.finisherMin;
  return { warmup, exercises, ramp, finisher: s.finisherMin, total };
}

/** Session length rounded to the nearest minute, for display. */
export function estimateMinutes(sessionId: SessionId, week: number, deload = false): number {
  return Math.round(sessionTime(sessionId, week, deload).total);
}

/** What the schedule says for a date (used by the dashboard's "tomorrow"). */
export function plannedFor(iso: string): string {
  const ids = sessionsFor(iso);
  if (!ids.length) return 'No session — walk';
  const names = ids.map((id) => SESSIONS[id].short).join(' or ');
  return SESSIONS[ids[0]].slot === 'weekend' ? SESSIONS[ids[0]].name : `${names} if you can be at the gym by ${WEEKDAY_GYM_CUTOFF.label}`;
}
