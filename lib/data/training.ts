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
//
// ─── Session length (see sessionTime() in lib/training.ts) ────────────────────
// minutes = warm-up steps (summed)
//         + for each exercise: sets × (work + rest) + 1 min setup/changeover
//           + 1 min per lighter "ramp" set before a later barbell/main lift
//         + finisher minutes.
// Work = 40 s per set (80 s for one-side-at-a-time sets). Rest is counted after
// every set, including the last one. A superset partner (done straight after
// its pair, at the same spot) adds only its work time.
// Caps from the brief: weekday ≤ 45 min and ≤ 5 exercises; weekend 60–75 min.
// To fit, these trades were made (all rests stay inside the cited ranges):
//  • Small isolation lifts (lateral raise, leg curl, calf raises, core) rest
//    60 s — the low end of the cited 60–90 s, not below it.
//  • Upper B dropped the seated cable row (2 sets). Back still gets 9 hard sets
//    a week from barbell row, lat pulldown and pull-ups.
//  • Calf raises on Saturday: 2 sets (was 3); dead bug 2 sets (was 3).
//  • Weekday sessions have no finisher; weekend finishers are 10 min in total.

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
  /** Same muscles, different equipment: use it when the machine or bench is taken. */
  alternative: string;
  tutorials?: ExerciseTutorialId[];
  /** Main strength lift (longer rest, lighter sets before it). */
  isMainLift?: boolean;
  /** Shown only from this week onward (e.g. jumps after technique is learned). */
  fromWeek?: number;
  /** Done one side at a time, so each set takes twice as long. */
  perSide?: boolean;
  /** Lighter sets done just before the working sets (later heavy lifts only; the first lift's ramp-up is in the warm-up). */
  rampSets?: number;
  /** Done straight after this exercise at the same spot (superset): no extra rest or setup. */
  supersetWith?: string;
}

export interface WarmupStep {
  name: string;
  /** How to do it, in 1–2 short sentences. */
  how: string;
  /** Reps, time or sets, e.g. "5 min" or "8 slow reps". */
  dose: string;
  minutes: number;
  kind: 'cardio' | 'mobility' | 'ramp';
  tutorials?: ExerciseTutorialId[];
}

export interface Session {
  id: SessionId;
  name: string;
  short: string;
  focus: string;
  minutes: string;
  /** Weekend sessions are fixed (60–75 min, including a 10 min finisher); weekday ones are short and flexible. */
  slot: 'weekend' | 'weekday';
  /** Done in order before the first exercise. Its minutes add up to the warm-up time. */
  warmup: WarmupStep[];
  exercises: Exercise[];
  finisher: string;
  finisherMin: number;
}

// ─── Warm-up steps ────────────────────────────────────────────────────────────

const easyCardio = (machines: string): WarmupStep => ({
  name: 'Easy cardio',
  how: `${machines}. Easy pace: you can still talk in full sentences.`,
  dose: '5 min',
  minutes: 5,
  kind: 'cardio',
  tutorials: ['talkTest'],
});

const rampUp = (lift: string, start: string): WarmupStep => ({
  name: `Lighter sets for the ${lift}`,
  how: 'Three easy sets that get heavier. Rest about 30 s between them. They are practice, not work.',
  dose: `${start} × 8–10, then about half your work weight × 5, then about ¾ × 3`,
  minutes: 3,
  kind: 'ramp',
});

const DRILL = {
  legSwings: { name: 'Leg swings', how: 'Hold a rack. Swing one leg forward and back, then side to side. Keep it loose.', dose: '10 each way, per leg', minutes: 1, kind: 'mobility' },
  worldsGreatest: {
    name: 'World’s greatest stretch',
    how: 'Step into a long lunge and put both hands on the floor. Twist and reach one arm up to the ceiling.',
    dose: '3 per side',
    minutes: 1,
    kind: 'mobility',
    tutorials: ['worldsGreatestStretch'],
  },
  ankleRocks: {
    name: 'Knee-to-wall ankle rocks',
    how: 'Face a wall with one foot forward. Push the knee toward the wall without lifting the heel.',
    dose: '10 per side',
    minutes: 1,
    kind: 'mobility',
    tutorials: ['ankleMobility'],
  },
  catCow: { name: 'Cat-cow', how: 'On hands and knees. Slowly round your back up, then let it sag down.', dose: '8 slow reps', minutes: 1, kind: 'mobility', tutorials: ['catCow'] },
  armCircles: { name: 'Arm circles', how: 'Arms out to the sides. Make big, slow circles forwards, then backwards.', dose: '10 each way', minutes: 1, kind: 'mobility' },
  pullAparts: {
    name: 'Band pull-aparts',
    how: 'Hold a light band in front of your chest, arms straight. Pull it apart until it touches your chest.',
    dose: '15 reps',
    minutes: 1,
    kind: 'mobility',
  },
  openBook: {
    name: 'Open book',
    how: 'Lie on your side, knees bent, arms out in front. Open the top arm across to the other side and follow it with your eyes.',
    dose: '6 per side',
    minutes: 1,
    kind: 'mobility',
    tutorials: ['openBook'],
  },
} satisfies Record<string, WarmupStep>;

// ─── Sessions ─────────────────────────────────────────────────────────────────

const LIGHTER_SET_CUE = 'Lighter set first: 1 set of 5 at about half your work weight.';

export const SESSIONS: Record<SessionId, Session> = {
  upperA: {
    id: 'upperA',
    name: 'Upper A — Bench focus (Sunday)',
    short: 'Upper A',
    focus: 'Pushing and pulling in front of you. The bench press is the main strength lift.',
    minutes: '60–75 min',
    slot: 'weekend',
    warmup: [easyCardio('Rower or bike'), DRILL.armCircles, DRILL.pullAparts, DRILL.openBook, rampUp('bench press', 'Empty bar')],
    exercises: [
      {
        id: 'bench',
        name: 'Barbell bench press',
        muscles: 'Chest, front of shoulders, triceps',
        alternative: 'Dumbbell bench press, same sets and reps. Or the Smith machine bench press.',
        sets: { learn: 3, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        rir: '2',
        restSec: 180,
        increment: '+2.5 kg',
        cues: [
          'Lie with your eyes under the bar.',
          'Pull your shoulder blades back and down. Keep a small arch.',
          'Feet flat on the floor.',
          'Lower the bar slowly to your lower chest. Forearms straight up and down.',
          'Press up and slightly back toward your face.',
          'Always use the safety pins or a spotter.',
        ],
        tutorials: ['benchPress'],
        isMainLift: true,
      },
      {
        id: 'row',
        name: 'Barbell row',
        muscles: 'Upper back, lats (sides of the back), back of shoulders',
        alternative: 'Chest-supported dumbbell row, or the seated cable row. Use these too if your lower back is tired.',
        sets: { learn: 3, build: 3 },
        reps: '8–10',
        repRange: [8, 10],
        rir: '2',
        restSec: 120,
        increment: '+2.5 kg',
        rampSets: 1,
        cues: [
          LIGHTER_SET_CUE,
          'Bend forward at the hips to about 45°. Keep your back flat.',
          'Tighten your stomach as if about to be poked.',
          'Pull the bar to your lower ribs, elbows first.',
          'Don’t jerk the weight up with your hips.',
        ],
        tutorials: ['barbellRow'],
      },
      {
        id: 'db-ohp',
        name: 'Seated dumbbell shoulder press',
        muscles: 'Shoulders, triceps',
        alternative: 'Shoulder press machine.',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '2',
        restSec: 120,
        increment: 'next dumbbell (+1–2 kg each)',
        cues: ['Bench upright, or one notch back.', 'Lower the dumbbells to about ear level.', 'Press up. Don’t let your ribs flare out.'],
      },
      {
        id: 'pulldown',
        name: 'Lat pulldown',
        muscles: 'Lats (sides of the back), biceps',
        alternative: 'Assisted pull-up machine, or a one-arm dumbbell row.',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin (+2.5–5 kg)',
        cues: ['Lean back a little, chest up.', 'Pull the bar to your upper chest by driving the elbows down.', 'Let your arms stretch fully at the top.'],
        tutorials: ['latPulldown'],
      },
      {
        id: 'lateral-a',
        name: 'Dumbbell lateral raise',
        muscles: 'Side of the shoulders',
        alternative: 'One-arm cable lateral raise, or the lateral raise machine.',
        sets: { learn: 2, build: 3 },
        reps: '12–20',
        repRange: [12, 20],
        rir: '1–2',
        restSec: 60,
        increment: 'add reps first; next dumbbell only at 3 × 20',
        cues: ['Keep a small bend in the elbows.', 'Lift to shoulder height, elbows leading.', 'Lower slowly.', 'Start light: 4–6 kg.'],
        tutorials: ['lateralRaise'],
      },
      {
        id: 'pushdown',
        name: 'Triceps rope pushdown (superset with curl)',
        muscles: 'Triceps',
        alternative: 'Overhead dumbbell triceps extension (one dumbbell, both hands), or a straight-bar cable pushdown.',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Superset: do a set of curls straight after each pushdown set, then rest.', 'Elbows stay at your sides.', 'Pull the rope apart at the bottom.', 'Let it up slowly.'],
        tutorials: ['pushdown'],
      },
      {
        id: 'curl',
        name: 'Dumbbell curl',
        muscles: 'Biceps',
        alternative: 'Cable curl, or EZ-bar curl.',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 90,
        increment: 'next dumbbell',
        supersetWith: 'pushdown',
        cues: ['Done straight after each pushdown set; the rest comes after the curls.', 'Keep your elbows still.', 'Turn the palm up as you curl.', 'No swinging.'],
        tutorials: ['curl'],
      },
    ],
    finisher: 'Easy bike or incline walk for 8 min (you can still talk in full sentences). Then 2 min of stretching. It counts toward your weekly cardio.',
    finisherMin: 10,
  },
  lowerA: {
    id: 'lowerA',
    name: 'Lower A — Squat focus (Saturday)',
    short: 'Lower A',
    focus: 'Squat strength, plus the back of the legs, calves and core.',
    minutes: '60–75 min',
    slot: 'weekend',
    warmup: [easyCardio('Bike or incline walk'), DRILL.legSwings, DRILL.worldsGreatest, DRILL.ankleRocks, rampUp('squat', 'Empty bar')],
    exercises: [
      {
        id: 'box-jump',
        name: 'Box jump (low box)',
        muscles: 'Power, safe landings',
        alternative: 'No box free? Squat jumps on the floor, 3 × 3, landing softly.',
        sets: { learn: 0, build: 3 },
        reps: '3',
        repRange: [3, 3],
        rir: 'stop while jumps are fast',
        restSec: 90,
        increment: 'keep the box low (30–45 cm); aim for soft, quiet landings',
        cues: ['Do these after the warm-up, just before your first squat work set.', 'Swing the arms, jump up, land softly with bent knees.', 'Step down. Don’t jump down.', 'Stop if your landings get loud.'],
        tutorials: ['boxJump'],
        fromWeek: 3,
      },
      {
        id: 'squat',
        name: 'Barbell back squat',
        muscles: 'Front of thighs, glutes, inner thighs',
        alternative: 'Smith machine squat, or the hack squat machine. Same sets and reps.',
        sets: { learn: 3, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        rir: '2',
        restSec: 180,
        increment: '+2.5–5 kg',
        cues: [
          'Bar on your upper back, hands just outside your shoulders.',
          'Before each rep, take a big breath and tighten your stomach. Hold it on the way down.',
          'Knees point the same way as your toes.',
          'Go as deep as you can while your back stays straight. Goal: hip crease at or below the knee.',
          'Set the safety bars just below your lowest point.',
        ],
        tutorials: ['backSquat', 'squatWarmUp'],
        isMainLift: true,
      },
      {
        id: 'rdl',
        name: 'Romanian deadlift',
        muscles: 'Hamstrings (back of thighs), glutes, back',
        alternative: 'Dumbbell Romanian deadlift, same sets and reps.',
        sets: { learn: 3, build: 3 },
        reps: '8–10',
        repRange: [8, 10],
        rir: '2',
        restSec: 150,
        increment: '+2.5–5 kg',
        rampSets: 1,
        cues: [
          LIGHTER_SET_CUE,
          'Knees slightly bent. Push your hips back.',
          'Slide the bar down your thighs.',
          'Stop when you feel a stretch in the back of your legs and your back is still flat.',
        ],
        tutorials: ['rdl'],
      },
      {
        id: 'leg-press',
        name: 'Leg press',
        muscles: 'Front of thighs, glutes',
        alternative: 'Hack squat machine, or a dumbbell goblet squat.',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '2',
        restSec: 120,
        increment: '+5–10 kg',
        cues: ['Lower until just before your lower back lifts off the pad.', 'Knees in line with your toes.', 'Don’t snap the knees straight at the top.'],
        tutorials: ['legPress'],
      },
      {
        id: 'leg-curl',
        name: 'Seated or lying leg curl',
        muscles: 'Hamstrings (back of thighs)',
        alternative: 'The other leg curl machine (seated or lying), or stability-ball leg curls.',
        sets: { learn: 2, build: 3 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 60,
        increment: 'next pin',
        cues: ['Use the full movement.', 'Squeeze at the top.', 'Take 2–3 s to let it back.'],
        tutorials: ['legCurl'],
      },
      {
        id: 'calf-a',
        name: 'Standing calf raise',
        muscles: 'Calves',
        alternative: 'Calf raise on the leg press machine, or the Smith machine standing calf raise.',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        rir: '1–2',
        restSec: 60,
        increment: 'next pin',
        cues: ['Let the heels drop for a full stretch. Pause 1 s.', 'Rise as high as you can.'],
        tutorials: ['calfRaise'],
      },
      {
        id: 'dead-bug',
        name: 'Dead bug → ab-wheel rollout',
        muscles: 'Core (stops your lower back from arching)',
        alternative: 'Front plank, 2 × 30–45 s. Needs no equipment.',
        sets: { learn: 2, build: 2 },
        reps: '6–10 per side',
        repRange: [6, 10],
        rir: 'perfect form',
        restSec: 60,
        increment: 'when 2 × 10 per side is easy, move to kneeling ab-wheel rollouts',
        cues: ['Lower back stays pressed into the floor.', 'Breathe out fully as the arm and leg reach out.'],
        tutorials: ['deadBug'],
      },
    ],
    finisher: 'Easy bike for 8 min (you can still talk in full sentences). Then hip flexor stretch and couch stretch, 30 s per side.',
    finisherMin: 10,
  },
  upperB: {
    id: 'upperB',
    name: 'Upper B — Press & pull-up (weekday, short)',
    short: 'Upper B',
    focus: 'Pushing overhead and pulling down. The overhead press is the main strength lift. 4 exercises, 45 min or less.',
    minutes: '34–42 min (estimate)',
    slot: 'weekday',
    warmup: [easyCardio('Rower or bike'), DRILL.pullAparts, DRILL.openBook, rampUp('overhead press', 'Empty bar')],
    exercises: [
      {
        id: 'ohp',
        name: 'Standing barbell overhead press',
        muscles: 'Shoulders, triceps, upper back',
        alternative: 'Standing or seated dumbbell shoulder press, same sets and reps.',
        sets: { learn: 2, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        rir: '2',
        restSec: 180,
        increment: '+1–2.5 kg (use small plates if you have them)',
        cues: [
          'Hands just outside your shoulders, forearms straight up and down.',
          'Squeeze your glutes. Keep your ribs down.',
          'Tip your head back a little, press the bar straight up, then push your head forward under it at the top.',
        ],
        tutorials: ['overheadPress'],
        isMainLift: true,
      },
      {
        id: 'pullup',
        name: 'Pull-up (assisted until you get 3 × 5)',
        muscles: 'Lats (sides of the back), biceps, upper back',
        alternative: 'Lat pulldown, same sets and reps.',
        sets: { learn: 2, build: 3 },
        reps: '5–10',
        repRange: [5, 10],
        rir: '2',
        restSec: 150,
        increment: 'less help first; then more reps; then a little added weight',
        rampSets: 1,
        cues: [
          'Lighter set first: 3–5 easy reps with more help from the machine or band.',
          'Start hanging with straight arms and your shoulders pulled down.',
          'Pull your chest up to the bar.',
          'Lower slowly, in about 2–3 s.',
        ],
        tutorials: ['pullUp'],
        isMainLift: true,
      },
      {
        id: 'incline-db',
        name: 'Incline dumbbell press',
        muscles: 'Upper chest, front of shoulders, triceps',
        alternative: 'Incline Smith machine press, or the incline chest press machine.',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '2',
        restSec: 120,
        increment: 'next dumbbell',
        cues: ['Bench at 30°.', 'Lower until you feel a stretch in your chest.', 'Keep the elbows a little tucked in.'],
        tutorials: ['inclineDbPress'],
      },
      {
        id: 'face-pull',
        name: 'Face pull',
        muscles: 'Back of shoulders, small shoulder muscles',
        alternative: 'Reverse fly machine (rear delt), or a bent-over dumbbell reverse fly.',
        sets: { learn: 2, build: 2 },
        reps: '12–20',
        repRange: [12, 20],
        rir: '2',
        restSec: 60,
        increment: 'add reps, then the next pin',
        supersetWith: 'incline-db',
        cues: ['Done straight after each incline press set (set the cable up first); the rest comes after the face pulls.', 'Rope at forehead height.', 'Pull toward your eyes. Hands apart, thumbs back.'],
        tutorials: ['facePull'],
      },
    ],
    finisher: 'None on weekdays. Go home, eat and sleep.',
    finisherMin: 0,
  },
  lowerB: {
    id: 'lowerB',
    name: 'Lower B — Deadlift (weekday, short)',
    short: 'Lower B',
    focus: 'Deadlift strength, one-leg work, glutes and core. 5 exercises, 45 min or less.',
    minutes: '38–42 min (estimate)',
    slot: 'weekday',
    warmup: [easyCardio('Bike or incline walk'), DRILL.catCow, DRILL.worldsGreatest, rampUp('deadlift', 'Empty bar (or a light weight)')],
    exercises: [
      {
        id: 'deadlift',
        name: 'Trap-bar deadlift (or conventional)',
        muscles: 'Back of the body, thighs, grip',
        alternative: 'No trap bar? A normal barbell deadlift, same sets and reps. No bar or platform free? Heavy dumbbell Romanian deadlift.',
        sets: { learn: 2, build: 3 },
        reps: '4–6',
        repRange: [4, 6],
        rir: '2',
        restSec: 180,
        increment: '+5 kg while you are new, later +2.5 kg',
        cues: [
          'Stand in the middle of the bar.',
          'Hips down, chest up. Pull the bar up just enough to take the slack out.',
          'Push the floor away. Hips and shoulders rise together.',
          'Let the bar settle on the floor between reps. No bouncing.',
        ],
        tutorials: ['trapBarDeadlift', 'deadlift'],
        isMainLift: true,
      },
      {
        id: 'split-squat',
        name: 'Bulgarian split squat',
        muscles: 'Front of thighs, glutes, balance',
        alternative: 'Dumbbell reverse lunges, or walking lunges.',
        sets: { learn: 2, build: 2 },
        reps: '8–12 per leg',
        repRange: [8, 12],
        rir: '2',
        restSec: 90,
        increment: 'bodyweight first, then the next dumbbell',
        cues: ['Back foot on a bench. Front foot far enough forward.', 'Drop straight down.', 'Leaning forward a little is fine.'],
        perSide: true,
        tutorials: ['splitSquat'],
      },
      {
        id: 'hip-thrust',
        name: 'Barbell hip thrust',
        muscles: 'Glutes',
        alternative: 'Smith machine hip thrust, or the hip thrust / glute bridge machine. No bench free? Barbell glute bridge on the floor.',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        rir: '1–2',
        restSec: 120,
        increment: '+5 kg',
        rampSets: 1,
        cues: [LIGHTER_SET_CUE, 'Upper back on the bench edge, chin tucked.', 'Shins straight up and down at the top.', 'Push your hips all the way up without arching your lower back.'],
        tutorials: ['hipThrust'],
      },
      {
        id: 'calf-b',
        name: 'Seated calf raise',
        muscles: 'Calves (lower part)',
        alternative: 'Standing calf raise machine, or a calf raise on the leg press.',
        sets: { learn: 2, build: 2 },
        reps: '12–15',
        repRange: [12, 15],
        rir: '1–2',
        restSec: 60,
        increment: 'next pin',
        cues: ['Pause at the bottom, in the stretch.'],
        tutorials: ['calfRaise'],
      },
      {
        id: 'knee-raise',
        name: 'Hanging knee raise',
        muscles: 'Core, grip',
        alternative: 'Knee raise on the captain’s chair (dip station), or lying reverse crunch on a bench.',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        rir: 'no swinging',
        restSec: 60,
        increment: 'lower more slowly, then straighten the legs',
        supersetWith: 'calf-b',
        cues: ['Done straight after each calf-raise set; the rest comes after the knee raises.', 'Curl your hips up toward your chest. Don’t just lift the knees.'],
        tutorials: ['hangingKneeRaise'],
      },
    ],
    finisher: 'None on weekdays. Go home, eat and sleep.',
    finisherMin: 0,
  },
};

/** Order the sessions are listed in on the Program tab. */
export const SESSION_ORDER: SessionId[] = ['lowerA', 'upperA', 'lowerB', 'upperB'];

export type DayType = 'lift-fixed' | 'lift-flex' | 'rest';

// ─── Weekly schedule ──────────────────────────────────────────────────────────
// 4 sessions a week: Saturday (Lower A) and Sunday (Upper A) are fixed and
// train different regions. Two short weekday sessions (Lower B, Upper B) are
// flexible: they happen only if you can be at the gym by 9:00 PM (it closes at
// 10 PM), never two on one day, and a missed one is skipped, not made up.

/** Latest arrival at the gym for a weekday session (24 h clock, local time). */
export const WEEKDAY_GYM_CUTOFF = { hour: 21, minute: 0, label: '9:00 PM' } as const;

/** Weekdays each flexible session may fall on. */
export const FLEX_WINDOWS: Record<'lowerB' | 'upperB', DayName[]> = {
  // Not Thursday or Friday, so there are ≥ 2 full days before Saturday's lower session.
  lowerB: ['Monday', 'Tuesday', 'Wednesday'],
  // Not Monday: the day after Sunday's upper session.
  upperB: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

export const WEEK_PLAN: Record<DayName, { type: DayType; label: string; detail: string }> = {
  Monday: { type: 'lift-flex', label: 'Lower B (if at the gym by 9 PM)', detail: 'Lower B can be Mon, Tue or Wed. If not today, walk 20–30 min.' },
  Tuesday: { type: 'lift-flex', label: 'Lower B or Upper B', detail: 'Best day for one of the two short sessions.' },
  Wednesday: { type: 'lift-flex', label: 'Lower B or Upper B', detail: 'Last day for Lower B this week.' },
  Thursday: { type: 'lift-flex', label: 'Upper B (if not done)', detail: 'Upper B can be Tue to Fri.' },
  Friday: { type: 'lift-flex', label: 'Upper B (if not done)', detail: 'Last chance for Upper B. If not, rest before the weekend.' },
  Saturday: { type: 'lift-fixed', label: 'Lower A', detail: 'Squat day · 60–75 min, late morning' },
  Sunday: { type: 'lift-fixed', label: 'Upper A', detail: 'Bench day · 60–75 min, late morning' },
};

/** Short definitions shown on the Program tab. Each term is explained once, in plain words. */
export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'RIR (reps in reserve)', meaning: 'Reps left in the tank: how many more good reps you could have done. RIR 2 = you stop with 2 good reps left.' },
  { term: 'RPE', meaning: 'Effort on a 1–10 scale. RPE = 10 − RIR, so RIR 2 is RPE 8.' },
  { term: 'Compound lift', meaning: 'Uses several joints and big muscles at once, like the squat, bench press or deadlift.' },
  { term: 'Isolation lift', meaning: 'Works one joint and a smaller muscle, like a curl or a calf raise.' },
  { term: 'Lighter (ramp-up) sets', meaning: 'Easy sets that build up to your work weight. They don’t count as work sets.' },
  { term: 'Superset', meaning: 'Two exercises done back to back, then one rest.' },
  { term: 'Double progression', meaning: 'First add reps. When every set reaches the top of the rep range, add a little weight and start again at the bottom.' },
  { term: 'Deload', meaning: 'An easier week: half the sets and a bit lighter, to let tiredness clear.' },
  { term: 'Easy pace (Zone 2)', meaning: 'Cardio where you can still talk in full sentences, but not sing.' },
  { term: 'Hip hinge', meaning: 'Bending forward by pushing the hips back, with a flat back (as in the Romanian deadlift).' },
  { term: 'Brace', meaning: 'Take a big breath and tighten your stomach, as if about to be poked. Hold it during the rep.' },
  { term: 'Full range of motion', meaning: 'Moving the joint as far as you can with good form, e.g. a deep squat.' },
];

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
    summary: 'Fewer sets. Stop with 3–4 good reps left. Find your starting weights.',
    details: [
      'Pick weights you could lift 3–4 more times. Good form matters more than weight.',
      'Film one set of squat, bench and deadlift from the side. Compare it with the videos.',
      'Expect sore muscles in week 1. It goes away fast. Don’t judge a workout by it.',
    ],
  },
  {
    weeks: 'Weeks 3–12',
    name: 'Build',
    summary: 'All sets, at the listed reps left (RIR). Add reps first, then weight.',
    details: [
      'Most beginners add weight to the main lifts every week or two here.',
      'Box jumps start in week 3 on Saturdays.',
      'Measure your waist and take photos every 4 weeks.',
    ],
  },
  {
    weeks: 'When needed',
    name: 'Deload week (easy week)',
    summary: 'Same exercises, about half the sets, about 10% lighter, stop with 4+ reps left. Turn it on in Settings.',
    details: [
      'Take one when the warning signs below show up, or at the latest every 8–10 weeks. Many beginners won’t need one sooner.',
      'A busy work week, illness or travel is a good time for it.',
      'Sessions are shorter that week. The weekend ones may be under 60 min. That is fine.',
      'Keep cardio easy and keep walking.',
    ],
  },
  {
    weeks: 'Months 4+',
    name: 'Refine',
    summary: 'Keep building from your new weights. Sets per muscle can rise toward 10–15 a week.',
    details: [
      'If a main lift stops moving from session to session, aim for a small weekly gain instead: one more rep on any set, or a small weight jump.',
      'Add a third set to a muscle that is lagging. One muscle at a time.',
      'After about 6 months, swap a few smaller exercises for variety (e.g. leg press → hack squat).',
    ],
  },
];

export const PROGRESSION_RULES = [
  {
    title: 'How to progress (double progression)',
    body: 'Each exercise has a rep range, e.g. 8–12. Keep the same weight until every set reaches 12 reps with the listed reps left. Next time, add the smallest weight step and start again at 8.',
  },
  {
    title: 'Reps left in the tank (RIR)',
    body: 'How many more good reps you could have done. RIR 2 = stop with 2 left. Some people use RPE, a 1–10 effort scale: RPE = 10 − RIR, so RIR 2 is RPE 8. Beginners often guess too high, so film a set now and then.',
  },
  {
    title: 'If a lift gets stuck',
    body: 'Same weight, fewer reps two sessions in a row? First check sleep, food and stress. Then try the same weight once more. Still stuck? Drop the weight about 10% and build back up. This is normal and usually clears in 2–3 weeks.',
  },
  {
    title: 'Pain or just hard work?',
    body: 'Muscle burn and tiredness are fine. Sharp pain, joint pain, or tingling is not. Stop that exercise and use the listed alternative. If it lasts more than a week, get it checked.',
  },
];

export const DELOAD_SIGNALS = [
  'Two or more main lifts go down in the same week',
  'You sleep under 6.5 hours most nights for a week',
  'Joints ache (not just sore muscles), or you have no drive to train for over a week',
  'Illness, exams, travel or a big work deadline is coming. Take the easy week then.',
];

// ─── Missed sessions and real life ────────────────────────────────────────────

export interface ScheduleRule {
  situation: string;
  action: string;
  why?: string;
}

export const MISSED_SESSION_RULE =
  'Missed a session? Skip it. Don’t make it up. Do the next session on its normal day with the same weights. Never add sets, never do two sessions in one day, and never move a weekday session outside its days.';

export const SCHEDULE_RULES: ScheduleRule[] = [
  {
    situation: 'You can’t be at the gym by 9:00 PM',
    action: 'Skip tonight. Try the next day that session is allowed. If its days are over, skip it this week.',
    why: 'Training until 10 PM pushes dinner and sleep past 12:30 AM. Sleep matters more than one short session.',
  },
  {
    situation: 'Only one weekday session happened',
    action: 'That is a 3-session week. That’s fine. Carry on as normal next week.',
    why: 'Three good sessions beat four rushed ones.',
  },
  {
    situation: 'Missed Saturday or Sunday',
    action: 'Skip it. Don’t do both weekend sessions on one day. Don’t move it to a weekday.',
  },
  {
    situation: 'Short on time (30 min or less at the gym)',
    action: 'Do the full warm-up, then only the first three exercises.',
  },
  {
    situation: 'Back after 1–2 weeks off',
    action: 'Use about 90% of your last weights for a week. Then carry on as normal.',
  },
  {
    situation: 'Back after 3+ weeks off',
    action: 'Use about 80% of your last weights and 2 sets per exercise for a week. Then go back to normal. Strength comes back faster than it took to build.',
  },
  {
    situation: 'Ill',
    action: 'Only a mild cold (above the neck)? An easy session or a walk is fine. Fever, body aches or chest symptoms? Rest until you are better.',
  },
];

export const NEVER_DO = [
  'Never do two lifting sessions on the same day.',
  'Never add sets or a fifth session to “make up” for a missed one.',
  'Never start a weekday session after 9:00 PM.',
  'Never cut sleep to fit a workout in. A missed session costs far less than a week of short sleep.',
];

export const INJURY_PREVENTION = [
  'Warm up every time: 5 min easy cardio, the listed drills, then lighter sets for the first lift.',
  'Form before weight. In weeks 1–2, stop with 3–4 good reps left.',
  'Use the safety pins or bars for squat and bench, and clips on the bar.',
  'Add weight in small steps (2.5 kg on a barbell), and only after every set hits the top of the rep range.',
  'Muscle burn is fine. Sharp pain, joint pain or tingling is not: stop that exercise and use the alternative. If it lasts more than a week, get it checked.',
  'Sleep 7+ hours and eat all four meals. Tiredness and too little food raise the risk of injury.',
];

// ─── Cardio & mobility ────────────────────────────────────────────────────────

export const CARDIO = {
  weeklyTarget: 'Aim for 150+ minutes of moderate activity a week (WHO). Brisk walks, warm-ups and easy cardio after weekend sessions all count.',
  steps: 'Daily steps: build up to 8,000 or more. In large studies of adults under 60, the risk of dying early keeps falling up to about 8,000–10,000 steps a day. Walking on the commute and a 20–30 min walk on non-gym evenings count.',
  sitting: 'Break up sitting: stand or walk for 2–3 minutes every 30–45 minutes at work. Short walks after meals lower blood sugar.',
  zone2: {
    title: 'Easy cardio (Zone 2): after weekend sessions, or a brisk walk',
    how: '8–10 min on a bike, rower or incline treadmill after Saturday and Sunday sessions, plus brisk walks. Easy pace: you can talk in full sentences but not sing (the talk test). That is roughly 60–70% of your max heart rate, about 120–137 beats a minute at age 24.',
  },
  intervals: {
    title: 'Hard intervals: optional, Sundays from week 8',
    how: 'After Upper A, if you feel fresh: 30 s hard, 90 s easy on a bike, 6 times. Not after a leg session. Skip them while you are still building up how much you eat.',
  },
  interference: 'Cardio at this amount doesn’t slow muscle or strength gains (Schumann 2022). Keep hard intervals away from leg days.',
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
    when: 'Every day, about 6 min, before lunch or after work',
    items: [
      { name: 'Half-kneeling hip flexor stretch', dose: '45 s per side', tutorials: ['hipFlexorStretch'] },
      { name: 'Open book (upper-back twist)', dose: '6 per side', tutorials: ['openBook'] },
      { name: 'Cat-cow', dose: '8 slow reps', tutorials: ['catCow'] },
      { name: 'Knee-to-wall ankle rocks', dose: '10 per side', tutorials: ['ankleMobility'] },
    ],
  },
  {
    title: 'Weekend mobility',
    when: 'Saturday and Sunday after training, or any evening, about 15 min',
    items: [
      { name: "World's greatest stretch", dose: '5 per side', tutorials: ['worldsGreatestStretch'] },
      { name: '90/90 hip switches', dose: '6 per side', tutorials: ['hip9090'] },
      { name: 'Couch stretch', dose: '2 × 45 s per side', tutorials: ['couchStretch'] },
      { name: 'Deep squat hold (hold on to something)', dose: '3 × 30 s' },
      { name: 'Doorway chest stretch', dose: '2 × 30 s' },
    ],
  },
];

export const MOBILITY_NOTES = [
  'Lifting through a full range of motion (as deep as good form allows) improves flexibility about as much as stretching. Your squats, Romanian deadlifts and split squats already count.',
  'Short stretches (60 s or less per muscle) before lifting don’t make you weaker. Save long holds for after training or another time.',
];
