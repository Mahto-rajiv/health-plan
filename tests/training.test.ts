import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FLEX_WINDOWS, SESSIONS, SESSION_ORDER } from '../lib/data/training';
import { EXERCISE_TUTORIALS } from '../lib/data/tutorials';
import { activeExercises, sessionTime, TIME_MODEL, todayTraining, warmupMinutes } from '../lib/training';
import type { WorkoutRecord } from '../lib/storage';

const rec = (date: string, sessionId: WorkoutRecord['sessionId']): WorkoutRecord => ({ id: date + sessionId, date, sessionId, sets: {}, completedAt: `${date}T21:00:00` });
const at = (h: number, m = 0) => new Date(2026, 10, 4, h, m);
// Week of Monday 2 Nov 2026.
const MON = '2026-11-02', TUE = '2026-11-03', WED = '2026-11-04', THU = '2026-11-05', FRI = '2026-11-06', SAT = '2026-11-07', SUN = '2026-11-08';

describe('sessions', () => {
  // Learning weeks (1–2), build weeks (3+, incl. 8 and 12) and a deload week.
  const WEEKS = [1, 2, 3, 8, 12];

  for (const id of SESSION_ORDER) {
    const s = SESSIONS[id];
    if (s.slot === 'weekday') {
      it(`${id}: ≤ 5 exercises and ≤ 45 min in every week, deload included`, () => {
        for (const week of WEEKS) {
          for (const deload of [false, true]) {
            const t = sessionTime(id, week, deload);
            const n = activeExercises(id, week, deload).length;
            assert.ok(n <= 5, `${id} week ${week}${deload ? ' deload' : ''}: ${n} exercises`);
            assert.ok(t.total <= 45, `${id} week ${week}${deload ? ' deload' : ''}: ${t.total.toFixed(1)} min > 45 (${JSON.stringify(t)})`);
          }
        }
      });
    } else {
      it(`${id}: 60–75 min in every non-deload week; shorter (≤ 75) in a deload week`, () => {
        for (const week of WEEKS) {
          const t = sessionTime(id, week);
          assert.ok(t.total >= 60 && t.total <= 75, `${id} week ${week}: ${t.total.toFixed(1)} min, outside 60–75 (${JSON.stringify(t)})`);
          assert.ok(sessionTime(id, week, true).total <= 75, `${id} week ${week} deload`);
        }
      });
    }
  }

  it('session time is the sum of its parts, using the stated constants', () => {
    // Upper B week 3 by hand: warm-up 10; OHP 3×(40+180)s + 1 = 12; pull-up 3×(40+150)s + 1 + 1 lighter set = 11.5;
    // incline 2×(40+120)s + 1 = 6.33; face pull 2×(40+60)s + 1 = 4.33; no finisher.
    assert.deepEqual(TIME_MODEL, { workSec: 40, perSideWorkSec: 80, setupMin: 1, rampSetMin: 1 });
    const t = sessionTime('upperB', 3);
    assert.equal(t.warmup, 10);
    assert.equal(t.finisher, 0);
    assert.ok(Math.abs(t.total - (10 + 12 + 11.5 + 380 / 60 + 260 / 60)) < 1e-9, String(t.total));
    for (const sid of SESSION_ORDER) {
      const st = sessionTime(sid, 3);
      const sum = st.warmup + st.exercises.reduce((a, e) => a + e.minutes, 0) + st.finisher;
      assert.ok(Math.abs(sum - st.total) < 1e-9);
      assert.equal(st.finisher, SESSIONS[sid].finisherMin);
    }
  });

  it('every session has a warm-up of ≥ 3 steps: easy cardio, drills and lighter sets, summing to the warm-up time', () => {
    for (const id of SESSION_ORDER) {
      const steps = SESSIONS[id].warmup;
      assert.ok(steps.length >= 3, `${id}: ${steps.length} warm-up steps`);
      for (const k of ['cardio', 'mobility', 'ramp'] as const) assert.ok(steps.some((st) => st.kind === k), `${id}: no ${k} step`);
      assert.equal(steps[0].kind, 'cardio', `${id}: warm-up should start with easy cardio`);
      assert.equal(steps.at(-1)!.kind, 'ramp', `${id}: lighter sets should come last, just before the first lift`);
      for (const st of steps) {
        assert.ok(st.minutes > 0 && st.name && st.how && st.dose, `${id}: incomplete step ${st.name}`);
        for (const t of st.tutorials ?? []) assert.ok(t in EXERCISE_TUTORIALS, `${id} ${st.name}: ${t}`);
      }
      const sum = steps.reduce((a, st) => a + st.minutes, 0);
      assert.equal(warmupMinutes(id), sum);
      assert.equal(sessionTime(id, 3).warmup, sum);
      assert.ok(sum >= 10 && sum <= 12, `${id}: warm-up ${sum} min`);
    }
  });

  it('later heavy lifts get lighter sets first, and their cues say so', () => {
    for (const id of SESSION_ORDER) {
      const exs = SESSIONS[id].exercises;
      for (const ex of exs.slice(1)) {
        const heavyLater = ex.isMainLift || /barbell|romanian|hip thrust/i.test(ex.name);
        if (heavyLater && ex.id !== 'squat') assert.ok((ex.rampSets ?? 0) >= 1 && (ex.rampSets ?? 0) <= 2, `${id} ${ex.id}: needs 1–2 lighter sets`);
        if (ex.rampSets) assert.match(ex.cues[0], /^Lighter set first/, `${ex.id}`);
      }
    }
  });

  it('rests stay inside the cited ranges: ≥ 2 min on main lifts, ≥ 60 s everywhere', () => {
    for (const s of Object.values(SESSIONS))
      for (const ex of s.exercises) {
        assert.ok(ex.restSec >= 60, `${ex.id}: ${ex.restSec} s`);
        if (ex.isMainLift) assert.ok(ex.restSec >= 120, `${ex.id}: ${ex.restSec} s`);
      }
  });

  it('a superset partner exists in the same session', () => {
    for (const s of Object.values(SESSIONS)) for (const ex of s.exercises) if (ex.supersetWith) assert.ok(s.exercises.some((e) => e.id === ex.supersetWith), ex.id);
  });

  it('Saturday and Sunday train different regions', () => {
    assert.match(SESSIONS.lowerA.name, /Lower/);
    assert.match(SESSIONS.upperA.name, /Upper/);
  });

  it('every exercise tutorial id exists', () => {
    for (const s of Object.values(SESSIONS)) for (const ex of s.exercises) for (const t of ex.tutorials ?? []) assert.ok(t in EXERCISE_TUTORIALS, `${ex.id}: ${t}`);
  });
});

describe('schedule', () => {
  it('Saturday is Lower A and Sunday is Upper A', () => {
    assert.equal(todayTraining([], SAT, at(10)).sessionId, 'lowerA');
    assert.equal(todayTraining([], SUN, at(10)).sessionId, 'upperA');
  });

  it('a weekday session is offered only before 9:00 PM', () => {
    assert.equal(todayTraining([], TUE, at(20, 30)).kind, 'flex');
    assert.equal(todayTraining([], TUE, at(21, 1)).kind, 'late');
  });

  it('never two sessions in one day', () => {
    assert.equal(todayTraining([rec(TUE, 'lowerB')], TUE, at(18)).kind, 'done');
  });

  it('Lower B only Mon–Wed, Upper B only Tue–Fri; a missed one is skipped, not made up', () => {
    assert.equal(todayTraining([], MON, at(18)).sessionId, 'lowerB');
    assert.ok(!FLEX_WINDOWS.upperB.includes('Monday'));
    // Lower B missed Mon–Wed: Thursday offers Upper B, never Lower B.
    assert.equal(todayTraining([], THU, at(18)).sessionId, 'upperB');
    // Both done: Friday is a rest day, no extra session.
    assert.equal(todayTraining([rec(TUE, 'lowerB'), rec(WED, 'upperB')], FRI, at(18)).kind, 'rest');
    // Upper B missed all week: Saturday is still Lower A, not Upper B.
    assert.equal(todayTraining([rec(MON, 'lowerB')], SAT, at(10)).sessionId, 'lowerA');
  });
});
