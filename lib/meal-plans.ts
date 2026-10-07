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

function formatAmount(food: FoodId, grams: number): string {
  if (food === 'egg') return `${Math.round(grams / 50)} eggs`;
  if (food === 'milk') return `${(grams / 1000).toFixed(1)} L`;
  if (food === 'curd') return `${(grams / 1000).toFixed(1)} L milk (set as curd)`;
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
