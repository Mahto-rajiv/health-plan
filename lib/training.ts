import { FLEX_WINDOWS, SESSIONS, WEEKDAY_GYM_CUTOFF, WEEK_PLAN, type Exercise, type SessionId } from './data/training';
import type { LoggedSet, WorkoutRecord } from './storage';
import { addDays, dayName, weekStart } from './dates';

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

export function sortedWorkouts(log: WorkoutRecord[]) {
  return [...log].sort((a, b) => (a.date === b.date ? a.completedAt.localeCompare(b.completedAt) : a.date.localeCompare(b.date)));
}

export interface TodayTraining {
  /** fixed = weekend session; flex = a weekday session you may do tonight; late = too late tonight. */
  kind: 'fixed' | 'flex' | 'late' | 'done' | 'rest';
  sessionId?: SessionId;
  note: string;
}

const FLEX: ('lowerB' | 'upperB')[] = ['lowerB', 'upperB'];

/** Weekday sessions still open on `iso` this week (not done, and today is in their window). */
export function openFlexSessions(log: WorkoutRecord[], iso: string): ('lowerB' | 'upperB')[] {
  const thisWeek = log.filter((w) => weekStart(w.date) === weekStart(iso));
  const day = dayName(iso);
  // Lower B first: its window closes on Wednesday.
  return FLEX.filter((id) => FLEX_WINDOWS[id].includes(day) && !thisWeek.some((w) => w.sessionId === id));
}

/** Local time is past the latest gym arrival for a weekday session. */
export function pastCutoff(now: Date): boolean {
  return now.getHours() * 60 + now.getMinutes() > WEEKDAY_GYM_CUTOFF.hour * 60 + WEEKDAY_GYM_CUTOFF.minute;
}

/**
 * What to do today. Saturday and Sunday are fixed. On weekdays, a short session
 * is offered if one is still open this week and you can be at the gym by 9 PM.
 * Missed sessions are never made up and two sessions never share a day.
 */
export function todayTraining(log: WorkoutRecord[], iso: string, now: Date = new Date()): TodayTraining {
  const day = dayName(iso);
  const doneToday = log.find((w) => w.date === iso);
  if (doneToday) return { kind: 'done', sessionId: doneToday.sessionId, note: 'Session logged. Eat Meal 4 and protect tonight’s sleep.' };
  if (day === 'Saturday') return { kind: 'fixed', sessionId: 'lowerA', note: WEEK_PLAN.Saturday.detail };
  if (day === 'Sunday') return { kind: 'fixed', sessionId: 'upperA', note: WEEK_PLAN.Sunday.detail };

  const open = openFlexSessions(log, iso);
  if (!open.length) {
    const done = log.filter((w) => weekStart(w.date) === weekStart(iso) && FLEX.some((id) => id === w.sessionId)).length;
    return {
      kind: 'rest',
      note:
        done >= 2
          ? 'Both weekday sessions are done. Walk 20–30 minutes if you can.'
          : 'No weekday session is due today. Walk 20–30 minutes if you can; missed sessions are skipped, not made up.',
    };
  }
  const id = open[0];
  if (pastCutoff(now)) {
    return { kind: 'late', sessionId: id, note: `It is past ${WEEKDAY_GYM_CUTOFF.label}: skip tonight. ${nextChance(iso, id)}` };
  }
  return {
    kind: 'flex',
    sessionId: id,
    note: `Go only if you can be at the gym by ${WEEKDAY_GYM_CUTOFF.label} (it closes at 10). ${SESSIONS[id].minutes}, ${SESSIONS[id].exercises.length} exercises. If not, skip it. Don’t make it up later.`,
  };
}

/** The next weekday in the session's window this week, as a sentence. */
export function nextChance(iso: string, id: 'lowerB' | 'upperB'): string {
  for (let i = 1; i <= 6; i++) {
    const d = addDays(iso, i);
    if (weekStart(d) !== weekStart(iso)) break;
    if (FLEX_WINDOWS[id].includes(dayName(d))) return `Next chance for ${SESSIONS[id].short}: ${dayName(d)}.`;
  }
  return `${SESSIONS[id].short} is skipped this week.`;
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

/** Average logged length of full (not short) sessions of this type, or null if none were timed. */
export function loggedMinutes(log: WorkoutRecord[], sessionId: SessionId): number | null {
  const times = log.filter((w) => w.sessionId === sessionId && !w.short && w.minutes).map((w) => w.minutes!);
  return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
}

/** Session length rounded to the nearest minute, for display. */
export function estimateMinutes(sessionId: SessionId, week: number, deload = false): number {
  return Math.round(sessionTime(sessionId, week, deload).total);
}

/** What the schedule says for a date (used by the dashboard's "tomorrow"). */
export function plannedFor(log: WorkoutRecord[], iso: string): string {
  const day = dayName(iso);
  if (day === 'Saturday' || day === 'Sunday') return SESSIONS[day === 'Saturday' ? 'lowerA' : 'upperA'].name;
  const open = openFlexSessions(log, iso);
  return open.length ? `${SESSIONS[open[0]].short} if you can be at the gym by ${WEEKDAY_GYM_CUTOFF.label}` : 'No session — walk';
}

/** Most recent logged sets for an exercise (any session), excluding a given date. */
export function lastPerformance(log: WorkoutRecord[], exerciseId: string, beforeDate?: string) {
  const sorted = sortedWorkouts(log).reverse();
  for (const w of sorted) {
    if (beforeDate && w.date >= beforeDate) continue;
    const sets = w.sets[exerciseId]?.filter((s) => s.done && s.reps);
    if (sets && sets.length) return { date: w.date, sets };
  }
  return null;
}

/** Epley estimated 1RM — a trend indicator, not a test result. */
export function e1rm(kg: number, reps: number) {
  if (reps <= 0) return 0;
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

export function bestE1rm(sets: LoggedSet[]) {
  let best = 0;
  for (const s of sets) if (s.done && s.kg && s.reps && s.kg > 0) best = Math.max(best, e1rm(s.kg, s.reps));
  return best;
}

/** Progression hint from last time's sets and the rep range. */
export function progressionHint(ex: Exercise, last: { sets: LoggedSet[] } | null, targetSets: number): string | null {
  if (!last) return null;
  const sets = last.sets.filter((s) => s.done);
  if (!sets.length) return null;
  const kg = sets[0].kg;
  const allTop = sets.length >= targetSets && sets.every((s) => (s.reps ?? 0) >= ex.repRange[1]);
  if (allTop && kg !== null) return `You hit the top of the rep range last time. Add weight: ${ex.increment}.`;
  if (kg !== null) return `Same weight (${kg} kg). Try to add a rep to any set.`;
  return 'Try to add a rep to any set.';
}

export function formatSet(s: LoggedSet, unit: Exercise['unit']) {
  if (unit === 'metres') return `${s.kg ?? '—'} kg × ${s.reps ?? '—'} m`;
  if (s.kg === null || s.kg === 0) return `${s.reps ?? '—'}`;
  return `${s.kg}×${s.reps ?? '—'}`;
}
