import { MEAL_PLAN_DEFINITIONS, buildWeek } from '../lib/data/meal-plans';
import { itemsNutrients, itemsCost } from '../lib/nutrition';

for (const plan of MEAL_PLAN_DEFINITIONS) {
  const week = buildWeek(plan);
  console.log(`\n=== ${plan.name}`);
  let wk = 0;
  for (const d of week) {
    const items = d.meals.flatMap((pm) => pm.meal.items);
    const nu = itemsNutrients(items);
    const cost = itemsCost(items);
    wk += cost;
    const per = d.meals.map((pm) => { const x = itemsNutrients(pm.meal.items); return `${Math.round(x.kcal)}/${Math.round(x.protein)}`; }).join(' ');
    console.log(`${d.day.slice(0,3)} kcal ${Math.round(nu.kcal)} P ${Math.round(nu.protein)} C ${Math.round(nu.carbs)} F ${Math.round(nu.fat)} Fib ${Math.round(nu.fiber)} Fe ${Math.round(nu.iron)} Ca ${Math.round(nu.calcium)} Zn ${nu.zinc.toFixed(1)} VC ${Math.round(nu.vitC)} ₹${Math.round(cost)} | ${per}`);
  }
  console.log(`week ₹${Math.round(wk)} month ₹${Math.round(wk*30/7)}`);
}
