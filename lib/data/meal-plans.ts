import type { MealItem } from '../nutrition';
import type { TutorialId } from './tutorials';

// ─── Four-meal structure (applies to every plan) ─────────────────────────────
// • Exactly 4 meals a day. No snacks.
// • Meal 1 is the same every day, Monday–Sunday.
// • Meal 3 is the same Monday–Friday (it is eaten at the office).
// • Meals 2 and 4 vary. Weekend Meals 2–4 are freer because you are at home.
// The structure is enforced in code: buildWeek() places the same Meal 1 object
// on all 7 days and the same weekday Meal 3 object on Mon–Fri.
//
// Practical system: "cook once, eat twice". Each weekday dinner is cooked in a
// double portion and the second portion is the next day's packed lunch.

export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const DAYS: DayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WEEKDAYS: DayName[] = DAYS.slice(0, 5);

export type MealSlot = 1 | 2 | 3 | 4;

export interface Meal {
  id: string;
  title: string;
  items: MealItem[];
  prep: string;
  /** Short line about why this meal is built the way it is. */
  why?: string;
  tutorials?: TutorialId[];
  /** Eaten at the office: must be packable and fridge-friendly. */
  packable?: boolean;
}

export type PlanId = 'preferred' | 'vegetarian' | 'egg' | 'nonveg';

export interface MealPlanDefinition {
  id: PlanId;
  name: string;
  shortName: string;
  summary: string;
  diet: string;
  meal1: Meal;
  weekdayMeal3: Meal;
  /** Weekday dinners. Each is cooked double; the extra portion is the next day's lunch. */
  dinners: Record<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', Meal>;
  saturday: { meal2: Meal; meal3: Meal; meal4: Meal };
  /** Sunday dinner is also cooked double: the extra portion is Monday's lunch. */
  sunday: { meal2: Meal; meal3: Meal; meal4: Meal };
  substitutions: { swap: string; with: string; note?: string }[];
  prepStrategy: string[];
  notes: string[];
}

export const MEAL_SLOTS: Record<
  MealSlot,
  { name: string; weekday: string; weekend: string; role: string }
> = {
  1: {
    name: 'Meal 1 · Breakfast',
    weekday: '8:15–8:45 AM',
    weekend: '9:00 AM',
    role: 'Same every day. On a morning-workout day, eat it straight after training.',
  },
  2: {
    name: 'Meal 2 · Lunch',
    weekday: '1:00 PM (office)',
    weekend: '1:30 PM',
    role: "Weekdays: last night's extra dinner portion, packed. Varies by day.",
  },
  3: {
    name: 'Meal 3 · Afternoon',
    weekday: '4:45–5:15 PM (office)',
    weekend: '5:00 PM',
    role: 'Same Mon–Fri. No cooking needed. Doubles as your pre-workout meal for evening training.',
  },
  4: {
    name: 'Meal 4 · Dinner',
    weekday: '8:45–9:30 PM',
    weekend: '8:30 PM',
    role: 'Varies. After an evening workout this is your post-workout meal.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const m = (
  id: string,
  title: string,
  items: MealItem[],
  prep: string,
  extra: Partial<Pick<Meal, 'why' | 'tutorials' | 'packable'>> = {},
): Meal => ({ id, title, items, prep, ...extra });

// ═════════════════════════════════════════════════════════════════════════════
// PLAN 1 — PREFERRED FOODS (vegetarian)
// Built around foods you already like. Corrections made after review:
//  • Protein was too low in the original plan, so soya chunks are added in small
//    amounts. They are the cheapest protein per gram in India.
//  • Nuts and seeds are kept but portioned small (10–15 g), because they are the
//    most expensive part of the budget per calorie.
//  • Kala chana and green moong are soaked and pressure-cooked or sprouted, which
//    makes them easier to digest.
// ═════════════════════════════════════════════════════════════════════════════

const p1: MealPlanDefinition = {
  id: 'preferred',
  name: 'Plan 1 — Preferred foods',
  shortName: 'Preferred',
  diet: 'Vegetarian',
  summary:
    'Built around foods you already like: sattu, oats, moong, kala chana, paneer, curd, sweet potato and seeds. It has been corrected where the evidence or budget required it.',
  meal1: m(
    'p1-m1',
    'Sattu–oats porridge with banana and seeds',
    [
      { food: 'oats', g: 60 },
      { food: 'milk', g: 250 },
      { food: 'sattu', g: 25, note: 'stirred in after cooking' },
      { food: 'banana', g: 110, note: '1 medium' },
      { food: 'pumpkinSeeds', g: 8, note: '1 level tbsp — zinc and iron' },
      { food: 'raisins', g: 5, note: '1 tsp' },
      { food: 'flax', g: 7, note: 'ground — for omega-3 (ALA)' },
    ],
    'Simmer the oats in milk for 3–4 minutes (or soak them in the milk overnight in the fridge). Take it off the heat, stir in the sattu so it doesn’t clump, and top with sliced banana, pumpkin seeds and raisins. Takes about 7 minutes.',
    {
      why: 'Gives about 25 g of protein to start the day. Oats provide beta-glucan fibre, and sattu adds plant protein and iron. Making it the same every day means no decisions in the morning.',
      tutorials: ['overnightOats'],
    },
  ),
  weekdayMeal3: m(
    'p1-m3',
    'Sattu chaas, roasted chana and papaya',
    [
      { food: 'sattu', g: 40, note: '4 tbsp' },
      { food: 'curd', g: 150, note: 'whisked into ~350 ml chaas' },
      { food: 'roastedChana', g: 20 },
      { food: 'papaya', g: 150, note: 'cubed; or another seasonal fruit' },
      { food: 'lemon', g: 5 },
    ],
    'At home, whisk the curd with water, roasted jeera and salt into chaas, and carry it in a bottle (keep it in the office fridge). Cube the papaya into a small box. At 5 PM, shake in the sattu and a squeeze of lemon. Eat the roasted chana and papaya alongside. No cooking at the office.',
    {
      why: 'Easy to digest and carb-rich about 2–3 hours before an evening workout. Papaya and lemon add vitamin C, which helps you absorb the iron in sattu and chana. Papaya is also one of the cheapest fruits most of the year.',
      tutorials: ['sattuDrink', 'chaas'],
      packable: true,
    },
  ),
  dinners: {
    Monday: m(
      'p1-d-mon',
      'Palak paneer, moong dal and roti',
      [
        { food: 'spinach', g: 150 },
        { food: 'paneer', g: 40 },
        { food: 'oil', g: 7 },
        { food: 'moongDal', g: 35, note: 'thin dal' },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 100 },
        { food: 'soyaChunks', g: 15, note: 'soaked, cooked in the dal' },
      ],
      'Blanch the spinach for 2 minutes, then blend it. Cook it with onion, garlic and spices, and add paneer cubes for the last 3 minutes. Pressure-cook the moong dal with the soaked soya chunks (about 15 minutes). Cook double: tomorrow’s lunch is the second portion.',
      { tutorials: ['palakPaneer', 'dal', 'roti'], packable: true },
    ),
    Tuesday: m(
      'p1-d-tue',
      'Green moong–soya khichdi with beetroot raita',
      [
        { food: 'rice', g: 80 },
        { food: 'moongWhole', g: 50, note: 'soaked 4–6 h' },
        { food: 'soyaChunks', g: 20 },
        { food: 'mixedVeg', g: 100 },
        { food: 'ghee', g: 7 },
        { food: 'curd', g: 180 },
        { food: 'beetroot', g: 80, note: 'grated into the raita' },
      ],
      'Pressure-cook the rice, soaked whole moong, soya chunks and vegetables with turmeric and salt (3–4 whistles). Finish with a ghee–jeera tadka. For the raita, mix curd with grated raw or boiled beetroot.',
      {
        why: 'Soaked moong in a soft khichdi is one of the easiest legume meals to digest. It suits a gut that is adjusting to more fibre.',
        tutorials: ['khichdi', 'soyaChunks'],
        packable: true,
      },
    ),
    Wednesday: m(
      'p1-d-wed',
      'Kala chana–soya masala with rice and curd',
      [
        { food: 'kalaChana', g: 45, note: 'soaked overnight' },
        { food: 'soyaChunks', g: 30 },
        { food: 'rice', g: 80 },
        { food: 'mixedVeg', g: 80, note: 'onion–tomato masala' },
        { food: 'oil', g: 7 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Soak the kala chana overnight, discard the water, and pressure-cook it for 5–6 whistles until soft. Add soaked soya chunks to the onion–tomato masala along with the chana and simmer for 10 minutes.',
      { tutorials: ['kalaChana', 'soyaChunks'], packable: true },
    ),
    Thursday: m(
      'p1-d-thu',
      'Paneer–sweet potato tikka, moong dal and roti',
      [
        { food: 'paneer', g: 30 },
        { food: 'sweetPotato', g: 120 },
        { food: 'oil', g: 7 },
        { food: 'moongDal', g: 40 },
        { food: 'atta', g: 70, note: '2 rotis' },
        { food: 'curd', g: 100, note: 'for the marinade and a small side' },
        { food: 'salad', g: 80 },
        { food: 'soyaChunks', g: 30, note: 'soaked, squeezed, added to the tikka marinade' },
      ],
      'Marinate paneer, soaked soya chunks and par-boiled sweet potato cubes in curd and tikka spices. Pan-roast or air-fry them for 10–12 minutes. Serve with thin moong dal and rotis.',
      { tutorials: ['paneerTikka', 'dal'], packable: true },
    ),
    Friday: m(
      'p1-d-fri',
      'Sattu paratha with curd and sabzi',
      [
        { food: 'atta', g: 85 },
        { food: 'sattu', g: 55, note: 'filling' },
        { food: 'ghee', g: 8 },
        { food: 'curd', g: 200 },
        { food: 'mixedVeg', g: 150, note: 'dry sabzi' },
      ],
      'Mix sattu with chopped onion, green chilli, ajwain, lemon and salt to make the filling. Stuff it into atta dough and cook 2 parathas with a little ghee. Serve with curd and a dry sabzi.',
      { tutorials: ['sattuParatha'] },
    ),
  },
  saturday: {
    meal2: m(
      'p1-sat-2',
      'Kala chana pulao with raita and salad',
      [
        { food: 'kalaChana', g: 55 },
        { food: 'soyaChunks', g: 20 },
        { food: 'rice', g: 90 },
        { food: 'oil', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 100 },
      ],
      'Use chana boiled earlier in the week. Sauté whole spices, onion and the soaked soya chunks, then add rice, chana and water and pressure-cook for 2 whistles.',
      { tutorials: ['kalaChana'] },
    ),
    meal3: m(
      'p1-sat-3',
      'Sweet potato chaat, roasted chana and chaas',
      [
        { food: 'sweetPotato', g: 170 },
        { food: 'roastedChana', g: 30 },
        { food: 'curd', g: 200, note: 'as chaas' },
        { food: 'papaya', g: 150 },
        { food: 'lemon', g: 5 },
      ],
      'Boil or roast the sweet potato, cube it, and toss it with lemon, chaat masala and roasted chana. Have it with a glass of chaas and the papaya.',
      { tutorials: ['sweetPotato', 'chaas'] },
    ),
    meal4: m(
      'p1-sat-4',
      'Paneer tikka with whole moong dal and roti',
      [
        { food: 'paneer', g: 60 },
        { food: 'curd', g: 60, note: 'marinade' },
        { food: 'oil', g: 7 },
        { food: 'moongWhole', g: 50 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'salad', g: 100 },
        { food: 'soyaChunks', g: 20, note: 'in the dal' },
      ],
      'Marinate the paneer in curd, ginger–garlic and tikka spices for 20 minutes, then grill or pan-roast it. Pressure-cook the whole moong and soaked soya chunks with tomato, ginger and jeera.',
      { tutorials: ['paneerTikka', 'dal', 'roti'] },
    ),
  },
  sunday: {
    meal2: m(
      'p1-sun-2',
      'Moong cheela with beetroot raita and papaya',
      [
        { food: 'moongWhole', g: 85, note: 'soaked, ground to batter' },
        { food: 'oil', g: 10 },
        { food: 'curd', g: 200, note: 'as raita' },
        { food: 'beetroot', g: 80, note: 'grated into the raita' },
        { food: 'papaya', g: 150 },
      ],
      'Soak the whole moong overnight, then grind it with ginger and green chilli (the tutorial uses split moong; whole green moong works the same way with a slightly coarser batter). Cook thin cheelas on a hot tawa. Mix the curd with grated beetroot, roasted jeera and salt for the raita.',
      { tutorials: ['moongCheela'] },
    ),
    meal3: m(
      'p1-sun-3',
      'Curd bowl with banana, dates, nuts and milk',
      [
        { food: 'curd', g: 250 },
        { food: 'dates', g: 20, note: '2 dates' },
        { food: 'walnuts', g: 10 },
        { food: 'almonds', g: 5 },
        { food: 'peanuts', g: 5 },
        { food: 'banana', g: 110 },
        { food: 'milk', g: 200, note: 'or more curd' },
      ],
      'Slice the banana into the curd, chop the dates, and top with the nuts; drink the milk alongside or pour it over. This is the weekend home for the nuts you enjoy — kept to small amounts because nuts are the costliest food per gram of protein in this plan.',
    ),
    meal4: m(
      'p1-sun-4',
      'Soya–vegetable pulao, moong dal and raita',
      [
        { food: 'rice', g: 90 },
        { food: 'soyaChunks', g: 30 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'moongDal', g: 40 },
        { food: 'curd', g: 120 },
      ],
      'Cook a double batch: the second portion is Monday’s lunch. Refrigerate it within 2 hours of cooking. Also boil this week’s kala chana and store it in portions.',
      { tutorials: ['soyaChunks', 'dal'], packable: true },
    ),
  },
  substitutions: [
    { swap: 'Paneer (70–100 g)', with: 'Soya chunks (25–36 g dry) + 5 g ghee', note: 'Less than half the cost for the same protein.' },
    { swap: 'Pumpkin seeds', with: 'Watermelon seeds or peanuts (same weight)' },
    { swap: 'Almonds', with: 'Cashews (same weight)', note: 'Similar cost; slightly less fibre and calcium.' },
    { swap: 'Walnuts / almonds', with: 'Peanuts (same weight)', note: 'Much cheaper. Walnuts are the only one with meaningful omega-3 (ALA); flaxseed is the budget substitute for that.' },
    { swap: 'Sweet potato', with: 'Potato or extra rice (same carbs)' },
    { swap: 'Seasonal fruit', with: 'Banana, guava, orange, papaya — whichever is cheapest that week' },
    { swap: 'Kala chana', with: 'Kabuli chana or rajma (same dry weight)' },
  ],
  prepStrategy: [
    'Sunday (about 60 minutes): boil the week’s kala chana and freeze it in portions; soak whole moong for Tuesday; cook the Sunday dinner double for Monday’s lunch.',
    'Every evening: cook dinner as a double batch. Pack the second portion into a lunch box and refrigerate it immediately.',
    'Every night (5 minutes): set curd from 500 ml milk; pack the next day’s Meal 3 (chana, fruit, sattu in a small jar); soak oats in milk if you prefer them overnight.',
    'Morning: carry the lunch box and the chaas bottle. Put both in the office fridge when you arrive.',
  ],
  notes: [
    'Setting curd at home costs about the same as milk, and roughly 30–40% less than buying packaged dahi.',
    'Fibre is built up gradually: if your gut feels unsettled, start with the khichdi and dal days and add the chana days over 2–3 weeks.',
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// PLAN 2 — RESEARCH-BASED VEGETARIAN
// Designed from the evidence, without reference to the preferred-foods list:
//  • Protein about 1.8–2.0 g/kg spread over 4 meals (~25–40 g each), mostly from
//    dairy + soya + pulses + cereals so the amino acids complement each other.
//  • Low cost per gram of protein: soya chunks, milk, curd, peanuts, pulses.
//  • Whole grains and pulses for fibre (target ~35 g), added gradually.
//  • Flaxseed and walnuts for plant omega-3 (ALA); iodised salt for iodine.
// ═════════════════════════════════════════════════════════════════════════════

const p2: MealPlanDefinition = {
  id: 'vegetarian',
  name: 'Plan 2 — Research-based vegetarian',
  shortName: 'Vegetarian',
  diet: 'Vegetarian',
  summary:
    'Designed from the evidence rather than from your preferences. It relies on dairy, soya, pulses and whole grains for protein that is complete, cheap and digestible, with flaxseed for omega-3.',
  meal1: m(
    'p2-m1',
    'Overnight oats with milk, curd, peanuts, flax and fruit',
    [
      { food: 'oats', g: 60 },
      { food: 'milk', g: 250 },
      { food: 'curd', g: 100 },
      { food: 'peanuts', g: 15, note: 'roasted, crushed' },
      { food: 'flax', g: 8, note: 'ground' },
      { food: 'seasonalFruit', g: 150 },
    ],
    'At night, mix the oats, milk, curd and ground flax in a jar and refrigerate. In the morning, top with crushed roasted peanuts and chopped fruit. No cooking.',
    {
      why: 'No cooking needed and quick to eat, which suits late nights. Ground flax gives the plan’s main omega-3 (ALA) dose. Whole flax seeds pass through undigested.',
      tutorials: ['overnightOats'],
    },
  ),
  weekdayMeal3: m(
    'p2-m3',
    'Milk, roasted chana–peanut mix and banana',
    [
      { food: 'milk', g: 250, note: 'carried in a bottle, office fridge' },
      { food: 'roastedChana', g: 35 },
      { food: 'peanuts', g: 15, note: 'roasted' },
      { food: 'banana', g: 110 },
    ],
    'Pack the roasted chana and peanuts in a small box. Carry the milk in a sealed bottle and refrigerate it at the office. Nothing to prepare.',
    {
      why: 'The cheapest balanced pre-workout meal in any plan: about 20 g of protein and easy carbs, and nothing to cook.',
      packable: true,
    },
  ),
  dinners: {
    Monday: m(
      'p2-d-mon',
      'Rajma–soya masala with rice and curd',
      [
        { food: 'rajma', g: 55, note: 'soaked 8–10 h' },
        { food: 'soyaChunks', g: 25 },
        { food: 'rice', g: 85 },
        { food: 'oil', g: 7 },
        { food: 'mixedVeg', g: 80 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Soak the rajma overnight, discard the water, and pressure-cook it until fully soft (6–8 whistles). Undercooked kidney beans are unsafe and hard on digestion. Add soaked soya chunks to the masala.',
      { tutorials: ['rajma', 'soyaChunks'], packable: true },
    ),
    Tuesday: m(
      'p2-d-tue',
      'Soya chunk curry with roti and curd',
      [
        { food: 'soyaChunks', g: 40 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 150 },
        { food: 'rice', g: 40, note: 'or a 4th roti' },
      ],
      'Boil the soya chunks for 5 minutes, then squeeze out the water. Simmer them in an onion–tomato–curd gravy for 10 minutes.',
      { tutorials: ['soyaChunks', 'roti'], packable: true },
    ),
    Wednesday: m(
      'p2-d-wed',
      'Toor dal, rice, palak sabzi and curd',
      [
        { food: 'toorDal', g: 60 },
        { food: 'rice', g: 85 },
        { food: 'spinach', g: 150 },
        { food: 'oil', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'peanuts', g: 15, note: 'in the sabzi' },
      ],
      'Pressure-cook the dal with turmeric (3 whistles) and finish with a jeera–garlic tadka. Sauté the spinach with garlic and crushed peanuts.',
      { tutorials: ['dal'], packable: true },
    ),
    Thursday: m(
      'p2-d-thu',
      'Chole with roti and raita',
      [
        { food: 'kabuliChana', g: 50, note: 'soaked overnight' },
        { food: 'soyaChunks', g: 15 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 60 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Soak the chickpeas overnight, then pressure-cook them until very soft (5–6 whistles). Mash a few to thicken the gravy.',
      { tutorials: ['chole', 'roti'], packable: true },
    ),
    Friday: m(
      'p2-d-fri',
      'Paneer–vegetable stir-fry with roti and dal',
      [
        { food: 'paneer', g: 70 },
        { food: 'mixedVeg', g: 150 },
        { food: 'oil', g: 6 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'moongDal', g: 35 },
      ],
      'Stir-fry the capsicum, onion and beans on high heat. Add the paneer cubes and spices for the last 3 minutes.',
      { tutorials: ['paneerBhurji', 'dal'] },
    ),
  },
  saturday: {
    meal2: m(
      'p2-sat-2',
      'Soya keema with roti and salad',
      [
        { food: 'soyaChunks', g: 45, note: 'soaked, minced' },
        { food: 'mixedVeg', g: 100, note: 'onion, tomato, peas' },
        { food: 'oil', g: 8 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'salad', g: 100 },
        { food: 'curd', g: 150 },
      ],
      'Soak and squeeze the soya chunks, pulse them in a mixer, then cook like keema with onion, tomato, peas and garam masala.',
      { tutorials: ['soyaKeema'] },
    ),
    meal3: m(
      'p2-sat-3',
      'Vegetable poha with peanuts and chaas',
      [
        { food: 'poha', g: 80 },
        { food: 'peanuts', g: 20 },
        { food: 'oil', g: 5 },
        { food: 'mixedVeg', g: 80 },
        { food: 'curd', g: 200, note: 'as chaas' },
        { food: 'lemon', g: 5 },
      ],
      'Rinse the poha, then temper mustard seeds, curry leaves and peanuts. Add onion and vegetables, then the poha and turmeric. Finish with lemon.',
      { tutorials: ['poha', 'chaas'] },
    ),
    meal4: m(
      'p2-sat-4',
      'Dal makhani-style rajma–urad with rice and salad',
      [
        { food: 'rajma', g: 50 },
        { food: 'rice', g: 80 },
        { food: 'ghee', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 100 },
        { food: 'paneer', g: 50, note: 'cubed into the dal' },
      ],
      'A weekend dal: slow-simmered rajma (or rajma + whole urad) finished with ghee, tomato and kasuri methi. Pressure-cook until creamy.',
      { tutorials: ['rajma'] },
    ),
  },
  sunday: {
    meal2: m(
      'p2-sun-2',
      'Besan chilla with paneer, curd and fruit',
      [
        { food: 'besan', g: 70 },
        { food: 'paneer', g: 50 },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 60 },
        { food: 'curd', g: 150 },
        { food: 'guava', g: 120 },
      ],
      'Make a thin batter of besan, water, onion, tomato, ajwain and salt. Cook 3 chillas and fill them with crumbled paneer.',
      { tutorials: ['cheela'] },
    ),
    meal3: m(
      'p2-sun-3',
      'Milk, roasted chana, peanuts and fruit',
      [
        { food: 'milk', g: 250 },
        { food: 'roastedChana', g: 40 },
        { food: 'peanuts', g: 15 },
        { food: 'seasonalFruit', g: 150 },
      ],
      'Same as the weekday afternoon meal, with a different fruit.',
    ),
    meal4: m(
      'p2-sun-4',
      'Moong dal khichdi with soya, curd and salad',
      [
        { food: 'rice', g: 80 },
        { food: 'moongDal', g: 55 },
        { food: 'soyaChunks', g: 25 },
        { food: 'mixedVeg', g: 120 },
        { food: 'ghee', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Cook double: the second portion is Monday’s lunch. Also soak Monday’s rajma tonight.',
      { tutorials: ['khichdi'], packable: true },
    ),
  },
  substitutions: [
    { swap: 'Soya chunks', with: 'Paneer (about twice the weight) or extra dal + curd', note: 'Soya is fine to eat daily at these amounts. Swap it if you simply prefer variety.' },
    { swap: 'Rajma / chole', with: 'Kala chana, lobia or whole masoor (same dry weight)' },
    { swap: 'Flaxseed', with: 'Walnuts (15 g)', note: 'Keeps the omega-3 (ALA) intake.' },
    { swap: 'Rice', with: 'Roti, millet (jowar/bajra) or dalia (same dry weight)' },
    { swap: 'Peanuts', with: 'Any nut or seed (same weight)' },
  ],
  prepStrategy: [
    'Sunday: soak the rajma/chole for Mon and Thu (freeze cooked portions); cook the Sunday khichdi double for Monday.',
    'Evenings: cook dinner double. The extra portion is tomorrow’s lunch.',
    'Nightly: make the overnight oats jar (2 minutes) and set curd.',
    'Keep a jar of roasted chana–peanut mix at the office desk (it keeps for weeks), so Meal 3 only needs milk.',
  ],
  notes: [
    'Cheapest of the four plans per gram of protein.',
    'Soya at these amounts (15–45 g dry a day) is well within intakes studied in humans, and there is no good evidence that it harms testosterone in men.',
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// PLAN 3 — RESEARCH-BASED VEGETARIAN + EGGS
// Eggs where they genuinely help: the two fixed meals, because boiled eggs are
// cheap, portable, need no office cooking and add vitamin B12, choline and
// high-quality protein. 21 eggs a week (3/day) — eggs are not used in every meal.
// ═════════════════════════════════════════════════════════════════════════════

const p3: MealPlanDefinition = {
  id: 'egg',
  name: 'Plan 3 — Vegetarian + eggs',
  shortName: 'Veg + eggs',
  diet: 'Vegetarian + eggs',
  summary:
    'The research-based vegetarian approach, with boiled eggs in the two fixed meals where they add the most: portable protein, vitamin B12 and choline, with nothing to cook at the office.',
  meal1: m(
    'p3-m1',
    'Two boiled eggs, oats–milk porridge and banana',
    [
      { food: 'egg', g: 100, note: '2 eggs, boiled' },
      { food: 'oats', g: 60 },
      { food: 'milk', g: 250 },
      { food: 'banana', g: 110 },
      { food: 'flax', g: 7, note: '1 tbsp ground' },
    ],
    'Boil the week’s eggs in two batches (10–11 minutes, then cold water). Unpeeled, they keep for up to a week in the fridge. Cook the oats in milk and add banana and flax.',
    {
      why: 'Eggs plus dairy give about 30 g of high-quality protein and some vitamin B12, which matters given your low-normal B12.',
      tutorials: ['boiledEggs', 'overnightOats'],
    },
  ),
  weekdayMeal3: m(
    'p3-m3',
    'Boiled egg, roasted chana, papaya and chaas',
    [
      { food: 'egg', g: 50, note: '1 egg' },
      { food: 'roastedChana', g: 40 },
      { food: 'papaya', g: 150, note: 'or another seasonal fruit' },
      { food: 'curd', g: 150, note: 'as chaas' },
      { food: 'peanuts', g: 15 },
    ],
    'Carry one peeled boiled egg in a small box, plus the chana–peanut mix and cubed papaya. Bring the chaas in a bottle and keep everything in the office fridge.',
    { tutorials: ['boiledEggs', 'chaas'], packable: true },
  ),
  dinners: {
    Monday: m(
      'p3-d-mon',
      'Kala chana–soya masala with rice and raita',
      [
        { food: 'kalaChana', g: 50, note: 'soaked overnight' },
        { food: 'soyaChunks', g: 20 },
        { food: 'rice', g: 95 },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 80, note: 'onion–tomato masala' },
        { food: 'salad', g: 80 },
        { food: 'curd', g: 150 },
      ],
      'Soak the kala chana overnight, discard the water, and pressure-cook it for 5–6 whistles until soft. Simmer it with soaked soya chunks in an onion–tomato masala for 10 minutes. Cook double: half is tomorrow’s lunch.',
      { tutorials: ['kalaChana', 'soyaChunks'], packable: true },
    ),
    Tuesday: m(
      'p3-d-tue',
      'Soya chunk curry with roti and curd',
      [
        { food: 'soyaChunks', g: 35 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 150 },
        { food: 'rice', g: 45, note: 'or a 4th roti' },
      ],
      'Boil the soya chunks for 5 minutes, then squeeze out the water. Simmer them in an onion–tomato–curd gravy.',
      { tutorials: ['soyaChunks', 'roti'], packable: true },
    ),
    Wednesday: m(
      'p3-d-wed',
      'Rajma with rice and raita',
      [
        { food: 'rajma', g: 50 },
        { food: 'soyaChunks', g: 15 },
        { food: 'rice', g: 95 },
        { food: 'oil', g: 7 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Soak the rajma overnight, then pressure-cook it until fully soft before making the masala.',
      { tutorials: ['rajma'], packable: true },
    ),
    Thursday: m(
      'p3-d-thu',
      'Paneer–peas sabzi with roti and dal',
      [
        { food: 'paneer', g: 70 },
        { food: 'mixedVeg', g: 150 },
        { food: 'oil', g: 6 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'moongDal', g: 35 },
      ],
      'A quick sabzi: onion, tomato and peas with paneer cubes, about 15 minutes. Cook double for Friday’s lunch.',
      { tutorials: ['paneerBhurji', 'roti'], packable: true },
    ),
    Friday: m(
      'p3-d-fri',
      'Egg bhurji with moong dal and roti',
      [
        { food: 'egg', g: 100, note: '2 eggs' },
        { food: 'oil', g: 6 },
        { food: 'mixedVeg', g: 100 },
        { food: 'moongDal', g: 40 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 100 },
      ],
      'Scramble the eggs with onion, tomato, green chilli and turmeric on medium heat. Make it fresh — bhurji doesn’t keep well, which is why it sits on Friday, when no lunch box is needed.',
      { tutorials: ['eggBhurji', 'dal'] },
    ),
  },
  saturday: {
    meal2: m(
      'p3-sat-2',
      'Chole with roti, raita and salad',
      [
        { food: 'kabuliChana', g: 55, note: 'soaked overnight' },
        { food: 'soyaChunks', g: 15 },
        { food: 'oil', g: 7 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 150, note: 'as raita' },
        { food: 'salad', g: 100 },
      ],
      'Pressure-cook the soaked chickpeas until very soft (5–6 whistles) and simmer them with soaked soya chunks in an onion–tomato gravy. Serve with rotis, raita and salad.',
      { tutorials: ['chole', 'roti'] },
    ),
    meal3: m(
      'p3-sat-3',
      'Vegetable poha with peanuts and milk',
      [
        { food: 'poha', g: 80 },
        { food: 'peanuts', g: 20 },
        { food: 'oil', g: 5 },
        { food: 'mixedVeg', g: 80 },
        { food: 'milk', g: 250 },
      ],
      'Classic poha with peanuts, vegetables and lemon, with a glass of milk.',
      { tutorials: ['poha'] },
    ),
    meal4: m(
      'p3-sat-4',
      'Paneer tikka with whole moong dal and rice',
      [
        { food: 'paneer', g: 60 },
        { food: 'curd', g: 50, note: 'marinade' },
        { food: 'oil', g: 7 },
        { food: 'moongWhole', g: 50 },
        { food: 'rice', g: 80 },
        { food: 'salad', g: 100 },
        { food: 'soyaChunks', g: 15, note: 'in the dal' },
      ],
      'Marinate the paneer in curd and tikka spices for 20 minutes, then grill or pan-roast it. Pressure-cook the moong dal with tomato and jeera.',
      { tutorials: ['paneerTikka', 'dal'] },
    ),
  },
  sunday: {
    meal2: m(
      'p3-sun-2',
      'Moong cheela with paneer, curd and papaya',
      [
        { food: 'moongWhole', g: 70, note: 'soaked, ground to batter' },
        { food: 'oil', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'papaya', g: 200 },
        { food: 'paneer', g: 50, note: 'as filling' },
      ],
      'Grind soaked whole moong with ginger and chilli (the tutorial uses split moong; whole moong works the same way with a coarser batter). Cook thin cheelas and fill them with crumbled paneer.',
      { tutorials: ['moongCheela'] },
    ),
    meal3: m(
      'p3-sun-3',
      'Curd, roasted chana, walnuts and fruit',
      [
        { food: 'curd', g: 200 },
        { food: 'roastedChana', g: 30 },
        { food: 'walnuts', g: 10 },
        { food: 'seasonalFruit', g: 150 },
        { food: 'banana', g: 110 },
      ],
      'Slice the banana and fruit into a bowl of curd and top with roasted chana and broken walnuts. No cooking — about 3 minutes.',
    ),
    meal4: m(
      'p3-sun-4',
      'Soya pulao with dal and raita',
      [
        { food: 'rice', g: 85 },
        { food: 'soyaChunks', g: 30 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'moongDal', g: 40 },
        { food: 'curd', g: 120 },
        { food: 'ghee', g: 5 },
      ],
      'Cook double: the second portion is Monday’s lunch. Boil 10 eggs tonight for Monday–Wednesday, and soak the kala chana for Monday.',
      { tutorials: ['soyaChunks', 'boiledEggs'], packable: true },
    ),
  },
  substitutions: [
    { swap: '1 egg', with: '25 g paneer, or 10 g soya chunks plus 100 ml milk', note: 'About the same protein (≈6 g).' },
    { swap: 'Friday egg bhurji', with: 'Paneer bhurji (70 g paneer)' },
    { swap: 'Rajma / chole', with: 'Kala chana or lobia' },
    { swap: 'Flaxseed', with: 'Walnuts (10–15 g)' },
  ],
  prepStrategy: [
    'Eggs: 21 a week — 2 at Meal 1 every day, 1 at Meal 3 on weekdays, 2 in Friday’s bhurji. Boil 10 on Sunday night (Mon–Wed) and 9 on Wednesday night (Thu–Sun). Keep them unpeeled in the fridge and use within 7 days.',
    'Sunday: soak the kala chana for Monday and the rajma for Wednesday; cook the Sunday pulao double.',
    'Evenings: cook dinner double for tomorrow’s lunch.',
    'Nightly: pack Meal 3 (1 peeled egg in a box, chana–peanut mix, fruit) and set curd.',
  ],
  notes: [
    'Exactly 3 eggs a day on average (21 a week). For healthy people with normal lipids (yours are within range), current evidence does not show harm at roughly 1–3 eggs a day as part of a balanced diet. The evidence at higher intakes is less certain, so the plan stays at 3.',
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// PLAN 4 — RESEARCH-BASED NON-VEGETARIAN
// Chicken and fish where they help: lean, complete protein that reduces the
// volume of food needed. Fish once or twice a week for long-chain omega-3.
// Pulses and dairy remain because they add fibre, calcium and keep cost down.
// Not automatically healthier than Plans 2–3 — just a different route.
// ═════════════════════════════════════════════════════════════════════════════

const p4: MealPlanDefinition = {
  id: 'nonveg',
  name: 'Plan 4 — Research-based non-vegetarian',
  shortName: 'Non-veg',
  diet: 'Non-vegetarian',
  summary:
    'Adds chicken and fish where they genuinely help: lean, complete protein in less food, plus fish once or twice a week for omega-3. Pulses and dairy stay for fibre, calcium and cost. It isn’t automatically healthier than the vegetarian plans.',
  meal1: m(
    'p4-m1',
    'Vegetable poha with two boiled eggs and milk',
    [
      { food: 'poha', g: 70 },
      { food: 'peanuts', g: 15 },
      { food: 'oil', g: 5 },
      { food: 'mixedVeg', g: 60, note: 'onion, peas, carrot' },
      { food: 'egg', g: 100, note: '2 eggs, boiled' },
      { food: 'milk', g: 250 },
    ],
    'Poha takes about 10 minutes. Boil the eggs in two batches a week (Sunday and Wednesday). Drink the milk alongside, or make it chai-latte style with less sugar.',
    { tutorials: ['poha', 'boiledEggs'] },
  ),
  weekdayMeal3: m(
    'p4-m3',
    'Curd, roasted chana–peanut mix, banana and fruit',
    [
      { food: 'curd', g: 200 },
      { food: 'roastedChana', g: 40 },
      { food: 'peanuts', g: 15, note: 'roasted' },
      { food: 'seasonalFruit', g: 150 },
      { food: 'banana', g: 110 },
    ],
    'Curd in a sealed box, plus the chana–peanut mix and the fruit, all kept in the office fridge. Nothing to cook.',
    {
      why: 'Eggs already appear at breakfast and in two dinners, and chicken or fish on four days, so this meal uses cheaper dairy and pulses. That keeps eggs at about 3 a day.',
      tutorials: ['curd'],
      packable: true,
    },
  ),
  dinners: {
    Monday: m(
      'p4-d-mon',
      'Home-style chicken curry with rice and salad',
      [
        { food: 'chicken', g: 100 },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 80, note: 'onion–tomato base' },
        { food: 'rice', g: 100 },
        { food: 'curd', g: 100 },
        { food: 'salad', g: 100 },
      ],
      'Cook boneless chicken in an onion–tomato–ginger–garlic masala for about 20 minutes, until no pink remains (75 °C inside). Cook double and refrigerate the second portion within 2 hours for tomorrow’s lunch.',
      { tutorials: ['chickenCurry'], packable: true },
    ),
    Tuesday: m(
      'p4-d-tue',
      'Toor dal, palak sabzi, roti and curd',
      [
        { food: 'toorDal', g: 55 },
        { food: 'spinach', g: 150 },
        { food: 'oil', g: 8 },
        { food: 'atta', g: 140, note: '4 rotis' },
        { food: 'curd', g: 150 },
        { food: 'peanuts', g: 10 },
      ],
      'A vegetarian night that keeps fibre up and costs down. Pressure-cook the dal; sauté the spinach with garlic.',
      { tutorials: ['dal', 'roti'], packable: true },
    ),
    Wednesday: m(
      'p4-d-wed',
      'Fish curry with rice and salad',
      [
        { food: 'fish', g: 110 },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 60 },
        { food: 'rice', g: 100 },
        { food: 'moongDal', g: 30 },
        { food: 'salad', g: 100 },
      ],
      'Rub rohu or katla pieces with turmeric and salt and lightly pan-fry them. Simmer in a light mustard or tomato gravy for 8–10 minutes. Fish keeps for 1 day in the fridge, so eat tomorrow’s portion at lunch.',
      { tutorials: ['fishCurry', 'dal'], packable: true },
    ),
    Thursday: m(
      'p4-d-thu',
      'Egg curry with chole and roti',
      [
        { food: 'egg', g: 100, note: '2 eggs' },
        { food: 'kabuliChana', g: 40, note: 'soaked overnight' },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 80 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 120 },
      ],
      'Simmer halved boiled eggs and pressure-cooked chickpeas in one onion–tomato gravy. Cook double for Friday’s lunch.',
      { tutorials: ['chole', 'boiledEggs', 'roti'], packable: true },
    ),
    Friday: m(
      'p4-d-fri',
      'Rajma with rice and an egg',
      [
        { food: 'rajma', g: 55 },
        { food: 'rice', g: 100 },
        { food: 'oil', g: 7 },
        { food: 'egg', g: 50, note: '1 egg' },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Pressure-cook soaked rajma until fully soft. A Friday comfort dinner.',
      { tutorials: ['rajma'] },
    ),
  },
  saturday: {
    meal2: m(
      'p4-sat-2',
      'Grilled fish with rice, dal and salad',
      [
        { food: 'fish', g: 110 },
        { food: 'oil', g: 7 },
        { food: 'rice', g: 95 },
        { food: 'moongDal', g: 35 },
        { food: 'curd', g: 100 },
        { food: 'salad', g: 100 },
      ],
      'Marinate the fish in lemon, turmeric, chilli and garlic, then pan-grill it for 3–4 minutes a side. Choose oily fish such as sardine or mackerel (bangda) when available: they are cheaper and richer in omega-3.',
      { tutorials: ['fishCurry', 'dal'] },
    ),
    meal3: m(
      'p4-sat-3',
      'Sweet potato chaat with chana and chaas',
      [
        { food: 'sweetPotato', g: 170 },
        { food: 'roastedChana', g: 35 },
        { food: 'curd', g: 200, note: 'as chaas' },
        { food: 'seasonalFruit', g: 120 },
      ],
      'Toss boiled sweet potato with lemon, chaat masala and roasted chana.',
      { tutorials: ['sweetPotato', 'chaas'] },
    ),
    meal4: m(
      'p4-sat-4',
      'Chicken tikka with whole moong dal and roti',
      [
        { food: 'chicken', g: 100 },
        { food: 'curd', g: 60, note: 'marinade' },
        { food: 'oil', g: 7 },
        { food: 'moongWhole', g: 45 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'salad', g: 100 },
      ],
      'Marinate chicken pieces in curd, lemon, ginger–garlic and tikka spices (30 minutes or overnight). Grill, air-fry or pan-roast until cooked through (75 °C inside).',
      { tutorials: ['grilledChicken', 'dal'] },
    ),
  },
  sunday: {
    meal2: m(
      'p4-sun-2',
      'Egg bhurji with paratha and curd',
      [
        { food: 'egg', g: 100, note: '2 eggs' },
        { food: 'oil', g: 6 },
        { food: 'mixedVeg', g: 80 },
        { food: 'atta', g: 85, note: '2 parathas' },
        { food: 'ghee', g: 5 },
        { food: 'curd', g: 200 },
        { food: 'peanuts', g: 15, note: 'roasted, in the bhurji or on the side' },
      ],
      'A weekend brunch. Scramble the eggs with onion, tomato and spices.',
      { tutorials: ['eggBhurji'] },
    ),
    meal3: m(
      'p4-sun-3',
      'Milk, roasted chana, peanuts and fruit',
      [
        { food: 'milk', g: 250 },
        { food: 'roastedChana', g: 35 },
        { food: 'peanuts', g: 15 },
        { food: 'seasonalFruit', g: 150 },
      ],
      'A glass of milk (warm or cold) with a handful of roasted chana and peanuts and a piece of seasonal fruit. No cooking.',
    ),
    meal4: m(
      'p4-sun-4',
      'Chicken curry with roti and dal',
      [
        { food: 'chicken', g: 90 },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 80 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'moongDal', g: 30 },
        { food: 'salad', g: 80 },
        { food: 'curd', g: 120 },
      ],
      'Cook double: the second portion is Monday’s lunch. Boil the week’s eggs tonight.',
      { tutorials: ['chickenCurry', 'boiledEggs'], packable: true },
    ),
  },
  substitutions: [
    { swap: 'Chicken (100 g raw)', with: '45 g dry soya chunks, or 3 eggs (then skip that day’s other eggs)', note: 'Similar protein, lower cost.' },
    { swap: 'Rohu / katla', with: 'Any local fish, or canned tuna/sardines', note: 'Oily fish (sardine/mackerel/bangda) gives more omega-3.' },
    { swap: 'Rajma', with: 'Chole or kala chana' },
  ],
  prepStrategy: [
    'Buy chicken twice a week (or freeze it in 110 g portions). Thaw it in the fridge overnight, not on the counter.',
    'Sunday: boil the eggs, soak the rajma for Friday, and cook the Sunday chicken curry double for Monday’s lunch.',
    'Cooked chicken and fish: refrigerate within 2 hours and eat within 1–2 days.',
  ],
  notes: [
    'Fish once or twice a week provides long-chain omega-3 (EPA/DHA), which the vegetarian plans can only get as ALA.',
    'The most expensive plan. See the budget section for trade-offs.',
  ],
};

export const MEAL_PLAN_DEFINITIONS: MealPlanDefinition[] = [p1, p2, p3, p4];

// ─── Week builder ─────────────────────────────────────────────────────────────

export interface PlannedMeal {
  slot: MealSlot;
  meal: Meal;
  time: string;
  /** e.g. "Same every day" / "Same Mon–Fri" / "Yesterday's dinner, packed". */
  tag?: 'fixed-daily' | 'fixed-weekday' | 'leftover' | 'cook-double';
}

export interface PlannedDay {
  day: DayName;
  isWeekend: boolean;
  meals: [PlannedMeal, PlannedMeal, PlannedMeal, PlannedMeal];
}

const previousDinner = (plan: MealPlanDefinition, day: DayName): Meal => {
  switch (day) {
    case 'Monday':
      return plan.sunday.meal4;
    case 'Tuesday':
      return plan.dinners.Monday;
    case 'Wednesday':
      return plan.dinners.Tuesday;
    case 'Thursday':
      return plan.dinners.Wednesday;
    case 'Friday':
      return plan.dinners.Thursday;
    default:
      throw new Error('No packed lunch on weekends');
  }
};

export function buildWeek(plan: MealPlanDefinition): PlannedDay[] {
  return DAYS.map((day) => {
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const t = (slot: MealSlot) => (isWeekend ? MEAL_SLOTS[slot].weekend : MEAL_SLOTS[slot].weekday);
    const meal1: PlannedMeal = { slot: 1, meal: plan.meal1, time: t(1), tag: 'fixed-daily' };
    if (isWeekend) {
      const w = day === 'Saturday' ? plan.saturday : plan.sunday;
      return {
        day,
        isWeekend,
        meals: [
          meal1,
          { slot: 2, meal: w.meal2, time: t(2) },
          { slot: 3, meal: w.meal3, time: t(3) },
          { slot: 4, meal: w.meal4, time: t(4), tag: day === 'Sunday' ? 'cook-double' : undefined },
        ],
      };
    }
    const dinner = plan.dinners[day as keyof MealPlanDefinition['dinners']];
    return {
      day,
      isWeekend,
      meals: [
        meal1,
        { slot: 2, meal: previousDinner(plan, day), time: t(2), tag: 'leftover' },
        { slot: 3, meal: plan.weekdayMeal3, time: t(3), tag: 'fixed-weekday' },
        { slot: 4, meal: dinner, time: t(4), tag: day === 'Friday' ? undefined : 'cook-double' },
      ],
    };
  });
}
