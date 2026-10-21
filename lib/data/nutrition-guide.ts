import type { RefId } from './references';

// ─── Daily targets ────────────────────────────────────────────────────────────
// Energy: Mifflin-St Jeor BMR = 10×66 + 6.25×180 − 5×24 + 5 ≈ 1,670 kcal.
// Desk job + 4 lifting sessions ≈ PAL 1.5–1.6 → maintenance ≈ 2,450–2,700 kcal.
// A surplus of ~200–300 kcal (≈10%, the low end of the 10–20% advised for
// novices by Iraki 2019) gives the plan target of ~2,700 kcal.
// Your weight is currently stable, so your real maintenance is whatever you eat
// now — the first 3–4 weeks of weigh-ins calibrate the estimate.

export interface Target {
  key: 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'water';
  label: string;
  value: number;
  unit: string;
  range: string;
  basis: string;
  refs: RefId[];
}

export const TARGETS: Target[] = [
  {
    key: 'kcal',
    label: 'Calories',
    value: 2700,
    unit: 'kcal',
    range: '2,600–2,800',
    basis: 'Estimated maintenance ~2,450–2,700 kcal (BMR ≈ 1,670 × activity 1.5–1.6) plus a ~200–300 kcal surplus (≈10%, the low end of the 10–20% suggested for novices). The estimate is calibrated by your weight trend, not trusted blindly.',
    refs: ['mifflin', 'frankenfield', 'faoEnergy', 'helms2023'],
  },
  {
    key: 'protein',
    label: 'Protein',
    value: 125,
    unit: 'g',
    range: '110–135 g (1.6–2.0 g/kg)',
    basis: 'Benefits for muscle gain plateau around 1.6 g/kg (upper confidence limit 2.2 g/kg). Spread across 4 meals of ~25–40 g. Well-planned vegetarian protein builds muscle as well as omnivorous protein at this intake.',
    refs: ['morton', 'schoenfeldAragon', 'heviaLarrain', 'devries'],
  },
  {
    key: 'carbs',
    label: 'Carbohydrate',
    value: 340,
    unit: 'g',
    range: '310–370 g (~5 g/kg)',
    basis: 'The remainder of your calories after protein and fat. Fuels training volume. Mostly whole grains, pulses, fruit and milk.',
    refs: ['iraki', 'icmr2024'],
  },
  {
    key: 'fat',
    label: 'Fat',
    value: 75,
    unit: 'g',
    range: '60–90 g (≤ 30% of calories)',
    basis: 'ICMR-NIN and WHO advise ≤ 30% of energy from fat. Visible oil + ghee in the plans is ~15–25 g/day, under ICMR’s ~40 g limit for active men.',
    refs: ['icmr2024', 'whoFats'],
  },
  {
    key: 'fiber',
    label: 'Fibre',
    value: 45,
    unit: 'g',
    range: '≥ 30 g; the plans give ~40–65 g',
    basis: 'WHO advises at least 25 g/day; ICMR’s figure is reported as ~40 g per 2,000 kcal. Traditional Indian vegetarian meals are naturally high in fibre, so increase it over 2–4 weeks with plenty of fluid.',
    refs: ['whoFats', 'icmr2020', 'niddkGas'],
  },
  {
    key: 'water',
    label: 'Fluids',
    value: 3,
    unit: 'L',
    range: '2.5–3.5 L/day',
    basis: 'EFSA’s adequate intake for men is 2.5 L of total water a day; more on hot days and training days. Pale-yellow urine is a practical check.',
    refs: ['efsaWater', 'namWater', 'icmr2024'],
  },
];

export const ENERGY_MATH = [
  { label: 'BMR (Mifflin-St Jeor)', value: '≈ 1,670 kcal' },
  { label: 'Activity level (desk job + 4 lifts/week)', value: '× 1.5–1.6' },
  { label: 'Estimated maintenance', value: '≈ 2,450–2,700 kcal' },
  { label: 'Lean-gain surplus (≈10%)', value: '+200–300 kcal' },
  { label: 'Plan target', value: '≈ 2,700 kcal (2,600–2,800)' },
];

// ─── Weight-gain rules (shown on Nutrition + Progress) ───────────────────────

export const GAIN_RULES = {
  rate: '+0.5–1.0 kg per month (≈ 0.2–0.35% of body weight per week). After ~6 months, as beginner gains slow, +0.3–0.7 kg per month.',
  why: 'A review of off-season nutrition suggests 0.25–0.5% of body weight per week for novices. This plan sits in the lower half of that range because your goals are strength, health and a moderate physique, not maximum size. In trials, bigger surpluses mostly added fat, not more muscle. Beginners gain muscle well even on small surpluses, because training is the main driver.',
  refs: ['helms2023', 'garthe', 'iraki', 'slater', 'benito'] as RefId[],
  timeline: 'At that rate, 66 → 72 kg (the first checkpoint) takes roughly 6–12 months, and 75 kg roughly 12–20 months. Weight gain slows after the first year — that is normal. Much of what you notice early will be strength and shape, not scale weight.',
  target: '75 kg (BMI 23.1) is within the WHO “normal” range, but it sits right at the Asian action point of BMI 23. So the plan treats 72 kg as a checkpoint: pause, compare waist, photos and lifts, then decide whether 74–76 kg suits you.',
  targetRefs: ['whoAsianBmi', 'misra'] as RefId[],
  decisions: [
    { when: 'Rate 0.5–1.0 kg/month, waist stable or rising slowly, lifts improving', then: 'Continue — change nothing.' },
    { when: 'Rate < 0.5 kg/month for 4+ weeks and you ate the plan most days', then: 'Add ~150 kcal (e.g. +200 ml milk or +1 roti) and re-check in 4 weeks.' },
    { when: 'Rate > 1.2 kg/month after the first month', then: 'Slow down: remove ~150 kcal (one roti or a third of the dinner rice).' },
    { when: 'Waist rising more than ~1 cm per kg gained', then: 'Slow down — more of the gain is fat than muscle.' },
    { when: 'Waist reaches 85 cm', then: 'Maintain for 4–8 weeks (drop the surplus) and reassess.' },
    { when: 'Waist reaches 90 cm (half your height; Asian-Indian cut-off)', then: 'Stop gaining. Maintain, or a short gentle cut if needed.' },
    { when: 'Weight reaches ~72 kg', then: 'Checkpoint: maintain 4–6 weeks and reassess the 75 kg goal.' },
    { when: 'Poor sleep, illness, exams or a heavy work stretch', then: 'Maintain instead of gaining until life settles.' },
  ],
  measure: [
    'Weigh 3–4 mornings a week after the toilet, before food or water. Compare weekly averages only — single weigh-ins swing by 0.5–1.5 kg.',
    'Waist weekly: tape at the navel, relaxed, after a normal exhale.',
    'Photos every 4 weeks: same place, light and time.',
    'Lifts: the Progress page tracks estimated strength from your logged sets.',
  ],
};

// ─── Meal timing & training-day adjustments ──────────────────────────────────

export const TRAINING_DAY = {
  evening: {
    title: 'Evening training (default, ~7–8:30 PM)',
    points: [
      'Meal 3 at ~5 PM is your pre-workout meal: carbs + ~20 g protein, 2–3 hours before training.',
      'Meal 4 after training is your post-workout meal. There’s no need to rush it — within ~1–2 hours is fine.',
      'Drink ~500 ml water in the 2 hours before training and sip during the session.',
    ],
  },
  morning: {
    title: 'Morning training (~7–8 AM)',
    points: [
      'Only choose mornings when you slept by ~11:30 PM. Waking at 6:30 after a 1 AM bedtime costs more than it gains.',
      'Train first, then eat Meal 1 straight after — it is unchanged. Last night’s dinner fuels a morning session.',
      'Most people lift fine for an hour after an overnight fast. If your sessions clearly suffer, go back to evening training rather than adding a fifth meal.',
    ],
  },
  same: 'Calories and the four meals stay the same on training and rest days. Only the timing relative to the session changes — it keeps the system simple and the evidence for calorie cycling at this level is weak.',
};

export const HYDRATION = [
  'Start the day with a glass of water; carry a 1 L bottle to work and finish it twice.',
  'Training days: +500–750 ml around the session.',
  'Tea and coffee count toward fluids. Stop caffeine by ~3 PM so it doesn’t affect sleep.',
  'Use iodised salt for cooking (iodine). Don’t rely only on rock or pink salt.',
];

// ─── Digestive comfort ────────────────────────────────────────────────────────

export const GUT = {
  intro: 'There is no diagnosed condition, so the plan doesn’t cut out nutritious foods. Instead it changes how they are prepared and how quickly fibre increases.',
  steps: [
    { title: 'Ramp up over 2–4 weeks', body: 'Weeks 1–2: use the khichdi, moong dal and rice days more often, and half portions of chana/rajma. Week 3+: the full plan. Gas usually settles as your gut adapts.' },
    { title: 'Soak, discard, pressure-cook', body: 'Soak chana, rajma and whole moong 8–16 h, throw away the soaking water and pressure-cook until very soft. Soaking and cooking reduce the gas-forming sugars (oligosaccharides).' },
    { title: 'Meal size', body: 'Four moderate meals are easier than two large ones. Eat lunch and dinner slowly; finish dinner 2–3 hours before bed.' },
    { title: 'Fluids with fibre', body: 'Fibre needs water. Spread 2.5–3.5 L across the day rather than drinking a lot at once with meals.' },
    { title: 'Spices that help many people', body: 'Jeera, hing, ginger and ajwain in dal tadkas are traditional and harmless. Evidence for them is limited — keep them if they help you.' },
    { title: 'Keep a short symptom note', body: 'If one food reliably causes problems after proper soaking and cooking, swap it using the substitution list rather than dropping a whole food group.' },
  ],
  curdNote: 'Curd and chaas are in the plans because they are cheap, high in protein and calcium, and well tolerated by you — not because of strong evidence that they improve digestion.',
  redFlags: [
    'Unintended weight loss',
    'Blood in stool or black stools, or vomiting blood',
    'Difficulty swallowing, or repeated vomiting',
    'Severe or persistent abdominal pain, or a lump in the abdomen',
    'Bloating that doesn’t go away, or a change in bowel habit lasting more than a few weeks',
  ],
  refs: ['niddkGas', 'girigowda', 'nhsIndigestion', 'nhsBloating'] as RefId[],
};

// ─── Budget ───────────────────────────────────────────────────────────────────

export const PANTRY_MONTHLY = 300; // spices, salt, tea, sugar, ginger-garlic, lemons etc.

export const BUDGET_NOTES = [
  'Prices are approximate (Oct 2026): milk, eggs, chicken, fruit, oats and soya were checked against current listings; the rest are local-shop estimates. Your local prices may differ by ±15%.',
  'Costs include every food in the plan plus ~₹300/month for spices, salt, tea and other basics. Cooking gas is not included.',
  'Biggest savers: set curd at home (≈ milk price), buy sattu, chana and dals loose, buy fruit in season, and swap some paneer for soya chunks.',
];
