import { FOODS, type Food, type FoodId, type Nutrients } from './data/foods';
import { NUTRIENT_KEYS, type NutrientKey } from './data/nutrient-keys';
import { DEFAULT_PRICE_TABLE, type PriceTable } from './data/prices';
import { ATWATER } from './config';

export interface MealItem {
  food: FoodId;
  /** Grams as weighed: dry for pulses/grains, raw for vegetables/meat, ml for milk. */
  g: number;
  /** Optional household description, e.g. "3 rotis" or "soaked overnight". */
  note?: string;
}

export const EMPTY_NUTRIENTS: Nutrients = Object.fromEntries([['kcal', 0], ...NUTRIENT_KEYS.map((k) => [k, 0])]) as Nutrients;

const KEYS = Object.keys(EMPTY_NUTRIENTS) as (keyof Nutrients)[];

/** kcal from macros (4/4/9, fibre 2 kcal/g). Carbs are available carbohydrate. */
export function atwaterKcal(n: Pick<Nutrients, 'protein' | 'carbs' | 'fat' | 'fiber'>): number {
  return n.protein * ATWATER.protein + n.carbs * ATWATER.carbs + n.fat * ATWATER.fat + n.fiber * ATWATER.fiber;
}

/** Nutrients in one item. A value missing from the source table counts as 0; see missingNutrients. */
export function itemNutrients(item: MealItem): Nutrients {
  const food = FOODS[item.food] as Food;
  const factor = item.g / 100;
  const out = { ...EMPTY_NUTRIENTS };
  for (const k of NUTRIENT_KEYS) out[k] = (food.per100[k] ?? 0) * factor;
  out.kcal = atwaterKcal(out);
  return out;
}

/** For each nutrient, the foods in these items whose source table has no value (so totals may be low). */
export function missingNutrients(items: MealItem[]): Partial<Record<NutrientKey, FoodId[]>> {
  const out: Partial<Record<NutrientKey, FoodId[]>> = {};
  for (const it of items) {
    if (it.g <= 0) continue;
    for (const k of NUTRIENT_KEYS) {
      if (FOODS[it.food].per100[k] === null) {
        const list = (out[k] ??= []);
        if (!list.includes(it.food)) list.push(it.food);
      }
    }
  }
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
  return edibleGrams / FOODS[food].edible;
}

export function itemCost(item: MealItem, prices: PriceTable = DEFAULT_PRICE_TABLE): number {
  return (prices[item.food] * boughtGrams(item.food, item.g)) / 1000;
}

export function itemsCost(items: MealItem[], prices: PriceTable = DEFAULT_PRICE_TABLE): number {
  return items.reduce((s, i) => s + itemCost(i, prices), 0);
}

/** Calories are rounded to the nearest 10 — the underlying data is not more precise. */
export const roundKcal = (v: number) => Math.round(v / 10) * 10;
export const roundG = (v: number) => Math.round(v);

// Approximate household measures (standard 240 ml cup, level). Cup weights are
// USDA FoodData Central figures for similar foods where available (raw white
// rice 185 g, lentils 192 g, rolled oats 81 g, chickpea flour 92 g, whole-wheat
// flour 120 g, yogurt 245 g); the rest are kitchen approximations. Weigh a few
// times to calibrate, then measures are fine.
const CUP_GRAMS: Partial<Record<FoodId, number>> = {
  rice: 185,
  moongDal: 192,
  toorDal: 192,
  moongWhole: 192,
  rajma: 184,
  kalaChana: 200,
  kabuliChana: 200,
  oats: 81,
  besan: 92,
  atta: 120,
  daliya: 140,
  poha: 70,
  curd: 245,
  soyaChunks: 50,
  roastedChana: 150,
  sattu: 100,
};

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.33, '⅓'],
  [0.5, '½'],
  [0.67, '⅔'],
  [0.75, '¾'],
];

/** "≈ ½ cup" style measure, rounded to the nearest common fraction. */
export function cupMeasure(food: FoodId, grams: number): string | null {
  const per = CUP_GRAMS[food];
  if (!per) return null;
  const cups = grams / per;
  if (cups < 0.2) return null;
  const whole = Math.floor(cups + 0.12);
  const rest = cups - whole;
  const frac = rest < 0.12 ? '' : FRACTIONS.reduce((best, f) => (Math.abs(f[0] - rest) < Math.abs(best[0] - rest) ? f : best))[1];
  const n = whole ? `${whole}${frac ? ` ${frac}` : ''}` : frac;
  return `≈ ${n} cup`;
}

/** Human-friendly quantity: "300 ml", "70 g atta · 2 parathas", "2 eggs", "45 g (≈ ¼ cup)". */
export function formatQuantity(item: MealItem): string {
  const food = FOODS[item.food];
  if (item.food === 'milk') return `${item.g} ml`;
  if (item.food === 'egg') {
    const count = Math.round(item.g / 50);
    return `${count} egg${count === 1 ? '' : 's'}`;
  }
  // A note such as "2 parathas" already says the household amount.
  if (item.food === 'atta' && !item.note) {
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
    const count = Math.round(item.g / measure.grams);
    if (count >= 1) return `${item.g} g (${count} ${count === 1 ? measure.label : `${measure.label}s`})`;
  }
  const cup = cupMeasure(item.food, item.g);
  return cup ? `${item.g} g (${cup})` : `${item.g} g`;
}
