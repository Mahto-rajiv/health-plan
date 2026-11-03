import { FOODS } from '@/lib/data/foods';
import { NOT_COMPUTED, NUTRIENTS } from '@/lib/data/nutrients';
import { auditPlan, fatLimits, fmtAmount, STATUS_LABEL, type AuditStatus } from '@/lib/nutrient-audit';
import type { ComputedPlan } from '@/lib/meal-plans';
import { cn } from '@/lib/utils';
import { References } from '@/components/References';

const TONE: Record<AuditStatus, string> = {
  'below-ear': 'text-rose-700',
  'below-rda': 'text-amber-700',
  'below-ai': 'text-amber-700',
  meets: 'text-emerald-700',
  'above-ul': 'text-rose-700',
  info: 'text-muted',
};

/** Every vitamin and mineral the food table covers, for one plan and phase. */
export function NutrientAudit({ plan }: { plan: ComputedPlan }) {
  const rows = auditPlan(plan);
  const groups = ['Minerals', 'Vitamins', 'Fats'] as const;
  const below = rows.filter((r) => r.status === 'below-ear');
  const starShort = rows.filter((r) => r.info.rdaTarget && (r.status === 'below-rda' || r.status === 'below-ai') && r.info.key !== 'biotin');
  const fat = fatLimits(plan);
  const satOver = fat.satPctMaxDay >= fat.satLimitPct;
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Weekly average per day for {plan.def.shortName}, Phase {plan.phase}. ★ marks nutrients the plan aims to meet at the RDA (or AI),
        not just the average need.
      </p>
      <details className="rounded-lg border border-line px-3 py-2 text-sm text-ink-2">
        <summary className="cursor-pointer font-medium text-ink">Which number the plan aims for, and why</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Average need (EAR)</strong>: enough for half of healthy people. <strong>RDA</strong>: enough for almost everyone.{' '}
            <strong>AI</strong> (adequate intake): used where there isn’t enough data for an average need, so these nutrients have no EAR.
          </li>
          <li>
            ICMR (India, 2020) says to plan a diet to the EAR. The US/Canadian framework (IOM 2003) says to plan one person’s diet to the RDA
            or AI. This plan is for one person, so it aims for the <strong>RDA (or AI) for the ★ nutrients</strong>, at least the EAR
            for the rest, and never above an upper limit.
          </li>
          <li>The bold number in the last-but-one column is what the plan aims for.</li>
        </ul>
      </details>
      {(below.length > 0 || starShort.length > 0) && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
          <p className="font-medium">Known gaps in this plan</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {below.length > 0 && <li>Below the average need: {below.map((r) => r.info.label).join(', ')}.</li>}
            {starShort.length > 0 && <li>★ below the RDA/AI it aims for: {starShort.map((r) => r.info.label).join(', ')}.</li>}
          </ul>
          <p className="mt-1 text-xs">Why, and what to do: see the notes under the table.</p>
        </div>
      )}
      <div className={`rounded-lg px-3 py-2 text-sm ${satOver ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-ink-2'}`}>
        <p className="font-medium text-ink">Fat limits (share of energy)</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>
            Saturated fat: {fat.satPct.toFixed(1)}% on average, {fat.satPctMaxDay.toFixed(1)}% on the highest day. Limit: under {fat.satLimitPct}% every day (WHO 2023).
          </li>
          <li>
            Trans fat: at least {fat.transPct.toFixed(2)}%. Limit: under {fat.transLimitPct}%.
            {fat.tfaMissing.length > 0 && <> The food tables have no trans-fat value for {fat.tfaMissing.map((f) => FOODS[f].name.toLowerCase()).join(', ')}, so the real figure is a little higher.</>}
          </li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="py-1.5 pr-2 font-medium">Nutrient</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">Per day</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">Lowest day</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">EAR · RDA or AI</th>
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
                      {r.info.rdaTarget && <span title="Planned to the RDA (or AI)"> ★</span>}
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
                      <span className={cn(!r.info.rdaTarget && r.info.ear && 'font-semibold text-ink')}>{r.info.ear ? fmtAmount(r.info.ear) : '—'}</span> ·{' '}
                      <span className={cn((r.info.rdaTarget || !r.info.ear) && !r.info.infoOnly && 'font-semibold text-ink')}>
                        {r.info.rda ? `${fmtAmount(r.info.rda)}${r.info.adequateIntake ? ' (AI)' : ''}` : '—'}
                      </span>
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
          {(below.length > 0 || starShort.length > 0) && (
            <li>
              Why gaps remain: the solver closes as much of every gap as the hard limits allow (the phase’s calorie, protein and fibre
              limits, the upper limits, the dairy and variety rules) and prices every 1% of an average need at ₹1,000 a month, so a gap below the average need is never a saving. The foods richest
              in B6, B1 and vitamin E per calorie are vegetables, seeds and nuts, and the fibre cap limits how much of them fits, most of all in
              Phase 0 (35 g). Phases 0 and 1 last two weeks each.
            </li>
          )}
          <li>Biotin isn’t planned: 7 foods (oats, soya chunks, oil, ghee, kabuli chana, pumpkin seeds, fish) have no biotin value in either table, so its total is too low by an unknown amount. Biotin deficiency is rare on a mixed diet.</li>
        </ul>
      </div>
      <References ids={[...new Set(NUTRIENTS.flatMap((n) => n.source)), 'ifct', 'ifct2017pkg', 'iomPlanning2003']} />
    </div>
  );
}
