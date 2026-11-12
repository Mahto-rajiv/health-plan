import type { DayName } from './meal-plans';
import type { ExerciseLinkId, ExerciseTutorialId } from './tutorials';

// ─── Program design (Nov 2026 redesign; evidence in PROGRESS.md) ──────────────
// Evidence (abstracts checked Nov 2026):
//  • Muscle size depends on weekly hard sets, not on how often a muscle is
//    trained. Schoenfeld 2016 (Sports Med) favoured ≥ 2×/week, but the larger
//    Schoenfeld 2019 (J Sports Sci, 25 studies) found no difference when weekly
//    sets are equal. Pelland 2026 (Sports Med, 67 studies) agrees: volume matters
//    for size; frequency has little or no effect on size.
//  • Strength does rise with frequency: Pelland 2026 (with diminishing returns);
//    ACSM 2026 lists ≥ 2 sessions a week for strength. Grgic 2018 found the
//    frequency effect mostly explained by extra sets, strongest for multi-joint
//    lifts. Early strength gains are partly skill (Rutherford & Jones 1986), and
//    skill needs practice, so beginners benefit from doing each main lift twice
//    a week. ACSM 2009 advises 2–3 days a week for novices.
//  • So two muscle groups a day (each muscle once a week) can build size if
//    weekly sets match, but it practises each lift only once a week, and a missed
//    session means those muscles aren't trained that week. Training each muscle
//    2× a week is the better choice for a strength-first beginner.
//
// The split: up to 4 sessions a week, built around the two days that always
// happen (Saturday and Sunday) and two weekday sessions that happen only when
// you can be at the gym by 9 PM.
//  • Saturday: lower body. Sunday: upper body. Back-to-back days, so they train
//    different halves of the body. On their own they train every muscle once.
//  • Weekday A (Mon–Wed) and Weekday B (Tue–Fri) are full-body sessions. A starts
//    with the legs (deadlift), B with the upper body (overhead press). Either one
//    adds a second session for every main muscle, so a week with only one weekday
//    session still trains most muscles twice. The old upper/lower weekdays lost
//    half the body's second session whenever one was missed.
//  • Each main lift is practised twice a week when the week is complete: squat
//    pattern (back squat, split squat, goblet squat), hinge (Romanian deadlift,
//    deadlift, hip thrust), horizontal press (bench, dumbbell bench), overhead
//    press, rows and pull-downs/pull-ups.
//  • Weekly hard sets with all 4 sessions (from week 3): thighs (front) 10,
//    back of thighs and glutes 11, chest 8, back 12, shoulders 7 (plus all the
//    presses), arms 2 each plus the presses and pulls. Weekend only: 5–6 per big
//    muscle, still enough for a beginner to progress.
//  • Effort: stop with 1–3 good reps left (3–4 in weeks 1–2). Loads: 4–8 reps on
//    the main barbell lifts for strength, 8–20 on the rest.
//  • Rest: 2–3 min on main lifts, 60–120 s on smaller ones.
//  • Adding weight: reps first, then the smallest weight step.
//  • Easy week: when the warning signs show, or at the latest every 8–10 weeks.
//
// ─── Session length (see sessionTime() in lib/training.ts) ────────────────────
// minutes = warm-up steps (summed)
//         + for each exercise: sets × (work + rest) + 1 min setup/changeover
//           + 1 min per lighter set before a later heavy lift
//         + finish minutes.
// Work = 40 s per set (80 s for one-side-at-a-time sets). Rest is counted after
// every set, including the last one. An exercise paired with another (done
// straight after it, at the same spot) adds only its work time.
// Limits: weekday sessions ≤ 60 min including the warm-up (planned to ≤ 55 min,
// a 5-minute margin because the times are estimates); weekend 60–75 min.

export type SessionId = 'lower' | 'upper' | 'fullA' | 'fullB';

/** What to do when the equipment is taken: same muscles, similar movement, different equipment. */
export interface Alternative {
  name: string;
  equipment: string;
  note?: string;
  /** One verified tutorial (a video where one could be found). */
  link: ExerciseLinkId;
}

export interface Exercise {
  id: string;
  name: string;
  muscles: string;
  equipment: string;
  /** Sets during weeks 1–2 (learning) and from week 3 on. */
  sets: { learn: number; build: number };
  reps: string;
  /** Bottom and top of the rep range, for adding weight. */
  repRange: [number, number];
  /** Good reps left at the end of each set (from week 3), e.g. "2" or "1–2"; or a plain cue. */
  repsLeft: string;
  restSec: number;
  /** Weight step once every set reaches the top of the rep range. */
  increment: string;
  cues: string[];
  alternative: Alternative;
  /** One verified tutorial (a video where one could be found). */
  link: ExerciseLinkId;
  /** Main strength lift (longer rest, lighter sets before it). */
  isMainLift?: boolean;
  /** Done one side at a time, so each set takes twice as long. */
  perSide?: boolean;
  /** Lighter sets done just before the work sets (later heavy lifts only; the first lift's are in the warm-up). */
  rampSets?: number;
  /** Done straight after this exercise at the same spot, then one rest: no extra rest or setup. */
  pairedWith?: string;
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
  /** Weekend sessions are fixed (60–75 min, including a 10 min finish); weekday ones are flexible and ≤ 60 min. */
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
  lower: {
    id: 'lower',
    name: 'Lower body — Squat day (Saturday)',
    short: 'Lower body',
    focus: 'Squat strength, plus the back of the legs, calves and core.',
    minutes: '60–75 min',
    slot: 'weekend',
    warmup: [easyCardio('Bike or incline walk'), DRILL.legSwings, DRILL.worldsGreatest, DRILL.ankleRocks, rampUp('squat', 'Empty bar')],
    exercises: [
      {
        id: 'squat',
        name: 'Barbell back squat',
        muscles: 'Front of thighs, glutes, inner thighs',
        equipment: 'Barbell in a squat rack',
        sets: { learn: 3, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        repsLeft: '2',
        restSec: 180,
        increment: '+2.5–5 kg',
        cues: [
          'Bar on your upper back, hands just outside your shoulders.',
          'Before each rep, take a big breath and tighten your stomach. Hold it on the way down.',
          'Knees point the same way as your toes.',
          'Go as deep as you can while your back stays straight. Goal: hip crease at or below the knee.',
          'Set the safety bars just below your lowest point.',
        ],
        alternative: { name: 'Smith machine squat', equipment: 'Smith machine', note: 'Same sets and reps. Feet a little in front of the bar.', link: 'smithSquat' },
        link: 'backSquat',
        isMainLift: true,
      },
      {
        id: 'rdl',
        name: 'Romanian deadlift',
        muscles: 'Back of thighs, glutes, lower back',
        equipment: 'Barbell',
        sets: { learn: 3, build: 3 },
        reps: '8–10',
        repRange: [8, 10],
        repsLeft: '2',
        restSec: 150,
        increment: '+2.5–5 kg',
        rampSets: 1,
        cues: [
          LIGHTER_SET_CUE,
          'Knees slightly bent. Push your hips back.',
          'Slide the bar down your thighs.',
          'Stop when you feel a stretch in the back of your legs and your back is still flat.',
        ],
        alternative: { name: 'Dumbbell Romanian deadlift', equipment: 'Dumbbells', note: 'Same sets and reps.', link: 'dbRdl' },
        link: 'rdl',
      },
      {
        id: 'leg-press',
        name: 'Leg press',
        muscles: 'Front of thighs, glutes',
        equipment: 'Leg press machine',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '2',
        restSec: 120,
        increment: '+5–10 kg',
        cues: ['Lower until just before your lower back lifts off the pad.', 'Knees in line with your toes.', 'Don’t snap the knees straight at the top.'],
        alternative: { name: 'Hack squat', equipment: 'Hack squat machine', link: 'hackSquat' },
        link: 'legPress',
      },
      {
        id: 'leg-curl',
        name: 'Seated or lying leg curl',
        muscles: 'Back of thighs',
        equipment: 'Leg curl machine',
        sets: { learn: 2, build: 3 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 60,
        increment: 'next pin',
        cues: ['Use the full movement.', 'Squeeze at the top.', 'Take 2–3 s to let it back.'],
        alternative: { name: 'Stability-ball leg curl', equipment: 'Stability ball', note: 'Heels on the ball, hips up, roll it in and out.', link: 'ballLegCurl' },
        link: 'legCurl',
      },
      {
        id: 'calf-raise',
        name: 'Standing calf raise',
        muscles: 'Calves',
        equipment: 'Calf raise machine',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 60,
        increment: 'next pin',
        cues: ['Let the heels drop for a full stretch. Pause 1 s.', 'Rise as high as you can.'],
        alternative: { name: 'One-leg dumbbell calf raise', equipment: 'One dumbbell and a step', note: 'Hold a rack with the free hand.', link: 'dbCalfRaise' },
        link: 'calfRaise',
      },
      {
        id: 'pallof',
        name: 'Cable Pallof press',
        muscles: 'Core (stops your body from twisting)',
        equipment: 'Cable machine',
        sets: { learn: 2, build: 2 },
        reps: '8–10 per side',
        repRange: [8, 10],
        repsLeft: 'slow, perfect form',
        restSec: 60,
        increment: 'next pin when 2 × 10 per side is easy',
        perSide: true,
        cues: ['Stand side-on to the cable, handle at your chest.', 'Press it straight out and hold 2 s. Don’t let it pull you round.', 'Bring it back slowly.'],
        alternative: { name: 'Band Pallof press', equipment: 'Resistance band tied to a rack', link: 'bandPallof' },
        link: 'cablePallof',
      },
    ],
    finisher: 'Easy bike for 8 min (you can still talk in full sentences). Then hip flexor stretch and couch stretch, 30 s per side.',
    finisherMin: 10,
  },
  upper: {
    id: 'upper',
    name: 'Upper body — Bench day (Sunday)',
    short: 'Upper body',
    focus: 'Pushing and pulling. The bench press is the main strength lift.',
    minutes: '60–75 min',
    slot: 'weekend',
    warmup: [easyCardio('Rower or bike'), DRILL.armCircles, DRILL.pullAparts, DRILL.openBook, rampUp('bench press', 'Empty bar')],
    exercises: [
      {
        id: 'bench',
        name: 'Barbell bench press',
        muscles: 'Chest, front of shoulders, triceps',
        equipment: 'Barbell and bench with safety pins',
        sets: { learn: 3, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        repsLeft: '2',
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
        alternative: { name: 'Dumbbell bench press', equipment: 'Dumbbells and a flat bench', note: 'Same sets and reps.', link: 'dbBench' },
        link: 'benchPress',
        isMainLift: true,
      },
      {
        id: 'cable-row',
        name: 'Seated cable row',
        muscles: 'Upper back, sides of the back, back of shoulders',
        equipment: 'Cable row station',
        sets: { learn: 3, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '2',
        restSec: 120,
        increment: 'next pin',
        cues: ['Sit tall, chest up, small bend in the knees.', 'Pull the handle to your lower ribs, elbows close to your sides.', 'Let your shoulders reach forward at the start of each rep.'],
        alternative: { name: 'One-arm dumbbell row', equipment: 'One dumbbell and a bench', note: 'One hand and knee on the bench.', link: 'oneArmRow' },
        link: 'seatedRow',
      },
      {
        id: 'incline-db',
        name: 'Incline dumbbell press',
        muscles: 'Upper chest, front of shoulders, triceps',
        equipment: 'Dumbbells and an incline bench',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '2',
        restSec: 120,
        increment: 'next dumbbell',
        cues: ['Bench at 30°.', 'Lower until you feel a stretch in your chest.', 'Keep the elbows a little tucked in.'],
        alternative: { name: 'Incline chest press machine', equipment: 'Incline chest press machine', link: 'inclineMachinePress' },
        link: 'inclineDbPress',
      },
      {
        id: 'pulldown',
        name: 'Lat pulldown',
        muscles: 'Sides of the back, biceps',
        equipment: 'Cable pulldown station',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '1–2',
        restSec: 90,
        increment: 'next pin (+2.5–5 kg)',
        cues: ['Lean back a little, chest up.', 'Pull the bar to your upper chest by driving the elbows down.', 'Let your arms stretch fully at the top.'],
        alternative: { name: 'Assisted pull-up', equipment: 'Assisted pull-up machine', note: 'Choose enough help to get the reps.', link: 'assistedPullupMachine' },
        link: 'latPulldown',
      },
      {
        id: 'lateral',
        name: 'Dumbbell lateral raise',
        muscles: 'Side of the shoulders',
        equipment: 'Dumbbells',
        sets: { learn: 2, build: 2 },
        reps: '12–20',
        repRange: [12, 20],
        repsLeft: '1–2',
        restSec: 60,
        increment: 'add reps first; next dumbbell only at 2 × 20',
        cues: ['Keep a small bend in the elbows.', 'Lift to shoulder height, elbows leading.', 'Lower slowly.', 'Start light: 4–6 kg.'],
        alternative: { name: 'One-arm cable lateral raise', equipment: 'Cable machine, low pulley', link: 'cableLateralRaise' },
        link: 'lateralRaise',
      },
      {
        id: 'pushdown',
        name: 'Triceps rope pushdown (paired with the curl)',
        muscles: 'Triceps',
        equipment: 'Cable machine with a rope',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Do a set of curls straight after each pushdown set, then rest.', 'Elbows stay at your sides.', 'Pull the rope apart at the bottom.', 'Let it up slowly.'],
        alternative: { name: 'Overhead dumbbell triceps extension', equipment: 'One dumbbell, held in both hands', link: 'overheadExtension' },
        link: 'pushdown',
      },
      {
        id: 'curl',
        name: 'Dumbbell curl',
        muscles: 'Biceps',
        equipment: 'Dumbbells',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 90,
        increment: 'next dumbbell',
        pairedWith: 'pushdown',
        cues: ['Done straight after each pushdown set; the rest comes after the curls.', 'Keep your elbows still.', 'Turn the palm up as you curl.', 'No swinging.'],
        alternative: { name: 'EZ-bar curl', equipment: 'EZ bar', link: 'ezCurl' },
        link: 'curl',
      },
    ],
    finisher: 'Easy bike or incline walk for 8 min (you can still talk in full sentences). Then 2 min of stretching. It counts toward your weekly cardio.',
    finisherMin: 10,
  },
  fullA: {
    id: 'fullA',
    name: 'Full body A — Deadlift day (weekday)',
    short: 'Full body A',
    focus: 'Legs first: the deadlift is the main strength lift, then one-leg work, a press, a row and core. Plan on 55 min or less.',
    minutes: '45–50 min (estimate)',
    slot: 'weekday',
    warmup: [easyCardio('Bike or incline walk'), DRILL.catCow, DRILL.worldsGreatest, rampUp('deadlift', 'Empty bar (or a light weight)')],
    exercises: [
      {
        id: 'deadlift',
        name: 'Trap-bar deadlift',
        muscles: 'Back of the body, thighs, grip',
        equipment: 'Trap bar (hex bar)',
        sets: { learn: 2, build: 3 },
        reps: '4–6',
        repRange: [4, 6],
        repsLeft: '2',
        restSec: 180,
        increment: '+5 kg while you are new, later +2.5 kg',
        cues: [
          'Stand in the middle of the bar.',
          'Hips down, chest up. Pull the bar up just enough to take the slack out.',
          'Push the floor away. Hips and shoulders rise together.',
          'Let the bar settle on the floor between reps. No bouncing.',
        ],
        alternative: { name: 'Barbell deadlift', equipment: 'Straight barbell', note: 'Same sets and reps. Start lighter: it is harder to learn.', link: 'deadlift' },
        link: 'trapBarDeadlift',
        isMainLift: true,
      },
      {
        id: 'split-squat',
        name: 'Bulgarian split squat',
        muscles: 'Front of thighs, glutes, balance',
        equipment: 'Dumbbells and a bench',
        sets: { learn: 2, build: 2 },
        reps: '8–12 per leg',
        repRange: [8, 12],
        repsLeft: '2',
        restSec: 90,
        increment: 'bodyweight first, then the next dumbbell',
        perSide: true,
        cues: ['Back foot on a bench. Front foot far enough forward.', 'Drop straight down.', 'Leaning forward a little is fine.'],
        alternative: { name: 'Smith machine split squat', equipment: 'Smith machine', note: 'Back foot on the floor or a low step.', link: 'smithSplitSquat' },
        link: 'splitSquat',
      },
      {
        id: 'db-bench',
        name: 'Dumbbell bench press',
        muscles: 'Chest, front of shoulders, triceps',
        equipment: 'Dumbbells and a flat bench',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '2',
        restSec: 120,
        increment: 'next dumbbell',
        cues: ['Kick the dumbbells up from your knees as you lie back.', 'Shoulder blades back and down.', 'Lower until you feel a stretch in your chest, elbows a little tucked in.'],
        alternative: { name: 'Seated chest press machine', equipment: 'Chest press machine', link: 'machineChestPress' },
        link: 'dbBench',
      },
      {
        id: 'cs-row',
        name: 'Chest-supported dumbbell row',
        muscles: 'Upper back, sides of the back, back of shoulders',
        equipment: 'Dumbbells and an incline bench',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '2',
        restSec: 90,
        increment: 'next dumbbell',
        cues: ['Lie face down on a bench set to about 30°.', 'Pull the dumbbells toward your hips, elbows close.', 'Pause 1 s at the top. Lower slowly.'],
        alternative: { name: 'Seated cable row', equipment: 'Cable row station', link: 'seatedRow' },
        link: 'chestSupportedRow',
      },
      {
        id: 'knee-raise',
        name: 'Hanging knee raise',
        muscles: 'Core, grip',
        equipment: 'Pull-up bar',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: 'no swinging',
        restSec: 60,
        increment: 'lower more slowly, then straighten the legs',
        cues: ['Curl your hips up toward your chest. Don’t just lift the knees.', 'Lower slowly.'],
        alternative: { name: 'Knee raise on the captain’s chair', equipment: 'Captain’s chair (dip station with back pad)', link: 'captainsChair' },
        link: 'hangingKneeRaise',
      },
    ],
    finisher: 'None on weekdays. Go home, eat and sleep.',
    finisherMin: 0,
  },
  fullB: {
    id: 'fullB',
    name: 'Full body B — Press day (weekday)',
    short: 'Full body B',
    focus: 'Upper body first: the overhead press and pull-up are the main lifts, then a squat, glutes and the back of the shoulders. Plan on 55 min or less.',
    minutes: '50–55 min (estimate)',
    slot: 'weekday',
    warmup: [easyCardio('Rower or bike'), DRILL.pullAparts, DRILL.openBook, rampUp('overhead press', 'Empty bar')],
    exercises: [
      {
        id: 'ohp',
        name: 'Standing barbell overhead press',
        muscles: 'Shoulders, triceps, upper back',
        equipment: 'Barbell in a rack',
        sets: { learn: 2, build: 3 },
        reps: '5–8',
        repRange: [5, 8],
        repsLeft: '2',
        restSec: 180,
        increment: '+1–2.5 kg (use small plates if you have them)',
        cues: [
          'Hands just outside your shoulders, forearms straight up and down.',
          'Squeeze your glutes. Keep your ribs down.',
          'Tip your head back a little and press the bar straight up.',
          'At the top, push your head forward under the bar.',
        ],
        alternative: { name: 'Seated dumbbell shoulder press', equipment: 'Dumbbells and an upright bench', note: 'Same sets and reps.', link: 'seatedDbPress' },
        link: 'overheadPress',
        isMainLift: true,
      },
      {
        id: 'pullup',
        name: 'Pull-up (with help until you can do 3 × 5)',
        muscles: 'Sides of the back, biceps, upper back',
        equipment: 'Pull-up bar with a band, or the assisted pull-up machine',
        sets: { learn: 2, build: 3 },
        reps: '5–10',
        repRange: [5, 10],
        repsLeft: '2',
        restSec: 150,
        increment: 'less help first; then more reps; then a little added weight',
        rampSets: 1,
        cues: [
          'Lighter set first: 3–5 easy reps with more help from the machine or band.',
          'Start hanging with straight arms and your shoulders pulled down.',
          'Pull your chest up to the bar.',
          'Lower slowly, in about 2–3 s.',
        ],
        alternative: { name: 'Lat pulldown', equipment: 'Cable pulldown station', note: 'Same sets and reps.', link: 'latPulldown' },
        link: 'pullUp',
        isMainLift: true,
      },
      {
        id: 'goblet',
        name: 'Goblet squat',
        muscles: 'Front of thighs, glutes',
        equipment: 'One dumbbell or kettlebell',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '2–3',
        restSec: 90,
        increment: 'next dumbbell',
        cues: ['Hold the dumbbell upright against your chest.', 'Sit down between your knees, chest up.', 'Elbows brush the inside of your knees at the bottom.', 'Keep it a little easier than Saturday: this is practice for the squat.'],
        alternative: { name: 'Leg press', equipment: 'Leg press machine', link: 'legPress' },
        link: 'gobletSquat',
      },
      {
        id: 'hip-thrust',
        name: 'Barbell hip thrust',
        muscles: 'Glutes',
        equipment: 'Barbell, pad and a bench',
        sets: { learn: 2, build: 2 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '1–2',
        restSec: 120,
        increment: '+5 kg',
        rampSets: 1,
        cues: [LIGHTER_SET_CUE, 'Upper back on the bench edge, chin tucked.', 'Shins straight up and down at the top.', 'Push your hips all the way up without arching your lower back.'],
        alternative: { name: 'Hip thrust machine', equipment: 'Hip thrust (glute bridge) machine', link: 'hipThrustMachine' },
        link: 'hipThrust',
      },
      {
        id: 'face-pull',
        name: 'Face pull',
        muscles: 'Back of shoulders, small shoulder muscles',
        equipment: 'Cable machine with a rope',
        sets: { learn: 2, build: 2 },
        reps: '12–20',
        repRange: [12, 20],
        repsLeft: '2',
        restSec: 60,
        increment: 'add reps, then the next pin',
        cues: ['Rope at forehead height.', 'Pull toward your eyes. Hands apart, thumbs back.', 'Pause 1 s, then let it back slowly.'],
        alternative: { name: 'Reverse fly machine', equipment: 'Reverse fly (rear delt) machine', note: 'Sit facing the pad, arms straight out in front, open them wide.', link: 'reverseFly' },
        link: 'facePull',
      },
    ],
    finisher: 'None on weekdays. Go home, eat and sleep.',
    finisherMin: 0,
  },
};

/** Order the sessions are listed in on the Program tab. */
export const SESSION_ORDER: SessionId[] = ['lower', 'upper', 'fullA', 'fullB'];

export type DayType = 'lift-fixed' | 'lift-flex' | 'rest';

// ─── Weekly schedule ──────────────────────────────────────────────────────────
// Up to 4 sessions a week: Saturday (lower body) and Sunday (upper body) are
// fixed and train different halves of the body. The two weekday full-body
// sessions are flexible: they happen only if you can be at the gym by 9:00 PM
// (it closes at 10 PM), never two on one day, and a missed one is skipped, not
// made up. The day windows are the same as before the redesign.

/** Latest arrival at the gym for a weekday session (24 h clock, local time). */
export const WEEKDAY_GYM_CUTOFF = { hour: 21, minute: 0, label: '9:00 PM' } as const;

/** Weekdays each flexible session may fall on. */
export const FLEX_WINDOWS: Record<'fullA' | 'fullB', DayName[]> = {
  // Starts with the deadlift: not Thursday or Friday, so there are ≥ 2 full days before Saturday's squats.
  fullA: ['Monday', 'Tuesday', 'Wednesday'],
  // Starts with the overhead press: not Monday, the day after Sunday's upper-body session.
  fullB: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

export const WEEK_PLAN: Record<DayName, { type: DayType; label: string; detail: string }> = {
  Monday: { type: 'lift-flex', label: 'Full body A (if at the gym by 9 PM)', detail: 'Full body A can be Mon, Tue or Wed. If not today, walk 20–30 min.' },
  Tuesday: { type: 'lift-flex', label: 'Full body A or B', detail: 'Good day for one of the two weekday sessions.' },
  Wednesday: { type: 'lift-flex', label: 'Full body A or B', detail: 'Last day for Full body A this week.' },
  Thursday: { type: 'lift-flex', label: 'Full body B (if not done)', detail: 'Full body B can be Tue to Fri.' },
  Friday: { type: 'lift-flex', label: 'Full body B (if not done)', detail: 'Last chance for Full body B. If not, rest before the weekend.' },
  Saturday: { type: 'lift-fixed', label: 'Lower body', detail: 'Squat day · 60–75 min, late morning' },
  Sunday: { type: 'lift-fixed', label: 'Upper body', detail: 'Bench day · 60–75 min, late morning' },
};

/** Short definitions shown on the Program tab. Each term is explained once, in plain words. */
export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Rep', meaning: 'One lift of the weight, up and down.' },
  { term: 'Set', meaning: 'A group of reps done without a break, e.g. 3 sets of 8 reps.' },
  { term: 'Reps left', meaning: 'How many more good reps you could have done. “Stop with 2 left” means stop while 2 more good reps were still possible.' },
  { term: 'Main lift', meaning: 'A heavy barbell lift that uses many muscles at once, like the squat, bench press or deadlift.' },
  { term: 'Lighter sets', meaning: 'Easy sets that build up to your work weight. They don’t count as work sets.' },
  { term: 'Paired exercises', meaning: 'Two exercises done back to back, then one rest.' },
  { term: 'Easy week', meaning: 'A week with half the sets and a bit less weight, to let tiredness clear.' },
  { term: 'Easy pace (Zone 2)', meaning: 'Cardio where you can still talk in full sentences, but not sing.' },
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
    summary: 'All sets, stopping with the listed reps left. Add reps first, then weight.',
    details: ['Most beginners add weight to the main lifts every week or two here.'],
  },
  {
    weeks: 'When needed',
    name: 'Easy week',
    summary: 'Same exercises, about half the sets, about 10% lighter, stop with 4 or more reps left.',
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
    title: 'How to add weight',
    body: 'Each exercise has a rep range, e.g. 8–12. Keep the same weight until every set reaches 12 reps with the listed reps left. Next time, add the smallest weight step and start again at 8.',
  },
  {
    title: 'Reps left',
    body: 'How many more good reps you could have done. “Stop with 2 left” means stop while 2 more were still possible. Beginners often guess too high, so film a set now and then.',
  },
  {
    title: 'If a lift gets stuck',
    body: 'Same weight, fewer reps two sessions in a row? First check sleep, food and stress. Then try the same weight once more. Still stuck? Drop the weight about 10% and build back up. This is normal and usually clears in 2–3 weeks.',
  },
  {
    title: 'Pain or just hard work?',
    body: 'Muscle burn and tiredness are fine. Sharp pain, joint pain, or tingling is not. Stop that exercise and use the listed alternative.',
  },
];

export const EASY_WEEK_SIGNS = [
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
  'Muscle burn is fine. Sharp pain, joint pain or tingling is not: stop that exercise and use the alternative.',
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
    how: 'After the Sunday upper-body session, if you feel fresh: 30 s hard, 90 s easy on a bike, 6 times. Not after a leg session. Skip them while you are still building up how much you eat.',
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
