import type { ExerciseLinkId, ExerciseTutorialId } from './tutorials';

// ─── Program design (16 Nov 2026: split routine; evidence in PROGRESS.md) ─────
// The owner asked for a split (two muscle groups a session), no full-body and no
// lower-body-only session, and no fixed weekdays.
// Evidence (abstracts checked Nov 2026):
//  • Muscle size depends on weekly hard sets, not on how often a muscle is
//    trained (Schoenfeld 2019; Pelland 2026). A split and a full-body plan give
//    similar strength and size when weekly sets match (Ramos-Campo 2024, 14
//    studies; Pedersen 2022 in untrained women). Two small studies in trained
//    men disagree in opposite directions (Schoenfeld 2015, Bartolomei 2021).
//  • Recovery: an untrained muscle can need about 72 h to recover fully after a
//    hard session (Radaelli 2012). Three sessions over 5 days gives each
//    muscle about that much time.
//  • Arms: in beginners, presses and pulls grow the arms about as much as adding
//    curls and extensions (Gentil 2013, 2015); one small study found curls did
//    better (Mannarino 2021). So each arm muscle keeps direct work.
//  • Strength rises a little with frequency (Pelland 2026, diminishing returns;
//    Grgic 2018: mostly through extra sets). So 5 gym days a week (each muscle
//    about 1.7 times a week) is better for strength than 3.
//  • Sets: about 10 hard sets per muscle a week is a sound target for growth
//    (Schoenfeld 2017). Beginners grow on less.
//
// The split: three sessions in a fixed order, on any days of the week.
//  1. Chest + Triceps (bench press first)
//  2. Back + Biceps (pull-ups first)
//  3. Legs + Shoulders (squat first)
// Then back to 1. A gym day always does the next session in the order.
//  • Weekly hard sets from week 3 (per round of 3 sessions; ×1.7 for a 5-day
//    week): chest 8, triceps 5 plus all presses, back 6 plus 3 face
//    pulls, biceps 3 plus all pulls, front of thighs 5, back of thighs and glutes
//    3 plus the squat, shoulders 5 plus the presses and face pulls, core 2.
//  • Main lifts: bench press, pull-up, squat. 5–8 reps (pull-ups 5–10).
//  • Effort: stop with 1–3 good reps left (3–4 in weeks 1–2). Loads: 8–20 reps
//    on the smaller exercises.
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
// Limit: any session can fall on a work evening, so every session is ≤ 60 min
// including the warm-up (planned to ≤ 55 min, a 5-minute margin because the
// times are estimates), with at most 5 exercises.

export type SessionId = 'chestTri' | 'backBi' | 'legsShoulders';

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
  /** The two muscle groups this session trains. */
  groups: [string, string];
  focus: string;
  minutes: string;
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
const FINISH = 'Nothing extra needed. Go home and eat. On a day off work, you may add 8–10 min of easy bike and the longer mobility routine.';

export const SESSIONS: Record<SessionId, Session> = {
  chestTri: {
    id: 'chestTri',
    name: 'Chest + Triceps — Bench day',
    short: 'Chest + Triceps',
    groups: ['Chest', 'Triceps'],
    focus: 'Three presses for the chest, then two triceps exercises. The bench press is the main strength lift.',
    minutes: '45–50 min (estimate)',
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
        id: 'incline-db',
        name: 'Incline dumbbell press',
        muscles: 'Upper chest, front of shoulders, triceps',
        equipment: 'Dumbbells and an incline bench',
        sets: { learn: 2, build: 3 },
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
        id: 'chest-press',
        name: 'Seated chest press machine',
        muscles: 'Chest, triceps',
        equipment: 'Chest press machine',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Handles at mid-chest height.', 'Shoulder blades back against the pad.', 'Press out, then take 2–3 s to come back.'],
        alternative: { name: 'Push-up', equipment: 'Floor (hands on a bench to make it easier)', note: 'Same sets. Stop with 1–2 good reps left.', link: 'pushUp' },
        link: 'machineChestPress',
      },
      {
        id: 'pushdown',
        name: 'Triceps rope pushdown',
        muscles: 'Triceps',
        equipment: 'Cable machine with a rope',
        sets: { learn: 2, build: 3 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 90,
        increment: 'next pin',
        cues: ['Elbows stay at your sides.', 'Pull the rope apart at the bottom.', 'Let it up slowly.'],
        alternative: { name: 'Dumbbell skull crusher', equipment: 'Dumbbells and a flat bench', note: 'Lie on the bench. Bend only at the elbows.', link: 'dbSkullCrusher' },
        link: 'pushdown',
      },
      {
        id: 'overhead-ext',
        name: 'Overhead dumbbell triceps extension',
        muscles: 'Triceps (long head, stretched overhead)',
        equipment: 'One dumbbell, held in both hands',
        sets: { learn: 2, build: 2 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 60,
        increment: 'next dumbbell',
        cues: ['Sit on a bench with back support.', 'Lower the dumbbell behind your head. Elbows point up.', 'Straighten your arms without arching your back.'],
        alternative: { name: 'Overhead cable triceps extension', equipment: 'Cable machine with a rope', note: 'Face away from the machine.', link: 'cableOverheadExtension' },
        link: 'overheadExtension',
      },
    ],
    finisher: FINISH,
    finisherMin: 0,
  },
  backBi: {
    id: 'backBi',
    name: 'Back + Biceps — Pull-up day',
    short: 'Back + Biceps',
    groups: ['Back', 'Biceps'],
    focus: 'A vertical pull, a row and face pulls for the back, then curls and core. The pull-up is the main strength lift.',
    minutes: '45–50 min (estimate)',
    warmup: [
      easyCardio('Rower or bike'),
      DRILL.catCow,
      DRILL.pullAparts,
      DRILL.openBook,
      {
        name: 'Lighter sets for the pull-up',
        how: 'Two or three easy sets that get harder. Rest about 30 s between them. They are practice, not work.',
        dose: 'Lat pulldown, light × 10, then medium × 5; or pull-ups with extra help × 5',
        minutes: 3,
        kind: 'ramp',
      },
    ],
    exercises: [
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
        cues: ['Start hanging with straight arms and your shoulders pulled down.', 'Pull your chest up to the bar.', 'Lower slowly, in about 2–3 s.'],
        alternative: { name: 'Lat pulldown', equipment: 'Cable pulldown station', note: 'Same sets. 6–10 reps.', link: 'latPulldown' },
        link: 'pullUp',
        isMainLift: true,
      },
      {
        id: 'cable-row',
        name: 'Seated cable row',
        muscles: 'Upper back, sides of the back, back of shoulders',
        equipment: 'Cable row station',
        sets: { learn: 2, build: 3 },
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
        id: 'face-pull',
        name: 'Face pull',
        muscles: 'Upper back, back of shoulders',
        equipment: 'Cable machine with a rope',
        sets: { learn: 2, build: 3 },
        reps: '12–20',
        repRange: [12, 20],
        repsLeft: '2',
        restSec: 60,
        increment: 'add reps, then the next pin',
        cues: ['Rope at forehead height.', 'Pull toward your eyes. Hands apart, thumbs back.', 'Pause 1 s, then let it back slowly.'],
        alternative: { name: 'Reverse fly machine', equipment: 'Reverse fly (rear delt) machine', note: 'Sit facing the pad, arms straight out in front, open them wide.', link: 'reverseFly' },
        link: 'facePull',
      },
      {
        id: 'curl',
        name: 'Dumbbell curl',
        muscles: 'Biceps',
        equipment: 'Dumbbells',
        sets: { learn: 2, build: 3 },
        reps: '10–15',
        repRange: [10, 15],
        repsLeft: '1–2',
        restSec: 90,
        increment: 'next dumbbell',
        cues: ['Keep your elbows still.', 'Turn the palm up as you curl.', 'Lower slowly.', 'No swinging.'],
        alternative: { name: 'EZ-bar curl', equipment: 'EZ bar', link: 'ezCurl' },
        link: 'curl',
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
    finisher: FINISH,
    finisherMin: 0,
  },
  legsShoulders: {
    id: 'legsShoulders',
    name: 'Legs + Shoulders — Squat day',
    short: 'Legs + Shoulders',
    groups: ['Legs', 'Shoulders'],
    focus: 'Squat, Romanian deadlift and leg press for the legs, then a shoulder press and lateral raises. The squat is the main strength lift.',
    minutes: '50–55 min (estimate)',
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
        sets: { learn: 2, build: 3 },
        reps: '8–10',
        repRange: [8, 10],
        repsLeft: '2',
        restSec: 120,
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
        id: 'db-press',
        name: 'Seated dumbbell shoulder press',
        muscles: 'Shoulders, triceps',
        equipment: 'Dumbbells and an upright bench',
        sets: { learn: 2, build: 3 },
        reps: '8–12',
        repRange: [8, 12],
        repsLeft: '2',
        restSec: 120,
        increment: 'next dumbbell',
        rampSets: 1,
        cues: [LIGHTER_SET_CUE, 'Back against the pad, feet flat.', 'Start with the dumbbells at your ears, palms forward.', 'Press up until your arms are straight. Lower slowly.'],
        alternative: { name: 'Standing barbell overhead press', equipment: 'Barbell in a rack', note: 'Same sets. Start light: about the weight of both dumbbells together.', link: 'overheadPress' },
        link: 'seatedDbPress',
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
    ],
    finisher: FINISH,
    finisherMin: 0,
  },
};

/** The order the sessions are done in, on any days. After the last one, start again at the first. */
export const SESSION_ORDER: SessionId[] = ['chestTri', 'backBi', 'legsShoulders'];

// ─── Schedule ─────────────────────────────────────────────────────────────────
// No fixed days: any session can be done on any day, Monday to Sunday. Each gym
// day does the next session in the order. Plan: 5 gym days a week, one
// session a day, and at most 3 days in a row (one full round, then a day off;
// with at most 2 in a row, 5 days a week can't repeat week after week). On work days the gym session
// happens only if you can be there by 9:00 PM (it closes at 10 PM); that is a
// sleep rule, not a day restriction.

/** Latest arrival at the gym on a work day (24 h clock, local time). */
export const WORKDAY_GYM_CUTOFF = { hour: 21, minute: 0, label: '9:00 PM' } as const;

/** Gym days a week the plan is built for (each muscle about 1.7 times a week). */
export const GYM_DAYS_PER_WEEK = 5;

/** Most gym days in a row before a day off. */
export const MAX_DAYS_IN_A_ROW = 3;

export const ROTATION_RULE = 'Do the three sessions in order, then start again. Any day of the week works. Each gym day, do the session after the one you did last.';

/** Short definitions shown on the Program tab. Each term is explained once, in plain words. */
export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Rep', meaning: 'One lift of the weight, up and down.' },
  { term: 'Set', meaning: 'A group of reps done without a break, e.g. 3 sets of 8 reps.' },
  { term: 'Reps left', meaning: 'How many more good reps you could have done. “Stop with 2 left” means stop while 2 more good reps were still possible.' },
  { term: 'Main lift', meaning: 'A heavy barbell lift that uses many muscles at once, like the squat, bench press or deadlift.' },
  { term: 'Lighter sets', meaning: 'Easy sets that build up to your work weight. They don’t count as work sets.' },
  { term: 'Split', meaning: 'Training different muscles on different days, e.g. chest and triceps one day, back and biceps the next.' },
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
      'Film one set of squat, bench and Romanian deadlift from the side. Compare it with the videos.',
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
      'Sessions are shorter that week. That is fine.',
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
];

export const NEVER_DO = [
  'Never do two lifting sessions on the same day.',
  'Never train more than 3 days in a row.',
  'Never start a session on a work day after 9:00 PM.',
  'Never cut sleep to fit a workout in.',
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
  weeklyTarget: 'Aim for 150+ minutes of moderate activity a week (WHO). Brisk walks, warm-ups and easy cardio after sessions all count.',
  steps: 'Daily steps: build up to 8,000 or more. In large studies of adults under 60, the risk of dying early keeps falling up to about 8,000–10,000 steps a day. Walking on the commute and a 20–30 min walk on non-gym evenings count.',
  sitting: 'Break up sitting: stand or walk for 2–3 minutes every 30–45 minutes at work. Short walks after meals lower blood sugar.',
  zone2: {
    title: 'Easy cardio (Zone 2): after sessions on days off work, or a brisk walk',
    how: '8–10 min on a bike, rower or incline treadmill after sessions on days off work, plus brisk walks. Easy pace: you can talk in full sentences but not sing (the talk test). That is roughly 60–70% of your max heart rate, about 120–137 beats a minute at age 24.',
  },
  intervals: {
    title: 'Hard intervals: optional, from week 8',
    how: 'After a Chest + Triceps or Back + Biceps session on a day off work, if you feel fresh: 30 s hard, 90 s easy on a bike, 6 times. Not on Legs + Shoulders days or the day before them. Skip them while you are still building up how much you eat.',
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
    title: 'Longer mobility routine',
    when: 'After a session on a day off work, or any evening, about 15 min',
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
  'Lifting through a full range of motion (as deep as good form allows) improves flexibility about as much as stretching. Your squats, Romanian deadlifts and leg presses already count.',
  'Short stretches (60 s or less per muscle) before lifting don’t make you weaker. Save long holds for after training or another time.',
];
