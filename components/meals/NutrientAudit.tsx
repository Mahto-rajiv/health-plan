import { FOODS } from '@/lib/data/foods';
import { NOT_COMPUTED, NUTRIENTS } from '@/lib/data/nutrients';
import { auditPlan, fmtAmount, STATUS_LABEL, type AuditStatus } from '@/lib/nutrient-audit';
import type { ComputedPlan } from '@/lib/meal-plans';
import { SEASONS } from '@/lib/data/seasons';
import { cn } from '@/lib/utils';
import { References } from '@/components/References';

const TONE: Record<AuditStatus, string> = {
  'below-ear': 'text-rose-700',
  'below-rda': 'text-amber-700',
  meets: 'text-emerald-700',
  'above-ul': 'text-rose-700',
  info: 'text-muted',
};

/** Every vitamin and mineral the food table covers, for one plan, phase and season. */
export function NutrientAudit({ plan }: { plan: ComputedPlan }) {
  const rows = auditPlan(plan);
  const groups = ['Minerals', 'Vitamins', 'Fats'] as const;
  const below = rows.filter((r) => r.status === 'below-ear');
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Weekly average per day for {plan.def.shortName}, {SEASONS[plan.season].name.toLowerCase()}, Phase {plan.phase}.{' '}
        <strong>Average need</strong> (EAR) is what ICMR says to plan a diet around; the <strong>RDA</strong> covers almost everyone. ★ marks
        nutrients linked to hair loss when you are deficient. Getting enough prevents a deficiency; more than enough doesn’t grow hair.
      </p>
      {below.length > 0 && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Below the average need this week: {below.map((r) => r.info.label).join(', ')}. See the note under the table.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="py-1.5 pr-2 font-medium">Nutrient</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">Per day</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">Lowest day</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">Average need · RDA</th>
              <th scope="col" className="py-1.5 pl-2 font-medium">Main sources</th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g} className="divide-y divide-line">
              <tr>
                <th colSpan={5} scope="colgroup" className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {g}
                </th>
              </tr>
              {rows
                .filter((r) => r.info.group === g)
                .map((r) => (
                  <tr key={r.info.key} className="align-top">
                    <th scope="row" className="py-1.5 pr-2 font-normal text-ink">
                      {r.info.label}
                      {r.info.hair && <span title="Linked to hair loss when deficient"> ★</span>}
                      {r.missing.length > 0 && (
                        <span className="block text-[11px] text-amber-700">
                          No data for {r.missing.map((f) => FOODS[f].name.split(' (')[0].toLowerCase()).join(', ')}: total may be low
                        </span>
                      )}
                    </th>
                    <td className={cn('px-2 py-1.5 text-right font-semibold', TONE[r.status])}>
                      {fmtAmount(r.value)} {r.info.unit}
                      <span className="block text-[11px] font-normal">{STATUS_LABEL[r.status]}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-ink-2">{fmtAmount(r.lowestDay)}</td>
                    <td className="px-2 py-1.5 text-right text-ink-2">
                      {r.info.ear ? fmtAmount(r.info.ear) : '—'} · {r.info.rda ? `${fmtAmount(r.info.rda)}${r.info.adequateIntake ? ' (AI)' : ''}` : '—'}
                      {r.info.ul && <span className="block text-[11px] text-muted">limit {fmtAmount(r.info.ul)}</span>}
                    </td>
                    <td className="py-1.5 pl-2 text-xs text-ink-2">
                      {r.topSources.map((s) => `${s.name.split(' (')[0]} ${Math.round(s.share * 100)}%`).join(', ')}
                      {r.info.note && <span className="mt-0.5 block text-muted">{r.info.note}</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
      <div className="text-xs text-muted">
        <p className="font-medium text-ink-2">Not counted from food</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {NOT_COMPUTED.map((n) => (
            <li key={n.label}>
              <strong>{n.label}:</strong> {n.why}
            </li>
          ))}
          <li>
            Values are for raw food from the Indian Food Composition Tables 2017 (ICMR-NIN), or USDA SR28 where IFCT has no match. Cooking
            lowers vitamin C, folate and some B vitamins, so real intake of those is somewhat lower than shown. Weekly averages are used because
            the body stores most of these; the lowest single day is shown so you can see how much the days vary.
          </li>
          {below.length > 0 && (
            <li>
              Where a nutrient stays below the average need, it is because the phase’s calorie and fibre limits leave no room for more of the
              foods that supply it (the solver already tried). Compare phases and seasons with the selectors above; the Health page lists
              every case.
            </li>
          )}
        </ul>
      </div>
      <References ids={[...new Set(NUTRIENTS.flatMap((n) => n.source)), 'ifct', 'ifct2017pkg', 'almohanna', 'guoKatta']} />
    </div>
  );
}
