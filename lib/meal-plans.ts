import { FOODS, type FoodId, type GroceryCategory, type Nutrients } from './data/foods';
import { MEAL_PLAN_DEFINITIONS, buildWeek, type PlanId, type PlannedDay, type PlannedMeal, type MealPlanDefinition } from './data/meal-plans';
import { SEASON_IDS, type SeasonId } from './data/seasons';
import type { NutrientKey } from './data/nutrient-keys';
import { DEFAULT_PRICE_TABLE, type PriceTable } from './data/prices';
import { FOOD_SAFETY, PANTRY_MONTHLY } from './data/nutrition-guide';
import { PHASE_IDS, type PhaseId } from './config';
import { boughtGrams, itemCost, itemsCost, itemsNutrients, missingNutrients, sumNutrients } from './nutrition';

// Everything here is computed from the plan definitions and a price table, so
// totals can never drift from the foods listed or the prices in Settings.

export interface ComputedDay extends PlannedDay {
  totals: Nutrients;
  cost: number;
  mealTotals: Nutrients[];
  mealCosts: number[];
  /** Hands-on cooking minutes that day (all meals, whenever they are cooked). */
  activeMinutes: number;
  /** Hands-on minutes on the morning itself, before leaving (weekdays): Meal 1 plus packing. */
  morningMinutes: number;
}

export interface GroceryLine {
  food: FoodId;
  name: string;
  category: GroceryCategory;
  /** As bought: includes peel, seeds and trimmings for produce. */
  weeklyGrams: number;
  buy: string;
  pack: string;
  weeklyCost: number;
}

export interface ComputedPlan {
  def: MealPlanDefinition;
  phase: PhaseId;
  season: SeasonId;
  days: ComputedDay[];
  weeklyAverage: Nutrients;
  /** Nutrients for which some food in the week has no value in its source table (so the total may be low). */
  missing: Partial<Record<NutrientKey, FoodId[]>>;
  /** Milk and curd per day, weekly average (g). */
  dairyPerDay: number;
  ranges: Record<'kcal' | 'protein' | 'fiber', [number, number]>;
  weeklyFoodCost: number;
  monthlyCost: number;
  /** ₹ per 10 g of protein across the whole plan (food only, pantry excluded). */
  costPer10gProtein: number;
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
const DRY_FRUIT = new Set<FoodId>(['dates', 'raisins']);
const isPerishable = (food: FoodId) =>
  ['milk', 'curd', 'paneer', 'chicken', 'fish'].includes(food) ||
  ((FOODS[food].category === 'Fruit' || FOODS[food].category === 'Vegetables') && !DRY_FRUIT.has(food));

/** How many shop units a week needs, or how long one unit lasts — for low-waste buying. */
function packHint(food: FoodId, weeklyGrams: number): string {
  const unit = FOODS[food].buyUnit;
  const ratio = weeklyGrams / unit.grams;
  if (ratio >= 1) return `≈ ${Math.max(1, Math.round(ratio * 2) / 2)} × ${unit.label} a week`;
  if (food === 'paneer') return `1 × ${unit.label} covers ~${Math.floor(7 / ratio)} days — freeze the extra in portions`;
  if (isPerishable(food)) return 'buy fresh, 2–3 times a week';
  const weeks = Math.floor(1 / ratio);
  if (FOODS[food].category === 'Nuts & seeds' && weeks > 8) return `buy the smallest pack you can (1 × ${unit.label} would last ${weeks > 26 ? '6+ months' : `~${weeks} weeks`}) and keep it airtight in the fridge`;
  if (weeks > 26) return `1 × ${unit.label} lasts 6+ months`;
  return weeks >= 2 ? `1 × ${unit.label} lasts ~${weeks} weeks` : `1 × ${unit.label} lasts ~${Math.floor(7 / ratio)} days`;
}

function formatAmount(food: FoodId, grams: number): string {
  if (food === 'banana') return `${Math.round((grams / FOODS.banana.buyUnit.grams) * 12)} bananas`;
  if (food === 'egg') return `${Math.round(grams / 50)} eggs`;
  if (food === 'milk') return `${(grams / 1000).toFixed(1)} L`;
  if (food === 'curd') return `${(grams / 1000).toFixed(1)} L milk`;
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${Math.round(grams / 10) * 10} g`;
}

export const mealMinutes = (pm: PlannedMeal) => pm.meal.activeMin;

/** Minutes of hands-on work on the morning before leaving: Meal 1, plus packing the office meals. */
export function morningMinutes(day: PlannedDay): number {
  if (day.isWeekend) return day.meals[0].meal.activeMin;
  const [m1, m2, m3] = day.meals;
  const office = (pm: PlannedMeal) => (pm.meal.madeWhen === 'morning' || pm.meal.madeWhen === 'night-before' ? (pm.meal.morningMin ?? pm.meal.activeMin) : 0);
  return m1.meal.activeMin + office(m2) + office(m3);
}

/** Storage and food-safety advice for a planned meal. */
export function storageAdvice(pm: PlannedMeal): string[] {
  const out = pm.meal.keeps ? [pm.meal.keeps] : [];
  if (pm.tag === 'office-lunch') out.push(FOOD_SAFETY.coldLunch);
  return out;
}

export function computePlan(def: MealPlanDefinition, phase: PhaseId, season: SeasonId, prices: PriceTable = DEFAULT_PRICE_TABLE): ComputedPlan {
  const week = buildWeek(def, phase, season);
  const days: ComputedDay[] = week.map((d) => {
    const items = d.meals.flatMap((m) => m.meal.items);
    return {
      ...d,
      totals: itemsNutrients(items),
      cost: itemsCost(items, prices),
      mealTotals: d.meals.map((m) => itemsNutrients(m.meal.items)),
      mealCosts: d.meals.map((m) => itemsCost(m.meal.items, prices)),
      activeMinutes: d.meals.reduce((s, m) => s + mealMinutes(m), 0),
      morningMinutes: morningMinutes(d),
    };
  });

  const weekly = sumNutrients(days.map((d) => d.totals));
  const weeklyAverage = Object.fromEntries(Object.entries(weekly).map(([k, v]) => [k, v / 7])) as unknown as Nutrients;
  const range = (k: keyof Nutrients): [number, number] => [Math.min(...days.map((d) => d.totals[k])), Math.max(...days.map((d) => d.totals[k]))];

  const grams = new Map<FoodId, number>();
  for (const d of week) for (const pm of d.meals) for (const it of pm.meal.items) grams.set(it.food, (grams.get(it.food) ?? 0) + it.g);

  const lines: GroceryLine[] = [...grams.entries()].map(([food, g]) => {
    const f = FOODS[food];
    const bought = boughtGrams(food, g);
    return {
      food,
      name: f.name,
      category: f.category,
      weeklyGrams: bought,
      buy: formatAmount(food, bought),
      pack: packHint(food, bought),
      weeklyCost: itemCost({ food, g }, prices),
    };
  });
  const grocery = CATEGORY_ORDER.map((category) => ({
    category,
    lines: lines.filter((l) => l.category === category).sort((a, b) => b.weeklyCost - a.weeklyCost),
  })).filter((g) => g.lines.length);

  const weeklyFoodCost = days.reduce((s, d) => s + d.cost, 0);
  return {
    def,
    phase,
    season,
    days,
    weeklyAverage,
    missing: missingNutrients(week.flatMap((d) => d.meals.flatMap((m) => m.meal.items))),
    dairyPerDay: ((grams.get('milk') ?? 0) + (grams.get('curd') ?? 0)) / 7,
    ranges: { kcal: range('kcal'), protein: range('protein'), fiber: range('fiber') },
    weeklyFoodCost,
    monthlyCost: (weeklyFoodCost * 30) / 7 + PANTRY_MONTHLY,
    costPer10gProtein: (weeklyFoodCost / weekly.protein) * 10,
    grocery,
    eggsPerWeek: Math.round((grams.get('egg') ?? 0) / 50),
  };
}

/** All plans for one phase and season. */
export function computePlans(phase: PhaseId, season: SeasonId, prices: PriceTable = DEFAULT_PRICE_TABLE): ComputedPlan[] {
  return MEAL_PLAN_DEFINITIONS.map((def) => computePlan(def, phase, season, prices));
}

/** Every plan × phase × season at default prices (36). Computed on demand so client bundles don't pay for it at load. */
export function allDefaultPlans(): ComputedPlan[] {
  return PHASE_IDS.flatMap((ph) => SEASON_IDS.flatMap((s) => computePlans(ph, s)));
}

export function findPlan(plans: ComputedPlan[], id: PlanId): ComputedPlan {
  return plans.find((p) => p.def.id === id) ?? plans[0];
}

// ─── Budget swaps ─────────────────────────────────────────────────────────────
// Only shown when a plan is over the budget ceiling (BUDGET.max) (e.g. after you enter higher
// prices). There is no lower target, so the plans don't push you to swap.

interface SwapRule {
  id: string;
  label: string;
  note: string;
  from: FoodId[];
  /** Replacement per gram of the original food. */
  to: { food: FoodId; perGram: number }[];
  /** Share of the original grams that is swapped (0.5 = half of it). */
  share: number;
  /** Phases where the swap would break a phase cap. */
  notInPhases?: PhaseId[];
}

// Protein-matched where the food is a main protein source, weight-matched otherwise.
const SWAP_RULES: SwapRule[] = [
  {
    id: 'paneer-soya',
    label: 'Replace half the paneer with soya chunks',
    note: 'Protein-matched (100 g paneer ≈ 36 g dry soya + 1 tsp ghee). Not offered in Phase 0, where soya is capped at 20 g a day.',
    from: ['paneer'],
    to: [
      { food: 'soyaChunks', perGram: 0.36 },
      { food: 'ghee', perGram: 0.05 },
    ],
    share: 0.5,
    notInPhases: [0],
  },
  {
    id: 'oats-daliya',
    label: 'Use daliya (broken wheat) instead of oats',
    note: 'Same dry weight, similar protein and fibre. It needs ~15 minutes, so cook 2 days’ worth at once (Meal 1 then takes more than 10 minutes on the cooking day).',
    from: ['oats'],
    to: [{ food: 'daliya', perGram: 1 }],
    share: 1,
  },
  {
    id: 'chicken-soya',
    label: 'Replace half the chicken with soya chunks',
    note: 'Protein-matched (100 g raw chicken ≈ 43 g dry soya). Cook it in the same masala.',
    from: ['chicken'],
    to: [{ food: 'soyaChunks', perGram: 0.43 }],
    share: 0.5,
    notInPhases: [0],
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

/** Savings are computed from the plan's actual weekly quantities and the current prices. */
export function budgetSwaps(plan: ComputedPlan, prices: PriceTable = DEFAULT_PRICE_TABLE): BudgetSwap[] {
  const items = plan.days.flatMap((d) => d.meals.flatMap((m) => m.meal.items));
  return SWAP_RULES.filter((rule) => !rule.notInPhases?.includes(plan.phase)).map((rule) => {
    const original = items.filter((it) => rule.from.includes(it.food));
    const replacement = original.flatMap((it) => rule.to.map((t) => ({ food: t.food, g: it.g * t.perGram })));
    const before = itemsNutrients(original);
    const after = itemsNutrients(replacement);
    const saving = (itemsCost(original, prices) - itemsCost(replacement, prices)) * rule.share;
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

// ─── Ingredient value ─────────────────────────────────────────────────────────

/** The ~15 main ingredients, with the serving the plans typically use. */
export const MAIN_INGREDIENTS: { food: FoodId; serving: number; label: string }[] = [
  { food: 'soyaChunks', serving: 30, label: '30 g dry' },
  { food: 'moongDal', serving: 40, label: '40 g dry' },
  { food: 'toorDal', serving: 40, label: '40 g dry' },
  { food: 'rajma', serving: 50, label: '50 g dry' },
  { food: 'kalaChana', serving: 50, label: '50 g dry' },
  { food: 'sattu', serving: 30, label: '30 g' },
  { food: 'besan', serving: 70, label: '70 g (2 chillas)' },
  { food: 'peanuts', serving: 15, label: '15 g' },
  { food: 'atta', serving: 70, label: '70 g (2 rotis)' },
  { food: 'oats', serving: 60, label: '60 g dry' },
  { food: 'rice', serving: 100, label: '100 g raw' },
  { food: 'milk', serving: 250, label: '250 ml' },
  { food: 'curd', serving: 150, label: '150 g' },
  { food: 'paneer', serving: 80, label: '80 g' },
  { food: 'egg', serving: 100, label: '2 eggs' },
  { food: 'chicken', serving: 100, label: '100 g raw, edible' },
  { food: 'fish', serving: 100, label: '100 g raw, edible' },
];

export interface IngredientValue {
  food: FoodId;
  name: string;
  serving: string;
  costPerServing: number;
  proteinPerServing: number;
  costPer10gProtein: number;
  kcalPer10gProtein: number;
  fiberPer10gProtein: number;
}

export function ingredientValues(prices: PriceTable = DEFAULT_PRICE_TABLE): IngredientValue[] {
  return MAIN_INGREDIENTS.map(({ food, serving, label }) => {
    const n = itemsNutrients([{ food, g: serving }]);
    const per10 = 10 / n.protein;
    return {
      food,
      name: FOODS[food].name,
      serving: label,
      costPerServing: itemCost({ food, g: serving }, prices),
      proteinPerServing: n.protein,
      costPer10gProtein: itemCost({ food, g: serving }, prices) * per10,
      kcalPer10gProtein: n.kcal * per10,
      fiberPer10gProtein: n.fiber * per10,
    };
  }).sort((a, b) => a.costPer10gProtein - b.costPer10gProtein);
}
