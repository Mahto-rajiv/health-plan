import type { DayName } from './meal-plans';
import type { ExerciseTutorialId } from './tutorials';

// ─── Program design (summary of the evidence used) ────────────────────────────
// • Upper/lower split, 4 days: each muscle trained 2×/week, which matches the
//   evidence on frequency when weekly volume is equal (Schoenfeld 2016) and gives
//   beginners twice the practice of each lift.
// • Volume: ~8–12 hard sets per muscle per week to start, rising toward 10–15
//   as the program matures (Schoenfeld 2017; Pelland 2026; ACSM 2026: ≥10 sets/
//   week for hypertrophy).
// • Effort: 1–3 reps in reserve (RIR), regulated with the RIR scale (Zourdos
//   2016). ACSM 2026 found training to failure is not consistently needed.
// • Loads: 5–8 reps on main barbell lifts (strength is priority #1: heavier
//   loads, full ROM — ACSM 2026), 8–15 on accessories.
// • Rest: 2–3 min on compounds, 60–90 s on small isolation work
//   (Schoenfeld 2016; Singer 2024: little extra benefit beyond ~90 s).
// • Progression: double progression (reps first, then load).
// • Deload: taken when fatigue signals appear, not on a fixed calendar. The
//   definition is expert consensus (Bell 2023); a 1-week deload did not change
//   muscle growth but slightly reduced strength gains (Coleman 2024).

export type SessionId = 'upperA' | 'lowerA' | 'upperB' | 'lowerB';

export interface Exercise {
  id: string;
  name: string;
  muscles: string;
  /** Sets during weeks 1–2 (learning) and from week 3 on. */
  sets: { learn: number; build: number };
  reps: string;
  /** Lower bound / upper bound used for double progression. */
  repRange: [number, number];
  rir: string;
  restSec: number;
  /** Load increment once the top of the rep range is reached on all sets. */
  increment: string;
  cues: string[];
  alternatives?: string;
  tutorials?: ExerciseTutorialId[];
  /** Main lift → tracked on the strength chart. */
  isMainLift?: boolean;
  /** Logged as time/distance rather than kg × reps. */
  unit?: 'reps' | 'seconds' | 'metres';
  /** Shown only from this week onward (e.g. jumps after technique is learned). */
  fromWeek?: number;
}

export interface Session {
  id: SessionId;
  name: string;
  short: string;
  focus: string;
  minutes: string;
  warmup: string[];
  exercises: Exercise[];
  finisher: string;
}

const WARMUP_LOWER = [
  '5 min easy bike or incline walk',
  'Hip flexor stretch 30 s/side, world’s greatest stretch 3/side, knee-to-wall ankle drill 10/side',
  'Ramp-up sets for the first lift: empty bar × 8–10, ~50% × 5, ~70% × 3, ~85% × 1–2',
];
const WARMUP_UPPER = [
  '5 min easy rower or bike',
  'Open book 6/side, band pull-aparts × 15, arm circles',
  'Ramp-up sets for the first lift: empty bar × 8–10, ~50% × 5, ~70% × 3, ~85% × 1–2',
];

export const SESSIONS: Record<SessionId, Session> = {
  upperA: {
    id: 'upperA',
    name: 'Upper A — Bench focus',
    short: 'Upper A',
    focus: 'Horizontal push and pull, with bench press as the strength lift.',
    minutes: '60–70 min',
    warmup: WARMUP_UPPER,
    exercises: [
      {
        id: 'bench',
        name: 'Barbell bench press',
        muscles: 'Chest, front delts, triceps',
        sets: { learn: 2, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        rir: '2',
        restSec: 180,
        increment: '+2.5 kg',
        cues: ['Eyes under the bar, shoulder blades squeezed back and down', 'Feet planted, slight arch', 'Lower to the lower chest under control, forearms vertical', 'Press up and slightly back toward the face', 'Use safety pins or a spotter'],
        tutorials: ['benchPress'],
        isMainLift: true,
      },
      {
        id: 'row',
        name: 'Barbell row',
        muscles: 'Upper back, lats, rear delts',
        sets: { learn: 2, build: 3 },
        reps: '8–10',
        repRange: [8, 10],
        rir: '2',
        restSec: 120,
        increment: '+2.5 kg',
        cues: ['Hinge to ~45°, back flat, brace', 'Pull the bar to the lower ribs', 'Lead with the elbows; no jerking with the hips'],
        alternatives: 'If your lower back is tired from Lower B, use a chest-supported dumbbell row or machine row.',
        tutorials: ['barbellRow'],
      },
      {
        id: 'db-ohp',
        name: 'Seated dumbbell shoulder press',
        muscles: 'Shoulders, triceps',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '2',
        restSec: 120,
        increment: 'next dumbbell (+1–2 kg each)',
        cues: ['Bench upright or one notch back', 'Lower to about ear level', 'Press without flaring the ribs'],
      },
      {
        id: 'pulldown',
        name: 'Lat pulldown',
        muscles: 'Lats, biceps',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin (+2.5–5 kg)',
        cues: ['Slight lean back, chest up', 'Pull the bar to the upper chest by driving elbows down', 'Full stretch at the top'],
        tutorials: ['latPulldown'],
      },
      {
        id: 'lateral-a',
        name: 'Dumbbell lateral raise',
        muscles: 'Side delts',
        sets: { learn: 2, build: 3 },
        reps: '12–20',
        repRange: [12, 20],
        rir: '1–2',
        restSec: 90,
        increment: 'add reps first; next dumbbell only at 3×20',
        cues: ['Slight bend in the elbows', 'Raise to shoulder height, leading with the elbows', 'Slow on the way down; start light (4–6 kg)'],
        tutorials: ['lateralRaise'],
      },
      {
        id: 'pushdown',
        name: 'Triceps rope pushdown (superset with curl)',
        muscles: 'Triceps',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Elbows pinned to your sides', 'Spread the rope at the bottom', 'Control the way up'],
        tutorials: ['pushdown'],
      },
      {
        id: 'curl',
        name: 'Dumbbell curl',
        muscles: 'Biceps',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next dumbbell',
        cues: ['Elbows still', 'Turn the palm up as you curl', 'No swinging'],
        tutorials: ['curl'],
      },
    ],
    finisher: 'Optional: 10 min easy bike (Zone 2). Counts toward your weekly cardio.',
  },
  lowerA: {
    id: 'lowerA',
    name: 'Lower A — Squat focus',
    short: 'Lower A',
    focus: 'Squat strength, hamstrings, calves and anti-extension core.',
    minutes: '60–70 min',
    warmup: WARMUP_LOWER,
    exercises: [
      {
        id: 'box-jump',
        name: 'Box jump (low box)',
        muscles: 'Power, landing mechanics',
        sets: { learn: 0, build: 3 },
        reps: '3',
        repRange: [3, 3],
        rir: 'fresh, crisp reps',
        restSec: 90,
        increment: 'keep the box low (30–45 cm); focus on soft, quiet landings',
        cues: ['Swing the arms, jump up, land softly in a quarter squat', 'Step down — don’t jump down', 'Stop if landings get loud'],
        tutorials: ['boxJump'],
        fromWeek: 3,
      },
      {
        id: 'squat',
        name: 'Barbell back squat',
        muscles: 'Quads, glutes, adductors',
        sets: { learn: 2, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        rir: '2',
        restSec: 180,
        increment: '+2.5–5 kg',
        cues: ['Bar on the upper traps, hands just outside the shoulders', 'Big breath and brace before each rep', 'Knees track over the toes', 'Depth: as deep as you can keep a neutral back (hip crease at or below knee is the goal)', 'Set safety bars just below your bottom position'],
        tutorials: ['backSquat', 'squatWarmUp'],
        isMainLift: true,
      },
      {
        id: 'rdl',
        name: 'Romanian deadlift',
        muscles: 'Hamstrings, glutes, back',
        sets: { learn: 2, build: 3 },
        reps: '8–10',
        repRange: [8, 10],
        rir: '2',
        restSec: 150,
        increment: '+2.5–5 kg',
        cues: ['Soft knees, push the hips back', 'Bar slides down the thighs', 'Stop when the hamstrings are stretched and the back is still flat'],
        tutorials: ['rdl'],
      },
      {
        id: 'leg-press',
        name: 'Leg press',
        muscles: 'Quads, glutes',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '2',
        restSec: 120,
        increment: '+5–10 kg',
        cues: ['Lower until just before your lower back peels off the pad', 'Knees in line with the toes', 'Don’t lock the knees hard at the top'],
        tutorials: ['legPress'],
      },
      {
        id: 'leg-curl',
        name: 'Seated or lying leg curl',
        muscles: 'Hamstrings',
        sets: { learn: 2, build: 3 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Full range', 'Squeeze at the top', '2–3 s on the way back'],
        tutorials: ['legCurl'],
      },
      {
        id: 'calf-a',
        name: 'Standing calf raise',
        muscles: 'Calves',
        sets: { learn: 2, build: 3 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Full stretch at the bottom with a 1 s pause', 'Rise as high as possible'],
        tutorials: ['calfRaise'],
      },
      {
        id: 'dead-bug',
        name: 'Dead bug → ab-wheel rollout',
        muscles: 'Core (anti-extension)',
        sets: { learn: 2, build: 3 },
        reps: '6–10 per side',
        repRange: [6, 10],
        rir: 'perfect form',
        restSec: 90,
        increment: 'when 3×10/side is easy, progress to kneeling ab-wheel rollouts',
        cues: ['Low back stays pressed into the floor', 'Exhale fully as the arm and leg extend'],
        tutorials: ['deadBug'],
      },
    ],
    finisher: 'Hip flexor and couch stretch, 2 × 30 s per side.',
  },
  upperB: {
    id: 'upperB',
    name: 'Upper B — Press & pull-up focus',
    short: 'Upper B',
    focus: 'Vertical push and pull, with the overhead press as the strength lift.',
    minutes: '60–70 min',
    warmup: WARMUP_UPPER,
    exercises: [
      {
        id: 'ohp',
        name: 'Standing barbell overhead press',
        muscles: 'Shoulders, triceps, upper back',
        sets: { learn: 2, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        rir: '2',
        restSec: 180,
        increment: '+1–2.5 kg (use small plates if you have them)',
        cues: ['Grip just outside the shoulders, forearms vertical', 'Squeeze the glutes, ribs down', 'Move your head back slightly, press the bar straight up, then bring your head “through” at lockout'],
        tutorials: ['overheadPress'],
        isMainLift: true,
      },
      {
        id: 'pullup',
        name: 'Pull-up (assisted until you get 3×5)',
        muscles: 'Lats, biceps, upper back',
        sets: { learn: 2, build: 3 },
        reps: '5–10',
        repRange: [5, 10],
        rir: '2',
        restSec: 150,
        increment: 'reduce assistance; then add reps; then a little weight',
        cues: ['Start from a dead hang with the shoulders engaged', 'Pull your chest to the bar', 'Lower slowly — about 2–3 s'],
        alternatives: 'Use an assisted pull-up machine or a band. Log the assistance as negative kg (e.g. −25).',
        tutorials: ['pullUp'],
        isMainLift: true,
      },
      {
        id: 'incline-db',
        name: 'Incline dumbbell press',
        muscles: 'Upper chest, front delts, triceps',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '2',
        restSec: 120,
        increment: 'next dumbbell',
        cues: ['Bench at 30°', 'Lower until you feel a chest stretch', 'Slight elbow tuck'],
        tutorials: ['inclineDbPress'],
      },
      {
        id: 'cable-row',
        name: 'Seated cable row',
        muscles: 'Mid-back, lats',
        sets: { learn: 2, build: 3 },
        reps: '10–12',
        repRange: [10, 12],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Sit tall', 'Pull to the stomach and squeeze the shoulder blades', 'Let the shoulders reach forward on the return'],
        tutorials: ['seatedRow'],
      },
      {
        id: 'face-pull',
        name: 'Face pull',
        muscles: 'Rear delts, rotator cuff',
        sets: { learn: 2, build: 2 },
        reps: '12–20',
        repRange: [12, 20],
        rir: '2',
        restSec: 90,
        increment: 'add reps, then the next pin',
        cues: ['Rope at forehead height', 'Pull toward the eyes, hands apart, thumbs back'],
        tutorials: ['facePull'],
      },
      {
        id: 'lateral-b',
        name: 'Dumbbell lateral raise',
        muscles: 'Side delts',
        sets: { learn: 2, build: 2 },
        reps: '12–20',
        repRange: [12, 20],
        rir: '1–2',
        restSec: 90,
        increment: 'add reps first',
        cues: ['Same as Upper A'],
        tutorials: ['lateralRaise'],
      },
      {
        id: 'cable-fly',
        name: 'Cable or dumbbell chest fly',
        muscles: 'Chest',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin / dumbbell',
        cues: ['Slight, fixed bend in the elbows', 'Open until you feel a chest stretch, not a shoulder pinch', 'Bring the hands together in a hugging arc'],
      },
    ],
    finisher: 'Optional: 10 min easy bike (Zone 2).',
  },
  lowerB: {
    id: 'lowerB',
    name: 'Lower B — Deadlift focus',
    short: 'Lower B',
    focus: 'Hinge strength, single-leg work, glutes, grip and carries.',
    minutes: '60–70 min',
    warmup: WARMUP_LOWER,
    exercises: [
      {
        id: 'deadlift',
        name: 'Trap-bar deadlift (or conventional)',
        muscles: 'Whole posterior chain, quads, grip',
        sets: { learn: 2, build: 3 },
        reps: '4–6',
        repRange: [4, 6],
        rir: '2',
        restSec: 180,
        increment: '+5 kg (beginner), later +2.5 kg',
        cues: ['Stand in the centre of the bar', 'Hips down, chest up, take the slack out of the bar', 'Push the floor away; hips and shoulders rise together', 'Reset at the bottom of every rep — no bouncing'],
        alternatives: 'If there is no trap bar, use a conventional barbell deadlift with the same rep scheme.',
        tutorials: ['trapBarDeadlift', 'deadlift'],
        isMainLift: true,
      },
      {
        id: 'split-squat',
        name: 'Bulgarian split squat',
        muscles: 'Quads, glutes, balance',
        sets: { learn: 2, build: 3 },
        reps: '8–12 per leg',
        repRange: [8, 12],
        rir: '2',
        restSec: 90,
        increment: 'bodyweight first, then the next dumbbell',
        cues: ['Rear foot on a bench, front foot far enough forward', 'Drop straight down', 'Slight forward lean is fine'],
        tutorials: ['splitSquat'],
      },
      {
        id: 'hip-thrust',
        name: 'Barbell hip thrust',
        muscles: 'Glutes',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '1–2',
        restSec: 120,
        increment: '+5 kg',
        cues: ['Upper back on the bench edge, chin tucked', 'Shins vertical at the top', 'Full hip lockout without arching the low back'],
        tutorials: ['hipThrust'],
      },
      {
        id: 'leg-ext',
        name: 'Leg extension',
        muscles: 'Quads',
        sets: { learn: 2, build: 2 },
        reps: '12–15',
        repRange: [12, 15],
        rir: '1–2',
        restSec: 75,
        increment: 'next pin',
        cues: ['Pause at the top', 'Control down'],
      },
      {
        id: 'calf-b',
        name: 'Seated calf raise',
        muscles: 'Calves (soleus)',
        sets: { learn: 2, build: 3 },
        reps: '12–15',
        repRange: [12, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Pause at the bottom stretch'],
        tutorials: ['calfRaise'],
      },
      {
        id: 'carry',
        name: "Farmer's carry",
        muscles: 'Grip, core, traps',
        sets: { learn: 2, build: 3 },
        reps: '30–40 m',
        repRange: [30, 40],
        rir: 'tall posture throughout',
        restSec: 90,
        increment: 'heavier dumbbells once 40 m is solid',
        cues: ['Stand tall, shoulders down', 'Short, quick steps'],
        tutorials: ['farmersCarry'],
        unit: 'metres',
      },
      {
        id: 'knee-raise',
        name: 'Hanging knee raise',
        muscles: 'Core (flexion), grip',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        rir: 'no swinging',
        restSec: 90,
        increment: 'slow the lowering, then straighten the legs',
        cues: ['Curl the pelvis up, don’t just lift the knees'],
        tutorials: ['hangingKneeRaise'],
      },
    ],
    finisher: '90/90 hip transitions × 5/side, cat-cow × 8.',
  },
};

export const SESSION_ORDER: SessionId[] = ['upperA', 'lowerA', 'upperB', 'lowerB'];

export type DayType = 'lift' | 'cardio' | 'rest';

/** Default week. Lifting days are a *sequence*, not fixed appointments (see rules). */
export const DEFAULT_WEEK: Record<DayName, { type: DayType; session?: SessionId; label: string; detail: string }> = {
  Monday: { type: 'lift', session: 'upperA', label: 'Upper A', detail: 'Bench focus · 60–70 min' },
  Tuesday: { type: 'lift', session: 'lowerA', label: 'Lower A', detail: 'Squat focus · 60–70 min' },
  Wednesday: { type: 'cardio', label: 'Zone 2 + mobility', detail: '30–40 min easy cardio + 10 min mobility (optional, can be outdoors)' },
  Thursday: { type: 'lift', session: 'upperB', label: 'Upper B', detail: 'Press & pull-up focus · 60–70 min' },
  Friday: { type: 'lift', session: 'lowerB', label: 'Lower B', detail: 'Deadlift focus · 60–70 min' },
  Saturday: { type: 'cardio', label: 'Cardio + mobility', detail: '40–45 min cardio (intervals from week 5) + 15 min mobility' },
  Sunday: { type: 'rest', label: 'Rest', detail: 'Walk, prep food for the week' },
};

export interface Phase {
  weeks: string;
  name: string;
  summary: string;
  details: string[];
}

export const PHASES: Phase[] = [
  {
    weeks: 'Weeks 1–2',
    name: 'Learn',
    summary: '2 sets per exercise, stopping 3–4 reps short of failure. Find your starting weights.',
    details: [
      'Pick loads you could lift 3–4 more times. Technique beats load.',
      'Film one set of squat, bench and deadlift from the side and compare it with the tutorials.',
      'Expect soreness in week 1. It fades quickly — don’t judge workouts by it.',
    ],
  },
  {
    weeks: 'Weeks 3–12',
    name: 'Build',
    summary: 'Full sets at the listed RIR. Add reps, then load (double progression).',
    details: [
      'Most beginners add load to the main lifts every week or two in this phase.',
      'Box jumps start in week 3. Saturday cardio adds short intervals from week 5.',
      'Re-test waist and photos every 4 weeks.',
    ],
  },
  {
    weeks: 'When needed',
    name: 'Deload week',
    summary: 'Same exercises, about half the sets, ~10% lighter, easy effort (RIR 4+). Switch it on in Settings.',
    details: [
      'Take one when the fatigue signals below appear — not on a fixed calendar. Many beginners won’t need one for the first 10–12 weeks.',
      'A busy work week, illness or travel is a good time to deload on purpose.',
      'Keep cardio easy and walking normal.',
    ],
  },
  {
    weeks: 'Months 4+',
    name: 'Refine',
    summary: 'Keep progressing from your new weights. Volume can rise toward 10–15 sets per muscle per week.',
    details: [
      'When single-session progress stalls on a main lift, switch it to a weekly target: add one rep to any set, or a small load jump, each week.',
      'Add a third set to accessories that are lagging, one muscle at a time.',
      'After ~6 months, consider swapping a few accessories for variety (e.g. leg press → hack squat).',
    ],
  },
];

export const PROGRESSION_RULES = [
  {
    title: 'Double progression',
    body: 'Each exercise has a rep range (e.g. 8–12). Use the same weight until you hit the top of the range on every set at the target RIR. Next session, add the smallest increment and start again at the bottom of the range.',
  },
  {
    title: 'What RIR means',
    body: 'Reps in reserve: how many more clean reps you could have done. RIR 2 = you stopped with two good reps left. Beginners usually underestimate this — film a set occasionally.',
  },
  {
    title: 'If a lift stalls',
    body: 'Same weight, fewer reps for two sessions in a row? First check sleep, food and stress. Then repeat the weight once more. Still stuck: drop the load ~10% and build back up. Stalls are normal; most clear in 2–3 weeks.',
  },
  {
    title: 'Pain vs effort',
    body: 'Muscle burn and fatigue are fine. Sharp, joint or nerve-like pain is not — stop the exercise, use the listed alternative, and get it checked if it persists beyond a week.',
  },
];

export const DELOAD_SIGNALS = [
  'Performance drops on two or more main lifts in the same week',
  'Sleep is consistently under 6.5 h for a week',
  'Joints ache (not muscle soreness) or motivation is unusually low for over a week',
  'Illness, exams, travel or a heavy work deadline is coming — deload into it',
];

// ─── Real-life rescheduling ───────────────────────────────────────────────────

export interface ScheduleRule {
  situation: string;
  action: string;
  why?: string;
}

export const SCHEDULE_RULES: ScheduleRule[] = [
  {
    situation: 'Missed the morning session',
    action: 'Do the same session that evening. If you can only start after ~9:30 PM, do the short version (first 3 exercises) so you still sleep on time.',
    why: 'Training time of day makes little difference to long-term gains; consistency and sleep matter more.',
  },
  {
    situation: 'Missed a whole day',
    action: 'Do that session on your next free day and push the rest of the sequence back. Wednesday and Saturday are your buffer days.',
    why: 'The sessions are a rotation (Upper A → Lower A → Upper B → Lower B), not fixed appointments.',
  },
  {
    situation: 'Missed two or more days in a week',
    action: 'Do as many sessions as fit, in order, with at least one rest day between two lower sessions. A 3-session week is fine — continue the rotation next week.',
    why: 'Three good sessions beat four rushed ones.',
  },
  {
    situation: 'Short on time (≤ 40 min)',
    action: 'Warm up, then do only the first three exercises. That covers the main lift and the most important accessories.',
  },
  {
    situation: 'Back after 1–2 weeks off',
    action: 'Use ~90% of your last weights for the first week, then continue as normal.',
  },
  {
    situation: 'Back after 3+ weeks off',
    action: 'Use ~80% of your last weights and 2 sets per exercise for a week, then return to normal. Strength returns faster than it was built.',
  },
  {
    situation: 'Ill',
    action: 'Symptoms only above the neck (mild cold): an easy session or walk is fine. Fever, body aches or chest symptoms: rest until recovered.',
  },
];

export const NEVER_DO = [
  'Never do two lifting sessions on the same day.',
  'Never add a fifth session to “make up” for a missed one.',
  'Never train lower body on two consecutive days if it means squatting on sore legs — swap in the next upper session instead.',
  'Never cut sleep to fit a workout in. A missed session costs far less than a week of short sleep.',
];

// ─── Cardio & mobility ────────────────────────────────────────────────────────

export const CARDIO = {
  weeklyTarget: '150+ minutes of moderate activity a week (WHO), counting cardio sessions, warm-ups and brisk walking.',
  steps: 'Daily steps: build toward 8,000+. In large cohort studies, mortality risk keeps falling up to roughly 8,000–10,000 steps a day for adults under 60.',
  sitting: 'Break up sitting: stand or walk for 2–3 minutes every 30–45 minutes at work. Short walking breaks lower post-meal blood sugar.',
  zone2: {
    title: 'Zone 2 (easy) — Wednesday and optional finishers',
    how: '30–40 min on a bike, rower, incline treadmill walk or easy jog. You can talk in full sentences but not sing (the talk test). Roughly 60–70% of max heart rate (about 120–137 bpm at 24).',
  },
  intervals: {
    title: 'Intervals — Saturday from week 5',
    how: 'After a 10 min warm-up: 6 × 1 min hard (can only say a few words) / 2 min easy. Progress to 4 × 4 min hard / 3 min easy by week 12. Bike or rower is easier on the legs than running.',
  },
  interference: 'Cardio at this dose doesn’t reduce muscle or maximal-strength gains (Schumann 2022). Explosive power is blunted mainly when cardio and lifting share a session, so keep hard intervals on non-leg days, and at least ~3 hours from lifting where possible.',
  tutorials: ['talkTest'] as ExerciseTutorialId[],
};

export interface MobilityItem {
  name: string;
  dose: string;
  tutorials?: ExerciseTutorialId[];
}

export const MOBILITY: { title: string; when: string; items: MobilityItem[] }[] = [
  {
    title: 'Desk reset',
    when: 'Daily, ~6 min — before lunch or after work',
    items: [
      { name: 'Half-kneeling hip flexor stretch', dose: '45 s per side', tutorials: ['hipFlexorStretch'] },
      { name: 'Open book (thoracic rotation)', dose: '6 per side', tutorials: ['openBook'] },
      { name: 'Cat-cow', dose: '8 slow reps', tutorials: ['catCow'] },
      { name: 'Knee-to-wall ankle drill', dose: '10 per side', tutorials: ['ankleMobility'] },
    ],
  },
  {
    title: 'Weekend mobility',
    when: 'Saturday after cardio, ~15 min',
    items: [
      { name: "World's greatest stretch", dose: '5 per side', tutorials: ['worldsGreatestStretch'] },
      { name: '90/90 hip transitions', dose: '6 per side', tutorials: ['hip9090'] },
      { name: 'Couch stretch', dose: '2 × 45 s per side', tutorials: ['couchStretch'] },
      { name: 'Deep squat hold (hold a support)', dose: '3 × 30 s' },
      { name: 'Doorway chest stretch', dose: '2 × 30 s' },
    ],
  },
];

export const MOBILITY_NOTES = [
  'Lifting through a full range of motion improves flexibility about as much as stretching does — your squats, RDLs and split squats are already mobility work.',
  'Short stretches (≤ 60 s per muscle) before lifting don’t hurt strength. Long static holds are better saved for after training or separate sessions.',
];
