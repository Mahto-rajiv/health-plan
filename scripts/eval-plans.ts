// Summary of every plan × phase × season at default prices. Run: npm run plans:report
// Writes docs/plan-report.md (pasted into PROGRESS.md) and prints the same.
import { writeFileSync } from 'node:fs';
import { allDefaultPlans } from '../lib/meal-plans';
import { auditPlan, fmtAmount } from '../lib/nutrient-audit';
import { PHASES } from '../lib/config';
import { SEASONS } from '../lib/data/seasons';

const plans = allDefaultPlans();
const lines: string[] = [
  '# Plan report',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run plans:report\` at default prices. Per day: range across the 7 days; nutrients are weekly averages.`,
  '',
  '| Phase | Season | Plan | kcal | Protein g | Fibre g | Fat % | Milk+curd g/day | Morning min (weekdays) | ₹/month | Below EAR (weekly avg) |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
];
for (const p of plans) {
  const r = (k: 'kcal' | 'protein' | 'fiber') => `${Math.round(p.ranges[k][0])}–${Math.round(p.ranges[k][1])}`;
  const fat = p.days.map((d) => (d.totals.fat * 900) / d.totals.kcal);
  const morning = p.days.filter((d) => !d.isWeekend).map((d) => d.morningMinutes);
  const below = auditPlan(p)
    .filter((a) => a.status === 'below-ear')
    .map((a) => `${a.info.label} ${fmtAmount(a.value)}/${fmtAmount(a.info.ear!)} ${a.info.unit}`);
  lines.push(
    `| ${p.phase} | ${SEASONS[p.season].name} | ${p.def.shortName} | ${r('kcal')} | ${r('protein')} | ${r('fiber')} | ${Math.round(Math.min(...fat))}–${Math.round(Math.max(...fat))} | ${Math.round(p.dairyPerDay)} | ${Math.max(...morning)} | ${Math.round(p.monthlyCost).toLocaleString('en-IN')} | ${below.join('; ') || '—'} |`,
  );
}
lines.push('', `Phase bands: ${[0, 1, 2].map((ph) => `${ph}: ${PHASES[ph as 0].kcal.join('–')} kcal, ${PHASES[ph as 0].protein.map(Math.round).join('–')} g protein, fibre ≤ ${PHASES[ph as 0].fibreMax} g`).join(' · ')}.`, '');
writeFileSync('docs/plan-report.md', lines.join('\n'));
console.log(lines.join('\n'));
