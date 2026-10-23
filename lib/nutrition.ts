import { FOODS, type Food, type FoodId, type Nutrients } from './data/foods';

export interface MealItem {
  food: FoodId;
  /** Grams as weighed: dry for pulses/grains, raw for vegetables/meat, ml for milk. */
  g: number;
  /** Optional household description, e.g. "3 rotis" or "soaked overnight". */
  note?: string;
}

export const EMPTY_NUTRIENTS: Nutrients = {
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  iron: 0,
  calcium: 0,
  zinc: 0,
  vitC: 0,
};

const KEYS = Object.keys(EMPTY_NUTRIENTS) as (keyof Nutrients)[];

export function itemNutrients(item: MealItem): Nutrients {
  const per100 = FOODS[item.food].per100;
  const factor = item.g / 100;
  const out = { ...EMPTY_NUTRIENTS };
  for (const k of KEYS) out[k] = per100[k] * factor;
  return out;
}

export function sumNutrients(list: Nutrients[]): Nutrients {
  const out = { ...EMPTY_NUTRIENTS };
  for (const nut of list) for (const k of KEYS) out[k] += nut[k];
  return out;
}

export function itemsNutrients(items: MealItem[]): Nutrients {
  return sumNutrients(items.map(itemNutrients));
}

/** Grams to buy for this many edible grams (peel, seeds and trimmings added back). */
export function boughtGrams(food: FoodId, edibleGrams: number): number {
  return edibleGrams / ((FOODS[food] as Food).edible ?? 1);
}

export function itemCost(item: MealItem): number {
  return (FOODS[item.food].pricePerKg * boughtGrams(item.food, item.g)) / 1000;
}

export function itemsCost(items: MealItem[]): number {
  return items.reduce((s, i) => s + itemCost(i), 0);
}

/** Calories are rounded to the nearest 10 — the underlying data is not more precise. */
export const roundKcal = (v: number) => Math.round(v / 10) * 10;
export const roundG = (v: number) => Math.round(v);

/** Human-friendly quantity: "300 ml", "3 rotis (105 g atta)", "2 eggs", "1 medium banana (110 g)". */
export function formatQuantity(item: MealItem): string {
  const food = FOODS[item.food];
  if (item.food === 'milk') return `${item.g} ml`;
  if (item.food === 'egg') {
    const count = Math.round(item.g / 50);
    return `${count} egg${count === 1 ? '' : 's'}`;
  }
  if (item.food === 'atta') {
    const rotis = Math.round(item.g / 35);
    return `${rotis} roti${rotis === 1 ? '' : 's'} (${item.g} g atta)`;
  }
  const measure = 'measure' in food ? food.measure : undefined;
  if (measure) {
    if (measure.label === 'tsp' || measure.label === 'tbsp') {
      const count = item.g / measure.grams;
      const pretty = Number.isInteger(count) ? String(count) : count.toFixed(1);
      return `${item.g} g (${pretty} ${measure.label})`;
    }
    // Named unit: e.g. "medium banana", "date"
    const count = Math.round(item.g / measure.grams);
    if (count >= 1) {
      return `${item.g} g (${count} ${count === 1 ? measure.label : `${measure.label}s`})`;
    }
  }
  return `${item.g} g`;
}
