import type { MealItem } from '../nutrition';
import type { PhaseId } from '../config';
import type { FoodId } from './foods';
import type { TutorialId } from './tutorials';
import { SEASONS, type SeasonId, type SlotId, SEASON_IDS } from './seasons';
import { QUANTITIES } from './plan-quantities.generated';

// ─── Four-meal structure (applies to every plan) ─────────────────────────────
// • Exactly 4 meals a day. No snacks.
// • Meal 1 is identical Monday–Sunday. ≤ 10 min to make; eaten before leaving.
// • Meal 2 (weekdays) is the office lunch at ~1 PM, eaten COLD: it travels
//   ~2 h in an insulated bag with a frozen bottle, then waits in the office
//   fridge. No rice, no cooked dal or gravy, nothing that needs reheating.
// • Meal 3 is identical Monday–Friday: eaten at the office at 6:15–6:45 PM as
//   the pre-workout meal. No cooking. Saturday and Sunday have their own.
// • Meal 4 is dinner at home, 9:30–10:30 PM on training days (post-workout).
// • "Identical" means the same foods within a phase. Quantities step up from
//   Phase 0 to Phase 2 (lib/config.ts), so each item has three gram values.
// The structure is enforced in code by buildWeek() and tested in
// tests/plans.test.ts.

export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type WeekdayName = Exclude<DayName, 'Saturday' | 'Sunday'>;

export const DAYS: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const WEEKDAYS: WeekdayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export type MealSlot = 1 | 2 | 3 | 4;

/** Grams for Phase 0, 1 and 2, or one value for all phases. */
export type Grams = number | readonly [number, number, number];

interface PlanItemBase {
  /** Starting amount per phase (edible grams). The solver (npm run solve) picks the final amount within `range`. */
  g: Grams;
  /** Household description, e.g. "2 parathas" or "soaked overnight". One per phase if it changes. May use {slot} tokens. */
  note?: string | readonly [string, string, string];
  /** Smallest and largest amount the solver may use, any phase. Default: the starting amounts ±40%. 0 makes the item optional. */
  range?: readonly [number, number];
  /** Amounts are multiples of this (default 5 g; eggs 50 g). */
  step?: number;
}

/** A fixed food, the same all year. */
export interface FoodItem extends PlanItemBase {
  food: FoodId;
  slot?: never;
}

/** A seasonal slot: the food changes with the season (lib/data/seasons.ts). */
export interface SlotItem extends PlanItemBase {
  slot: SlotId;
  food?: never;
}

export type PlanItem = FoodItem | SlotItem;

/** Key used for an item in the solver output. */
export const itemKey = (it: PlanItem): string => (it.slot ? `slot:${it.slot}` : it.food!);

export interface Substitution {
  swap: string;
  with: string;
}

export interface Meal {
  id: string;
  title: string;
  items: PlanItem[];
  /** Preparation in order. For dinners this is also the printable cooking card. */
  steps: string[];
  /** Hands-on minutes on the day. */
  activeMin: number;
  /** Start to plate, including soaking-free waiting such as pressure cooking. */
  totalMin: number;
  /** Pots and pans used (the brief allows at most 2). */
  pots: number;
  /** How to make it taste good without changing foods or amounts. */
  flavour: string;
  substitutions: Substitution[];
  /** Why the meal is built this way. */
  why?: string;
  /** Storage specific to this meal. */
  keeps?: string;
  tutorials?: TutorialId[];
  /** Must the meal be heated before eating? Weekday Meal 2 must be false. */
  requiresReheat: boolean;
  /** Office meals: when the food is made. */
  madeWhen?: 'morning' | 'night-before';
  /** Office meals: hands-on minutes on the morning itself (packing). Weekday mornings must stay short. */
  morningMin?: number;
  /** Something to do the day before (soaking, boiling potatoes). */
  dayBefore?: string;
}

export type PlanId = 'vegetarian' | 'egg' | 'nonveg';

export interface MealPlanDefinition {
  id: PlanId;
  name: string;
  shortName: string;
  summary: string;
  diet: string;
  meal1: Meal;
  weekdayMeal3: Meal;
  lunches: Record<WeekdayName, Meal>;
  dinners: Record<WeekdayName, Meal>;
  saturday: { meal2: Meal; meal3: Meal; meal4: Meal };
  sunday: { meal2: Meal; meal3: Meal; meal4: Meal };
  prepStrategy: string[];
  notes: string[];
}

export const MEAL_SLOTS: Record<MealSlot, { name: string; weekday: string; weekend: string; role: string }> = {
  1: {
    name: 'Meal 1 · Breakfast',
    weekday: '7:45–8:30 AM, before leaving',
    weekend: '8:30–9:00 AM',
    role: 'Same every day. Ready in about 10 minutes.',
  },
  2: {
    name: 'Meal 2 · Office lunch',
    weekday: '~1:00 PM (office, eaten cold)',
    weekend: '~1:30 PM, after training',
    role: 'Weekdays: packed cold with a frozen bottle, refrigerated on arrival. No rice, dal, gravy or reheating. Varies by day.',
  },
  3: {
    name: 'Meal 3 · Pre-workout',
    weekday: '6:15–6:45 PM (office)',
    weekend: '~5:00 PM',
    role: 'Same Mon–Fri, no cooking. Your pre-workout meal 2–3 h before the gym. Saturday and Sunday each have their own.',
  },
  4: {
    name: 'Meal 4 · Dinner',
    weekday: '9:30–10:30 PM on gym days (~9 PM otherwise)',
    weekend: '~9:00 PM',
    role: 'Cooked fresh at home, at most 2 pots. Your post-workout meal on gym days.',
  },
};

// ─── Shared meals ─────────────────────────────────────────────────────────────
// Meals are shared between plans where the food is the same, so the three plans
// stay comparable. Egg and non-veg meals replace a few of them.

const meal = (m: Meal): Meal => m;

const COLD_PACK =
  'Morning: straight from the fridge into the insulated bag, between the frozen bottle and an ice pack; into the office fridge on arrival. If there is no fridge space, eat it by ~12:30 PM.';

// Weekday lunches are cooked the evening before (with or after dinner) and kept
// in the fridge, so the only morning work is Meal 1 and ~3 minutes of packing.
// USDA FSIS: refrigerate cooked food within 2 hours; leftovers keep 3–4 days.
// These are eaten the next day.
const OVERNIGHT = 'Cool on a plate for 10–15 minutes, box it and put it in the fridge (within 2 hours of cooking). Eat it the next day, not later.';
const MORNING_PACK = 'Morning (about 3 minutes): pack the box straight from the fridge with a box of curd and the frozen bottle.';

// Meal 1 ─────────────────────────────────────────────────────────────────────

const M1_VEG = meal({
  id: 'm1-veg',
  title: 'Oats cooked in milk with peanuts and seeds, and {fruit1}',
  items: [
    { food: 'milk', g: 300 },
    { food: 'oats', g: [55, 60, 60] },
    { food: 'peanuts', g: [15, 25, 25], note: 'dry-roasted, crushed' },
    { food: 'pumpkinSeeds', g: 5, range: [0, 15], note: 'stirred in at the end' },
    { food: 'flax', g: 5, range: [0, 10], note: 'ground, stirred in at the end' },
    { food: 'sunflowerSeeds', g: 5, range: [0, 20], note: 'stirred in at the end' },
    { slot: 'fruit1', g: 150, range: [100, 250], note: 'cut, on the side' },
  ],
  steps: [
    'Bring the milk to a boil in a small pan.',
    'Add the oats and simmer 3–4 minutes, stirring, until thick.',
    'Stir in the ground flaxseed and the pumpkin and sunflower seeds; top with the crushed roasted peanuts. Eat the {fruit1} alongside.',
  ],
  activeMin: 8,
  totalMin: 10,
  pots: 1,
  flavour: 'Simmer with 2 crushed elaichi pods or a pinch of cinnamon. A pinch of jaggery if you want it sweeter (adds ~20 kcal a tsp). Dry-roast a week’s peanuts on Sunday so they stay crunchy.',
  substitutions: [
    { swap: 'Oats', with: 'Daliya, same weight (needs ~15 min, so cook 2 days’ worth at once)' },
    { swap: 'Peanuts', with: 'Same weight of almonds (≈ 6× the price)' },
    { swap: 'The fruit', with: 'Any fruit in season (see the season note); papaya is in the market all year' },
    { swap: 'Pumpkin seeds', with: 'Leave out if they don’t suit you; the zinc then comes mostly from dals and atta' },
  ],
  why: 'Quick, mostly carbohydrate with ~20 g protein, moderate in fat and fibre so it sits well on the commute. Pumpkin seeds add zinc and iron; ground flaxseed adds omega-3 (ALA). The fruit changes with the season; everything else stays the same all year.',
  keeps: 'Grind a week’s flaxseed at a time and keep it in a closed jar in the fridge (ground flax goes stale).',
  requiresReheat: false,
});

const M1_EGG = meal({
  id: 'm1-egg',
  title: 'Oats cooked in milk with boiled eggs and seeds, and {fruit1}',
  items: [
    { food: 'milk', g: 200 },
    { food: 'oats', g: 70 },
    { food: 'egg', g: [50, 100, 100], step: 50, range: [50, 100], note: 'boiled last night' },
    { food: 'pumpkinSeeds', g: 5, range: [0, 15], note: 'stirred in at the end' },
    { food: 'flax', g: 5, range: [0, 10], note: 'ground, stirred in at the end' },
    { food: 'sunflowerSeeds', g: 5, range: [0, 20], note: 'stirred in at the end' },
    { slot: 'fruit1', g: 150, range: [100, 250], note: 'cut, on the side' },
  ],
  steps: [
    'Bring the milk to a boil in a small pan, add the oats and simmer 3–4 minutes.',
    'Stir in the ground flaxseed and the pumpkin and sunflower seeds.',
    'Peel the egg(s) boiled last night; season with salt and pepper. Eat the {fruit1} alongside.',
  ],
  activeMin: 7,
  totalMin: 10,
  pots: 1,
  flavour: 'Elaichi or cinnamon in the oats; chaat masala or black pepper on the eggs.',
  substitutions: [
    { swap: 'Oats', with: 'Daliya, same weight' },
    { swap: 'Boiled eggs', with: 'A 2-egg omelette (adds ~5 min and 1 tsp oil)' },
    { swap: 'The fruit', with: 'Any fruit in season (see the season note); papaya is in the market all year' },
  ],
  why: 'Same base as the vegetarian Meal 1; eggs replace the peanuts for protein. The fruit changes with the season; everything else stays the same all year.',
  keeps: 'Grind a week’s flaxseed at a time and keep it in the fridge. Boil tomorrow’s eggs while dinner cooks (10 minutes), cool them in cold water and refrigerate. Food Standards Scotland advises eating hard-boiled eggs within 2 days.',
  tutorials: ['boiledEggs'],
  requiresReheat: false,
});

// Meal 3 ─────────────────────────────────────────────────────────────────────

const M3_WEEKDAY = meal({
  id: 'm3-curd-fruit',
  title: 'Curd with {fruit3}, dates and peanuts',
  items: [
    { food: 'curd', g: 225 },
    { slot: 'fruit3', g: 110, range: [80, 200], note: 'packed whole' },
    { food: 'dates', g: [20, 30, 40], step: 10 },
    { food: 'peanuts', g: 10, note: 'dry-roasted' },
    { food: 'sunflowerSeeds', g: 5, range: [0, 20] },
  ],
  steps: [
    'Morning: spoon the curd into a leak-proof box. Pack the {fruit3} whole, and the dates and peanuts in a small dry box.',
    'At the office: curd into the fridge on arrival.',
    '6:15–6:45 PM: chop the dates into the curd and sprinkle the peanuts and sunflower seeds on top; eat the {fruit3} alongside.',
  ],
  activeMin: 3,
  totalMin: 3,
  pots: 0,
  flavour: 'Sweet: a pinch of elaichi in the curd. Savoury version: skip the dates, add roasted jeera powder and black salt. Alternate through the week.',
  substitutions: [
    { swap: 'Dates', with: 'Raisins, same weight' },
    { swap: 'Peanuts', with: 'Roasted chana, twice the weight (about 3× the fibre)' },
    { swap: 'The fruit', with: 'Banana works in any season (in the market all year)' },
  ],
  why: 'Pre-workout 2–3 h before training: mostly carbohydrate with some protein and little fat or fibre. Nothing to cook or heat.',
  keeps: 'The curd is the perishable part. Keep it in the office fridge; without one, eat it within ~4 h of leaving home.',
  requiresReheat: false,
  madeWhen: 'morning',
  morningMin: 3,
});

// Meal 2: office lunches ─────────────────────────────────────────────────────

const L_SATTU = meal({
  id: 'l-sattu-paratha',
  title: 'Sattu parathas with curd and salad',
  items: [
    { food: 'atta', g: [55, 55, 75], note: ['2 parathas', '2 parathas', '2 large parathas'] },
    { food: 'sattu', g: [25, 25, 40], note: 'filling' },
    { food: 'oil', g: [9, 9, 12], note: 'dough and tawa' },
    { food: 'curd', g: 225 },
    { slot: 'salad', g: [50, 50, 80], range: [40, 120], note: '{salad}' },
    { food: 'lemon', g: 5, note: 'in the filling' },
  ],
  steps: [
    'Mix the sattu with chopped onion, green chilli, coriander, ajwain, salt, lemon juice and 1 tsp oil.',
    'Knead the atta into a soft dough and divide it into balls.',
    'Stuff each ball with the filling, seal and roll out gently.',
    'Cook on a hot tawa with a little oil until there are brown spots on both sides.',
    `${OVERNIGHT} Steam makes warm parathas soggy, so let them cool fully before wrapping them in foil. Cut the salad and keep it in a closed box.`,
    MORNING_PACK,
  ],
  activeMin: 20,
  totalMin: 25,
  pots: 1,
  flavour: 'Ajwain, green chilli and lemon in the filling keep the taste strong when cold. A spoon of lime or mango pickle on the side (it counts toward salt).',
  substitutions: [
    { swap: 'Sattu', with: 'Roasted chana ground at home' },
    { swap: 'Curd', with: 'Chaas in a bottle' },
  ],
  why: 'A Bihari travel food: designed to be eaten cold and keeps well.',
  keeps: COLD_PACK,
  tutorials: ['sattuParatha'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

const L_PANEER_ROLL = meal({
  id: 'l-paneer-bhurji-roll',
  title: 'Paneer bhurji rolls with mint curd',
  items: [
    { food: 'atta', g: [80, 80, 90], note: ['2 rotis', '2 rotis', '2 large rotis'] },
    { food: 'paneer', g: [60, 80, 110] },
    { food: 'onion', g: [25, 30, 35] },
    { food: 'tomato', g: [20, 30, 30] },
    { food: 'capsicum', g: [15, 20, 25] },
    { food: 'oil', g: 4 },
    { food: 'curd', g: 125, note: 'with chopped mint and salt' },
  ],
  steps: [
    'Make the rotis.',
    'Heat the oil, add jeera, then onion, tomato and capsicum; cook 4–5 minutes with salt, haldi and garam masala.',
    'Crumble in the paneer and cook 2 minutes until dry.',
    'Cool, then roll the bhurji inside the rotis and wrap in foil.',
    OVERNIGHT,
    `${MORNING_PACK} Stir chopped mint and salt into the curd as a dip.`,
  ],
  activeMin: 20,
  totalMin: 25,
  pots: 2,
  flavour: 'Cook the bhurji dry; a squeeze of lemon and chaat masala just before rolling keep it bright when cold.',
  substitutions: [
    { swap: 'Paneer', with: 'Tofu, same weight (less fat, similar protein)' },
    { swap: 'Capsicum', with: 'Peas in winter, or grated carrot' },
  ],
  why: 'Paneer and curd travel safely cold for ~4 h with the frozen bottle, and taste fine unheated.',
  keeps: COLD_PACK,
  tutorials: ['paneerBhurji', 'roti'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

const L_CHILLA = meal({
  id: 'l-besan-chilla',
  title: 'Besan chillas with paneer and curd',
  items: [
    { food: 'besan', g: [65, 85, 110], note: ['2 chillas', '2 chillas', '3 chillas'] },
    { food: 'paneer', g: 30, note: 'grated, inside' },
    { food: 'onion', g: 70, note: 'chopped, with coriander' },
    { food: 'tomato', g: 70, note: 'chopped' },
    { food: 'oil', g: [5, 6, 6] },
    { food: 'curd', g: [125, 125, 225] },
  ],
  steps: [
    'Whisk the besan with water, salt, ajwain and haldi into a pouring batter; stir in the chopped onion, tomato, chilli and coriander.',
    'Pour a ladle onto a hot greased tawa, spread thin and cook ~2 minutes a side.',
    'Sprinkle grated paneer on one half and fold.',
    OVERNIGHT,
    MORNING_PACK,
  ],
  activeMin: 20,
  totalMin: 25,
  pots: 1,
  flavour: 'Ajwain in the batter, and a green chutney or a pinch of chaat masala on the paneer. Thin chillas stay softer cold than thick ones.',
  substitutions: [
    { swap: 'Besan', with: 'Moong dal batter (soak 4 h, grind)' },
    { swap: 'Paneer', with: 'Leave out and add 20 g besan' },
  ],
  keeps: COLD_PACK,
  tutorials: ['cheela'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

const L_SOYA_ROLL = meal({
  id: 'l-soya-keema-roll',
  title: 'Soya keema rolls with curd',
  items: [
    { food: 'atta', g: [55, 55, 70], note: ['2 rotis', '2 rotis', '2 large rotis'] },
    { food: 'soyaChunks', g: [20, 35, 45], note: 'soaked, squeezed, minced' },
    { slot: 'sabzi', g: [50, 55, 100], note: '{sabzi}, finely chopped' },
    { food: 'oil', g: [9, 9, 12] },
    { food: 'curd', g: 250 },
  ],
  steps: [
    'Night before, while dinner cooks: soak the soya chunks in hot water 10 minutes, squeeze out all the water and mince them in a mixer.',
    'Sauté the onion, ginger-garlic, tomato and the chopped vegetables in the oil; add the soya, salt, chilli and garam masala; cook dry ~5 minutes.',
    'Make the rotis, roll the cooled keema inside and wrap in foil.',
    OVERNIGHT,
    MORNING_PACK,
  ],
  activeMin: 20,
  totalMin: 30,
  pots: 2,
  flavour: 'Squeeze the soya really dry so it takes up the masala; finish with kasuri methi and lemon. Raw onion rings in the roll add crunch.',
  substitutions: [
    { swap: 'Soya chunks', with: 'Paneer, about 2.5× the weight' },
    { swap: 'The vegetables', with: 'Grated carrot or capsicum' },
  ],
  why: 'Soya is the cheapest protein in the food table. It stays at ≤ 20 g a day in Phase 0 while your gut adjusts.',
  keeps: COLD_PACK,
  tutorials: ['soyaKeema', 'roti'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

const L_ALOO_PANEER = meal({
  id: 'l-aloo-paneer-paratha',
  title: 'Aloo-paneer parathas with curd',
  items: [
    { food: 'atta', g: 110, note: ['2 parathas', '2 parathas', '2 large parathas'] },
    { food: 'potato', g: [55, 70, 70], note: 'boiled with dinner' },
    { food: 'paneer', g: [60, 60, 75], note: 'grated' },
    { food: 'oil', g: 6 },
    { food: 'curd', g: 225 },
  ],
  steps: [
    'Mash the cooled boiled potato with the grated paneer, salt, green chilli, coriander and amchur.',
    'Stuff into balls of atta dough and roll out gently.',
    'Cook on the tawa with a little oil until brown spots appear on both sides.',
    OVERNIGHT,
    MORNING_PACK,
  ],
  activeMin: 20,
  totalMin: 25,
  pots: 1,
  flavour: 'Amchur and green chilli in the filling; a little pickle on the side.',
  substitutions: [
    { swap: 'Paneer', with: 'More potato plus 15 g sattu in the filling' },
  ],
  keeps: COLD_PACK,
  dayBefore: 'Boil the potatoes with dinner (pressure cooker, 2–3 whistles) and let them cool before mashing.',
  tutorials: ['roti'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

const L_EGG_ROLL = meal({
  id: 'l-egg-bhurji-roll',
  title: 'Egg bhurji rolls with curd',
  items: [
    { food: 'atta', g: [90, 105, 110], note: ['2 rotis', '2 rotis', '2 large rotis'] },
    { food: 'egg', g: [100, 100, 150], step: 50, range: [100, 150] },
    { food: 'onion', g: [20, 25, 25] },
    { food: 'tomato', g: [15, 20, 20] },
    { food: 'capsicum', g: [15, 15, 20] },
    { food: 'oil', g: [5, 5, 7] },
    { food: 'curd', g: 125 },
  ],
  steps: [
    'Make the rotis.',
    'Sauté onion, tomato and capsicum in the oil 3–4 minutes with salt, haldi and chilli.',
    'Add the beaten eggs and stir until completely set, with no runny parts.',
    'Cool, roll inside the rotis and wrap in foil.',
    OVERNIGHT,
    MORNING_PACK,
  ],
  activeMin: 15,
  totalMin: 20,
  pots: 2,
  flavour: 'Black pepper, coriander and a pinch of garam masala at the end; green chutney inside the roll.',
  substitutions: [{ swap: 'Egg bhurji', with: '2–3 sliced boiled eggs with onion and chaat masala' }],
  keeps: `Cook the eggs until fully set. ${COLD_PACK}`,
  tutorials: ['eggBhurji', 'roti'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

const L_CHICKEN_ROLL = meal({
  id: 'l-chicken-roll',
  title: 'Chicken bhuna rolls with curd',
  items: [
    { food: 'atta', g: [100, 105, 110], note: ['2 rotis', '2 rotis', '2 large rotis'] },
    { food: 'chicken', g: [60, 70, 80], note: 'boneless, cooked the night before' },
    { slot: 'salad', g: [50, 60, 60], range: [40, 120], note: '{salad}, sliced' },
    { food: 'oil', g: [9, 9, 12] },
    { food: 'curd', g: [100, 125, 250] },
  ],
  steps: [
    'Tuesday night: when the dinner chicken is browned in masala and fully cooked (no pink inside), lift this portion out before adding water. Cool and refrigerate in a closed box.',
    'Same night, once it is cool: shred the chicken, mix with the sliced salad, lemon and chaat masala, roll inside rotis and wrap in foil.',
    OVERNIGHT,
    MORNING_PACK,
  ],
  activeMin: 15,
  totalMin: 15,
  pots: 1,
  flavour: 'Lemon, raw onion and chaat masala make cold chicken taste fresh; mint chutney inside the roll.',
  substitutions: [{ swap: 'Chicken', with: 'Paneer bhurji (same weight) for a vegetarian day' }],
  keeps: `Cooked chicken: refrigerated overnight and eaten the next day, never older. ${COLD_PACK}`,
  tutorials: ['roti'],
  requiresReheat: false,
  madeWhen: 'night-before',
  morningMin: 3,
});

// Meal 4: dinners ────────────────────────────────────────────────────────────

const DAL_RICE_POTS = 'Pressure cooker with a separator (dal below, rice above) and one kadhai.';

const D_MOONG = meal({
  id: 'd-moong-dal-rice',
  title: 'Moong dal, rice and soya sabzi',
  items: [
    { food: 'moongDal', g: [35, 35, 40] },
    { food: 'rice', g: 130 },
    { food: 'soyaChunks', g: [20, 40, 45], note: 'soaked 10 min, squeezed' },
    { slot: 'sabzi', g: 50, range: [50, 200], note: '{sabzi}' },
    { food: 'oil', g: [8, 9, 11], note: 'sabzi and tadka' },
    { food: 'curd', g: 175 },
  ],
  steps: [
    DAL_RICE_POTS,
    'Soak the soya chunks in hot water 10 minutes; squeeze them dry.',
    'Rinse the dal and rice. Dal with 3× water, haldi and salt in the cooker; rice with 2× water in the separator. 3 whistles, then let the pressure drop.',
    'Meanwhile in the kadhai: jeera, onion, tomato and spices, then the chopped vegetables and soya; cover and cook 8 minutes. Move to a bowl.',
    'Same kadhai: heat 1 tsp oil, add jeera, garlic, hing and dry red chilli; pour over the dal.',
    'Serve with the curd.',
  ],
  activeMin: 20,
  totalMin: 35,
  pots: 2,
  flavour: 'Garlic and hing in the tadka, lemon on the dal (it also helps iron absorption). Squeeze the soya well so it takes up the masala.',
  substitutions: [
    { swap: 'Moong dal', with: 'Masoor dal (same weight, cooks as fast)' },
    { swap: 'Soya chunks', with: 'Paneer, 2.5× the weight' },
    { swap: 'Rice', with: '2 rotis (adds ~7 g fibre)' },
  ],
  tutorials: ['dal', 'soyaChunks'],
  requiresReheat: false,
});

const D_RAJMA = meal({
  id: 'd-rajma-rice',
  title: 'Rajma chawal with salad and curd',
  items: [
    { food: 'rajma', g: [50, 60, 80], note: 'soaked overnight' },
    { food: 'rice', g: [60, 65, 65] },
    { slot: 'salad', g: [80, 80, 100], range: [50, 150], note: '{salad}' },
    { food: 'oil', g: [8, 10, 12] },
    { food: 'curd', g: 175 },
  ],
  steps: [
    'Night before: soak the rajma in plenty of water.',
    'Drain, rinse, and pressure-cook with fresh water and salt: 6–7 whistles, until a bean crushes easily. Undercooked kidney beans are toxic.',
    'Kadhai: oil, jeera, onion until golden, ginger-garlic, tomato and spices; cook until the oil separates. Add the rajma with its water and simmer 10 minutes.',
    'Rinse the cooker and cook the rice (2× water, 2 whistles), or cook it in a separator above the rajma.',
    'Serve with salad and curd.',
  ],
  activeMin: 20,
  totalMin: 50,
  pots: 2,
  flavour: 'Mash a few beans into the gravy to thicken it; finish with kasuri methi and garam masala.',
  substitutions: [{ swap: 'Rajma', with: 'Kabuli chana or kala chana, same weight' }],
  dayBefore: 'Soak the rajma overnight.',
  tutorials: ['rajma'],
  requiresReheat: false,
});

const D_PALAK_PANEER = meal({
  id: 'd-saag-paneer-rice',
  title: 'Saag paneer, moong dal and rice',
  items: [
    { food: 'paneer', g: 30 },
    { food: 'moongDal', g: [30, 35, 40], note: 'thin dal' },
    { slot: 'greens', g: [125, 135, 250], range: [100, 300], note: '{greens}' },
    { food: 'rice', g: [115, 125, 125] },
    { food: 'oil', g: 4 },
    { food: 'curd', g: 175 },
  ],
  steps: [
    'Pressure cooker with a separator: moong dal (3× water, haldi, salt) below, rice (2× water) above; 3 whistles.',
    'Kadhai: boil water, blanch the greens 2 minutes, drain, cool in cold water and blend.',
    'Same kadhai: oil, jeera, onion, ginger-garlic, tomato and spices; add the green purée and simmer 5 minutes.',
    'Add the paneer cubes for the last 3 minutes.',
    'Temper the dal with jeera and garlic in the kadhai once the saag paneer is out, and serve everything with the curd.',
  ],
  activeMin: 25,
  totalMin: 35,
  pots: 2,
  flavour: 'Cold water after blanching keeps the greens bright; kasuri methi and lemon at the end.',
  substitutions: [
    { swap: 'The greens', with: 'Methi, or any leafy greens in season' },
    { swap: 'Paneer', with: 'Soaked soya chunks, 40% of the weight' },
  ],
  tutorials: ['palakPaneer', 'dal'],
  requiresReheat: false,
});

const D_TOOR = meal({
  id: 'd-toor-dal-aloo',
  title: 'Toor dal, rice and jeera aloo',
  items: [
    { food: 'toorDal', g: [80, 80, 85] },
    { food: 'rice', g: 105 },
    { food: 'potato', g: [40, 60, 100] },
    { food: 'oil', g: [9, 10, 12] },
    { food: 'curd', g: 150 },
  ],
  steps: [
    DAL_RICE_POTS,
    'Dal with 3× water, haldi and salt; rice in the separator; 3–4 whistles. Add the cubed potatoes in a third separator, or boil them in the dal water.',
    'Kadhai: jeera in oil, then the boiled potato cubes with salt, chilli and amchur; toss 5 minutes.',
    'Same kadhai: a quick tadka of jeera, garlic and tomato for the dal.',
    'Serve with the curd.',
  ],
  activeMin: 20,
  totalMin: 35,
  pots: 2,
  flavour: 'Tomato and a pinch of jaggery in the tadka for Gujarati-style dal; or garlic and red chilli for Punjabi style.',
  substitutions: [{ swap: 'Potato', with: 'The season’s sabzi, 150 g' }],
  tutorials: ['dal'],
  requiresReheat: false,
});

const D_SOYA_CURRY = meal({
  id: 'd-soya-curry-rice',
  title: 'Soya chunk curry with rice and salad',
  items: [
    { food: 'soyaChunks', g: [20, 35, 45], note: 'soaked 10 min, squeezed' },
    { food: 'rice', g: [85, 85, 105] },
    { food: 'potato', g: [60, 60, 80], note: 'cubed, in the curry' },
    { slot: 'salad', g: [80, 100, 100], range: [50, 150], note: '{salad}' },
    { food: 'oil', g: [4, 6, 8] },
    { food: 'curd', g: 175 },
  ],
  steps: [
    'Soak the soya chunks in hot water 10 minutes; squeeze them dry.',
    'Pressure cooker: oil, jeera, onion, ginger-garlic, tomato and spices until the oil separates; add the soya, potato and 1 cup water; 2 whistles.',
    'Cook the rice in a separator above the curry, or straight after in the rinsed cooker.',
    'Serve with salad and curd.',
  ],
  activeMin: 15,
  totalMin: 30,
  pots: 1,
  flavour: 'Squeeze the soya really dry so it soaks up the masala; kasuri methi and garam masala at the end.',
  substitutions: [
    { swap: 'Soya curry', with: 'Chole (soak overnight; about 3× the fibre)' },
    { swap: 'Soya chunks', with: 'Paneer, 2.5× the weight' },
  ],
  tutorials: ['soyaChunks'],
  requiresReheat: false,
});

const D_EGG_CURRY = meal({
  id: 'd-egg-curry-rice',
  title: 'Egg curry with rice and sabzi',
  items: [
    { food: 'egg', g: [100, 100, 150], step: 50, range: [100, 150] },
    { food: 'rice', g: [125, 130, 130] },
    { slot: 'sabzi', g: 200, range: [100, 250], note: 'onion-tomato masala and a side sabzi of {sabzi}' },
    { food: 'oil', g: 4 },
    { food: 'curd', g: 150 },
  ],
  steps: [
    'Boil the eggs 10 minutes in the pressure cooker base, cool and peel. Use the same cooker for the rice (2 whistles).',
    'Kadhai: onion until golden, ginger-garlic, tomato and spices until the oil separates; add water and simmer 5 minutes.',
    'Slit the eggs and simmer them in the gravy 5 minutes.',
    'Serve with rice and curd.',
  ],
  activeMin: 20,
  totalMin: 35,
  pots: 2,
  flavour: 'Fry the peeled eggs in the masala for a minute before adding water; finish with coriander.',
  substitutions: [{ swap: 'Egg curry', with: 'Egg bhurji with 2 rotis' }],
  tutorials: ['boiledEggs'],
  requiresReheat: false,
});

const D_CHICKEN = meal({
  id: 'd-chicken-curry-rice',
  title: 'Chicken curry with rice and salad',
  items: [
    { food: 'chicken', g: [65, 70, 75] },
    { food: 'rice', g: [125, 130, 130] },
    { slot: 'salad', g: 150, range: [50, 200], note: '{salad}' },
    { food: 'oil', g: 12 },
    { food: 'curd', g: [200, 200, 250], note: 'half in the marinade' },
  ],
  steps: [
    'Marinate the chicken in half the curd with salt, haldi and chilli (30 min, or overnight in the fridge).',
    'Kadhai: onion until golden, ginger-garlic, tomato and spices; add the chicken and cook on medium until browned and cooked through (no pink inside).',
    'On Tuesday, lift out the portion for Wednesday’s roll now, before adding water.',
    'Add water and simmer 10 minutes. Cook the rice in the pressure cooker meanwhile.',
    'Serve with salad and the rest of the curd.',
  ],
  activeMin: 25,
  totalMin: 45,
  pots: 2,
  flavour: 'Brown the onions properly and add garam masala at the end. Brown, not black: don’t char the chicken.',
  substitutions: [{ swap: 'Chicken', with: 'Paneer or soaked soya chunks for a vegetarian day' }],
  keeps: 'Thaw frozen chicken in the fridge overnight, not on the counter.',
  tutorials: ['chickenCurry'],
  requiresReheat: false,
});

const D_FISH = meal({
  id: 'd-fish-curry-rice',
  title: 'Fish curry with rice and sabzi',
  items: [
    { food: 'fish', g: [80, 85, 115], note: 'rohu or katla pieces' },
    { food: 'rice', g: [120, 120, 130] },
    { slot: 'sabzi', g: [65, 120, 120], range: [60, 200], note: '{sabzi}, in the curry' },
    { food: 'oil', g: [4, 10, 12] },
    { food: 'curd', g: [75, 75, 125] },
  ],
  steps: [
    'Rub the fish with salt and haldi.',
    'Kadhai: lightly fry the fish 2 minutes a side and take it out.',
    'Same kadhai: jeera, the vegetables, ginger, tomato and spices; add water and simmer until the vegetables are soft.',
    'Return the fish and simmer 5 minutes. Cook the rice in the pressure cooker meanwhile.',
    'Serve with the curd.',
  ],
  activeMin: 25,
  totalMin: 40,
  pots: 2,
  flavour: 'Kalonji and green chilli in the oil (Bengali style); rice-bran oil every day, mustard oil only occasionally.',
  substitutions: [{ swap: 'Rohu / katla', with: 'Any local fish; sardine or mackerel give more omega-3' }],
  tutorials: ['fishCurry'],
  requiresReheat: false,
});

// Weekend meals ──────────────────────────────────────────────────────────────

const W_PULAO = meal({
  id: 'w-paneer-pulao',
  title: 'Soya-paneer pulao with raita',
  items: [
    { food: 'rice', g: [75, 75, 80] },
    { food: 'paneer', g: 30 },
    { food: 'soyaChunks', g: [15, 30, 45], note: 'soaked 10 min, squeezed' },
    { slot: 'sabzi', g: [100, 100, 120], range: [60, 200], note: '{sabzi}' },
    { food: 'oil', g: [4, 4, 9] },
    { food: 'curd', g: 225, note: 'raita with cucumber' },
  ],
  steps: [
    'Soak the soya chunks in hot water 10 minutes and squeeze them dry.',
    'Pressure cooker: oil, whole spices (jeera, bay leaf, clove), onion, vegetables, soya and paneer cubes; 1 minute.',
    'Add the rinsed rice, 2× water and salt; 2 whistles.',
    'Mix the curd with grated cucumber, roasted jeera and salt for the raita.',
  ],
  activeMin: 15,
  totalMin: 30,
  pots: 1,
  flavour: 'Fry the whole spices first; a squeeze of lemon and fresh coriander before serving.',
  substitutions: [{ swap: 'Paneer', with: 'More soya chunks, 40% of the paneer weight' }],
  tutorials: ['soyaChunks'],
  requiresReheat: false,
});

const W_POHA = meal({
  id: 'w-poha-chaas',
  title: 'Kanda poha with peanuts and chaas',
  items: [
    { food: 'poha', g: [40, 55, 60] },
    { food: 'peanuts', g: [10, 10, 15] },
    { food: 'onion', g: [50, 50, 60], note: 'sliced (add a handful of peas in winter)' },
    { food: 'oil', g: [4, 5, 5] },
    { food: 'curd', g: 250, note: 'whisked into chaas' },
    { food: 'lemon', g: 5 },
  ],
  steps: [
    'Rinse the poha in a sieve and let it soften 5 minutes.',
    'Kadhai: oil, mustard seeds, curry leaves, peanuts, then the onion; 3 minutes.',
    'Add the poha, haldi, salt and a pinch of sugar; toss 2 minutes. Lemon and coriander on top.',
    'Whisk the curd with water, roasted jeera and salt into chaas.',
  ],
  activeMin: 15,
  totalMin: 15,
  pots: 1,
  flavour: 'Curry leaves and lemon are what make poha; sev on top if you like (counts toward salt and fat).',
  substitutions: [{ swap: 'Poha', with: 'Upma (same weight of rava)' }],
  tutorials: ['poha', 'chaas'],
  requiresReheat: false,
});

const W_KALA_CHANA = meal({
  id: 'w-kala-chana-rice',
  title: 'Kala chana curry, rice and salad',
  items: [
    { food: 'kalaChana', g: 80, note: 'soaked overnight' },
    { food: 'rice', g: [70, 70, 90] },
    { slot: 'salad', g: [80, 100, 100], range: [50, 150], note: '{salad}' },
    { food: 'oil', g: 4 },
    { food: 'curd', g: 150 },
  ],
  steps: [
    'Night before: soak the chana.',
    'Pressure-cook the drained chana with fresh water and salt, 6–7 whistles.',
    'Kadhai: onion, ginger-garlic, tomato and spices; add the chana and simmer 10 minutes.',
    'Cook the rice in the rinsed cooker.',
  ],
  activeMin: 20,
  totalMin: 50,
  pots: 2,
  flavour: 'Amchur or a squeeze of lemon at the end; Bihari style with mustard seeds and garlic.',
  substitutions: [{ swap: 'Kala chana', with: 'Rajma or kabuli chana, same weight' }],
  dayBefore: 'Soak the kala chana overnight.',
  tutorials: ['kalaChana'],
  requiresReheat: false,
});

const W_KHICHDI = meal({
  id: 'w-khichdi',
  title: 'Moong dal khichdi with curd and sabzi',
  items: [
    { food: 'rice', g: [85, 85, 90] },
    { food: 'moongDal', g: [65, 80, 90] },
    { slot: 'sabzi', g: [50, 60, 165], range: [50, 200], note: '{sabzi}, cooked into the khichdi' },
    { food: 'ghee', g: 4 },
    { food: 'curd', g: 250 },
  ],
  steps: [
    'Pressure cooker: ghee, jeera and hing, then the vegetables.',
    'Add the rinsed rice and dal, 4× water, haldi and salt; 3 whistles.',
    'Serve with the curd.',
  ],
  activeMin: 10,
  totalMin: 30,
  pots: 1,
  flavour: 'Ghee, jeera and hing; a spoon of pickle or roasted papad on the side.',
  substitutions: [{ swap: 'Moong dal', with: 'Masoor dal' }],
  tutorials: ['khichdi'],
  requiresReheat: false,
});

const W_SHAKE = meal({
  id: 'w-banana-shake-chana',
  title: 'Banana milkshake and roasted chana',
  items: [
    { food: 'milk', g: 325 },
    { food: 'banana', g: 110 },
    { food: 'dates', g: [10, 20, 20], step: 10 },
    { food: 'roastedChana', g: [20, 25, 40] },
  ],
  steps: ['Blend the cold milk, banana and dates 30 seconds.', 'Eat the roasted chana alongside.'],
  activeMin: 5,
  totalMin: 5,
  pots: 0,
  flavour: 'A pinch of elaichi in the shake; chaat masala on the chana.',
  substitutions: [{ swap: 'Dates', with: '1 tsp jaggery' }],
  requiresReheat: false,
});

const W_MATAR_PANEER = meal({
  id: 'w-paneer-soya-sabzi-rice',
  title: 'Paneer and soya sabzi with rice',
  items: [
    { food: 'paneer', g: [50, 55, 55] },
    { food: 'soyaChunks', g: [20, 30, 30], note: 'soaked 10 min, squeezed' },
    { slot: 'sabzi', g: [90, 90, 150], range: [60, 200], note: '{sabzi} (matar paneer in winter)' },
    { food: 'rice', g: [95, 95, 105] },
    { food: 'oil', g: [8, 8, 10] },
    { food: 'curd', g: 100 },
  ],
  steps: [
    'Cook the rice in the pressure cooker.',
    'Soak the soya chunks in hot water 10 minutes; squeeze them dry.',
    'Kadhai: onion, ginger-garlic, tomato and spices until the oil separates; add the chopped vegetables, soya and a little water, simmer 8 minutes.',
    'Add the paneer cubes for the last 3 minutes.',
  ],
  activeMin: 20,
  totalMin: 30,
  pots: 2,
  flavour: 'Kasuri methi and a pinch of garam masala at the end.',
  substitutions: [{ swap: 'Paneer', with: 'Soaked soya chunks, 40% of the weight' }],
  requiresReheat: false,
});

// ─── Plans ────────────────────────────────────────────────────────────────────

const vegetarian: MealPlanDefinition = {
  id: 'vegetarian',
  name: 'Plan 1 — Vegetarian',
  shortName: 'Vegetarian',
  diet: 'Vegetarian (dairy)',
  summary: 'Dairy, pulses, soya and grains. Cold parathas and rolls for the office, dal-rice or a paneer dish for dinner.',
  meal1: M1_VEG,
  weekdayMeal3: M3_WEEKDAY,
  lunches: { Monday: L_SATTU, Tuesday: L_PANEER_ROLL, Wednesday: L_CHILLA, Thursday: L_SOYA_ROLL, Friday: L_ALOO_PANEER },
  dinners: { Monday: D_MOONG, Tuesday: W_KHICHDI, Wednesday: D_PALAK_PANEER, Thursday: D_TOOR, Friday: D_SOYA_CURRY },
  saturday: { meal2: W_PULAO, meal3: W_POHA, meal4: W_KALA_CHANA },
  sunday: { meal2: D_RAJMA, meal3: W_SHAKE, meal4: W_MATAR_PANEER },
  prepStrategy: [
    'Sunday: dry-roast the week’s peanuts; buy paneer in sealed packs (freeze the extra in portions).',
    'Sunday: grind the week’s flaxseed and keep it in a closed jar in the fridge.',
    'Sunday to Thursday evening: cook the next day’s office lunch with or after dinner (about 15–20 minutes), cool it and refrigerate it within 2 hours. Weekday mornings are then just Meal 1 and ~3 minutes of packing.',
    'Every night: set curd from 1 L milk for the next day.',
    'Friday night: soak the kala chana for Saturday; Saturday night: soak the rajma for Sunday. Thursday night: boil the potatoes with dinner for Friday’s parathas.',
  ],
  notes: ['Iron and zinc come mostly from pulses, atta and pumpkin seeds; lemon on dals and the fruit with Meals 1 and 3 help absorption.'],
};

const egg: MealPlanDefinition = {
  id: 'egg',
  name: 'Plan 2 — Vegetarian + eggs',
  shortName: 'Veg + eggs',
  diet: 'Vegetarian + eggs',
  summary: 'The vegetarian plan with eggs at breakfast, one egg lunch and one egg dinner.',
  meal1: M1_EGG,
  weekdayMeal3: M3_WEEKDAY,
  lunches: { Monday: L_SATTU, Tuesday: L_EGG_ROLL, Wednesday: L_CHILLA, Thursday: L_SOYA_ROLL, Friday: L_ALOO_PANEER },
  dinners: { Monday: D_MOONG, Tuesday: W_KHICHDI, Wednesday: D_EGG_CURRY, Thursday: D_TOOR, Friday: D_SOYA_CURRY },
  saturday: { meal2: W_PULAO, meal3: W_POHA, meal4: W_KALA_CHANA },
  sunday: { meal2: D_RAJMA, meal3: W_SHAKE, meal4: W_MATAR_PANEER },
  prepStrategy: [
    'Every night: boil the next morning’s eggs while dinner cooks and refrigerate them (eat hard-boiled eggs within 2 days).',
    'Sunday: grind the week’s flaxseed and keep it in a closed jar in the fridge.',
    'Sunday to Thursday evening: cook the next day’s office lunch with or after dinner (about 15–20 minutes), cool it and refrigerate it within 2 hours. Weekday mornings are then just Meal 1 and ~3 minutes of packing.',
    'Every night: set curd from 1 L milk for the next day.',
    'Friday night: soak the kala chana for Saturday; Saturday night: soak the rajma for Sunday. Thursday night: boil the potatoes with dinner for Friday’s parathas.',
  ],
  notes: ['Eggs add vitamin B12 that plant foods lack.'],
};

const nonveg: MealPlanDefinition = {
  id: 'nonveg',
  name: 'Plan 3 — Non-vegetarian',
  shortName: 'Non-veg',
  diet: 'Mixed: vegetarian meals plus eggs, chicken and fish',
  summary: 'A mixed plan: eggs at breakfast, chicken twice and fish once a week, the rest vegetarian.',
  meal1: M1_EGG,
  weekdayMeal3: M3_WEEKDAY,
  lunches: { Monday: L_SATTU, Tuesday: L_CHILLA, Wednesday: L_CHICKEN_ROLL, Thursday: L_ALOO_PANEER, Friday: L_EGG_ROLL },
  dinners: { Monday: D_MOONG, Tuesday: D_CHICKEN, Wednesday: D_PALAK_PANEER, Thursday: D_FISH, Friday: D_EGG_CURRY },
  saturday: { meal2: W_PULAO, meal3: W_POHA, meal4: W_KALA_CHANA },
  sunday: { meal2: D_RAJMA, meal3: W_SHAKE, meal4: D_CHICKEN },
  prepStrategy: [
    'Every night: boil the next morning’s eggs while dinner cooks and refrigerate them.',
    'Sunday: grind the week’s flaxseed and keep it in a closed jar in the fridge.',
    'Sunday to Thursday evening: cook the next day’s office lunch with or after dinner (about 15–20 minutes), cool it and refrigerate it within 2 hours. Weekday mornings are then just Meal 1 and ~3 minutes of packing.',
    'Buy chicken on Monday and Saturday, or freeze portions and thaw in the fridge overnight.',
    'Tuesday: cook the extra chicken for Wednesday’s roll (lift it out before adding water). Wednesday night: boil the potatoes with dinner for Thursday’s parathas.',
  ],
  notes: [
    'Fish once a week provides long-chain omega-3 (EPA/DHA).',
    'Non-veg is not automatically healthier: the three plans are built to the same calorie, protein and micronutrient targets.',
  ],
};

export const MEAL_PLAN_DEFINITIONS: MealPlanDefinition[] = [vegetarian, egg, nonveg];

// ─── Week builder ─────────────────────────────────────────────────────────────

export interface ResolvedItem extends MealItem {
  /** Set when the item comes from a seasonal slot. */
  slot?: SlotId;
}

export interface ResolvedMeal extends Omit<Meal, 'items'> {
  items: ResolvedItem[];
  season: SeasonId;
}

export interface PlannedMeal {
  slot: MealSlot;
  meal: ResolvedMeal;
  time: string;
  tag?: 'fixed-daily' | 'fixed-weekday' | 'office-lunch';
}

export interface PlannedDay {
  day: DayName;
  isWeekend: boolean;
  meals: [PlannedMeal, PlannedMeal, PlannedMeal, PlannedMeal];
}

export const gramsFor = (g: Grams, phase: PhaseId): number => (typeof g === 'number' ? g : g[phase]);

/** The amount of an item for a phase and season: the solver's result, or the starting amount if the meal hasn't been solved. */
export function solvedGrams(m: Meal, it: PlanItem, phase: PhaseId, season: SeasonId): number {
  const q = (QUANTITIES as Record<string, Record<string, number[][]> | undefined>)[m.id]?.[itemKey(it)];
  return q ? q[phase][SEASON_IDS.indexOf(season)] : gramsFor(it.g, phase);
}

/** Replace {fruit1}, {sabzi}… with the season's food names. */
export function fillSlots(text: string, season: SeasonId): string {
  return text.replace(/\{(fruit1|fruit3|sabzi|salad|greens)\}/g, (_, slot: SlotId) => SEASONS[season].slots[slot].name);
}

/** The meal with quantities for one phase and season. Seasonal slots become their foods; zero-gram optional items are left out. */
export function resolveMeal(m: Meal, phase: PhaseId, season: SeasonId): ResolvedMeal {
  const f = (t: string) => fillSlots(t, season);
  const items: ResolvedItem[] = [];
  for (const it of m.items) {
    const g = solvedGrams(m, it, phase, season);
    if (g <= 0) continue;
    const note = it.note === undefined ? undefined : f(typeof it.note === 'string' ? it.note : it.note[phase]);
    if (it.slot) {
      for (const [food, share] of SEASONS[season].slots[it.slot].foods) {
        items.push({ food, g: Math.round(g * share * 10) / 10, slot: it.slot, ...(note ? { note } : {}) });
      }
    } else items.push({ food: it.food!, g, ...(note ? { note } : {}) });
  }
  return {
    ...m,
    title: f(m.title),
    steps: m.steps.map(f),
    flavour: f(m.flavour),
    substitutions: m.substitutions.map((x) => ({ swap: f(x.swap), with: f(x.with) })),
    ...(m.why ? { why: f(m.why) } : {}),
    items,
    season,
  };
}

/** The four meals of a day in a plan, before quantities are applied. */
export function mealsForDay(plan: MealPlanDefinition, day: DayName): [Meal, Meal, Meal, Meal] {
  if (day === 'Saturday') return [plan.meal1, plan.saturday.meal2, plan.saturday.meal3, plan.saturday.meal4];
  if (day === 'Sunday') return [plan.meal1, plan.sunday.meal2, plan.sunday.meal3, plan.sunday.meal4];
  const wd = day as WeekdayName;
  return [plan.meal1, plan.lunches[wd], plan.weekdayMeal3, plan.dinners[wd]];
}

export function buildWeek(plan: MealPlanDefinition, phase: PhaseId, season: SeasonId): PlannedDay[] {
  return DAYS.map((day) => {
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const t = (slot: MealSlot) => (isWeekend ? MEAL_SLOTS[slot].weekend : MEAL_SLOTS[slot].weekday);
    const r = (m: Meal) => resolveMeal(m, phase, season);
    const meal1: PlannedMeal = { slot: 1, meal: r(plan.meal1), time: t(1), tag: 'fixed-daily' };
    if (isWeekend) {
      const w = day === 'Saturday' ? plan.saturday : plan.sunday;
      return {
        day,
        isWeekend,
        meals: [meal1, { slot: 2, meal: r(w.meal2), time: t(2) }, { slot: 3, meal: r(w.meal3), time: t(3) }, { slot: 4, meal: r(w.meal4), time: t(4) }],
      };
    }
    const wd = day as WeekdayName;
    return {
      day,
      isWeekend,
      meals: [
        meal1,
        { slot: 2, meal: r(plan.lunches[wd]), time: t(2), tag: 'office-lunch' },
        { slot: 3, meal: r(plan.weekdayMeal3), time: t(3), tag: 'fixed-weekday' },
        { slot: 4, meal: r(plan.dinners[wd]), time: t(4) },
      ],
    };
  });
}

/** Every distinct dinner in a plan, in week order (for cooking cards). */
export function planDinners(plan: MealPlanDefinition): { days: DayName[]; meal: Meal }[] {
  const out: { days: DayName[]; meal: Meal }[] = [];
  const add = (day: DayName, m: Meal) => {
    const hit = out.find((o) => o.meal.id === m.id);
    if (hit) hit.days.push(day);
    else out.push({ days: [day], meal: m });
  };
  for (const d of WEEKDAYS) add(d, plan.dinners[d]);
  add('Saturday', plan.saturday.meal4);
  add('Sunday', plan.sunday.meal4);
  return out;
}
