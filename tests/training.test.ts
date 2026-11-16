import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as TRAINING from '../lib/data/training';
import { GYM_DAYS_PER_WEEK, MAX_DAYS_IN_A_ROW, SESSIONS, SESSION_ORDER, type Exercise, type SessionId } from '../lib/data/training';
import * as RECOVERY from '../lib/data/recovery';
import { EXERCISE_LINKS, EXERCISE_TUTORIALS } from '../lib/data/tutorials';
import { REFS, type RefId } from '../lib/data/references';
import { activeExercises, isWorkday, nextSession, plannedFor, sessionsFor, sessionTime, TIME_MODEL, warmupMinutes } from '../lib/training';
import { parsePhase, phaseOn, weekLabel } from '../lib/phase';
import { startsLabel } from '../lib/dates';

// Week of Monday 2 Nov 2026.
const MON = '2026-11-02', TUE = '2026-11-03', WED = '2026-11-04', THU = '2026-11-05', FRI = '2026-11-06', SAT = '2026-11-07', SUN = '2026-11-08';
// Learning weeks (1–2) and build weeks (3+, incl. 8 and 12).
const WEEKS = [1, 2, 3, 8, 12];
const allExercises = (): Exercise[] => Object.values(SESSIONS).flatMap((s) => s.exercises);

describe('sessions', () => {
  // Any session can fall on a work evening, so every one keeps the work-evening limit: 60 min including
  // the warm-up (owner), planned to ≤ 55 min. The time constants (40 s a set, 1 min setup) are estimates,
  // not timed, so the plan keeps a 5-min (~8%) margin.
  for (const id of SESSION_ORDER) {
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
  }

  it('session time is the sum of its parts, using the stated constants', () => {
    // Legs + Shoulders week 3 by hand: warm-up 11; squat 3×(40+180)s + 1 = 12; Romanian deadlift 3×(40+120)s + 1 + 1 lighter set = 10;
    // leg press 2×(40+120)s + 1 = 6.33; shoulder press 3×(40+120)s + 1 + 1 lighter set = 10; lateral raise 2×(40+60)s + 1 = 4.33; no finish.
    assert.deepEqual(TIME_MODEL, { workSec: 40, perSideWorkSec: 80, setupMin: 1, rampSetMin: 1 });
    const t = sessionTime('legsShoulders', 3);
    assert.equal(t.warmup, 11);
    assert.equal(t.finisher, 0);
    assert.ok(Math.abs(t.total - (11 + 12 + 10 + (320 / 60 + 1) + 10 + (200 / 60 + 1))) < 1e-9, String(t.total));
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

describe('split', () => {
  const text = (id: SessionId) => SESSIONS[id].exercises.map((e) => e.muscles.toLowerCase()).join(' ');
  const LEGS = /thighs|glutes|calves/;

  it('three split sessions, named for their two muscle groups: Chest + Triceps, Back + Biceps, Legs + Shoulders', () => {
    assert.deepEqual(SESSION_ORDER, ['chestTri', 'backBi', 'legsShoulders']);
    assert.deepEqual(Object.keys(SESSIONS).sort(), [...SESSION_ORDER].sort());
    for (const id of SESSION_ORDER) {
      const s = SESSIONS[id];
      assert.equal(s.short, s.groups.join(' + '), id);
      assert.ok(s.name.startsWith(s.short), id);
    }
  });

  it('no full-body and no lower-body-only session: only Legs + Shoulders trains legs, and it also trains shoulders', () => {
    for (const id of SESSION_ORDER) {
      assert.doesNotMatch(SESSIONS[id].name, /full body|full-body|lower body|upper body/i, id);
      if (id !== 'legsShoulders') assert.doesNotMatch(text(id), LEGS, `${id} trains legs`);
    }
    assert.match(text('legsShoulders'), LEGS);
    const shoulderOnly = SESSIONS.legsShoulders.exercises.filter((e) => /shoulder/i.test(e.muscles) && !LEGS.test(e.muscles.toLowerCase()));
    assert.ok(shoulderOnly.length >= 2);
  });

  it('each session starts with its main lift and trains its two groups', () => {
    const want: Record<SessionId, [RegExp, RegExp]> = { chestTri: [/chest/, /triceps/], backBi: [/back/, /biceps/], legsShoulders: [/thighs/, /shoulders/] };
    for (const id of SESSION_ORDER) {
      assert.ok(SESSIONS[id].exercises[0].isMainLift, `${id}: first exercise is not a main lift`);
      for (const re of want[id]) assert.match(text(id), re, `${id}: ${re}`);
    }
  });

  it('each arm muscle gets direct work: a triceps-only and a biceps-only exercise', () => {
    assert.ok(SESSIONS.chestTri.exercises.some((e) => /^triceps/i.test(e.muscles)));
    assert.ok(SESSIONS.backBi.exercises.some((e) => /^biceps$/i.test(e.muscles)));
  });
});

describe('schedule (any day of the week)', () => {
  it('every session is allowed on every day, Monday to Sunday, in the same order', () => {
    for (const d of [MON, TUE, WED, THU, FRI, SAT, SUN]) assert.deepEqual(sessionsFor(), SESSION_ORDER, d);
  });

  it('the order goes round: Chest + Triceps → Back + Biceps → Legs + Shoulders → Chest + Triceps', () => {
    assert.equal(nextSession('chestTri'), 'backBi');
    assert.equal(nextSession('backBi'), 'legsShoulders');
    assert.equal(nextSession('legsShoulders'), 'chestTri');
  });

  it('the 9 PM arrival rule applies on work days (Mon–Fri) only, and the tomorrow line names no fixed session', () => {
    for (const d of [MON, TUE, WED, THU, FRI]) assert.ok(isWorkday(d), d);
    for (const d of [SAT, SUN]) assert.ok(!isWorkday(d), d);
    assert.equal(plannedFor(TUE), 'The next session in the order, or a day off. Gym only if you can be there by 9:00 PM');
    assert.equal(plannedFor(SAT), 'The next session in the order, or a day off');
  });

  it('5 gym days a week fit the rest rule: at most 3 days in a row needs at least 2 days off in 7', () => {
    assert.equal(GYM_DAYS_PER_WEEK, 5);
    assert.equal(MAX_DAYS_IN_A_ROW, 3);
    // In a repeating 7-day week, every run of training days ends with a day off.
    const minDaysOff = Math.ceil(7 / (MAX_DAYS_IN_A_ROW + 1));
    assert.ok(GYM_DAYS_PER_WEEK + minDaysOff <= 7, `${GYM_DAYS_PER_WEEK} days need ${minDaysOff} days off`);
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
