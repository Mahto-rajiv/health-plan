// ─── Food list ────────────────────────────────────────────────────────────────
// Names, grocery categories and how each food is bought. Nutrient values and the
// edible share come from lib/data/composition.generated.ts, which
// scripts/food-data/build.ts builds from IFCT 2017 (ICMR-NIN) and USDA SR28.
// Nothing nutritional is typed by hand here. Sources per food:
// scripts/food-data/sources.ts.
//
// Prices are in lib/data/prices.ts (editable in Settings).
//
// Energy: the app computes kcal from the macros (lib/config.ts ATWATER), so meal
// and day totals always reconcile with protein, carbs, fat and fibre. Carbs are
// AVAILABLE carbohydrate (fibre excluded).
//
// Meal grams are edible weight. Produce prices are per kg as bought, so
// `edible` (the share left after peel, seeds, pods and trimmings, from USDA
// SR28 "refuse") converts one into the other.
import { COMPOSITION } from './composition.generated';
import type { NutrientKey } from './nutrient-keys';

export type GroceryCategory =
  | 'Dairy'
  | 'Pulses & soya'
  | 'Grains & flours'
  | 'Nuts & seeds'
  | 'Fruit'
  | 'Vegetables'
  | 'Fats & oils'
  | 'Eggs, meat & fish';

/** Nutrient totals. kcal is computed from the macros; missing source values count as 0 (see missingNutrients). */
export type Nutrients = { kcal: number } & Record<NutrientKey, number>;

export interface FoodMeta {
  name: string;
  category: GroceryCategory;
  /** How the item is usually bought, used to round the grocery list. */
  buyUnit: { label: string; grams: number };
  /** Optional household measure shown next to grams. */
  measure?: { label: string; grams: number };
  isEgg?: boolean;
  isMeatOrFish?: boolean;
}

const META = {
  milk: {
    name: 'Double-toned milk (1.5% fat)',
    category: 'Dairy',
    buyUnit: { label: '1 L', grams: 1000 },
    measure: { label: 'ml', grams: 1 },
  },
  curd: {
    name: 'Curd (dahi, set at home from double-toned milk)',
    category: 'Dairy',
    buyUnit: { label: '1 L milk, set as curd at home,', grams: 1000 },
  },
  paneer: {
    name: 'Paneer',
    category: 'Dairy',
    buyUnit: { label: '200 g pack', grams: 200 },
  },
  ghee: {
    name: 'Ghee',
    category: 'Fats & oils',
    buyUnit: { label: '500 ml', grams: 500 },
    measure: { label: 'tsp', grams: 5 },
  },
  oil: {
    name: 'Rice-bran oil (or groundnut oil)',
    category: 'Fats & oils',
    buyUnit: { label: '1 L', grams: 910 },
    measure: { label: 'tsp', grams: 5 },
  },
  sattu: {
    name: 'Sattu (roasted chana flour)',
    category: 'Pulses & soya',
    buyUnit: { label: '1 kg', grams: 1000 },
    measure: { label: 'tbsp', grams: 10 },
  },
  roastedChana: {
    name: 'Roasted chana',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  moongWhole: {
    name: 'Green moong (whole, dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  moongDal: {
    name: 'Moong dal (yellow, split, dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  toorDal: {
    name: 'Toor / arhar dal (dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  kalaChana: {
    name: 'Kala chana (dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  kabuliChana: {
    name: 'Kabuli chana / chickpeas (dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  rajma: {
    name: 'Rajma (dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  soyaChunks: {
    name: 'Soya chunks (dry)',
    category: 'Pulses & soya',
    buyUnit: { label: '1 kg pouch', grams: 1000 },
  },
  besan: {
    name: 'Besan (gram flour)',
    category: 'Pulses & soya',
    buyUnit: { label: '500 g', grams: 500 },
  },
  oats: {
    name: 'Rolled oats',
    category: 'Grains & flours',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  atta: {
    name: 'Whole-wheat atta',
    category: 'Grains & flours',
    buyUnit: { label: '5 kg bag', grams: 5000 },
    measure: { label: 'roti', grams: 35 },
  },
  daliya: {
    name: 'Daliya (broken wheat)',
    category: 'Grains & flours',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  rice: {
    name: 'Rice (raw)',
    category: 'Grains & flours',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  poha: {
    name: 'Poha (flattened rice)',
    category: 'Grains & flours',
    buyUnit: { label: '500 g', grams: 500 },
  },
  peanuts: {
    name: 'Peanuts (raw)',
    category: 'Nuts & seeds',
    buyUnit: { label: '500 g', grams: 500 },
    measure: { label: 'tbsp', grams: 9 },
  },
  pumpkinSeeds: {
    name: 'Pumpkin seeds',
    category: 'Nuts & seeds',
    buyUnit: { label: '200 g', grams: 200 },
  },
  flax: {
    name: 'Flaxseed (ground)',
    category: 'Nuts & seeds',
    buyUnit: { label: '250 g', grams: 250 },
    measure: { label: 'tbsp', grams: 7 },
  },
  sunflowerSeeds: {
    name: 'Sunflower seeds (kernels)',
    category: 'Nuts & seeds',
    buyUnit: { label: '200 g', grams: 200 },
  },
  sesame: {
    name: 'Sesame seeds (til, white)',
    category: 'Nuts & seeds',
    buyUnit: { label: '250 g', grams: 250 },
    measure: { label: 'tbsp', grams: 9 },
  },
  almonds: {
    name: 'Almonds',
    category: 'Nuts & seeds',
    buyUnit: { label: '250 g', grams: 250 },
  },
  walnuts: {
    name: 'Walnut kernels',
    category: 'Nuts & seeds',
    buyUnit: { label: '100 g', grams: 100 },
  },
  cashews: {
    name: 'Cashews',
    category: 'Nuts & seeds',
    buyUnit: { label: '100 g', grams: 100 },
  },
  raisins: {
    name: 'Raisins',
    category: 'Fruit',
    buyUnit: { label: '250 g', grams: 250 },
  },
  dates: {
    name: 'Dates',
    category: 'Fruit',
    buyUnit: { label: '250 g', grams: 250 },
    measure: { label: 'date', grams: 10 },
  },
  banana: {
    name: 'Banana',
    category: 'Fruit',
    buyUnit: { label: '1 dozen (~2 kg)', grams: 2000 },
    measure: { label: 'medium banana', grams: 110 },
  },
  papaya: {
    name: 'Papaya',
    category: 'Fruit',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  guava: {
    name: 'Guava',
    category: 'Fruit',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  lemon: {
    name: 'Lemon (juice)',
    category: 'Fruit',
    buyUnit: { label: '250 g', grams: 250 },
  },
  sweetPotato: {
    name: 'Sweet potato',
    category: 'Vegetables',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  beetroot: {
    name: 'Beetroot',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  spinach: {
    name: 'Spinach / palak',
    category: 'Vegetables',
    buyUnit: { label: '1 bunch (~250 g)', grams: 250 },
  },
  potato: {
    name: 'Potato',
    category: 'Vegetables',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  egg: {
    name: 'Egg',
    category: 'Eggs, meat & fish',
    buyUnit: { label: 'tray of 30', grams: 1500 },
    measure: { label: 'egg', grams: 50 },
    isEgg: true,
  },
  chicken: {
    name: 'Chicken (raw, edible part — curry cut or boneless)',
    category: 'Eggs, meat & fish',
    buyUnit: { label: '500 g', grams: 500 },
    isMeatOrFish: true,
  },
  fish: {
    name: 'Rohu / katla fish (raw, edible part)',
    category: 'Eggs, meat & fish',
    buyUnit: { label: '500 g', grams: 500 },
    isMeatOrFish: true,
  },
  orange: {
    name: 'Orange / kinnow',
    category: 'Fruit',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  muskmelon: {
    name: 'Muskmelon (kharbooja)',
    category: 'Fruit',
    buyUnit: { label: '1 melon (~1 kg)', grams: 1000 },
  },
  mango: {
    name: 'Mango',
    category: 'Fruit',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  apple: {
    name: 'Apple',
    category: 'Fruit',
    buyUnit: { label: '1 kg', grams: 1000 },
    measure: { label: 'medium apple', grams: 150 },
  },
  amaranth: {
    name: 'Amaranth leaves (chaulai)',
    category: 'Vegetables',
    buyUnit: { label: '1 bunch (~250 g)', grams: 250 },
  },
  peas: {
    name: 'Green peas (in the pod)',
    category: 'Vegetables',
    buyUnit: { label: '1 kg in pods', grams: 1000 },
  },
  cauliflower: {
    name: 'Cauliflower',
    category: 'Vegetables',
    buyUnit: { label: '1 head (~1 kg)', grams: 1000 },
  },
  carrot: {
    name: 'Carrot',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  radish: {
    name: 'Radish (mooli)',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  bottleGourd: {
    name: 'Bottle gourd (lauki)',
    category: 'Vegetables',
    buyUnit: { label: '1 lauki (~1 kg)', grams: 1000 },
  },
  okra: {
    name: 'Okra (bhindi)',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  pumpkin: {
    name: 'Pumpkin (kaddu)',
    category: 'Vegetables',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  brinjal: {
    name: 'Brinjal (baingan)',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  frenchBeans: {
    name: 'French beans',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  cucumber: {
    name: 'Cucumber',
    category: 'Vegetables',
    buyUnit: { label: '500 g', grams: 500 },
  },
  onion: {
    name: 'Onion',
    category: 'Vegetables',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  tomato: {
    name: 'Tomato',
    category: 'Vegetables',
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  capsicum: {
    name: 'Capsicum (green)',
    category: 'Vegetables',
    buyUnit: { label: '250 g', grams: 250 },
  },
} satisfies Record<string, FoodMeta>;

export type FoodId = keyof typeof META;

export interface Food extends FoodMeta {
  /** Per 100 g edible portion; null = not in the source table. */
  per100: Record<NutrientKey, number | null>;
  /** The source table's own kcal per 100 g (cross-check only). */
  tabulatedKcal: number | null;
  /** Share of the bought weight that is eaten. */
  edible: number;
  edibleSource: string;
  source: string;
}

const composition = COMPOSITION as Record<string, (typeof COMPOSITION)[keyof typeof COMPOSITION]>;

export const FOODS = Object.fromEntries(
  (Object.keys(META) as FoodId[]).map((id) => {
    const c = composition[id];
    if (!c) throw new Error(`No composition for ${id}: add it to scripts/food-data/sources.ts and run npm run food-data`);
    return [id, { ...(META[id] as FoodMeta), per100: c.values, tabulatedKcal: c.tabulatedKcal, edible: c.edible, edibleSource: c.edibleSource, source: c.source }];
  }),
) as Record<FoodId, Food>;

export const FOOD_IDS = Object.keys(META) as FoodId[];

export function getFood(id: FoodId): Food {
  return FOODS[id];
}
