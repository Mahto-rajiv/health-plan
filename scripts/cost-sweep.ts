// Cost against nutrient gaps: runs the solver (scripts/solve-plans.ts) at several
// monthly cost ceilings and writes docs/cost-sweep.md, so you can see where extra
// spending stops buying nutrition. Doesn't change the app's quantities.
// Run: npm run solve:sweep   (CAPS=4500,5000,5500,6000 TL=180 by default)
import { writeFileSync } from 'node:fs';
import { solveAll, shortfalls } from './solve-plans';
import { PHASE_IDS } from '../lib/config';

const CAPS = (process.env.CAPS ?? '4500,5000,5500,6000').split(',').map(Number);
process.env.TL ??= '180';

async function main() {
  const lines = [
    '# Cost against nutrient gaps',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run solve:sweep\` (HiGHS, ${process.env.TL} s per phase, default prices). ` +
      'Each row: the solver with that monthly ceiling. Nutrient gaps are priced far above cost (scripts/solve-plans.ts), so the solver closes as much of them as the hard rules and the ceiling allow and only then saves money; the cost shown is what the plan actually costs (it can be well under the ceiling). The solver stops at a time limit, so it is close to, not proven at, the optimum: differences of one variant between rows can be search noise.',
    '',
    'Counts are over the 3 plans per phase (weekly averages). "★" = iron, zinc, riboflavin, folate, B12, vitamins A and E, selenium (biotin is not planned: 7 foods have no biotin data).',
    '',
    '| Ceiling ₹ | Phase | Cost ₹/month (min–max) | Below EAR (variants: nutrients) | ★ nutrients below RDA/AI | Other nutrients below RDA/AI |',
    '|---|---|---|---|---|---|',
  ];
  for (const cap of CAPS) {
    let res;
    try {
      res = await solveAll(cap);
    } catch (e) {
      console.log(`₹${cap}: ${(e as Error).message}`);
      lines.push(`| ${cap.toLocaleString('en-IN')} | — | **no plan possible** at this ceiling (${(e as Error).message}) | | | |`);
      continue;
    }
    for (const ph of PHASE_IDS) {
      const plans = res.results[ph].plans;
      const costs = plans.map((p) => p.monthlyCost);
      const tally = (pick: (s: ReturnType<typeof shortfalls>[number]) => boolean) => {
        const m = new Map<string, number>();
        for (const p of plans) for (const s of shortfalls(p.weekly)) if (pick(s)) m.set(s.label, (m.get(s.label) ?? 0) + 1);
        return [...m].map(([k, n]) => `${k} ${n}`).join(', ') || '—';
      };

      lines.push(
        `| ${cap.toLocaleString('en-IN')} | ${ph} | ${Math.round(Math.min(...costs)).toLocaleString('en-IN')}–${Math.round(Math.max(...costs)).toLocaleString('en-IN')} | ${tally((s) => s.belowEar)} | ${tally((s) => s.rdaTarget && s.belowTop)} | ${tally((s) => !s.rdaTarget && s.belowTop)} |`,
      );
    }
  }
  lines.push('');
  writeFileSync('docs/cost-sweep.md', lines.join('\n'));
  console.log(lines.join('\n'));
}

main();
