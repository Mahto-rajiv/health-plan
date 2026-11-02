import { ATWATER } from '../config';
import { FOODS, type FoodId } from './foods';

// ─── Fruit and vegetables: one menu all year, with a swap for each ────────────
// Owner (Nov 2026): no seasons. The meals use fruit and vegetables that Ahmedabad
// markets sell most of the year. Each one has a single named alternative, with
// its own amount, for days the market doesn't have it:
//   • fruit: the alternative amount gives the same calories (rounded to 10 g);
//   • vegetables and greens: the same weight.
// Onion and tomato are sold all year and have no alternative.
// Nutrients and costs are worked out for the main food, not the alternative.
//
// Each meal has *slots* (the fruit in Meal 1, the fruit in Meal 3, the cooked
// vegetables, the salad, the greens). A slot is always the same foods, so Meal 1
// is identical every day and Meal 3 identical Mon–Fri.

export type SlotId = 'fruit1' | 'fruit3' | 'sabzi' | 'salad' | 'greens';

/** One food in a slot: its share of the slot's grams, and the swap if it isn't in the market. */
export interface SlotFood {
  food: FoodId;
  share: number;
  alt?: FoodId;
}

export interface SlotFill {
  /** Short name used inside titles and steps, e.g. "papaya". */
  name: string;
  /** Shares sum to 1. */
  foods: SlotFood[];
}

export const SLOTS: Record<SlotId, SlotFill> = {
  fruit1: { name: 'papaya', foods: [{ food: 'papaya', share: 1, alt: 'apple' }] },
  fruit3: { name: 'banana', foods: [{ food: 'banana', share: 1, alt: 'apple' }] },
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
  salad: {
    name: 'cucumber, onion and tomato',
    foods: [
      { food: 'cucumber', share: 0.5, alt: 'carrot' },
      { food: 'onion', share: 0.25 },
      { food: 'tomato', share: 0.25 },
    ],
  },
  greens: { name: 'palak (spinach)', foods: [{ food: 'spinach', share: 1, alt: 'amaranth' }] },
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
