// ─── Food database ────────────────────────────────────────────────────────────
// Values are per 100 g of food as weighed (raw/dry unless the name says otherwise).
// Sources: Indian Food Composition Tables (IFCT 2017, ICMR-NIN), USDA FoodData
// Central, and Indian retail pack labels. Treat every value as an approximation:
// real foods vary by brand, season and preparation, so the app rounds totals and
// never shows more precision than the data supports.
//
// Prices are approximate Indian urban retail prices (₹ per kg or litre, checked
// Oct 2026 where possible: milk, eggs, chicken, fruit, soya, oats; the rest are
// kirana estimates). Meat and fish prices are per kg of EDIBLE part (curry-cut
// chicken ≈ ₹280/kg bought, ~75% edible). They estimate a budget, not exact cost.

export type GroceryCategory =
  | 'Dairy'
  | 'Pulses & soya'
  | 'Grains & flours'
  | 'Nuts & seeds'
  | 'Fruit'
  | 'Vegetables'
  | 'Fats & oils'
  | 'Eggs, meat & fish';

export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number; // available carbohydrate (excludes fibre)
  fat: number;
  fiber: number;
  iron: number; // mg
  calcium: number; // mg
  zinc: number; // mg
  vitC: number; // mg
}

export interface Food {
  name: string;
  category: GroceryCategory;
  per100: Nutrients;
  /** Approximate retail price, ₹ per kg (or per litre for liquids). */
  pricePerKg: number;
  /** How the item is usually bought, used to round the grocery list. */
  buyUnit: { label: string; grams: number };
  /** Optional household measure shown next to grams. */
  measure?: { label: string; grams: number };
  isEgg?: boolean;
  isMeatOrFish?: boolean;
}

const n = (
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  iron: number,
  calcium: number,
  zinc: number,
  vitC = 0,
): Nutrients => ({ kcal, protein, carbs, fat, fiber, iron, calcium, zinc, vitC });

export const FOODS = {
  // Dairy
  milk: {
    name: 'Toned milk',
    category: 'Dairy',
    per100: n(58, 3.1, 4.7, 3.0, 0, 0.1, 120, 0.4, 1),
    pricePerKg: 58,
    buyUnit: { label: '1 L', grams: 1000 },
    measure: { label: 'ml', grams: 1 },
  },
  curd: {
    name: 'Curd (dahi, set at home from toned milk)',
    category: 'Dairy',
    per100: n(60, 3.3, 4.6, 3.1, 0, 0.1, 120, 0.5, 1),
    pricePerKg: 58,
    buyUnit: { label: '1 L milk to set', grams: 1000 },
  },
  paneer: {
    name: 'Paneer',
    category: 'Dairy',
    per100: n(290, 18.5, 3, 22, 0, 0.3, 300, 2.5),
    pricePerKg: 450,
    buyUnit: { label: '200 g pack', grams: 200 },
  },
  ghee: {
    name: 'Ghee',
    category: 'Fats & oils',
    per100: n(900, 0, 0, 100, 0, 0, 0, 0),
    pricePerKg: 620,
    buyUnit: { label: '500 ml', grams: 500 },
    measure: { label: 'tsp', grams: 5 },
  },
  oil: {
    name: 'Mustard or groundnut oil',
    category: 'Fats & oils',
    per100: n(884, 0, 0, 100, 0, 0, 0, 0),
    pricePerKg: 195,
    buyUnit: { label: '1 L', grams: 910 },
    measure: { label: 'tsp', grams: 5 },
  },

  // Pulses & soya
  sattu: {
    name: 'Sattu (roasted chana flour)',
    category: 'Pulses & soya',
    per100: n(370, 22, 50, 5.5, 16, 5, 60, 3),
    pricePerKg: 200,
    buyUnit: { label: '500 g', grams: 500 },
    measure: { label: 'tbsp', grams: 10 },
  },
  roastedChana: {
    name: 'Roasted chana',
    category: 'Pulses & soya',
    per100: n(365, 20, 50, 5.5, 17, 5, 60, 3),
    pricePerKg: 200,
    buyUnit: { label: '500 g', grams: 500 },
  },
  moongWhole: {
    name: 'Green moong (whole, dry)',
    category: 'Pulses & soya',
    per100: n(335, 23, 48, 1.3, 16, 4.4, 120, 2.7),
    pricePerKg: 130,
    buyUnit: { label: '500 g', grams: 500 },
  },
  moongDal: {
    name: 'Moong dal (yellow, split, dry)',
    category: 'Pulses & soya',
    per100: n(345, 24, 52, 1.2, 9, 4, 80, 2.5),
    pricePerKg: 130,
    buyUnit: { label: '500 g', grams: 500 },
  },
  toorDal: {
    name: 'Toor / arhar dal (dry)',
    category: 'Pulses & soya',
    per100: n(340, 22, 52, 1.5, 9, 3.9, 70, 2.5),
    pricePerKg: 160,
    buyUnit: { label: '500 g', grams: 500 },
  },
  kalaChana: {
    name: 'Kala chana (dry)',
    category: 'Pulses & soya',
    per100: n(360, 20, 46, 5, 18, 6, 150, 3),
    pricePerKg: 110,
    buyUnit: { label: '500 g', grams: 500 },
  },
  kabuliChana: {
    name: 'Kabuli chana / chickpeas (dry)',
    category: 'Pulses & soya',
    per100: n(364, 19, 50, 6, 17, 5, 100, 3),
    pricePerKg: 160,
    buyUnit: { label: '500 g', grams: 500 },
  },
  rajma: {
    name: 'Rajma (dry)',
    category: 'Pulses & soya',
    per100: n(333, 22, 45, 1.2, 18, 5.5, 140, 2.8),
    pricePerKg: 180,
    buyUnit: { label: '500 g', grams: 500 },
  },
  soyaChunks: {
    name: 'Soya chunks (dry)',
    category: 'Pulses & soya',
    per100: n(345, 52, 20, 0.5, 13, 9, 240, 2.5),
    pricePerKg: 180,
    buyUnit: { label: '200 g pack', grams: 200 },
  },
  besan: {
    name: 'Besan (gram flour)',
    category: 'Pulses & soya',
    per100: n(387, 22, 50, 6.7, 11, 4.9, 45, 2.8),
    pricePerKg: 110,
    buyUnit: { label: '500 g', grams: 500 },
  },

  // Grains & flours
  oats: {
    name: 'Rolled oats',
    category: 'Grains & flours',
    per100: n(385, 12.5, 58, 7.5, 10, 4, 50, 3),
    pricePerKg: 160,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  atta: {
    name: 'Whole-wheat atta',
    category: 'Grains & flours',
    per100: n(340, 12, 62, 1.7, 11, 4, 35, 2.5),
    pricePerKg: 50,
    buyUnit: { label: '5 kg bag', grams: 5000 },
    measure: { label: 'roti', grams: 35 },
  },
  rice: {
    name: 'Rice (raw)',
    category: 'Grains & flours',
    per100: n(360, 7, 78, 0.6, 1.3, 0.8, 10, 1.1),
    pricePerKg: 55,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  poha: {
    name: 'Poha (flattened rice)',
    category: 'Grains & flours',
    per100: n(350, 6.5, 75, 1.2, 2, 4, 20, 1),
    pricePerKg: 75,
    buyUnit: { label: '500 g', grams: 500 },
  },

  // Nuts & seeds
  peanuts: {
    name: 'Peanuts (raw)',
    category: 'Nuts & seeds',
    per100: n(567, 25.8, 16, 49, 8.5, 4.6, 92, 3.3),
    pricePerKg: 150,
    buyUnit: { label: '500 g', grams: 500 },
  },
  pumpkinSeeds: {
    name: 'Pumpkin seeds',
    category: 'Nuts & seeds',
    per100: n(559, 30, 5, 49, 6, 8.8, 46, 7.8),
    pricePerKg: 800,
    buyUnit: { label: '200 g', grams: 200 },
  },
  watermelonSeeds: {
    name: 'Watermelon seeds (kernels)',
    category: 'Nuts & seeds',
    per100: n(557, 28, 15, 47, 4, 7.3, 54, 10),
    pricePerKg: 700,
    buyUnit: { label: '200 g', grams: 200 },
  },
  flax: {
    name: 'Flaxseed (ground)',
    category: 'Nuts & seeds',
    per100: n(534, 18, 2, 42, 27, 5.7, 255, 4.3),
    pricePerKg: 220,
    buyUnit: { label: '250 g', grams: 250 },
    measure: { label: 'tbsp', grams: 7 },
  },
  almonds: {
    name: 'Almonds',
    category: 'Nuts & seeds',
    per100: n(579, 21, 10, 50, 12, 3.7, 270, 3.1),
    pricePerKg: 1000,
    buyUnit: { label: '250 g', grams: 250 },
  },
  walnuts: {
    name: 'Walnut kernels',
    category: 'Nuts & seeds',
    per100: n(654, 15, 7, 65, 6.7, 2.9, 98, 3.1),
    pricePerKg: 1300,
    buyUnit: { label: '100 g', grams: 100 },
  },
  cashews: {
    name: 'Cashews',
    category: 'Nuts & seeds',
    per100: n(553, 18, 27, 44, 3.3, 6.7, 37, 5.8),
    pricePerKg: 1000,
    buyUnit: { label: '100 g', grams: 100 },
  },

  // Fruit
  raisins: {
    name: 'Raisins',
    category: 'Fruit',
    per100: n(299, 3, 75, 0.5, 3.7, 1.9, 50, 0.2, 2),
    pricePerKg: 380,
    buyUnit: { label: '250 g', grams: 250 },
  },
  dates: {
    name: 'Dates',
    category: 'Fruit',
    per100: n(282, 2.5, 67, 0.4, 8, 1, 64, 0.4),
    pricePerKg: 320,
    buyUnit: { label: '250 g', grams: 250 },
    measure: { label: 'date', grams: 10 },
  },
  banana: {
    name: 'Banana',
    category: 'Fruit',
    per100: n(89, 1.1, 20.5, 0.3, 2.6, 0.3, 5, 0.2, 9),
    pricePerKg: 55,
    buyUnit: { label: '1 dozen (~1.3 kg)', grams: 1300 },
    measure: { label: 'medium banana', grams: 110 },
  },
  papaya: {
    name: 'Papaya',
    category: 'Fruit',
    per100: n(43, 0.5, 9, 0.3, 1.7, 0.3, 20, 0.1, 60),
    pricePerKg: 55,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  guava: {
    name: 'Guava',
    category: 'Fruit',
    per100: n(68, 2.6, 9, 1, 5.4, 0.3, 18, 0.2, 228),
    pricePerKg: 80,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  seasonalFruit: {
    name: 'Seasonal fruit (orange, guava, apple, papaya…)',
    category: 'Fruit',
    per100: n(55, 0.8, 12, 0.3, 2.5, 0.3, 25, 0.1, 40),
    pricePerKg: 85,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  lemon: {
    name: 'Lemon juice',
    category: 'Fruit',
    per100: n(22, 0.4, 7, 0.2, 0.3, 0.1, 6, 0.1, 39),
    pricePerKg: 120,
    buyUnit: { label: '250 g lemons', grams: 250 },
  },

  // Vegetables
  sweetPotato: {
    name: 'Sweet potato',
    category: 'Vegetables',
    per100: n(86, 1.6, 17, 0.1, 3, 0.6, 30, 0.3, 2.4),
    pricePerKg: 70,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  beetroot: {
    name: 'Beetroot',
    category: 'Vegetables',
    per100: n(43, 1.6, 7, 0.2, 2.8, 0.8, 16, 0.35, 5),
    pricePerKg: 50,
    buyUnit: { label: '500 g', grams: 500 },
  },
  mixedVeg: {
    name: 'Mixed seasonal vegetables (sabzi)',
    category: 'Vegetables',
    per100: n(35, 2, 5, 0.3, 2.5, 0.8, 30, 0.3, 25),
    pricePerKg: 50,
    buyUnit: { label: '1 kg', grams: 1000 },
  },
  spinach: {
    name: 'Spinach / palak',
    category: 'Vegetables',
    per100: n(23, 2.9, 1.4, 0.4, 2.2, 2.7, 99, 0.5, 28),
    pricePerKg: 40,
    buyUnit: { label: '1 bunch (~250 g)', grams: 250 },
  },
  salad: {
    name: 'Salad (cucumber, onion, tomato, carrot)',
    category: 'Vegetables',
    per100: n(25, 1, 4.5, 0.2, 1.5, 0.4, 20, 0.2, 12),
    pricePerKg: 40,
    buyUnit: { label: '1 kg', grams: 1000 },
  },

  // Eggs, meat & fish
  egg: {
    name: 'Egg',
    category: 'Eggs, meat & fish',
    per100: n(143, 12.6, 0.7, 9.5, 0, 1.8, 56, 1.3),
    // ~₹7 per egg (Delhi, Oct 2026), ~50 g edible portion
    pricePerKg: 140,
    buyUnit: { label: 'tray of 30', grams: 1500 },
    measure: { label: 'egg', grams: 50 },
    isEgg: true,
  },
  chicken: {
    name: 'Chicken (raw, edible part — curry cut or boneless)',
    category: 'Eggs, meat & fish',
    per100: n(120, 22.5, 0, 2.6, 0, 0.4, 5, 0.8),
    pricePerKg: 380,
    buyUnit: { label: '500 g', grams: 500 },
    isMeatOrFish: true,
  },
  fish: {
    name: 'Rohu / katla fish (raw, edible part)',
    category: 'Eggs, meat & fish',
    per100: n(100, 17, 0, 3, 0, 1, 80, 0.8),
    pricePerKg: 380,
    buyUnit: { label: '500 g', grams: 500 },
    isMeatOrFish: true,
  },
} satisfies Record<string, Food>;

export type FoodId = keyof typeof FOODS;

export function getFood(id: FoodId): Food {
  return FOODS[id];
}
