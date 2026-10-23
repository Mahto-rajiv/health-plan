// Checks the hard rules of the meal plans. Run: npm run validate
import { MEAL_PLAN_DEFINITIONS, WEEKDAYS, buildWeek, type Meal } from '../lib/data/meal-plans';
import { FOODS, type FoodId } from '../lib/data/foods';
import { itemsNutrients } from '../lib/nutrition';
import { PLANS, BUDGET_MAX, storageAdvice } from '../lib/meal-plans';
import { PANTRY_MONTHLY } from '../lib/data/nutrition-guide';
import { COOKING_TUTORIALS, EXERCISE_TUTORIALS } from '../lib/data/tutorials';
import { SESSIONS, CARDIO, MOBILITY } from '../lib/data/training';

const failures = new Set<string>();
const warnings: string[] = [];
const check = (ok: boolean, msg: string) => ok || failures.add(msg);

// Compares meals by content, so two different objects with the same food still count as identical.
const fingerprint = (m: Meal) => JSON.stringify({ title: m.title, items: m.items, prep: m.prep });

// WHO: at least 400 g of fruit and vegetables a day, not counting starchy roots such as sweet potato.
const FRUIT_VEG: FoodId[] = ['mixedVeg', 'salad', 'spinach', 'beetroot', 'papaya', 'guava', 'seasonalFruit', 'banana'];
const WEEKDAY_MAX_MINUTES = 60;

// A meal's title must not name a food that isn't in it (e.g. "roasted chana" with no chana).
const TITLE_FOODS: [RegExp, FoodId[]][] = [
  [/paneer/i, ['paneer']],
  [/\begg|omelette/i, ['egg']],
  [/chicken/i, ['chicken']],
  [/fish/i, ['fish']],
  [/soya/i, ['soyaChunks']],
  [/rajma/i, ['rajma']],
  [/chole/i, ['kabuliChana']],
  [/kala chana/i, ['kalaChana']],
  [/roasted chana/i, ['roastedChana']],
  [/moong/i, ['moongWhole', 'moongDal']],
  [/toor/i, ['toorDal']],
  [/sattu/i, ['sattu']],
  [/oats/i, ['oats']],
  [/poha/i, ['poha']],
  [/besan/i, ['besan']],
  [/curd|raita|chaas/i, ['curd']],
  [/milk/i, ['milk']],
  [/sweet potato/i, ['sweetPotato']],
  [/papaya/i, ['papaya']],
  [/beetroot/i, ['beetroot']],
  [/peanut/i, ['peanuts']],
  [/dates/i, ['dates']],
  [/banana/i, ['banana']],
  [/palak/i, ['spinach']],
  [/roti|paratha/i, ['atta']],
  [/rice|pulao|khichdi/i, ['rice']],
  [/salad/i, ['salad']],
  [/\bnuts\b/i, ['almonds', 'walnuts', 'cashews', 'peanuts']],
  [/fruit/i, ['seasonalFruit', 'papaya', 'banana', 'guava']],
];

for (const def of MEAL_PLAN_DEFINITIONS) {
  const week = buildWeek(def);
  check(week.length === 7, `${def.id}: 7 days`);
  const meal1 = new Set(week.map((d) => fingerprint(d.meals[0].meal)));
  check(meal1.size === 1, `${def.id}: Meal 1 differs between days`);
  const meal3 = new Set(week.filter((d) => WEEKDAYS.includes(d.day)).map((d) => fingerprint(d.meals[2].meal)));
  check(meal3.size === 1, `${def.id}: Meal 3 differs between Mon–Fri`);
  // Saturday and Sunday Meal 3 are free: they may differ from the weekday one and from each other.
  for (const d of week.filter((x) => x.isWeekend)) check(d.meals[2].tag !== 'fixed-weekday', `${def.id} ${d.day}: weekend Meal 3 is tagged as the weekday meal`);

  for (const d of week) {
    check(d.meals.length === 4, `${def.id} ${d.day}: exactly 4 meals`);
    check(d.meals.map((m) => m.slot).join() === '1,2,3,4', `${def.id} ${d.day}: slots are not 1–4 in order`);
    const n = itemsNutrients(d.meals.flatMap((m) => m.meal.items));
    check(n.kcal >= 2500 && n.kcal <= 2900, `${def.id} ${d.day}: kcal ${Math.round(n.kcal)} outside 2,500–2,900`);
    check(n.protein >= 110 && n.protein <= 145, `${def.id} ${d.day}: protein ${Math.round(n.protein)} outside 110–145 g`);
    check(n.fat <= 100, `${def.id} ${d.day}: fat ${Math.round(n.fat)} > 100 g`);
    check(n.fiber >= 30, `${def.id} ${d.day}: fibre ${Math.round(n.fiber)} < 30 g`);
    const fv = d.meals.flatMap((m) => m.meal.items).filter((i) => FRUIT_VEG.includes(i.food)).reduce((s, i) => s + i.g, 0);
    check(fv >= 400, `${def.id} ${d.day}: fruit and vegetables ${fv} g < 400 g`);
    if (!d.isWeekend) {
      check(!!d.meals[1].meal.packable, `${def.id} ${d.day}: office lunch ${d.meals[1].meal.id} is not packable`);
      check(!!d.meals[2].meal.packable, `${def.id} ${d.day}: office Meal 3 ${d.meals[2].meal.id} is not packable`);
      for (const pm of d.meals.slice(1, 3)) check(storageAdvice(pm).length > 0, `${def.id} ${d.day}: office meal ${pm.meal.id} has no storage advice`);
    }
    for (const pm of d.meals) {
      check(pm.meal.items.length > 0 && pm.meal.prep.length > 20, `${pm.meal.id}: missing ingredients or preparation`);
      check(pm.meal.minutes > 0, `${pm.meal.id}: no hands-on time`);
      for (const it of pm.meal.items) {
        check(it.g > 0, `${pm.meal.id}: ${it.food} has no quantity`);
        const f = FOODS[it.food] as { isEgg?: boolean; isMeatOrFish?: boolean };
        if (def.id === 'preferred' || def.id === 'vegetarian') check(!f.isEgg && !f.isMeatOrFish, `${def.id}: ${pm.meal.id} contains ${it.food}`);
        if (def.id === 'egg') check(!f.isMeatOrFish, `${def.id}: ${pm.meal.id} contains ${it.food}`);
      }
      const foods = new Set(pm.meal.items.map((i) => i.food));
      for (const [re, ids] of TITLE_FOODS) {
        if (re.test(pm.meal.title)) check(ids.some((id) => foods.has(id)), `${pm.meal.id}: title "${pm.meal.title}" names a food (${re.source}) it doesn't contain`);
      }
      for (const t of pm.meal.tutorials ?? []) check(t in COOKING_TUTORIALS, `${pm.meal.id}: unknown tutorial ${t}`);
    }
  }
}

for (const s of Object.values(SESSIONS)) for (const ex of s.exercises) for (const t of ex.tutorials ?? []) check(t in EXERCISE_TUTORIALS, `${ex.id}: unknown tutorial ${t}`);
for (const t of CARDIO.tutorials) check(t in EXERCISE_TUTORIALS, `cardio: unknown tutorial ${t}`);
for (const g of MOBILITY) for (const it of g.items) for (const t of it.tutorials ?? []) check(t in EXERCISE_TUTORIALS, `${it.name}: unknown tutorial ${t}`);

for (const p of PLANS) {
  const weekdayMinutes = Math.max(...p.days.filter((d) => !d.isWeekend).map((d) => d.activeMinutes));
  check(weekdayMinutes <= WEEKDAY_MAX_MINUTES, `${p.def.id}: ${weekdayMinutes} min hands-on cooking on a weekday (limit ${WEEKDAY_MAX_MINUTES})`);
  const ingredients = p.grocery.reduce((s, g) => s + g.lines.length, 0);
  const groceryWeekly = p.grocery.flatMap((g) => g.lines).reduce((s, l) => s + l.weeklyCost, 0);
  check(Math.abs(groceryWeekly - p.weeklyFoodCost) < 0.5, `${p.def.id}: grocery list cost ₹${groceryWeekly.toFixed(0)} ≠ meal cost ₹${p.weeklyFoodCost.toFixed(0)}`);
  check(Math.abs(p.monthlyCost - ((p.weeklyFoodCost * 30) / 7 + PANTRY_MONTHLY)) < 0.5, `${p.def.id}: monthly cost is not weekly × 30/7 + pantry`);
  check(p.eggsPerWeek <= 21, `${p.def.id}: ${p.eggsPerWeek} eggs/week is above the 3-a-day limit the plans use`);
  if (p.monthlyCost > BUDGET_MAX) warnings.push(`${p.def.shortName}: ≈ ₹${Math.round(p.monthlyCost)}/month, ₹${Math.round(p.monthlyCost - BUDGET_MAX)} over the ₹${BUDGET_MAX} budget (shown on the site with costed swaps)`);
  console.log(
    `${p.def.shortName.padEnd(11)} kcal ${Math.round(p.ranges.kcal[0])}–${Math.round(p.ranges.kcal[1])} (avg ${Math.round(p.weeklyAverage.kcal)})  protein ${Math.round(p.ranges.protein[0])}–${Math.round(p.ranges.protein[1])} g  fibre ${Math.round(p.ranges.fiber[0])}–${Math.round(p.ranges.fiber[1])} g  eggs ${p.eggsPerWeek}/wk  ≈ ₹${Math.round(p.monthlyCost)}/month  ${ingredients} ingredients  ≤ ${weekdayMinutes} min/weekday`,
  );
}
if (warnings.length) console.warn(`\nBudget:\n- ${warnings.join('\n- ')}`);
if (failures.size) {
  console.error(`\n${failures.size} rule violation(s):\n- ${[...failures].join('\n- ')}`);
  process.exit(1);
}
console.log('\nAll meal-plan rules pass.');
