// Checks the hard rules of the meal plans. Run: npm run validate
import { MEAL_PLAN_DEFINITIONS, WEEKDAYS, buildWeek } from '../lib/data/meal-plans';
import { FOODS } from '../lib/data/foods';
import { itemsNutrients } from '../lib/nutrition';
import { PLANS } from '../lib/meal-plans';
import { COOKING_TUTORIALS } from '../lib/data/tutorials';

const failures: string[] = [];
const check = (ok: boolean, msg: string) => ok || failures.push(msg);

for (const def of MEAL_PLAN_DEFINITIONS) {
  const week = buildWeek(def);
  check(week.length === 7, `${def.id}: 7 days`);
  for (const d of week) {
    check(d.meals.length === 4, `${def.id} ${d.day}: exactly 4 meals`);
    check(d.meals[0].meal === def.meal1, `${def.id} ${d.day}: Meal 1 is the fixed meal`);
    const n = itemsNutrients(d.meals.flatMap((m) => m.meal.items));
    check(n.kcal >= 2500 && n.kcal <= 2900, `${def.id} ${d.day}: kcal ${Math.round(n.kcal)} outside 2,500–2,900`);
    check(n.protein >= 110 && n.protein <= 145, `${def.id} ${d.day}: protein ${Math.round(n.protein)} outside 110–145 g`);
    check(n.fat <= 100, `${def.id} ${d.day}: fat ${Math.round(n.fat)} > 100 g`);
    for (const pm of d.meals) {
      for (const it of pm.meal.items) {
        const f = FOODS[it.food] as { isEgg?: boolean; isMeatOrFish?: boolean };
        if (def.id === 'preferred' || def.id === 'vegetarian') check(!f.isEgg && !f.isMeatOrFish, `${def.id}: ${pm.meal.id} contains ${it.food}`);
        if (def.id === 'egg') check(!f.isMeatOrFish, `${def.id}: ${pm.meal.id} contains ${it.food}`);
      }
      for (const t of pm.meal.tutorials ?? []) check(t in COOKING_TUTORIALS, `${pm.meal.id}: unknown tutorial ${t}`);
    }
  }
  const weekdayMeal3 = week.filter((d) => WEEKDAYS.includes(d.day)).map((d) => d.meals[2].meal);
  check(weekdayMeal3.every((m) => m === def.weekdayMeal3), `${def.id}: Meal 3 identical Mon–Fri`);
}

for (const p of PLANS) {
  console.log(
    `${p.def.shortName.padEnd(11)} kcal ${Math.round(p.ranges.kcal[0])}–${Math.round(p.ranges.kcal[1])}  protein ${Math.round(p.ranges.protein[0])}–${Math.round(p.ranges.protein[1])} g  fibre ${Math.round(p.ranges.fiber[0])}–${Math.round(p.ranges.fiber[1])} g  ≈ ₹${Math.round(p.monthlyCost)}/month`,
  );
}
if (failures.length) {
  console.error(`\n${failures.length} rule violation(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAll meal-plan rules pass.');
