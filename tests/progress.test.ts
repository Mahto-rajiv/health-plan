import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assessGain, waistLimits, weeklyAverages, weightLoss } from '../lib/progress';
import { addDays, startsLabel } from '../lib/dates';
import type { BodyEntry } from '../lib/storage';

const START = '2026-11-02';
const series = (kgs: number[]): BodyEntry[] => kgs.flatMap((kg, w) => [0, 2, 4].map((d) => ({ date: addDays(START, w * 7 + d), weightKg: kg })));
const opts = { heightCm: 180, startWeightKg: 70, preLossWeightKg: 74, weeksIn: 2, monthsGaining: 0 };

describe('weight decisions', () => {
  it('still falling after 2 weeks in Phase 0/1 → +200 kcal and see a doctor', () => {
    const a = assessGain(series([69.8, 69.2, 69.0]), { ...opts, phase: 0, weeksIn: 2 });
    assert.equal(a.status, 'still-losing');
    assert.equal(a.doctor, true);
    assert.match(a.action, /200 kcal/);
  });

  it('within ±0.5 kg of the start in Phase 0 → loss has stopped', () => {
    assert.equal(assessGain(series([70.1, 69.9, 70.2]), { ...opts, phase: 0 }).status, 'stable');
  });

  it('recalled weights are never used for decisions', () => {
    const recalled: BodyEntry = { date: '2026-05-01', weightKg: 74, recalled: true };
    assert.equal(weeklyAverages([recalled]).length, 0);
    const a = assessGain([recalled, ...series([70, 70])], { ...opts, phase: 0 });
    assert.equal(a.status, 'stable');
  });

  it('the first checkpoint is the pre-loss weight', () => {
    const a = assessGain(series([73.6, 73.9, 74.1, 74.3]), { ...opts, phase: 2, weeksIn: 20 });
    assert.equal(a.status, 'checkpoint');
  });

  it('waist cut-offs come from height', () => {
    assert.deepEqual(waistLimits(180), { review: 85, stop: 90 });
    assert.deepEqual(waistLimits(170), { review: 80, stop: 85 });
  });
});

describe('weights are optional (entered in Settings, not in the code)', () => {
  it('without a start weight, the first weekly average is the baseline', () => {
    const { startWeightKg: _s, ...noStart } = opts;
    void _s;
    assert.equal(assessGain(series([70.1, 69.9, 70.2]), { ...noStart, phase: 0 }).status, 'stable');
    assert.equal(assessGain(series([70, 69.2, 69.0]), { ...noStart, phase: 0 }).status, 'still-losing');
  });
  it('without a pre-loss weight there is no checkpoint, and the weight loss is unknown', () => {
    const { preLossWeightKg: _p, ...noCheckpoint } = opts;
    void _p;
    assert.notEqual(assessGain(series([73.6, 73.9, 74.1, 74.3]), { ...noCheckpoint, phase: 2, weeksIn: 20 }).status, 'checkpoint');
    assert.equal(weightLoss([], {}), null);
    assert.deepEqual(weightLoss([], { startWeightKg: 70, preLossWeightKg: 74 }), { before: 74, now: 70, loss: 4, confirmed: false });
  });
});

describe('program start label', () => {
  it('shows "Starts Mon 9 Nov" before the start, the week number from the start day', () => {
    assert.equal(startsLabel('2026-11-09', '2026-11-03'), 'Starts Mon 9 Nov');
    assert.equal(startsLabel('2026-11-09', '2026-11-09'), null);
    assert.equal(startsLabel('2026-11-09', '2026-12-01'), null);
  });
});
