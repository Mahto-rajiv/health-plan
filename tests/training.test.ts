import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as TRAINING from '../lib/data/training';
import { FLEX_WINDOWS, SESSIONS, SESSION_ORDER, type Exercise } from '../lib/data/training';
import * as RECOVERY from '../lib/data/recovery';
import { EXERCISE_LINKS, EXERCISE_TUTORIALS } from '../lib/data/tutorials';
import { REFS, type RefId } from '../lib/data/references';
import { activeExercises, plannedFor, sessionsFor, sessionTime, TIME_MODEL, warmupMinutes } from '../lib/training';
import { parsePhase, phaseOn, weekLabel } from '../lib/phase';
import { startsLabel } from '../lib/dates';

// Week of Monday 2 Nov 2026.
const MON = '2026-11-02', TUE = '2026-11-03', WED = '2026-11-04', THU = '2026-11-05', FRI = '2026-11-06', SAT = '2026-11-07', SUN = '2026-11-08';
// Learning weeks (1–2) and build weeks (3+, incl. 8 and 12).
const WEEKS = [1, 2, 3, 8, 12];
const allExercises = (): Exercise[] => Object.values(SESSIONS).flatMap((s) => s.exercises);

describe('sessions', () => {
  for (const id of SESSION_ORDER) {
    const s = SESSIONS[id];
    if (s.slot === 'weekday') {
      // Hard limit 60 min including the warm-up (owner). Planned to ≤ 55 min: the time constants
      // (40 s a set, 1 min setup) are estimates, not timed, so the plan keeps a 5-min (~8%) margin.
      it(`${id}: warm-up included, ≤ 60 min (planned ≤ 55) and ≤ 5 exercises in every week`, () => {
        for (const week of WEEKS) {
          const t = sessionTime(id, week);
          const n = activeExercises(id, week).length;
          assert.ok(n <= 5, `${id} week ${week}: ${n} exercises`);
          assert.ok(t.warmup > 0 && t.total > t.warmup, `${id} week ${week}: warm-up not counted`);
          assert.ok(t.total <= 60, `${id} week ${week}: ${t.total.toFixed(1)} min > 60 (${JSON.stringify(t)})`);
          assert.ok(t.total <= 55, `${id} week ${week}: ${t.total.toFixed(1)} min > 55 planned (${JSON.stringify(t)})`);
        }
      });
    } else {
      it(`${id}: 60–75 min including the warm-up, in every week`, () => {
        for (const week of WEEKS) {
          const t = sessionTime(id, week);
          assert.ok(t.total >= 60 && t.total <= 75, `${id} week ${week}: ${t.total.toFixed(1)} min, outside 60–75 (${JSON.stringify(t)})`);
        }
      });
    }
  }

  it('session time is the sum of its parts, using the stated constants', () => {
    // Full body B week 3 by hand: warm-up 10; press 3×(40+180)s + 1 = 12; pull-up 3×(40+150)s + 1 + 1 lighter set = 11.5;
    // goblet squat 3×(40+90)s + 1 = 7.5; hip thrust 2×(40+120)s + 1 + 1 lighter set = 7.33; face pull 2×(40+60)s + 1 = 4.33; no finish.
    assert.deepEqual(TIME_MODEL, { workSec: 40, perSideWorkSec: 80, setupMin: 1, rampSetMin: 1 });
    const t = sessionTime('fullB', 3);
    assert.equal(t.warmup, 10);
    assert.equal(t.finisher, 0);
    assert.ok(Math.abs(t.total - (10 + 12 + 11.5 + 7.5 + (320 / 60 + 2) + (200 / 60 + 1))) < 1e-9, String(t.total));
    for (const sid of SESSION_ORDER) {
      const st = sessionTime(sid, 3);
      const sum = st.warmup + st.exercises.reduce((a, e) => a + e.minutes, 0) + st.finisher;
      assert.ok(Math.abs(sum - st.total) < 1e-9);
      assert.equal(st.finisher, SESSIONS[sid].finisherMin);
    }
  });

  it('every session starts with a warm-up of ≥ 3 steps (easy cardio, drills, lighter sets), each with a dose and time, summing to the warm-up time', () => {
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
      for (const week of WEEKS) assert.equal(sessionTime(id, week).warmup, sum);
      assert.ok(sum >= 10 && sum <= 12, `${id}: warm-up ${sum} min`);
    }
  });

  it('every exercise has sets, reps, a rep range and rest in every week', () => {
    for (const id of SESSION_ORDER)
      for (const week of WEEKS)
        for (const ex of activeExercises(id, week)) {
          assert.ok(ex.sets.learn >= 2 && ex.sets.build >= ex.sets.learn, `${ex.id}: sets ${JSON.stringify(ex.sets)}`);
          assert.ok(ex.reps && ex.repRange[0] <= ex.repRange[1] && ex.restSec > 0 && ex.repsLeft, ex.id);
        }
  });

  it('later heavy lifts get lighter sets first, and their cues say so', () => {
    for (const id of SESSION_ORDER) {
      const exs = SESSIONS[id].exercises;
      for (const ex of exs.slice(1)) {
        const heavyLater = ex.isMainLift || /barbell|romanian|hip thrust/i.test(ex.name);
        if (heavyLater) assert.ok((ex.rampSets ?? 0) >= 1 && (ex.rampSets ?? 0) <= 2, `${id} ${ex.id}: needs 1–2 lighter sets`);
        if (ex.rampSets) assert.match(ex.cues[0], /^Lighter set first/, `${ex.id}`);
      }
    }
  });

  it('rests stay inside the cited ranges: ≥ 2 min on main lifts, ≥ 60 s everywhere', () => {
    for (const ex of allExercises()) {
      assert.ok(ex.restSec >= 60, `${ex.id}: ${ex.restSec} s`);
      if (ex.isMainLift) assert.ok(ex.restSec >= 120, `${ex.id}: ${ex.restSec} s`);
    }
  });

  it('a paired exercise’s partner exists in the same session', () => {
    for (const s of Object.values(SESSIONS)) for (const ex of s.exercises) if (ex.pairedWith) assert.ok(s.exercises.some((e) => e.id === ex.pairedWith), ex.id);
  });

  it('exercise ids are unique', () => {
    const ids = allExercises().map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe('split (frequency)', () => {
  const MUSCLES = ['thighs', 'glutes', 'chest', 'back', 'shoulders'];
  const sessionsHitting = (ids: (keyof typeof SESSIONS)[], m: string) => ids.filter((id) => SESSIONS[id].exercises.some((e) => e.muscles.toLowerCase().includes(m))).length;

  it('Saturday and Sunday train different halves of the body and together cover every main muscle', () => {
    assert.match(SESSIONS.lower.name, /Lower body/);
    assert.match(SESSIONS.upper.name, /Upper body/);
    for (const m of MUSCLES) assert.ok(sessionsHitting(['lower', 'upper'], m) >= 1, m);
  });

  it('the weekday sessions are full body: each trains legs and upper body', () => {
    for (const id of ['fullA', 'fullB'] as const) {
      const text = SESSIONS[id].exercises.map((e) => e.muscles.toLowerCase()).join(' ');
      assert.match(text, /thighs|glutes/, id);
      assert.match(text, /shoulders|chest|back/, id);
    }
  });

  it('a full week trains every main muscle at least twice; weekend plus either weekday session trains at least 4 of 5 twice', () => {
    for (const m of MUSCLES) assert.ok(sessionsHitting(['lower', 'upper', 'fullA', 'fullB'], m) >= 2, m);
    for (const extra of ['fullA', 'fullB'] as const) {
      const twice = MUSCLES.filter((m) => sessionsHitting(['lower', 'upper', extra], m) >= 2);
      assert.ok(twice.length >= 4, `${extra}: twice only for ${twice}`);
    }
  });
});

describe('schedule', () => {
  it('Saturday is the lower-body session and Sunday the upper-body one', () => {
    assert.deepEqual(sessionsFor(SAT), ['lower']);
    assert.deepEqual(sessionsFor(SUN), ['upper']);
  });

  it('weekday windows are unchanged: Full body A Mon–Wed, Full body B Tue–Fri; Tue and Wed offer both', () => {
    assert.deepEqual(sessionsFor(MON), ['fullA']);
    assert.deepEqual(sessionsFor(TUE), ['fullA', 'fullB']);
    assert.deepEqual(sessionsFor(WED), ['fullA', 'fullB']);
    assert.deepEqual(sessionsFor(THU), ['fullB']);
    assert.deepEqual(sessionsFor(FRI), ['fullB']);
    assert.ok(!FLEX_WINDOWS.fullB.includes('Monday'));
    assert.ok(!FLEX_WINDOWS.fullA.includes('Thursday') && !FLEX_WINDOWS.fullA.includes('Friday'));
  });

  it('tomorrow line names the session(s) and the 9 PM cut-off on weekdays', () => {
    assert.match(plannedFor(SAT), /Lower body/);
    assert.equal(plannedFor(TUE), 'Full body A or Full body B if you can be at the gym by 9:00 PM');
  });
});

describe('alternatives and links', () => {
  it('every exercise has an alternative: a different exercise on different equipment', () => {
    for (const ex of allExercises()) {
      const alt = ex.alternative;
      assert.ok(alt.name.trim().length >= 5 && alt.equipment.trim().length >= 3, `${ex.id}: incomplete alternative`);
      assert.notEqual(alt.name.toLowerCase(), ex.name.toLowerCase(), `${ex.id}: alternative is the same exercise`);
      assert.notEqual(alt.equipment.toLowerCase(), ex.equipment.toLowerCase(), `${ex.id}: alternative uses the same equipment`);
      assert.notEqual(alt.link, ex.link, `${ex.id}: alternative shares the exercise's tutorial`);
    }
  });

  it('every exercise and alternative has exactly one tutorial link, a YouTube video', () => {
    for (const ex of allExercises())
      for (const id of [ex.link, ex.alternative.link]) {
        const t = EXERCISE_LINKS[id];
        assert.ok(t, `${ex.id}: ${id} missing`);
        assert.equal(t.kind, 'video', `${ex.id}: ${id}`);
        assert.match(t.url, /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/, `${ex.id}: ${id}`);
      }
  });

  it('every exercise link is used, and was verified by the last link check (docs/link-report.md, status ok)', () => {
    const used = new Set(allExercises().flatMap((ex) => [ex.link, ex.alternative.link]));
    const report = readFileSync('docs/link-report.md', 'utf8').split('\n');
    for (const [id, t] of Object.entries(EXERCISE_LINKS)) {
      assert.ok(used.has(id as keyof typeof EXERCISE_LINKS), `${id}: unused link`);
      const row = report.find((l) => l.includes(`| exercise:${id} |`));
      assert.ok(row, `${id}: not in the link report — run npm run links`);
      assert.ok(row.startsWith('| ok |') && row.includes(t.url), `${id}: ${row}`);
    }
  });
});

// ─── Plain language ──────────────────────────────────────────────────────────

/** Every string inside a value (objects, arrays), for scanning the text the app shows. */
function strings(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings);
  return [];
}

const JARGON: RegExp[] = [
  /\bRIR\b/,
  /\bRPE\b/,
  /deload/i,
  /hypertroph/i,
  /reps in reserve/i,
  /\b1 ?RM\b/i,
  /\bAMRAP\b/i,
  /periodi[sz]/i,
  /superset/i,
  /double progression/i,
  /compound lift/i,
  /isolation (lift|exercise)/i,
  /mesocycle|microcycle/i,
  /\bfailure\b/i,
];
/** References cited on the Training page (their labels are shown there). */
const TRAINING_PAGE_REFS = readFileSync('app/training/TrainingContent.tsx', 'utf8').match(/ids=\{\[([^\]]*)\]/g)!.flatMap((m) => [...m.matchAll(/'(\w+)'/g)].map((x) => x[1] as RefId));
const TRAINING_TSX = ['app/training', 'components/training'].flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.tsx')).map((f) => `${d}/${f}`));
const SHOWN_TEXT = [...strings(TRAINING), ...strings(RECOVERY), ...TRAINING_PAGE_REFS.flatMap((id) => strings(REFS[id]))];

describe('plain language', () => {
  it('no gym or research jargon in the training and recovery text, the training pages or their references', () => {
    assert.ok(TRAINING_PAGE_REFS.length >= 8);
    const sources: [string, string][] = [...SHOWN_TEXT.map((t): [string, string] => ['data', t]), ...TRAINING_TSX.map((f): [string, string] => [f, readFileSync(f, 'utf8')])];
    for (const [where, text] of sources) for (const re of JARGON) assert.ok(!re.test(text), `${where}: ${re} in "${text.slice(0, 120)}"`);
  });

  it('readability: short sentences (≤ 30 words each, ≤ 16 on average) and exercise cues of ≤ 20 words', () => {
    const sentences = SHOWN_TEXT.filter((t) => t.split(/\s+/).length > 3)
      .flatMap((t) => t.split(/(?<=[.!?])\s+(?=[A-Z“"])/))
      .map((x) => x.split(/\s+/).filter(Boolean).length);
    const long = SHOWN_TEXT.flatMap((t) => t.split(/(?<=[.!?])\s+(?=[A-Z“"])/)).filter((x) => x.split(/\s+/).length > 30);
    assert.deepEqual(long, []);
    const avg = sentences.reduce((a, b) => a + b, 0) / sentences.length;
    assert.ok(avg <= 16, `average sentence ${avg.toFixed(1)} words`);
    for (const ex of allExercises()) for (const c of ex.cues) assert.ok(c.split(/\s+/).length <= 20, `${ex.id}: "${c}"`);
  });
});

describe('phase follows the date only (fixed start Mon 9 Nov 2026)', () => {
  it('weeks 1–4 → Phase 1, week 5 (Mon 7 Dec 2026) on → Phase 2; before the start or without a date, Phase 1', () => {
    assert.equal(phaseOn(null), 1);
    assert.equal(phaseOn('2026-11-03'), 1);
    assert.equal(phaseOn('2026-11-09'), 1);
    assert.equal(phaseOn('2026-11-22'), 1);
    assert.equal(phaseOn('2026-11-23'), 1);
    assert.equal(phaseOn('2026-12-06'), 1);
    assert.equal(phaseOn('2026-12-07'), 2);
    assert.equal(phaseOn('2027-06-01'), 2);
  });

  it('a stale phase from a URL or old saved value ("0", junk, empty) is ignored, so the view falls back to the date', () => {
    assert.equal(parsePhase('1'), 1);
    assert.equal(parsePhase('2'), 2);
    for (const raw of ['0', '3', '-1', '1.5', 'abc', '', ' ', null, undefined]) assert.equal(parsePhase(raw), null, String(raw));
    assert.equal(parsePhase('0') ?? phaseOn('2026-11-12'), 1);
    assert.equal(parsePhase('0') ?? phaseOn('2026-12-08'), 2);
  });

  it('shows "Starts Mon 9 Nov" before the start, the week number from the start day', () => {
    assert.equal(startsLabel('2026-11-09', '2026-11-03'), 'Starts Mon 9 Nov');
    assert.equal(startsLabel('2026-11-09', '2026-11-09'), null);
    assert.equal(weekLabel('2026-11-03'), 'Starts Mon 9 Nov');
    assert.equal(weekLabel('2026-11-09'), 'Program week 1');
    assert.equal(weekLabel('2026-12-01'), 'Program week 4');
  });
});
