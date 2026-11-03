import type { Metadata } from 'next';
import { ListChecks, Pill, Salad, Scissors, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { References } from '@/components/References';
import { HAIR, HEALTH_TODO, HEALTH_DISCLAIMER, SUPPLEMENTS, SUPPLEMENT_NOTES, SUPPLEMENT_NOTE_REFS, type Supplement } from '@/lib/data/health';
import { allDefaultPlans } from '@/lib/meal-plans';
import { MEAL_PLAN_DEFINITIONS } from '@/lib/data/meal-plans';
import { NOT_COMPUTED, NUTRIENTS } from '@/lib/data/nutrients';
import { auditRange, fmtAmount, STATUS_LABEL, type AuditStatus } from '@/lib/nutrient-audit';
import { WeightTodo } from './WeightTodo';
import { BloodResults, BloodSummary } from './BloodResults';
import type { RefId } from '@/lib/data/references';

// Server component: computed once at build time from every plan × phase (9), at default prices.
const ALL_PLANS = allDefaultPlans();
const COVERAGE_BY_PLAN = MEAL_PLAN_DEFINITIONS.map((def) => ({ def, rows: auditRange(ALL_PLANS.filter((p) => p.def.id === def.id)) }));

export const metadata: Metadata = { title: 'Health' };

const VERDICT: Record<Supplement['verdict'], BadgeTone> = {
  Recommended: 'good',
  'Discuss first': 'caution',
  Optional: 'neutral',
  'Not recommended': 'alert',
};

const LEVEL: Record<string, BadgeTone> = { Reasonable: 'good', Mixed: 'caution', Weak: 'neutral', Avoid: 'alert' };

const COVERAGE_TONE: Record<AuditStatus, BadgeTone> = { meets: 'good', 'below-rda': 'caution', 'below-ai': 'caution', 'below-ear': 'alert', 'above-ul': 'alert', info: 'neutral' };

export default function HealthPage() {
  return (
    <>
      <PageHeader
        title="Health"
        description="Your blood work, your hair concern, and supplements. Explained in plain language, without diagnosing anything."
      />
      <div className="space-y-5">
        <Callout tone="medical">{HEALTH_DISCLAIMER}</Callout>

        <Card>
          <CardHeader title="To do" icon={<ListChecks size={18} />} description="Book these before or soon after starting the plan." />
          <ol className="space-y-2 text-sm">
            {HEALTH_TODO.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-900">{i + 1}</span>
                <span className="text-ink-2">{t === 'weight' ? <WeightTodo /> : t}</span>
              </li>
            ))}
          </ol>
        </Card>

        <BloodSummary />

        <BloodResults />

        <Card>
          <CardHeader title="Hair fall and thinning" icon={<Scissors size={18} />} />
          <p className="text-sm text-ink-2">{HAIR.summary}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Callout tone="medical" title="Recommended: see a dermatologist">
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {HAIR.seeDermatologist.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Callout>
            <div className="rounded-xl border border-line p-3.5 text-sm">
              <div className="flex items-center gap-2 font-medium text-ink">
                <Stethoscope size={16} className="text-muted" aria-hidden /> Tests to ask about
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2">
                {HAIR.askAbout.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className="mb-2 mt-5 text-sm font-semibold text-ink">What nutrition can and can’t do</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {HAIR.nutrition.map((n) => (
              <li key={n.title} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">{n.title}</span>
                  <Badge tone={LEVEL[n.level]}>{n.level === 'Avoid' ? 'Avoid' : `Evidence: ${n.level.toLowerCase()}`}</Badge>
                </div>
                <p className="mt-1 text-ink-2">{n.body}</p>
              </li>
            ))}
          </ul>
          <References ids={HAIR.refs} />
        </Card>

        <Card>
          <CardHeader
            title="What your diet covers"
            icon={<Salad size={18} />}
            description="Every vitamin and mineral the food tables cover, for each plan: the lowest and highest weekly average across all phases, against ICMR-NIN 2020 (US/Canadian values where ICMR gives none). Computed from the foods, so it updates when the meals change. Supplements are only for what food can’t cover."
          />
          <div className="overflow-x-auto">
            <table className="tabular w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th scope="col" className="py-1.5 pr-2 font-medium">Nutrient · average need · RDA</th>
                  {COVERAGE_BY_PLAN.map(({ def }) => (
                    <th key={def.id} scope="col" className="px-2 py-1.5 text-right font-medium">
                      {def.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {NUTRIENTS.map((n, i) => (
                  <tr key={n.key} className="align-top">
                    <th scope="row" className="py-1.5 pr-2 font-normal text-ink">
                      {n.label}
                      {n.hair && <span title="Linked to hair loss when deficient"> ★</span>}
                      <span className="block text-[11px] text-muted">
                        {n.ear ? `${fmtAmount(n.ear)} · ` : ''}
                        {n.rda ? `${fmtAmount(n.rda)}${n.adequateIntake ? ' (AI)' : ''} ` : ''}
                        {n.unit}
                      </span>
                    </th>
                    {COVERAGE_BY_PLAN.map(({ def, rows }) => {
                      const r = rows[i];
                      return (
                        <td key={def.id} className="px-2 py-1.5 text-right">
                          <span className="whitespace-nowrap font-medium text-ink">
                            {fmtAmount(r.min)}–{fmtAmount(r.max)}
                          </span>
                          <span className="mt-0.5 block">
                            <Badge tone={COVERAGE_TONE[r.worst]}>{r.worst === 'meets' ? 'meets RDA' : STATUS_LABEL[r.worst]}</Badge>
                          </span>
                          {r.belowEar.length > 0 && (
                            <span className="mt-0.5 block text-[11px] text-rose-700">
                              in {r.belowEar.length} of 12: {[...new Set(r.belowEar.map((b) => b.split(', ').slice(1).join(' ')))].slice(0, 4).join('; ')}
                              {r.belowEar.length > 4 ? '…' : ''}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
            <li>
              The badge shows the worst case across the 3 phases. ★ = linked to hair loss when deficient (Almohanna 2019; Guo
              &amp; Katta 2017). Per-phase detail, main sources and data gaps are on Meal plans → Vitamins &amp; minerals.
            </li>
            {NOT_COMPUTED.map((n) => (
              <li key={n.label}>
                <strong>{n.label}:</strong> {n.why}
              </li>
            ))}
            <li>Vitamin B12: on paper the plans meet the need from milk, curd and eggs, but boiling milk destroys some, absorption varies, and a level in the indeterminate range (see Blood results) needs a firm answer. Test first, then a supplement course if your doctor agrees (see below).</li>
          </ul>
          <References ids={['icmr2020', 'driElements', 'driVitamins', 'driMacros', 'ifct', 'usdaSr28', 'almohanna', 'guoKatta', 'odsIodine']} />
        </Card>

        <Card>
          <CardHeader title="Supplements" icon={<Pill size={18} />} description="Food first. Only what your results, diet and goals justify." />
          <ul className="grid gap-3 lg:grid-cols-2">
            {SUPPLEMENTS.map((s) => (
              <li key={s.name} className="rounded-xl border border-line p-3.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{s.name}</span>
                  <Badge tone={VERDICT[s.verdict]}>{s.verdict}</Badge>
                </div>
                {s.dose && (
                  <p className="mt-1.5">
                    <span className="font-medium text-ink">Dose: </span>
                    <span className="text-ink-2">{s.dose}</span>
                  </p>
                )}
                <p className="mt-1.5 text-ink-2">{s.why}</p>
                {s.cautions && <p className="mt-1.5 text-xs text-muted">{s.cautions}</p>}
                {s.buy && (
                  <p className="mt-1.5 text-xs text-muted">
                    <span className="font-medium text-ink-2">Buying: </span>
                    {s.buy}
                  </p>
                )}
                {s.cost && <p className="mt-1.5 text-xs text-muted">Cost: {s.cost}</p>}
              </li>
            ))}
          </ul>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted">
            {SUPPLEMENT_NOTES.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <References ids={[...SUPPLEMENTS.flatMap((s) => s.refs), ...SUPPLEMENT_NOTE_REFS] as RefId[]} />
        </Card>
      </div>
    </>
  );
}
