import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FLEX_WINDOWS, SESSIONS, SESSION_ORDER } from '../lib/data/training';
import { EXERCISE_TUTORIALS } from '../lib/data/tutorials';
import { activeExercises, estimateMinutes, todayTraining } from '../lib/training';
import type { WorkoutRecord } from '../lib/storage';

const rec = (date: string, sessionId: WorkoutRecord['sessionId']): WorkoutRecord => ({ id: date + sessionId, date, sessionId, sets: {}, completedAt: `${date}T21:00:00` });
const at = (h: number, m = 0) => new Date(2026, 10, 4, h, m);
// Week of Monday 2 Nov 2026.
const MON = '2026-11-02', TUE = '2026-11-03', WED = '2026-11-04', THU = '2026-11-05', FRI = '2026-11-06', SAT = '2026-11-07', SUN = '2026-11-08';

describe('sessions', () => {
  it('weekday sessions have ≤ 5 exercises and take ≤ 45 min; weekend sessions 60–75 min (non-deload weeks)', () => {
    for (const id of SESSION_ORDER) {
      for (const week of [1, 3, 12]) {
        const min = estimateMinutes(id, week);
        if (SESSIONS[id].slot === 'weekday') {
          assert.ok(activeExercises(id, week).length <= 5, `${id} week ${week}: ${activeExercises(id, week).length} exercises`);
          assert.ok(min <= 45, `${id} week ${week}: ${min} min`);
        } else {
          assert.ok(min >= 60 && min <= 75, `${id} week ${week}: ${min} min`);
        }
      }
    }
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
