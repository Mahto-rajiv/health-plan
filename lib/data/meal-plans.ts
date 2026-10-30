import type { MealItem } from '../nutrition';
import type { TutorialId } from './tutorials';

// ─── Four-meal structure (applies to every plan) ─────────────────────────────
// • Exactly 4 meals a day. No snacks.
// • Meal 1 is the same every day, Monday–Sunday.
// • Meal 3 is the same Monday–Friday (it is eaten at the office).
// • Saturday and Sunday each have their own Meal 3, which may differ from the
//   weekday one and from each other.
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
  /** Hands-on minutes on the day it is cooked (soaking and pressure-cooker waiting excluded). */
  minutes: number;
  /** A low-cost way to make it taste better without changing foods or amounts. */
  flavour?: string;
  /** Storage advice specific to this meal. Cooked-double meals also get the general leftovers rule. */
  keeps?: string;
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
  /** Why the plan costs what it does, shown when it is above the budget. */
  costNote: string;
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
    role: 'Same Mon–Fri. No cooking needed. Doubles as your pre-workout meal for evening training. Saturday and Sunday each have their own.',
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
  extra: Pick<Meal, 'minutes'> & Partial<Pick<Meal, 'why' | 'tutorials' | 'packable' | 'flavour' | 'keeps'>>,
): Meal => ({ id, title, items, prep, ...extra });

// ═════════════════════════════════════════════════════════════════════════════
// PLAN 1 — PREFERRED FOODS (vegetarian)
// Built around foods you already like. Corrections made after review:
//  • Protein was too low in the original plan, so soya chunks are added in small
//    amounts. They are the cheapest protein per gram in India.
//  • Nuts and seeds are peanuts and ground flax. Almonds, walnuts and pumpkin
//    seeds cost 5–8 times as much per gram and are listed as substitutions.
//  • Paneer is about 100 g a week (Monday and Saturday); Thursday's tikka uses
//    soya instead, to bring the cost toward the ₹3,000–4,000 budget.
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
    'Sattu–oats porridge with banana, peanuts and flax',
    [
      { food: 'oats', g: 60 },
      { food: 'milk', g: 250 },
      { food: 'sattu', g: 25, note: 'stirred in after cooking' },
      { food: 'banana', g: 110, note: '1 medium' },
      { food: 'peanuts', g: 10, note: 'roasted, crushed' },
      { food: 'flax', g: 7, note: 'ground — for omega-3 (ALA)' },
    ],
    'Simmer the oats in milk for 3–4 minutes (or soak them in the milk overnight in the fridge). Take it off the heat, stir in the sattu so it doesn’t clump, and top with sliced banana and crushed peanuts. Takes about 7 minutes.',
    {
      why: 'Gives about 25 g of protein to start the day. Oats provide beta-glucan fibre, and sattu adds plant protein and iron. Making it the same every day means no decisions in the morning.',
      tutorials: ['overnightOats'],
      minutes: 7,
      flavour: 'Simmer the oats with a pinch of cinnamon or 2 crushed elaichi pods, and dry-roast a week’s peanuts in one go so they stay crunchy. A spice changes the taste without changing the meal.',
      keeps: 'Overnight version: keeps up to 2 days in the fridge. Stir in the sattu and banana just before eating.',
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
      minutes: 5,
      flavour: 'Season the chaas with roasted jeera powder, kala namak, a little grated ginger and chopped mint or coriander. Toss the chana with chaat masala and lemon.',
      keeps: 'Make the chaas and cut the papaya the night before. Keep both in the fridge, carry them cold, and put them in the office fridge on arrival. Eat cut papaya within a day.',
    },
  ),
  dinners: {
    Monday: m(
      'p1-d-mon',
      'Palak paneer, moong dal and roti',
      [
        { food: 'spinach', g: 150 },
        { food: 'paneer', g: 30 },
        { food: 'oil', g: 10, note: 'including the dal tadka' },
        { food: 'moongDal', g: 35, note: 'thin dal' },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 100 },
        { food: 'soyaChunks', g: 20, note: 'soaked, cooked in the dal' },
      ],
      'Blanch the spinach for 2 minutes, then blend it. Cook it with onion, garlic and spices, and add paneer cubes for the last 3 minutes. Pressure-cook the moong dal with the soaked soya chunks (about 15 minutes). Cook double: tomorrow’s lunch is the second portion.',
      {
        tutorials: ['palakPaneer', 'dal', 'roti'],
        packable: true,
        minutes: 35,
        flavour: 'Blanch the palak for 2 minutes, then plunge it into cold water so it stays green. Finish with kasuri methi, a pinch of garam masala and a squeeze of lemon. The lemon also helps you absorb the iron.',
      },
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
        { food: 'curd', g: 150 },
        { food: 'beetroot', g: 80, note: 'grated into the raita' },
      ],
      'Pressure-cook the rice, soaked whole moong, soya chunks and vegetables with turmeric and salt (3–4 whistles). Finish with a ghee–jeera tadka. For the raita, mix curd with grated raw or boiled beetroot.',
      {
        why: 'Soaked moong in a soft khichdi is one of the easiest legume meals to digest. It suits a gut that is adjusting to more fibre.',
        tutorials: ['khichdi', 'soyaChunks'],
        packable: true,
        minutes: 20,
        flavour: 'Make the tadka with jeera, a pinch of hing, garlic and black pepper in the ghee. Add roasted jeera and a pinch of salt to the raita.',
      },
    ),
    Wednesday: m(
      'p1-d-wed',
      'Kala chana–soya masala with rice and curd',
      [
        { food: 'kalaChana', g: 45, note: 'soaked overnight' },
        { food: 'soyaChunks', g: 30 },
        { food: 'rice', g: 90 },
        { food: 'mixedVeg', g: 80, note: 'onion–tomato masala' },
        { food: 'oil', g: 10 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 80 },
      ],
      'Soak the kala chana overnight, discard the water, and pressure-cook it for 5–6 whistles until soft. Add soaked soya chunks to the onion–tomato masala along with the chana and simmer for 10 minutes.',
      {
        tutorials: ['kalaChana', 'soyaChunks'],
        packable: true,
        minutes: 25,
        flavour: 'Squeeze the soaked soya hard, then brown it in the masala for 3–4 minutes before adding water. It takes up the spices instead of tasting spongy. Finish with amchur or lemon and fresh coriander.',
      },
    ),
    Thursday: m(
      'p1-d-thu',
      'Soya–sweet potato tikka, moong dal and roti',
      [
        { food: 'sweetPotato', g: 120 },
        { food: 'oil', g: 7 },
        { food: 'moongDal', g: 40 },
        { food: 'atta', g: 70, note: '2 rotis' },
        { food: 'rice', g: 35, note: 'or a 3rd roti' },
        { food: 'curd', g: 100, note: 'for the marinade and a small side' },
        { food: 'salad', g: 80 },
        { food: 'soyaChunks', g: 40, note: 'soaked, squeezed, in the tikka marinade' },
      ],
      'Marinate soaked, well-squeezed soya chunks and par-boiled sweet potato cubes in curd and tikka spices. Pan-roast or air-fry them for 10–12 minutes. Serve with thin moong dal and rotis.',
      {
        tutorials: ['paneerTikka', 'dal'],
        packable: true,
        minutes: 35,
        flavour: 'Marinate for at least 20 minutes in curd, Kashmiri chilli, ginger–garlic, kasuri methi and a little oil. Then cook on high heat until the edges get brown spots (not black).',
      },
    ),
    Friday: m(
      'p1-d-fri',
      'Sattu paratha with curd and sabzi',
      [
        { food: 'atta', g: 85 },
        { food: 'sattu', g: 40, note: 'filling' },
        { food: 'ghee', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'mixedVeg', g: 150, note: 'dry sabzi' },
      ],
      'Mix sattu with chopped onion, green chilli, ajwain, lemon and salt to make the filling. Stuff it into atta dough and cook 2 parathas with a little ghee. Serve with curd and a dry sabzi.',
      {
        tutorials: ['sattuParatha'],
        minutes: 30,
        flavour: 'Add chopped onion, coriander, ajwain, kalonji and green chilli to the sattu filling, with lemon to bind it. Serve with curd mixed with roasted jeera.',
      },
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
      {
        tutorials: ['kalaChana'],
        minutes: 25,
        flavour: 'Fry the whole spices (bay leaf, clove, cinnamon, jeera) until fragrant before adding the rice. Top with fried onion and coriander.',
      },
    ),
    meal3: m(
      'p1-sat-3',
      'Sweet potato chaat, roasted chana and chaas',
      [
        { food: 'sweetPotato', g: 170 },
        { food: 'roastedChana', g: 30 },
        { food: 'curd', g: 150, note: 'as chaas' },
        { food: 'banana', g: 110 },
        { food: 'lemon', g: 5 },
      ],
      'Boil or roast the sweet potato, cube it, and toss it with lemon, chaat masala and roasted chana. Have it with a glass of chaas and a banana.',
      {
        tutorials: ['sweetPotato', 'chaas'],
        minutes: 15,
        flavour: 'Use chaat masala, roasted jeera, lemon and chopped onion and coriander. Roasting the sweet potato instead of boiling it makes it sweeter.',
      },
    ),
    meal4: m(
      'p1-sat-4',
      'Paneer tikka with whole moong dal and roti',
      [
        { food: 'paneer', g: 40 },
        { food: 'curd', g: 60, note: 'marinade' },
        { food: 'oil', g: 7 },
        { food: 'moongWhole', g: 50 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'salad', g: 100 },
        { food: 'soyaChunks', g: 27, note: 'in the dal' },
      ],
      'Marinate the paneer in curd, ginger–garlic and tikka spices for 20 minutes, then grill or pan-roast it. Pressure-cook the whole moong and soaked soya chunks with tomato, ginger and jeera.',
      {
        tutorials: ['paneerTikka', 'dal', 'roti'],
        minutes: 40,
        flavour: 'Sear the paneer on high heat until it has brown spots (not black). Finish the dal with a ghee–jeera–garlic tadka.',
      },
    ),
  },
  sunday: {
    meal2: m(
      'p1-sun-2',
      'Moong cheela with beetroot raita and papaya',
      [
        { food: 'moongWhole', g: 95, note: 'soaked, ground to batter' },
        { food: 'oil', g: 10 },
        { food: 'curd', g: 150, note: 'as raita' },
        { food: 'beetroot', g: 80, note: 'grated into the raita' },
        { food: 'papaya', g: 150 },
      ],
      'Soak the whole moong overnight, then grind it with ginger and green chilli (the tutorial uses split moong; whole green moong works the same way with a slightly coarser batter). Cook thin cheelas on a hot tawa. Mix the curd with grated beetroot, roasted jeera and salt for the raita.',
      {
        tutorials: ['moongCheela'],
        minutes: 25,
        flavour: 'Add grated ginger, green chilli, jeera and chopped coriander to the batter. Cook the cheelas thin and crisp on a hot tawa.',
      },
    ),
    meal3: m(
      'p1-sun-3',
      'Curd bowl with banana, dates, peanuts and milk',
      [
        { food: 'curd', g: 200 },
        { food: 'dates', g: 20, note: '2 dates' },
        { food: 'peanuts', g: 20, note: 'roasted' },
        { food: 'banana', g: 110 },
        { food: 'milk', g: 200, note: 'or more curd' },
      ],
      'Slice the banana into the curd, chop the dates, and top with the peanuts; drink the milk alongside or pour it over. If you want almonds or walnuts, this is the place for a small handful — see the substitutions for the cost.',
      {
        minutes: 3,
        flavour: 'Chop the dates so their sweetness spreads through the bowl. A pinch of cinnamon or elaichi on the curd works well.',
      },
    ),
    meal4: m(
      'p1-sun-4',
      'Soya–vegetable pulao, moong dal and raita',
      [
        { food: 'rice', g: 105 },
        { food: 'soyaChunks', g: 30 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'moongDal', g: 40 },
        { food: 'curd', g: 120 },
      ],
      'Cook a double batch: the second portion is Monday’s lunch. Refrigerate it within 2 hours of cooking. Also boil this week’s kala chana and store it in portions.',
      {
        tutorials: ['soyaChunks', 'dal'],
        packable: true,
        minutes: 30,
        flavour: 'Bloom whole garam masala in the oil, brown the soya well, and finish with lemon and coriander.',
      },
    ),
  },
  substitutions: [
    { swap: 'Paneer (70–100 g)', with: 'Soya chunks (25–36 g dry) + 5 g ghee', note: 'Less than half the cost for the same protein.' },
    { swap: 'Peanuts (Meal 1, Sunday)', with: 'Pumpkin seeds, almonds or walnuts (same weight)', note: 'About 5–8 times the price per gram (≈ +₹100–150/month). Nutritionally similar at these amounts; the daily flaxseed already covers omega-3 (ALA).' },
    { swap: 'Papaya', with: 'Guava when in season (mainly winter) or banana', note: 'Guava has even more vitamin C; banana is cheapest but has little.' },
    { swap: 'Sweet potato', with: 'Potato or extra rice (same carbs)' },
    { swap: 'Kala chana', with: 'Kabuli chana or rajma (same dry weight)' },
  ],
  costNote:
    'Your preferred foods (oats, sattu, papaya, paneer and sweet potato) cost more per meal than daliya, soya, banana and dal. Paneer is already down to about 100 g a week and the nuts and seeds are peanuts.',
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
//  • Flaxseed for plant omega-3 (ALA); iodised salt for iodine.
//  • The lowest-cost plan: daliya instead of oats, dairy ~500 g a day (ICMR
//    suggests ~300 g per 2,000 kcal), paneer only twice a week.
// ═════════════════════════════════════════════════════════════════════════════

const p2: MealPlanDefinition = {
  id: 'vegetarian',
  name: 'Plan 2 — Research-based vegetarian',
  shortName: 'Vegetarian',
  diet: 'Vegetarian',
  summary:
    'Designed from the evidence rather than from your preferences, and the cheapest of the four. It relies on dairy, soya, pulses and whole grains (including daliya) for protein that is complete, cheap and digestible, with flaxseed for omega-3.',
  meal1: m(
    'p2-m1',
    'Milk daliya with peanuts, flax and fruit',
    [
      { food: 'daliya', g: 70, note: 'dry weight' },
      { food: 'milk', g: 250 },
      { food: 'peanuts', g: 20, note: 'roasted, crushed' },
      { food: 'flax', g: 8, note: 'ground' },
      { food: 'papaya', g: 120, note: 'or banana / guava — whichever is cheapest that week' },
    ],
    'Every second night, dry-roast 140 g daliya in a teaspoon of ghee from the pantry for 2 minutes, then pressure-cook it with 2½ cups of water (2 whistles). Keep half in the fridge. Each morning, warm one portion with the milk for 3 minutes and stir in the ground flax; top with crushed peanuts and cubed fruit.',
    {
      why: 'Daliya is whole wheat at about 40% of the price of oats, with similar protein and fibre. Cooking two days at once keeps mornings to a few minutes. Ground flax gives the plan’s main omega-3 (ALA) dose. Whole flax seeds pass through undigested.',
      minutes: 6,
      flavour: 'Roasting the daliya first gives it a nutty taste. Add elaichi or cinnamon with the milk, or make it savoury once in a while with jeera, vegetables and salt.',
      keeps: 'Cooked daliya keeps 2 days in the fridge in a closed box. Add the peanuts and fruit just before eating.',
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
      minutes: 2,
      flavour: 'Toss the chana–peanut mix with chaat masala or kala namak. Elaichi or a pinch of haldi and black pepper in the milk adds variety.',
      keeps: 'Roasted chana–peanut mix: airtight jar at the desk, for up to a few weeks. Milk: a sealed bottle, kept in the office fridge, drunk the same day.',
    },
  ),
  dinners: {
    Monday: m(
      'p2-d-mon',
      'Rajma–soya masala with rice and curd',
      [
        { food: 'rajma', g: 55, note: 'soaked 8–10 h' },
        { food: 'soyaChunks', g: 25 },
        { food: 'rice', g: 95 },
        { food: 'oil', g: 7 },
        { food: 'mixedVeg', g: 80 },
        { food: 'curd', g: 100 },
        { food: 'salad', g: 80 },
      ],
      'Soak the rajma overnight, discard the water, and pressure-cook it until fully soft (6–8 whistles). Undercooked kidney beans are unsafe and hard on digestion. Add soaked soya chunks to the masala.',
      {
        tutorials: ['rajma', 'soyaChunks'],
        packable: true,
        minutes: 30,
        flavour: 'Finish with kasuri methi and a pinch of garam masala, and mash a spoonful of rajma into the gravy to thicken it.',
      },
    ),
    Tuesday: m(
      'p2-d-tue',
      'Soya chunk curry with roti and curd',
      [
        { food: 'soyaChunks', g: 40 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 100 },
        { food: 'rice', g: 40, note: 'or a 4th roti' },
      ],
      'Boil the soya chunks for 5 minutes, then squeeze out the water. Simmer them in an onion–tomato–curd gravy for 10 minutes.',
      {
        tutorials: ['soyaChunks', 'roti'],
        packable: true,
        minutes: 25,
        flavour: 'Squeeze the soya well and brown it in the masala before adding the curd. Stir the curd in off the heat so it doesn’t split. Finish with kasuri methi.',
      },
    ),
    Wednesday: m(
      'p2-d-wed',
      'Toor dal, rice, palak sabzi and curd',
      [
        { food: 'toorDal', g: 70 },
        { food: 'rice', g: 85 },
        { food: 'spinach', g: 150 },
        { food: 'oil', g: 8 },
        { food: 'curd', g: 100 },
        { food: 'peanuts', g: 15, note: 'in the sabzi' },
      ],
      'Pressure-cook the dal with turmeric (3 whistles) and finish with a jeera–garlic tadka. Sauté the spinach with garlic and crushed peanuts.',
      {
        tutorials: ['dal'],
        packable: true,
        minutes: 30,
        flavour: 'Make a garlic–jeera–red chilli tadka for the dal, with a pinch of hing. Lemon on the dal at the table.',
      },
    ),
    Thursday: m(
      'p2-d-thu',
      'Chole with roti and raita',
      [
        { food: 'kabuliChana', g: 50, note: 'soaked overnight' },
        { food: 'soyaChunks', g: 25 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 60 },
        { food: 'curd', g: 100 },
        { food: 'salad', g: 80 },
      ],
      'Soak the chickpeas overnight, then pressure-cook them until very soft (5–6 whistles). Mash a few to thicken the gravy.',
      {
        tutorials: ['chole', 'roti'],
        packable: true,
        minutes: 30,
        flavour: 'Add chole masala or amchur and a tea bag while pressure-cooking, for a dark, tangy chole. Top with raw onion and lemon.',
      },
    ),
    Friday: m(
      'p2-d-fri',
      'Paneer–soya vegetable stir-fry with roti and dal',
      [
        { food: 'paneer', g: 40 },
        { food: 'soyaChunks', g: 15, note: 'soaked, squeezed, stir-fried with the paneer' },
        { food: 'mixedVeg', g: 150 },
        { food: 'oil', g: 7 },
        { food: 'atta', g: 70, note: '2 rotis' },
        { food: 'rice', g: 40, note: 'or a 3rd roti' },
        { food: 'moongDal', g: 35 },
      ],
      'Stir-fry the capsicum, onion and beans on high heat. Add the soaked, squeezed soya chunks with the vegetables, and the paneer cubes and spices for the last 3 minutes.',
      {
        tutorials: ['paneerBhurji', 'dal'],
        minutes: 20,
        flavour: 'Cook on high heat so the vegetables stay crisp, then finish with black pepper and kasuri methi.',
      },
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
      {
        tutorials: ['soyaKeema'],
        minutes: 30,
        flavour: 'Brown the minced soya well and finish with garam masala, lemon and coriander.',
      },
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
      {
        tutorials: ['poha', 'chaas'],
        minutes: 15,
        flavour: 'Use mustard seeds, curry leaves, green chilli and lemon, and finish with coriander.',
      },
    ),
    meal4: m(
      'p2-sat-4',
      'Dal makhani-style rajma–urad with rice and salad',
      [
        { food: 'rajma', g: 70 },
        { food: 'rice', g: 90 },
        { food: 'ghee', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'salad', g: 100 },
        { food: 'soyaChunks', g: 15, note: 'granules, simmered in the dal' },
      ],
      'A weekend dal: slow-simmered rajma (or rajma + whole urad) finished with ghee, tomato and kasuri methi. Pressure-cook until creamy.',
      {
        tutorials: ['rajma'],
        minutes: 30,
        flavour: 'Simmer for longer for a creamy dal. Finish with ghee, kasuri methi and a pinch of garam masala.',
      },
    ),
  },
  sunday: {
    meal2: m(
      'p2-sun-2',
      'Besan chilla with paneer, curd and fruit',
      [
        { food: 'besan', g: 75 },
        { food: 'paneer', g: 40 },
        { food: 'oil', g: 10 },
        { food: 'mixedVeg', g: 60 },
        { food: 'curd', g: 150 },
        { food: 'guava', g: 120 },
      ],
      'Make a thin batter of besan, water, onion, tomato, ajwain and salt. Cook 3 chillas and fill them with crumbled paneer.',
      {
        tutorials: ['cheela'],
        minutes: 20,
        flavour: 'Add ajwain, chopped onion, green chilli and coriander to the batter. Season the paneer filling with chaat masala.',
      },
    ),
    meal3: m(
      'p2-sun-3',
      'Banana–peanut milkshake with masala roasted chana',
      [
        { food: 'milk', g: 250, note: 'chilled' },
        { food: 'banana', g: 110 },
        { food: 'peanuts', g: 20, note: 'roasted, blended in' },
        { food: 'roastedChana', g: 35 },
      ],
      'Blend the cold milk, banana and roasted peanuts for 30 seconds. Toss the roasted chana with chaat masala, lemon and chopped onion on the side.',
      {
        minutes: 5,
        flavour: 'A pinch of elaichi or cinnamon in the shake; a ripe, spotty banana makes it sweet enough without sugar.',
      },
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
      {
        tutorials: ['khichdi'],
        packable: true,
        minutes: 20,
        flavour: 'Make the tadka with ghee, jeera, hing and garlic. Serve with lemon.',
      },
    ),
  },
  substitutions: [
    { swap: 'Soya chunks', with: 'Paneer (about twice the weight) or extra dal + curd', note: 'Soya is fine to eat daily at these amounts. Swap it if you simply prefer variety.' },
    { swap: 'Rajma / chole', with: 'Kala chana, lobia or whole masoor (same dry weight)' },
    { swap: 'Flaxseed', with: 'Walnuts (15 g)', note: 'Keeps the omega-3 (ALA) intake.' },
    { swap: 'Daliya (Meal 1)', with: 'Rolled oats (same weight), soaked overnight in the milk', note: 'No cooking, but ≈ ₹170/month more.' },
    { swap: 'Rice', with: 'Roti, millet (jowar/bajra) or daliya (same dry weight)' },
    { swap: 'Peanuts', with: 'Any nut or seed (same weight)' },
  ],
  costNote:
    'This is the cheapest plan that still meets every target with some variety: daliya instead of oats, dairy at about 500 g a day, paneer twice a week. Going lower means cutting fruit or dairy below what the plan needs for vitamin C and calcium.',
  prepStrategy: [
    'Sunday: soak the rajma/chole for Mon and Thu (freeze cooked portions); cook the Sunday khichdi double for Monday.',
    'Evenings: cook dinner double. The extra portion is tomorrow’s lunch.',
    'Every second night: cook 2 days of daliya (about 12 minutes, mostly waiting). Nightly: set curd.',
    'Keep a jar of roasted chana–peanut mix at the office desk (it keeps for weeks), so Meal 3 only needs milk.',
  ],
  notes: [
    'Cheapest of the four plans per gram of protein.',
    'Soya at these amounts (15–45 g dry a day) is within the range eaten traditionally in East Asia, and a 2021 meta-analysis of 41 clinical studies found no effect on testosterone or oestrogen in men.',
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
      minutes: 8,
      flavour: 'Sprinkle black pepper and chaat masala on the eggs, and add a pinch of cinnamon or elaichi to the porridge.',
      keeps: 'Boiled eggs: unpeeled, in the fridge, for up to 7 days.',
    },
  ),
  weekdayMeal3: m(
    'p3-m3',
    'Boiled egg, roasted chana, papaya and chaas',
    [
      { food: 'egg', g: 50, note: '1 egg' },
      { food: 'roastedChana', g: 40 },
      { food: 'papaya', g: 120, note: 'or another seasonal fruit' },
      { food: 'curd', g: 150, note: 'as chaas' },
      { food: 'peanuts', g: 15 },
    ],
    'Carry one peeled boiled egg in a small box, plus the chana–peanut mix and cubed papaya. Bring the chaas in a bottle and keep everything in the office fridge.',
    {
      tutorials: ['boiledEggs', 'chaas'],
      packable: true,
      minutes: 5,
      flavour: 'Sprinkle kala namak and pepper on the egg. Season the chaas with roasted jeera and mint, and the chana–peanut mix with chaat masala.',
      keeps: 'Peel the egg the night before, keep it covered in the fridge, and eat it the next day. Make the chaas and cut the papaya the night before as well. Keep everything in the office fridge.',
    },
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
        { food: 'curd', g: 100 },
      ],
      'Soak the kala chana overnight, discard the water, and pressure-cook it for 5–6 whistles until soft. Simmer it with soaked soya chunks in an onion–tomato masala for 10 minutes. Cook double: half is tomorrow’s lunch.',
      {
        tutorials: ['kalaChana', 'soyaChunks'],
        packable: true,
        minutes: 25,
        flavour: 'Squeeze the soya hard and brown it in the masala before adding water. Finish with amchur or lemon and coriander.',
      },
    ),
    Tuesday: m(
      'p3-d-tue',
      'Soya chunk curry with roti and curd',
      [
        { food: 'soyaChunks', g: 35 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'curd', g: 100 },
        { food: 'rice', g: 50, note: 'or a 4th roti' },
      ],
      'Boil the soya chunks for 5 minutes, then squeeze out the water. Simmer them in an onion–tomato–curd gravy.',
      {
        tutorials: ['soyaChunks', 'roti'],
        packable: true,
        minutes: 25,
        flavour: 'Brown the squeezed soya in the masala, then stir in the curd off the heat. Finish with kasuri methi.',
      },
    ),
    Wednesday: m(
      'p3-d-wed',
      'Rajma with rice and raita',
      [
        { food: 'rajma', g: 50 },
        { food: 'soyaChunks', g: 15 },
        { food: 'rice', g: 100 },
        { food: 'oil', g: 7 },
        { food: 'curd', g: 100 },
        { food: 'salad', g: 80 },
      ],
      'Soak the rajma overnight, then pressure-cook it until fully soft before making the masala.',
      {
        tutorials: ['rajma'],
        packable: true,
        minutes: 30,
        flavour: 'Finish with kasuri methi and garam masala, and mash some rajma into the gravy to thicken it.',
      },
    ),
    Thursday: m(
      'p3-d-thu',
      'Paneer–peas sabzi with roti and dal',
      [
        { food: 'paneer', g: 30 },
        { food: 'soyaChunks', g: 15, note: 'granules, soaked — they blend into the gravy' },
        { food: 'mixedVeg', g: 150 },
        { food: 'oil', g: 6 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'moongDal', g: 45 },
      ],
      'A quick sabzi: onion, tomato and peas with paneer cubes, about 15 minutes. Cook double for Friday’s lunch.',
      {
        tutorials: ['paneerBhurji', 'roti'],
        packable: true,
        minutes: 20,
        flavour: 'Add a pinch of kasuri methi and garam masala at the end. Add the paneer last so it stays soft.',
      },
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
      {
        tutorials: ['eggBhurji', 'dal'],
        minutes: 15,
        flavour: 'Cook the onion until soft and golden before adding the eggs. Take them off the heat while still slightly soft, and finish with coriander.',
      },
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
      {
        tutorials: ['chole', 'roti'],
        minutes: 30,
        flavour: 'Add chole masala or amchur. Top with raw onion, green chilli and lemon.',
      },
    ),
    meal3: m(
      'p3-sat-3',
      'Vegetable poha with peanuts and milk',
      [
        { food: 'poha', g: 80 },
        { food: 'peanuts', g: 20 },
        { food: 'oil', g: 5 },
        { food: 'mixedVeg', g: 100, note: 'onion, peas, carrot' },
        { food: 'milk', g: 250 },
      ],
      'Classic poha with peanuts, vegetables and lemon, with a glass of milk.',
      {
        tutorials: ['poha'],
        minutes: 15,
        flavour: 'Use mustard seeds, curry leaves, green chilli and lemon, with coriander on top.',
      },
    ),
    meal4: m(
      'p3-sat-4',
      'Paneer tikka with whole moong dal and rice',
      [
        { food: 'paneer', g: 40 },
        { food: 'curd', g: 50, note: 'marinade' },
        { food: 'oil', g: 7 },
        { food: 'moongWhole', g: 50 },
        { food: 'rice', g: 80 },
        { food: 'salad', g: 100 },
        { food: 'soyaChunks', g: 22, note: 'in the dal' },
      ],
      'Marinate the paneer in curd and tikka spices for 20 minutes, then grill or pan-roast it. Pressure-cook the moong dal with tomato and jeera.',
      {
        tutorials: ['paneerTikka', 'dal'],
        minutes: 40,
        flavour: 'Sear the paneer on high heat until it has brown spots (not black). Finish the dal with a ghee–jeera–garlic tadka.',
      },
    ),
  },
  sunday: {
    meal2: m(
      'p3-sun-2',
      'Moong cheela with paneer, curd and papaya',
      [
        { food: 'moongWhole', g: 80, note: 'soaked, ground to batter' },
        { food: 'oil', g: 8 },
        { food: 'curd', g: 150 },
        { food: 'papaya', g: 200 },
        { food: 'paneer', g: 30, note: 'as filling' },
      ],
      'Grind soaked whole moong with ginger and chilli (the tutorial uses split moong; whole moong works the same way with a coarser batter). Cook thin cheelas and fill them with crumbled paneer.',
      {
        tutorials: ['moongCheela'],
        minutes: 25,
        flavour: 'Add ginger, green chilli and jeera to the batter, and season the paneer filling with chaat masala.',
      },
    ),
    meal3: m(
      'p3-sun-3',
      'Curd, roasted chana, peanuts and guava',
      [
        { food: 'curd', g: 200 },
        { food: 'roastedChana', g: 30 },
        { food: 'peanuts', g: 10, note: 'roasted' },
        { food: 'guava', g: 150, note: 'or another seasonal fruit' },
        { food: 'banana', g: 110 },
      ],
      'Slice the banana and guava into a bowl of curd and top with roasted chana and crushed peanuts. No cooking — about 3 minutes.',
      {
        minutes: 3,
        flavour: 'Sprinkle a pinch of chaat masala or roasted jeera on the guava. It also works on fruit with curd.',
      },
    ),
    meal4: m(
      'p3-sun-4',
      'Soya pulao with dal and raita',
      [
        { food: 'rice', g: 100 },
        { food: 'soyaChunks', g: 30 },
        { food: 'mixedVeg', g: 120 },
        { food: 'oil', g: 8 },
        { food: 'moongDal', g: 40 },
        { food: 'curd', g: 120 },
        { food: 'ghee', g: 5 },
      ],
      'Cook double: the second portion is Monday’s lunch. Boil 10 eggs tonight for Monday–Wednesday, and soak the kala chana for Monday.',
      {
        tutorials: ['soyaChunks', 'boiledEggs'],
        packable: true,
        minutes: 30,
        flavour: 'Bloom whole garam masala in the oil, brown the soya, and finish with lemon and coriander.',
      },
    ),
  },
  substitutions: [
    { swap: '1 egg', with: '25 g paneer, or 10 g soya chunks plus 100 ml milk', note: 'About the same protein (≈6 g).' },
    { swap: 'Friday egg bhurji', with: 'Paneer bhurji (70 g paneer)' },
    { swap: 'Rajma / chole', with: 'Kala chana or lobia' },
    { swap: 'Flaxseed', with: 'Walnuts (10–15 g)' },
  ],
  costNote:
    'Eggs are good value for B12 and protein, but 21 a week cost about ₹630 a month, more than the soya and dal they replace. The plan also keeps oats, papaya and some paneer for taste.',
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
    {
      tutorials: ['poha', 'boiledEggs'],
      minutes: 12,
      flavour: 'Use mustard seeds, curry leaves, green chilli and lemon in the poha, with coriander on top. Sprinkle pepper and chaat masala on the eggs.',
      keeps: 'Boiled eggs: unpeeled, in the fridge, for up to 7 days.',
    },
  ),
  weekdayMeal3: m(
    'p4-m3',
    'Curd, roasted chana–peanut mix, banana and papaya',
    [
      { food: 'curd', g: 150 },
      { food: 'roastedChana', g: 40 },
      { food: 'peanuts', g: 15, note: 'roasted' },
      { food: 'papaya', g: 100, note: 'cubed; or guava when in season' },
      { food: 'banana', g: 110 },
    ],
    'Curd in a sealed box, plus the chana–peanut mix and the fruit, all kept in the office fridge. Nothing to cook.',
    {
      why: 'Eggs already appear at breakfast and in two dinners, and chicken or fish on four days, so this meal uses cheaper dairy and pulses. That keeps eggs at about 3 a day.',
      tutorials: ['curd'],
      packable: true,
      minutes: 3,
      flavour: 'Season the curd with roasted jeera and a pinch of salt, or eat it with the fruit and a pinch of cinnamon. Sprinkle the chana–peanut mix with chaat masala.',
      keeps: 'Carry the curd in a sealed box and put it in the office fridge. Cut the papaya the night before and eat it within a day.',
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
      {
        tutorials: ['chickenCurry'],
        packable: true,
        minutes: 35,
        flavour: 'Brown the onions well and bloom the ground spices in oil for a minute. Finish with garam masala and coriander.',
      },
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
      {
        tutorials: ['dal', 'roti'],
        packable: true,
        minutes: 30,
        flavour: 'Make a garlic–jeera–red chilli tadka with a pinch of hing, and sauté the palak with garlic and the crushed peanuts.',
      },
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
      {
        tutorials: ['fishCurry', 'dal'],
        packable: true,
        minutes: 30,
        flavour: 'Rub the fish with turmeric, salt and a little oil 15 minutes before frying. For a Bengali-style gravy, use ground mustard seed paste rather than mustard oil. Finish with green chilli.',
      },
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
      {
        tutorials: ['chole', 'boiledEggs', 'roti'],
        packable: true,
        minutes: 30,
        flavour: 'Pan-fry the halved eggs in a little oil with turmeric and chilli before adding them to the gravy.',
      },
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
      'Pressure-cook soaked rajma until fully soft, and serve with one of the week’s boiled eggs, halved. A Friday comfort dinner.',
      {
        tutorials: ['rajma'],
        minutes: 25,
        flavour: 'Finish the rajma with kasuri methi and garam masala. Sprinkle pepper and salt on the egg.',
      },
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
      {
        tutorials: ['fishCurry', 'dal'],
        minutes: 25,
        flavour: 'Marinate the fish for 15–30 minutes and don’t move it in the pan until it releases. Squeeze lemon on it at the table.',
      },
    ),
    meal3: m(
      'p4-sat-3',
      'Sweet potato chaat with chana, chaas and papaya',
      [
        { food: 'sweetPotato', g: 170 },
        { food: 'roastedChana', g: 35 },
        { food: 'curd', g: 200, note: 'as chaas' },
        { food: 'papaya', g: 150 },
      ],
      'Toss boiled sweet potato with lemon, chaat masala and roasted chana.',
      {
        tutorials: ['sweetPotato', 'chaas'],
        minutes: 15,
        flavour: 'Use chaat masala, roasted jeera, lemon, onion and coriander. Roasting the sweet potato makes it sweeter.',
      },
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
      {
        tutorials: ['grilledChicken', 'dal'],
        minutes: 30,
        flavour: 'Marinate overnight if you can (marinating also reduces the harmful compounds that form on grilled meat). Cook on medium-high heat, turning often, until browned and cooked through; cut off any blackened bits. Serve with lemon and onion.',
      },
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
      ],
      'A weekend brunch. Scramble the eggs with onion, tomato and spices.',
      {
        tutorials: ['eggBhurji'],
        minutes: 25,
        flavour: 'Cook the onion until golden before adding the eggs, and finish with coriander and black pepper.',
      },
    ),
    meal3: m(
      'p4-sun-3',
      'Milk, roasted chana, peanuts and fruit',
      [
        { food: 'milk', g: 250 },
        { food: 'roastedChana', g: 35 },
        { food: 'peanuts', g: 15 },
        { food: 'guava', g: 150, note: 'or the cheapest seasonal fruit' },
      ],
      'A glass of milk (warm or cold) with a handful of roasted chana and peanuts and a guava or other seasonal fruit. No cooking.',
      {
        minutes: 2,
        flavour: 'Sprinkle the chana–peanut mix with chaat masala and lemon.',
      },
    ),
    meal4: m(
      'p4-sun-4',
      'Chicken–chana curry with roti and dal',
      [
        { food: 'chicken', g: 60 },
        { food: 'kabuliChana', g: 30, note: 'soaked, pressure-cooked' },
        { food: 'oil', g: 8 },
        { food: 'mixedVeg', g: 80 },
        { food: 'atta', g: 105, note: '3 rotis' },
        { food: 'moongDal', g: 30 },
        { food: 'salad', g: 80 },
        { food: 'curd', g: 120 },
      ],
      'Simmer the chicken and pressure-cooked chickpeas together in one masala; the chana stretches the chicken and soaks up the gravy. Cook double: the second portion is Monday’s lunch. Boil the week’s eggs tonight.',
      {
        tutorials: ['chickenCurry', 'boiledEggs'],
        packable: true,
        minutes: 35,
        flavour: 'Brown the onions well and finish with garam masala, kasuri methi and coriander.',
      },
    ),
  },
  substitutions: [
    { swap: 'Chicken (100 g raw)', with: '45 g dry soya chunks, or 3 eggs (then skip that day’s other eggs)', note: 'Similar protein, lower cost.' },
    { swap: 'Rohu / katla', with: 'Any local fish, or canned tuna/sardines', note: 'Oily fish (sardine/mackerel/bangda) gives more omega-3.' },
    { swap: 'Rajma', with: 'Chole or kala chana' },
  ],
  costNote:
    'Chicken and fish cost more per gram of protein than soya, pulses, eggs and dairy, so this plan cannot meet the same targets inside the budget without changing its character. Using Plan 3 on most days and this plan on some is another way to cut cost.',
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
