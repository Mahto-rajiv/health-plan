import { ATWATER } from '../config';
import { FOODS, type FoodId } from './foods';
import { NUTRIENTS } from './nutrients';
import type { NutrientKey } from './nutrient-keys';

// ─── Fruit and vegetables: one menu all year, with a swap for each ────────────
// Owner (Nov 2026): no seasons. The meals use fruit and vegetables that Ahmedabad
// markets sell most of the year. Each one has a single named alternative, with
// its own amount, for days the market doesn't have it:
//   • fruit: the alternative amount gives the same calories (rounded to 10 g);
//   • vegetables and greens: the same weight.
// Onion and tomato are sold all year and have no alternative.
// Nutrients and costs are worked out for the main food, not the alternative.
// Round 4: the same-calorie rule alone lost most of the vitamin C and folate
// (papaya 150 g → apple 60 g: vitamin C 65 → 2 mg) and added fibre on days at
// the Phase 0 cap (banana → apple +2.6 g). So:
//   • the swaps are chosen to keep what the main food is there for: orange for
//     papaya (keeps ~70% of the vitamin C), dates for banana (the fruit with the
//     least fibre per calorie after banana; a dry staple kept at home);
//   • each swap shows what it still loses (`swapNote`), e.g. "less folate".
//     A swap is for a few days; nothing needs replacing for that.
//
// Each meal has *slots* (the fruit in Meal 1, the fruit in Meal 3, the cooked
// vegetables, the salad, the greens). A slot is always the same foods, so Meal 1
// is identical every day and Meal 3 identical Mon–Fri.
// Round 7: the Meal 1 seed jar is a slot too (equal weights of three seeds, mixed
// on Sunday). It is not produce, so it has no market swap.

export type SlotId = 'fruit1' | 'fruit3' | 'sabzi' | 'salad' | 'greens' | 'seeds';

/** One food in a slot: its share of the slot's grams, and the swap if it isn't in the market. */
export interface SlotFood {
  food: FoodId;
  share: number;
  alt?: FoodId;
  /** The nutrient this food is on the menu for: the swap note always says if the swap loses it. */
  for?: NutrientKey;
}

export interface SlotFill {
  /** Short name used inside titles and steps, e.g. "papaya". */
  name: string;
  /** Shares sum to 1. */
  foods: SlotFood[];
}

export const SLOTS: Record<SlotId, SlotFill> = {
  fruit1: { name: 'papaya', foods: [{ food: 'papaya', share: 1, alt: 'orange' }] },
  fruit3: { name: 'banana', foods: [{ food: 'banana', share: 1, alt: 'dates' }] },
  sabzi: {
    name: 'bhindi, lauki and kaddu',
    foods: [
      { food: 'onion', share: 0.25 },
      { food: 'tomato', share: 0.25 },
      { food: 'okra', share: 0.2, alt: 'cauliflower' },
      { food: 'bottleGourd', share: 0.15, alt: 'brinjal' },
      { food: 'pumpkin', share: 0.15, alt: 'carrot' },
    ],
  },
  // Round 4: carrot is in the salad every day (vitamin A was below the RDA in every plan).
  salad: {
    name: 'cucumber, carrot, onion and tomato',
    foods: [
      { food: 'cucumber', share: 0.3, alt: 'radish' },
      { food: 'carrot', share: 0.2, alt: 'beetroot', for: 'vitA' },
      { food: 'onion', share: 0.25 },
      { food: 'tomato', share: 0.25 },
    ],
  },
  greens: { name: 'palak (spinach)', foods: [{ food: 'spinach', share: 1, alt: 'amaranth' }] },
  seeds: {
    name: 'seed jar',
    foods: [
      { food: 'sunflowerSeeds', share: 1 / 3 },
      { food: 'pumpkinSeeds', share: 1 / 3 },
      { food: 'sesame', share: 1 / 3 },
    ],
  },
};

const kcalPerG = (f: FoodId) => {
  const n = FOODS[f].per100;
  return ((n.protein ?? 0) * ATWATER.protein + (n.carbs ?? 0) * ATWATER.carbs + (n.fat ?? 0) * ATWATER.fat + (n.fiber ?? 0) * ATWATER.fiber) / 100;
};

/** Grams of `alt` that replace `g` grams of `food`: the same calories for fruit (to 10 g), the same weight otherwise. */
export function altGrams(food: FoodId, alt: FoodId, g: number): number {
  if (FOODS[food].category !== 'Fruit') return g;
  return Math.max(10, Math.round((g * kcalPerG(food)) / kcalPerG(alt) / 10) * 10);
}

/** Vitamins a swap can lose, and the fibre it can add. */
const WATCH: { key: NutrientKey; label: string }[] = [
  { key: 'vitC', label: 'vitamin C' },
  { key: 'folate', label: 'folate' },
  { key: 'vitA', label: 'vitamin A' },
];
const rda = (k: NutrientKey) => NUTRIENTS.find((n) => n.key === k)?.rda ?? Infinity;
const amount = (f: FoodId, k: NutrientKey, g: number) => ((FOODS[f].per100[k] ?? 0) * g) / 100;

/**
 * What a swap changes, in a few words, or undefined if nothing much. A vitamin is
 * counted when the main food gave at least 5% of the RDA: "almost no" when the swap
 * gives under 10% of it, "less" when under half. Fibre is shown when the swap adds 1 g
 * or more. Round 5: no salad vegetable in the table replaces carrot's vitamin A
 * (beetroot gives ~0.2%), so that swap says "almost no vitamin A", at any amount
 * (`for: 'vitA'`).
 */
export function swapNote(food: FoodId, g: number, alt: FoodId, altG: number, forKey?: NutrientKey): string | undefined {
  const counts = (key: NutrientKey) => key === forKey || amount(food, key, g) >= 0.05 * rda(key);
  const lost = (share: number) => WATCH.filter(({ key }) => counts(key) && amount(alt, key, altG) < share * amount(food, key, g));
  const almost = lost(0.1).map((w) => w.label);
  const less = lost(0.5).map((w) => w.label).filter((l) => !almost.includes(l));
  const list = (xs: string[]) => xs.join(' and ').replace(/ and (?=.* and )/, ', ');
  const fibre = amount(alt, 'fiber', altG) - amount(food, 'fiber', g);
  const parts = [almost.length ? `almost no ${list(almost)}` : '', less.length ? `less ${list(less)}` : '', fibre >= 1 ? `+${Math.round(fibre)} g fibre` : ''].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}
