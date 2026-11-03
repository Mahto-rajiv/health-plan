import type { RefId } from './references';
import { BUDGET } from '../config';

// ─── Daily targets ────────────────────────────────────────────────────────────
// Energy: Mifflin-St Jeor BMR = 10×weight + 6.25×180 − 5×24 + 5 ≈ 1,600–1,700 kcal
// (the weight is not written here: the repo is public). The equation is a
// cross-check only. The better evidence is your own history: weight fell over
// about 6 months on what you estimate is under ~2,000 kcal and ~60 g protein a
// day. That loss rate is roughly a 150–200 kcal daily deficit, so maintenance
// before training was probably about
// 2,000–2,100 kcal (an estimate). Four lifting sessions a week add roughly
// 100–200 kcal a day on average. Phase targets live in lib/config.ts.

export interface Target {
  key: 'protein' | 'carbs' | 'fat' | 'fiber' | 'water' | 'salt';
  label: string;
  value: string;
  basis: string;
  refs: RefId[];
}

export const TARGETS: Target[] = [
  {
    key: 'protein',
    label: 'Protein',
    value: '~90 → ~105 → 110–125 g',
    basis: `Rises with the phases from ~1.4 to 1.7–1.9 g/kg. Benefits for muscle gain level off around 1.6 g/kg (upper confidence limit 2.2 g/kg), so Phase 2 sits in the useful range without going beyond it. The plans spread it over 4 meals of about 12–49 g (Meal 3, the pre-workout meal, is the smallest at 12–20 g). Well-planned vegetarian protein builds muscle as well as omnivorous protein at this intake.`,
    refs: ['morton', 'schoenfeldAragon', 'heviaLarrain', 'devries'],
  },
  {
    key: 'carbs',
    label: 'Carbohydrate',
    value: 'the rest of the energy',
    basis: 'What is left after protein and fat; it fuels training. Carbohydrate in this app means AVAILABLE carbohydrate (starch and sugars), not counting fibre, as in the Indian food composition tables.',
    refs: ['ifct', 'faoFoodEnergy'],
  },
  {
    key: 'fat',
    label: 'Fat',
    value: '25–35% of energy',
    basis: 'Within the US/Canadian range of 20–35% of energy. WHO and ICMR-NIN advise ≤ 30% for the general population, mainly to limit weight gain; this plan is for regaining weight, and the extra room is what lets it reach the vitamin E need (the solver uses it for more cooking oil, curd and paneer, and less rice). Most of the fat comes from milk, curd, paneer, oil, peanuts and seeds.',
    refs: ['driMacros', 'icmr2024', 'whoFats'],
  },
  {
    key: 'fiber',
    label: 'Fibre',
    value: '≤ 35 → ≤ 40 → ≤ 50 g',
    basis: 'Capped per phase so your gut can adjust: your intake has been low, and a sudden jump in fibre is a common cause of gas and bloating. Phase 2 still gives ~40–50 g, above the WHO minimum of 25 g.',
    refs: ['whoFats', 'icmr2020', 'niddkGas'],
  },
  {
    key: 'water',
    label: 'Fluids',
    value: '2.5–3.5 L',
    basis: 'EFSA’s adequate intake for men is 2.5 L of total water a day; more on hot days and training days. Pale-yellow urine is a practical check.',
    refs: ['efsaWater', 'namWater', 'icmr2024'],
  },
  {
    key: 'salt',
    label: 'Salt',
    value: '~5 g, iodised',
    basis: 'WHO advises under 5 g of salt a day (about one level teaspoon, including what goes into cooking). Use iodised salt: rock, pink and sea salt are usually not iodised.',
    refs: ['whoSalt', 'odsIodine'],
  },
];

/** How kcal are computed everywhere in the app. */
export const ENERGY_NOTE =
  'Calories are calculated from the macros: 4 kcal per g of protein and of available carbohydrate, 9 per g of fat, and 2 per g of fibre (the FAO factor for fibre in mixed diets). Meal and day totals therefore always add up. Food-table values differ by a few percent for some foods; real food varies more than that.';

export const ENERGY_MATH = [
  { label: 'BMR (Mifflin-St Jeor, at your weight, 180 cm, 24 y)', value: '≈ 1,600–1,700 kcal' },
  { label: 'What you ate while losing weight (your estimate)', value: '< ~2,000 kcal' },
  { label: 'Estimated maintenance before training (estimate)', value: '≈ 2,000–2,100 kcal' },
  { label: 'Phase 0 · weeks 1–2 (stop the loss)', value: '≈ 2,200 kcal' },
  { label: 'Phase 1 · weeks 3–4', value: '≈ 2,400 kcal' },
  { label: 'Phase 2 · week 5 on (slow gain)', value: '2,550–2,700 kcal' },
];

// ─── Weight-gain rules (shown on Nutrition + Progress) ───────────────────────

export const GAIN_RULES = {
  rate: 'First stop the loss (Phase 0: weekly average within ±0.5 kg of your start). Then +0.5–1.0 kg per month (≈ 0.2–0.35% of body weight per week). After ~6 months, as beginner gains slow, +0.3–0.7 kg per month.',
  why: 'A review of off-season nutrition suggests 0.25–0.5% of body weight per week for novices. This plan sits in the lower half of that range because your goals are strength, health and a moderate physique, not maximum size. In trials, bigger surpluses mostly added fat, not more muscle. Beginners gain muscle well even on small surpluses, because training is the main driver.',
  refs: ['helms2023', 'garthe', 'iraki', 'slater', 'benito'] as RefId[],
  timeline: 'At that rate, each kilo back takes 1–2 months, counted from when the loss has stopped, until you reach your pre-loss weight (the first checkpoint). Much of what you notice early will be strength and shape, not scale weight.',
  target: 'Your pre-loss weight (set in Settings) is the first checkpoint: it is the weight you had before the loss. There, compare waist, photos and lifts, then decide whether to continue toward 75 kg (BMI 23.1, which sits at the Asian action point of BMI 23).',
  targetRefs: ['whoAsianBmi', 'misra'] as RefId[],
  decisions: [
    { when: 'Phase 0 or 1, and the weekly average is still falling after 2 weeks although you ate the plan', then: 'Add ~200 kcal (move to the next phase early, or +350 ml milk) and tell a doctor about the unexplained weight loss.' },
    { when: 'Phase 2: rate 0.5–1.0 kg/month, waist stable or rising slowly, lifts improving', then: 'Continue — change nothing.' },
    { when: 'Phase 2: rate < 0.5 kg/month for 4+ weeks and you ate the plan most days', then: 'Add ~150 kcal (e.g. +250 ml milk or +1 roti) and re-check in 4 weeks.' },
    { when: 'Rate > 1.2 kg/month after the first month', then: 'Slow down: remove ~150 kcal (one roti or a third of the dinner rice).' },
    { when: 'Waist rising more than ~1 cm per kg gained', then: 'Slow down — more of the gain is fat than muscle.' },
    { when: 'Waist reaches 47% of your height (85 cm at 180 cm)', then: 'Maintain for 4–8 weeks (drop the surplus) and reassess.' },
    { when: 'Waist reaches half your height (90 cm at 180 cm, also the Asian-Indian cut-off for men)', then: 'Stop gaining. Maintain, or a short gentle cut if needed.' },
    { when: 'Weight reaches your pre-loss weight', then: 'Checkpoint: maintain 4–6 weeks and reassess the 75 kg goal.' },
    { when: 'Poor sleep, illness or a heavy work stretch', then: 'Maintain instead of gaining until life settles.' },
  ],
  measure: [
    'Weigh 3–4 mornings a week after the toilet, before food or water. Compare weekly averages only — single weigh-ins swing by 0.5–1.5 kg.',
    'Waist weekly: tape at the navel, relaxed, after a normal exhale.',
    'Photos every 4 weeks: same place, light and time (keep them on your phone; the app stores only the date you took them).',
    'Lifts: the Progress page tracks estimated strength from your logged sets.',
  ],
};

// ─── Meal timing on training days ─────────────────────────────────────────────

export const TRAINING_DAY = {
  weekday: {
    title: 'Weekday gym days (at the gym by 9:00 PM)',
    points: [
      'Meal 3 at 6:15–6:45 PM is the pre-workout meal: mostly carbohydrate with 12–20 g protein, about 2–2.5 h before training.',
      'Meal 4 when you get home (9:30–10:30 PM) is the post-workout meal. Within ~1–2 hours of training is fine.',
      'Drink ~500 ml water between Meal 3 and the gym and sip during the session.',
      'Dinner at 10:30 PM still leaves ~2 h before a 12:30 AM bedtime.',
    ],
  },
  weekend: {
    title: 'Saturday and Sunday (fixed sessions)',
    points: [
      'Train ~2–3 h after Meal 1, late morning; Meal 2 at ~1:30 PM is the post-workout meal.',
      'If you train in the evening instead, use Meal 3 (~5 PM) as the pre-workout meal and Meal 4 after.',
    ],
  },
  same: 'Food is the same on training and rest days. Only the timing relative to the session changes; the evidence for calorie cycling at this level is weak and it would complicate the plan.',
};

export const HYDRATION = [
  'Start the day with a glass of water; carry a 1 L bottle to work and finish it twice.',
  'Training days: +500–750 ml around the session.',
  'Tea and coffee count toward fluids. Stop caffeine by ~3 PM so it doesn’t affect sleep.',
  'Use iodised salt for cooking (iodine). Don’t rely only on rock or pink salt.',
  'Keep total salt to about 5 g a day (one level teaspoon, including what goes into cooking). Chaat masala, kala namak, pickles, papad and packaged namkeen all count.',
  'Fluids: 2.5–3.5 L a day in total.',
];

// ─── Digestive comfort ────────────────────────────────────────────────────────

export const GUT = {
  intro: 'There is no diagnosed condition, so the plan doesn’t cut out nutritious foods. Instead it changes how they are prepared and how quickly fibre increases.',
  steps: [
    { title: 'Ramp up with the phases', body: 'Fibre is capped at 35 g a day in weeks 1–2, 45 g in weeks 3–4 and 50 g from week 5, and soya and sattu are capped at 20 g and 25 g a day in Phase 0. The table below shows how Meals 1 and 3 grow. Gas usually settles as your gut adapts.' },
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

// ─── Food safety ──────────────────────────────────────────────────────────────

export const FOOD_SAFETY = {
  /** Added to every weekday office lunch. */
  coldLunch: 'Cold-lunch rule: freeze a water bottle overnight and use an ice pack too (two cold sources); pack the box between them in the insulated bag; into the office fridge on arrival; eat it the same day.',
  office: [
    'Use two cold sources, as USDA advises: a water bottle frozen overnight and an ice pack, with the lunch box and Meal 3 between them in the insulated bag. Tests of insulated bags show that one cold source often does not keep food cold for 2 hours.',
    'Cooked fillings (paneer, potato, soya, chicken, egg) are safest made the night before and chilled in the fridge. Morning-made parathas and rolls: cool them fully on a plate (~15 minutes) before boxing; hot food sealed in a box stays warm for hours.',
    'On arrival (~2 h after leaving home), move both boxes to the office fridge. Perishable food should be out of the fridge for no more than 2 hours in total, or 1 hour above ~32 °C; on hot days the commute uses all of that. Without fridge space, eat the paneer, curd, egg and chicken meals by ~12:30 PM.',
    'No rice, dal or gravy in the office lunch: it is eaten cold with no reheating, and cooked rice is the riskiest leftover (Bacillus cereus spores survive cooking).',
    'Cooked chicken and egg fillings are made the night before or that morning and never kept longer than one day.',
    'Leftover dinner at home: refrigerate within 2 hours (1 hour on hot days) and eat it the next day, reheated until steaming.',
  ],
  buying: [
    'Nuts, peanuts, roasted chana and sattu: buy from a shop with high turnover and keep them airtight, dry and cool. Throw away any that look mouldy, discoloured or shrivelled, or taste bitter — that is how aflatoxin contamination usually shows.',
    'Ground flaxseed and nuts go rancid: buy small packs and keep them in the fridge once opened.',
    'Paneer: buy a sealed pack whose label says it is made from milk. Products labelled “analogue” are made with vegetable fat and are not the same food.',
    'Milk for home-set curd: packaged pasteurised milk can be used as it is; boil loose milk first and cool it to lukewarm before adding the starter.',
    'Rajma and other dry beans must be soaked and then boiled or pressure-cooked until completely soft. Raw or undercooked kidney beans contain a toxin that causes vomiting.',
    'Wash fruit and salad vegetables under running water before cutting them, and cut salad fresh rather than days ahead.',
    'Cooking oil: rice-bran oil every day (it has about twice the vitamin E of groundnut oil, which is the alternative), and mustard oil only now and then for flavour (about a teaspoon a week). Most Indian mustard oil is 40–50% erucic acid; at the plans’ ~30 g of oil a day it would be far above the EFSA safe intake, which is based on heart effects in animals. Harm in people has not been shown, but there is no reason to take the risk daily.',
    'Rice: for plain rice, cook it in plenty of water (about 6 cups per cup of rice) and drain it like pasta. That removes about 40% of the arsenic rice picks up from soil and water. Pulao and khichdi can’t be drained, which is one reason the plans keep rice to about one portion a day and alternate it with roti and daliya.',
    'Chicken and fish: don’t blacken them. Charring meat on high heat forms compounds (HCAs and PAHs) linked to cancer in lab studies. Marinate, turn often and cut off burnt bits. Paneer and soya don’t form HCAs in meaningful amounts.',
  ],
  refs: ['purdueBagLunch', 'fssRice', 'fsisLeftovers', 'whoMycotoxins', 'efsaErucic', 'gill2021', 'gray2016', 'nciCookedMeat', 'whoSalt'] as RefId[],
};

// ─── Budget ───────────────────────────────────────────────────────────────────

export const PANTRY_MONTHLY = 300; // spices, salt, tea, sugar, ginger-garlic, coriander, mint, curry leaves etc.

export const BUDGET_NOTES = [
  'All prices are estimates (Oct–Nov 2026), not quotes. A few were compared with online listings; the rest are local-shop estimates. Edit them in Settings → Prices and every cost in the app is recalculated.',
  'Costs include every food in the plan plus ~₹300/month for spices, salt, tea, herbs and other basics. Cooking gas is not included. Supplements are costed separately on the Health page.',
  'Produce is costed as bought, so peel, seeds, pods and trimmings are paid for (e.g. 38% of a papaya, 36% of a banana, 62% of peas in the pod). The shares are USDA SR28 “refuse” values.',
  'Cost rule: when two foods are equivalent in nutrition and taste, the plan uses the cheaper one unless it has a safety or digestive downside. That is why it uses soya, dals and home-set curd, but sealed branded paneer and ghee rather than loose ones.',
  `The budget is a ceiling of ₹${BUDGET.max.toLocaleString('en-IN')} a month with no lower target (Round 2), so the plans are built for nutrition first. The cost rises with the phases because you eat more. Fruit and vegetable prices added in Nov 2026 are rough estimates; check them in Settings.`,
];
