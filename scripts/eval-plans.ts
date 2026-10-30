// Day-by-day report for every plan and phase. Run: npm run plans:report
import { defaultPlans } from '../lib/meal-plans';

const DEFAULT_PLANS = defaultPlans();
import { PHASES, PHASE_IDS } from '../lib/config';

for (const ph of PHASE_IDS) {
  console.log(`\n##### ${PHASES[ph].name} — kcal ${PHASES[ph].kcal.join('–')}, protein ${PHASES[ph].protein.map(Math.round).join('–')} g, fibre ≤ ${PHASES[ph].fibreMax} g`);
  for (const plan of DEFAULT_PLANS[ph]) {
    console.log(`\n=== ${plan.def.name}`);
    for (const d of plan.days) {
      const n = d.totals;
      const per = d.mealTotals.map((x) => `${Math.round(x.kcal)}/${Math.round(x.protein)}`).join(' ');
      console.log(
        `${d.day.slice(0, 3)} kcal ${Math.round(n.kcal)} P ${Math.round(n.protein)} C ${Math.round(n.carbs)} F ${Math.round(n.fat)} (${Math.round((n.fat * 900) / n.kcal)}%) Fib ${Math.round(n.fiber)} Fe ${n.iron.toFixed(1)} Ca ${Math.round(n.calcium)} Zn ${n.zinc.toFixed(1)} VC ${Math.round(n.vitC)} B12 ${n.b12.toFixed(1)} ₹${Math.round(d.cost)} | ${per}`,
      );
    }
    console.log(`month ≈ ₹${Math.round(plan.monthlyCost)} · ₹${plan.costPer10gProtein.toFixed(1)} per 10 g protein · ${plan.eggsPerWeek} eggs/week`);
  }
}
