import { FOODS, type FoodId, type GroceryCategory, type Nutrients } from './data/foods';
import { MEAL_PLAN_DEFINITIONS, buildWeek, type PlanId, type PlannedDay, type MealPlanDefinition } from './data/meal-plans';
import { PANTRY_MONTHLY } from './data/nutrition-guide';
import { itemsCost, itemsNutrients, sumNutrients } from './nutrition';

// Everything here is computed once at module load from the plan definitions,
// so totals can never drift from the foods listed.

export interface ComputedDay extends PlannedDay {
  totals: Nutrients;
  cost: number;
  mealTotals: Nutrients[];
}

export interface GroceryLine {
  food: FoodId;
  name: string;
  category: GroceryCategory;
  weeklyGrams: number;
  buy: string;
  pack: string;
  weeklyCost: number;
}

export interface ComputedPlan {
  def: MealPlanDefinition;
  days: ComputedDay[];
  weeklyAverage: Nutrients;
  ranges: Record<'kcal' | 'protein' | 'fiber', [number, number]>;
  weeklyFoodCost: number;
  monthlyCost: number;
  grocery: { category: GroceryCategory; lines: GroceryLine[] }[];
  eggsPerWeek: number;
}

const CATEGORY_ORDER: GroceryCategory[] = [
  'Dairy',
  'Pulses & soya',
  'Grains & flours',
  'Vegetables',
  'Fruit',
  'Nuts & seeds',
  'Eggs, meat & fish',
  'Fats & oils',
];

// Fresh foods: never suggest that one pack "lasts weeks".
const PERISHABLE = new Set<FoodId>([
  'milk', 'curd', 'paneer', 'banana', 'papaya', 'guava', 'seasonalFruit', 'lemon',
  'sweetPotato', 'beetroot', 'mixedVeg', 'spinach', 'salad', 'chicken', 'fish',
]);

/** How many shop units a week needs, or how long one unit lasts — for low-waste buying. */
function packHint(food: FoodId, weeklyGrams: number): string {
  const unit = FOODS[food].buyUnit;
  const ratio = weeklyGrams / unit.grams;
  if (ratio >= 1) return `≈ ${Math.max(1, Math.round(ratio * 2) / 2)} × ${unit.label} a week`;
  if (food === 'paneer') return `1 × ${unit.label} covers ~${Math.floor(7 / ratio)} days — freeze the extra in portions`;
  if (PERISHABLE.has(food)) return 'buy fresh, 2–3 times a week';
  const weeks = Math.floor(1 / ratio);
  if (weeks > 26) return `1 × ${unit.label} lasts 6+ months`;
  return weeks >= 2 ? `1 × ${unit.label} lasts ~${weeks} weeks` : `1 × ${unit.label} lasts ~${Math.floor(7 / ratio)} days`;
}

function formatAmount(food: FoodId, grams: number): string {
  if (food === 'egg') return `${Math.round(grams / 50)} eggs`;
  if (food === 'milk') return `${(grams / 1000).toFixed(1)} L`;
  if (food === 'curd') return `${(grams / 1000).toFixed(1)} L milk`;
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${Math.round(grams / 10) * 10} g`;
}

function computePlan(def: MealPlanDefinition): ComputedPlan {
  const week = buildWeek(def);
  const days: ComputedDay[] = week.map((d) => {
    const items = d.meals.flatMap((m) => m.meal.items);
    return {
      ...d,
      totals: itemsNutrients(items),
      cost: itemsCost(items),
      mealTotals: d.meals.map((m) => itemsNutrients(m.meal.items)),
    };
  });

  const weekly = sumNutrients(days.map((d) => d.totals));
  const weeklyAverage = Object.fromEntries(Object.entries(weekly).map(([k, v]) => [k, v / 7])) as unknown as Nutrients;
  const range = (k: keyof Nutrients): [number, number] => [
    Math.min(...days.map((d) => d.totals[k])),
    Math.max(...days.map((d) => d.totals[k])),
  ];

  const grams = new Map<FoodId, number>();
  for (const d of week) for (const pm of d.meals) for (const it of pm.meal.items) grams.set(it.food, (grams.get(it.food) ?? 0) + it.g);

  const lines: GroceryLine[] = [...grams.entries()].map(([food, g]) => {
    const f = FOODS[food];
    return {
      food,
      name: f.name,
      category: f.category,
      weeklyGrams: g,
      buy: formatAmount(food, g),
      pack: packHint(food, g),
      weeklyCost: (f.pricePerKg * g) / 1000,
    };
  });
  const grocery = CATEGORY_ORDER.map((category) => ({
    category,
    lines: lines.filter((l) => l.category === category).sort((a, b) => b.weeklyCost - a.weeklyCost),
  })).filter((g) => g.lines.length);

  const weeklyFoodCost = days.reduce((s, d) => s + d.cost, 0);
  return {
    def,
    days,
    weeklyAverage,
    ranges: { kcal: range('kcal'), protein: range('protein'), fiber: range('fiber') },
    weeklyFoodCost,
    monthlyCost: (weeklyFoodCost * 30) / 7 + PANTRY_MONTHLY,
    grocery,
    eggsPerWeek: Math.round((grams.get('egg') ?? 0) / 50),
  };
}

export const PLANS: ComputedPlan[] = MEAL_PLAN_DEFINITIONS.map(computePlan);

export function getPlan(id: PlanId): ComputedPlan {
  return PLANS.find((p) => p.def.id === id) ?? PLANS[0];
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export const BUDGET_MIN = 4000;
export const BUDGET_MAX = 5000;

interface SwapRule {
  id: string;
  label: string;
  note: string;
  from: FoodId[];
  /** Replacement per gram of the original food. */
  to: { food: FoodId; perGram: number }[];
  /** Share of the original grams that is swapped (0.5 = half of it). */
  share: number;
}

// Protein-matched where the food is a main protein source, weight-matched otherwise.
const SWAP_RULES: SwapRule[] = [
  {
    id: 'paneer-soya',
    label: 'Replace half the paneer with soya chunks',
    note: 'Protein-matched (100 g paneer ≈ 36 g dry soya + 1 tsp ghee).',
    from: ['paneer'],
    to: [
      { food: 'soyaChunks', perGram: 0.36 },
      { food: 'ghee', perGram: 0.05 },
    ],
    share: 0.5,
  },
  {
    id: 'nuts-peanuts',
    label: 'Replace almonds, walnuts and seeds with peanuts',
    note: 'Same weight. Keep the flaxseed for omega-3 (ALA); pumpkin seeds are the richer zinc source.',
    from: ['almonds', 'walnuts', 'cashews', 'pumpkinSeeds', 'watermelonSeeds'],
    to: [{ food: 'peanuts', perGram: 1 }],
    share: 1,
  },
  {
    id: 'fruit-papaya',
    label: 'Use papaya or banana instead of mixed seasonal fruit',
    note: 'Same weight. Papaya is also one of the richest common sources of vitamin C.',
    from: ['seasonalFruit', 'guava'],
    to: [{ food: 'papaya', perGram: 1 }],
    share: 1,
  },
  {
    id: 'chicken-soya',
    label: 'Replace half the chicken with soya chunks',
    note: 'Protein-matched (100 g raw chicken ≈ 43 g dry soya). Cook it in the same curry or tikka masala.',
    from: ['chicken'],
    to: [{ food: 'soyaChunks', perGram: 0.43 }],
    share: 0.5,
  },
  {
    id: 'fish-soya',
    label: 'Make one of the three fish portions soya chunks instead',
    note: 'Protein-matched (110 g fish ≈ 36 g dry soya). Keep at least one fish meal a week for EPA/DHA.',
    from: ['fish'],
    to: [{ food: 'soyaChunks', perGram: 0.33 }],
    share: 1 / 3,
  },
];

export interface BudgetSwap {
  id: string;
  label: string;
  note: string;
  monthlySaving: number;
  proteinDeltaPerDay: number;
  kcalDeltaPerDay: number;
}

/** Savings are computed from the plan's actual weekly quantities, not estimated. */
export function budgetSwaps(plan: ComputedPlan): BudgetSwap[] {
  const items = plan.days.flatMap((d) => d.meals.flatMap((m) => m.meal.items));
  return SWAP_RULES.map((rule) => {
    const original = items.filter((it) => rule.from.includes(it.food));
    const replacement = original.flatMap((it) => rule.to.map((t) => ({ food: t.food, g: it.g * t.perGram })));
    const before = itemsNutrients(original);
    const after = itemsNutrients(replacement);
    const saving = (itemsCost(original) - itemsCost(replacement)) * rule.share;
    return {
      id: rule.id,
      label: rule.label,
      note: rule.note,
      monthlySaving: (saving * 30) / 7,
      proteinDeltaPerDay: ((after.protein - before.protein) * rule.share) / 7,
      kcalDeltaPerDay: ((after.kcal - before.kcal) * rule.share) / 7,
    };
  })
    .filter((s) => s.monthlySaving >= 30)
    .sort((a, b) => b.monthlySaving - a.monthlySaving);
}

// ─── Protein value ────────────────────────────────────────────────────────────

const PROTEIN_FOODS: FoodId[] = [
  'soyaChunks', 'peanuts', 'sattu', 'roastedChana', 'kalaChana', 'moongWhole', 'moongDal', 'toorDal', 'rajma',
  'besan', 'atta', 'oats', 'egg', 'milk', 'curd', 'paneer', 'chicken', 'fish', 'pumpkinSeeds', 'almonds',
];

export interface ProteinValue {
  food: FoodId;
  name: string;
  /** Grams (or ml) of the food needed for 20 g of protein. */
  gramsFor20g: number;
  costFor20g: number;
  kcalFor20g: number;
  fiberFor20g: number;
}

export const PROTEIN_VALUE: ProteinValue[] = PROTEIN_FOODS.map((food) => {
  const f = FOODS[food];
  const g = (20 / f.per100.protein) * 100;
  return {
    food,
    name: f.name,
    gramsFor20g: g,
    costFor20g: (f.pricePerKg * g) / 1000,
    kcalFor20g: (f.per100.kcal * g) / 100,
    fiberFor20g: (f.per100.fiber * g) / 100,
  };
}).sort((a, b) => a.costFor20g - b.costFor20g);
