// Summary of every plan × phase at default prices. Run: npm run plans:report
// Writes docs/plan-report.md (pasted into PROGRESS.md) and prints the same.
import { writeFileSync } from 'node:fs';
import { allDefaultPlans } from '../lib/meal-plans';
import { auditPlan, fatLimits, fmtAmount } from '../lib/nutrient-audit';
import { PHASES } from '../lib/config';
import { FOODS } from '../lib/data/foods';

const plans = allDefaultPlans();
const lines: string[] = [
  '# Plan report',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run plans:report\` at default prices. Per day: range across the 7 days; nutrients are weekly averages.`,
  '',
  '| Phase | Plan | kcal | Protein g | Fibre g | Fat % | Sat fat % (avg, max day) | Milk+curd g/day | Dairy % of protein | Morning min (weekdays) | ₹/month | Below EAR (weekly avg) | ★ below RDA/AI |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
];
for (const p of plans) {
  const r = (k: 'kcal' | 'protein' | 'fiber') => `${Math.round(p.ranges[k][0])}–${Math.round(p.ranges[k][1])}`;
  const fat = p.days.map((d) => (d.totals.fat * 900) / d.totals.kcal);
  const morning = p.days.filter((d) => !d.isWeekend).map((d) => d.morningMinutes);
  const audit = auditPlan(p);
  const below = audit.filter((a) => a.status === 'below-ear').map((a) => `${a.info.label} ${fmtAmount(a.value)}/${fmtAmount(a.info.ear!)} ${a.info.unit}`);
  const hair = audit
    .filter((a) => a.info.hair && a.info.key !== 'biotin' && (a.status === 'below-rda' || a.status === 'below-ai'))
    .map((a) => `${a.info.label} ${fmtAmount(a.value)}/${fmtAmount(a.info.rda!)} ${a.info.unit}`);
  let dairyProtein = 0;
  let protein = 0;
  for (const d of p.days)
    for (const pm of d.meals)
      for (const it of pm.meal.items) {
        const g = (FOODS[it.food].per100.protein ?? 0) * (it.g / 100);
        protein += g;
        if (it.food === 'milk' || it.food === 'curd' || it.food === 'paneer') dairyProtein += g;
      }
  lines.push(
    `| ${p.phase} | ${p.def.shortName} | ${r('kcal')} | ${r('protein')} | ${r('fiber')} | ${Math.round(Math.min(...fat))}–${Math.round(Math.max(...fat))} | ${fatLimits(p).satPct.toFixed(1)}, ${fatLimits(p).satPctMaxDay.toFixed(1)} | ${Math.round(p.dairyPerDay)} | ${Math.round((dairyProtein / protein) * 100)} | ${Math.max(...morning)} | ${Math.round(p.monthlyCost).toLocaleString('en-IN')} | ${below.join('; ') || '—'} | ${hair.join('; ') || '—'} |`,
  );
}
lines.push('', `Phase bands: ${[0, 1, 2].map((ph) => `${ph}: ${PHASES[ph as 0].kcal.join('–')} kcal, ${PHASES[ph as 0].protein.map(Math.round).join('–')} g protein, fibre ≤ ${PHASES[ph as 0].fibreMax} g`).join(' · ')}.`, '');
writeFileSync('docs/plan-report.md', lines.join('\n'));
console.log(lines.join('\n'));
