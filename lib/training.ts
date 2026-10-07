import { SESSIONS, SESSION_ORDER, DEFAULT_WEEK, type Exercise, type SessionId } from './data/training';
import type { LoggedSet, WorkoutRecord } from './storage';
import { dayName, weekStart, daysBetween } from './dates';

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

/** Next session in the rotation, based on the last completed workout. */
export function nextSession(log: WorkoutRecord[]): SessionId {
  const sorted = sortedWorkouts(log);
  const last = sorted[sorted.length - 1];
  if (!last) return SESSION_ORDER[0];
  const idx = SESSION_ORDER.indexOf(last.sessionId);
  return SESSION_ORDER[(idx + 1) % SESSION_ORDER.length];
}

export interface TodayTraining {
  kind: 'lift' | 'lift-optional' | 'done' | 'cardio' | 'rest';
  sessionId?: SessionId;
  note: string;
}

/**
 * What to do today. Lifting follows the rotation, so a missed day simply moves
 * the sequence back. Wednesday/Saturday become catch-up slots only if fewer than
 * 4 sessions are done this week and no lift happened yesterday.
 */
export function todayTraining(log: WorkoutRecord[], today: string): TodayTraining {
  const day = dayName(today);
  const plan = DEFAULT_WEEK[day];
  const doneToday = log.find((w) => w.date === today);
  if (doneToday) return { kind: 'done', sessionId: doneToday.sessionId, note: 'Session logged. Recover well tonight.' };

  const thisWeek = log.filter((w) => weekStart(w.date) === weekStart(today));
  const next = nextSession(log);
  const liftedYesterday = log.some((w) => daysBetween(w.date, today) === 1);

  if (plan.type === 'lift') {
    const isDefault = plan.session === next;
    return {
      kind: 'lift',
      sessionId: next,
      note: isDefault
        ? plan.detail
        : `The rotation has moved: ${SESSIONS[next].short} is next (normally ${plan.label} today). Just continue the sequence.`,
    };
  }
  if (thisWeek.length < 4 && (day === 'Wednesday' || day === 'Saturday') && !liftedYesterday && log.length > 0) {
    const behind = expectedByNow(today) - thisWeek.length;
    if (behind > 0) {
      return {
        kind: 'lift-optional',
        sessionId: next,
        note: `Catch-up slot: you have ${thisWeek.length} session${thisWeek.length === 1 ? '' : 's'} this week. If you feel fresh, do ${SESSIONS[next].short} instead of cardio. Otherwise keep the plan.`,
      };
    }
  }
  return { kind: plan.type === 'cardio' ? 'cardio' : 'rest', note: plan.detail };
}

/** Lifting sessions that would normally be done by the end of `today`. */
function expectedByNow(today: string) {
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  const idx = order.indexOf(dayName(today));
  return order.slice(0, idx + 1).filter((d) => DEFAULT_WEEK[d].type === 'lift').length;
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
  if (allTop && kg !== null) return `Hit the top of the range last time — add load (${ex.increment}).`;
  if (kg !== null) return `Same load (${kg} kg); try to add a rep to any set.`;
  return 'Try to add a rep to any set.';
}

export function formatSet(s: LoggedSet, unit: Exercise['unit']) {
  if (unit === 'metres') return `${s.kg ?? '—'} kg × ${s.reps ?? '—'} m`;
  if (s.kg === null || s.kg === 0) return `${s.reps ?? '—'}`;
  return `${s.kg}×${s.reps ?? '—'}`;
}
