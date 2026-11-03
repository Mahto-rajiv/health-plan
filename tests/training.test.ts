import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FLEX_WINDOWS, SESSIONS, SESSION_ORDER } from '../lib/data/training';
import { EXERCISE_TUTORIALS } from '../lib/data/tutorials';
import { activeExercises, plannedFor, sessionsFor, sessionTime, TIME_MODEL, warmupMinutes } from '../lib/training';
import { phaseOn, weekLabel } from '../lib/phase';
import { startsLabel } from '../lib/dates';

// Week of Monday 2 Nov 2026.
const MON = '2026-11-02', TUE = '2026-11-03', WED = '2026-11-04', THU = '2026-11-05', FRI = '2026-11-06', SAT = '2026-11-07', SUN = '2026-11-08';

describe('sessions', () => {
  // Learning weeks (1–2) and build weeks (3+, incl. 8 and 12).
  const WEEKS = [1, 2, 3, 8, 12];

  for (const id of SESSION_ORDER) {
    const s = SESSIONS[id];
    if (s.slot === 'weekday') {
      // Budget 42 min, not the 45-min cap: the time constants (40 s a set, 1 min setup) are estimates,
      // not timed, so the plan keeps a 3-min (~7%) buffer (Round 3).
      it(`${id}: ≤ 5 exercises and ≤ 42 min (3-min buffer under the 45-min cap) in every week`, () => {
        for (const week of WEEKS) {
          const t = sessionTime(id, week);
          const n = activeExercises(id, week).length;
          assert.ok(n <= 5, `${id} week ${week}: ${n} exercises`);
          assert.ok(t.total <= 42, `${id} week ${week}: ${t.total.toFixed(1)} min > 42 (${JSON.stringify(t)})`);
        }
      });
    } else {
      it(`${id}: 60–75 min in every week`, () => {
        for (const week of WEEKS) {
          const t = sessionTime(id, week);
          assert.ok(t.total >= 60 && t.total <= 75, `${id} week ${week}: ${t.total.toFixed(1)} min, outside 60–75 (${JSON.stringify(t)})`);
        }
      });
    }
  }

  it('session time is the sum of its parts, using the stated constants', () => {
    // Upper B week 3 by hand: warm-up 10; OHP 3×(40+180)s + 1 = 12; pull-up 3×(40+150)s + 1 + 1 lighter set = 11.5;
    // incline 2×(40+120)s + 1 = 6.33; face pull paired with the incline press (Round 3), so only its work: 2×40 s = 1.33; no finisher.
    assert.deepEqual(TIME_MODEL, { workSec: 40, perSideWorkSec: 80, setupMin: 1, rampSetMin: 1 });
    const t = sessionTime('upperB', 3);
    assert.equal(t.warmup, 10);
    assert.equal(t.finisher, 0);
    assert.ok(Math.abs(t.total - (10 + 12 + 11.5 + 380 / 60 + 80 / 60)) < 1e-9, String(t.total));
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
    assert.deepEqual(sessionsFor(SAT), ['lowerA']);
    assert.deepEqual(sessionsFor(SUN), ['upperA']);
  });

  it('Lower B only Mon–Wed, Upper B only Tue–Fri; Tue and Wed offer both', () => {
    assert.deepEqual(sessionsFor(MON), ['lowerB']);
    assert.deepEqual(sessionsFor(TUE), ['lowerB', 'upperB']);
    assert.deepEqual(sessionsFor(WED), ['lowerB', 'upperB']);
    assert.deepEqual(sessionsFor(THU), ['upperB']);
    assert.deepEqual(sessionsFor(FRI), ['upperB']);
    assert.ok(!FLEX_WINDOWS.upperB.includes('Monday'));
  });

  it('tomorrow line names the session(s) and the 9 PM cut-off on weekdays', () => {
    assert.match(plannedFor(SAT), /Lower A/);
    assert.equal(plannedFor(TUE), 'Lower B or Upper B if you can be at the gym by 9:00 PM');
  });
});

describe('alternatives', () => {
  it('every exercise has a swap that names a different exercise', () => {
    for (const s of Object.values(SESSIONS)) {
      for (const ex of s.exercises) {
        assert.ok(ex.alternative.trim().length >= 10, `${ex.id}: no alternative`);
        assert.ok(!ex.alternative.toLowerCase().startsWith(ex.name.toLowerCase()), `${ex.id}: alternative is the same exercise`);
      }
    }
  });
});

describe('phase follows the date only (fixed start Mon 9 Nov 2026)', () => {
  it('weeks 1–2 → Phase 0, 3–4 → Phase 1, 5+ → Phase 2; before the start, Phase 0', () => {
    assert.equal(phaseOn('2026-11-03'), 0);
    assert.equal(phaseOn('2026-11-09'), 0);
    assert.equal(phaseOn('2026-11-22'), 0);
    assert.equal(phaseOn('2026-11-23'), 1);
    assert.equal(phaseOn('2026-12-06'), 1);
    assert.equal(phaseOn('2026-12-07'), 2);
    assert.equal(phaseOn('2027-06-01'), 2);
  });

  it('shows "Starts Mon 9 Nov" before the start, the week number from the start day', () => {
    assert.equal(startsLabel('2026-11-09', '2026-11-03'), 'Starts Mon 9 Nov');
    assert.equal(startsLabel('2026-11-09', '2026-11-09'), null);
    assert.equal(weekLabel('2026-11-03'), 'Starts Mon 9 Nov');
    assert.equal(weekLabel('2026-11-09'), 'Program week 1');
    assert.equal(weekLabel('2026-12-01'), 'Program week 4');
  });
});
