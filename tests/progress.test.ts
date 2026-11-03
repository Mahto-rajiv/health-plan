import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assessGain, waistLimits, weeklyAverages } from '../lib/progress';
import { addDays, startsLabel } from '../lib/dates';
import type { BodyEntry } from '../lib/storage';

const START = '2026-11-02';
const series = (kgs: number[]): BodyEntry[] => kgs.flatMap((kg, w) => [0, 2, 4].map((d) => ({ date: addDays(START, w * 7 + d), weightKg: kg })));
const opts = { heightCm: 180, startWeightKg: 64, preLossWeightKg: 68, weeksIn: 2, monthsGaining: 0 };

describe('weight decisions', () => {
  it('still falling after 2 weeks in Phase 0/1 → +200 kcal and see a doctor', () => {
    const a = assessGain(series([63.8, 63.2, 63.0]), { ...opts, phase: 0, weeksIn: 2 });
    assert.equal(a.status, 'still-losing');
    assert.equal(a.doctor, true);
    assert.match(a.action, /200 kcal/);
  });

  it('within ±0.5 kg of the start in Phase 0 → loss has stopped', () => {
    assert.equal(assessGain(series([64.1, 63.9, 64.2]), { ...opts, phase: 0 }).status, 'stable');
  });

  it('recalled weights are never used for decisions', () => {
    const recalled: BodyEntry = { date: '2026-05-01', weightKg: 68, recalled: true };
    assert.equal(weeklyAverages([recalled]).length, 0);
    const a = assessGain([recalled, ...series([64, 64])], { ...opts, phase: 0 });
    assert.equal(a.status, 'stable');
  });

  it('the first checkpoint is the pre-loss weight', () => {
    const a = assessGain(series([67.6, 67.9, 68.1, 68.3]), { ...opts, phase: 2, weeksIn: 20 });
    assert.equal(a.status, 'checkpoint');
  });

  it('waist cut-offs come from height', () => {
    assert.deepEqual(waistLimits(180), { review: 85, stop: 90 });
    assert.deepEqual(waistLimits(170), { review: 80, stop: 85 });
  });
});

describe('program start label', () => {
  it('shows "Starts Mon 9 Nov" before the start, the week number from the start day', () => {
    assert.equal(startsLabel('2026-11-09', '2026-11-03'), 'Starts Mon 9 Nov');
    assert.equal(startsLabel('2026-11-09', '2026-11-09'), null);
    assert.equal(startsLabel('2026-11-09', '2026-12-01'), null);
  });
});
