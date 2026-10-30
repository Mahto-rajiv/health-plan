import type { Metadata } from 'next';
import { ClipboardList, FlaskConical, ListChecks, Pill, Salad, Scissors, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { References } from '@/components/References';
import { BLOOD_DATE, BLOOD_RESULTS, DIET_COVERAGE, HAIR, HEALTH_TODO, HEALTH_DISCLAIMER, SUPPLEMENTS, SUPPLEMENT_NOTES, SUPPLEMENT_NOTE_REFS, type Coverage, type CoverageRow, type ResultStatus, type Supplement } from '@/lib/data/health';
import { defaultPlans } from '@/lib/meal-plans';

// Server component: computed once at build time.
const DEFAULT_PLANS = defaultPlans();
import type { RefId } from '@/lib/data/references';

export const metadata: Metadata = { title: 'Health' };

const STATUS: Record<ResultStatus, { label: string; tone: BadgeTone }> = {
  normal: { label: 'Normal', tone: 'good' },
  'low-normal': { label: 'Low-normal', tone: 'caution' },
  discuss: { label: 'Borderline', tone: 'caution' },
};

const VERDICT: Record<Supplement['verdict'], BadgeTone> = {
  Recommended: 'good',
  'Discuss first': 'caution',
  Optional: 'neutral',
  'Not recommended': 'alert',
};

const LEVEL: Record<string, BadgeTone> = { Reasonable: 'good', Mixed: 'caution', Weak: 'neutral', Avoid: 'alert' };

const COVERAGE: Record<Coverage, BadgeTone> = { 'Covered by diet': 'good', Close: 'caution', 'Not from diet': 'alert' };

const fmt = (v: number) => (v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString('en-IN'));

/** Average daily amount in a plan in Phase 0 and Phase 2, computed from its foods. */
function planAmount(key: NonNullable<CoverageRow['key']>, i: number): string {
  return `${fmt(DEFAULT_PLANS[0][i].weeklyAverage[key])} → ${fmt(DEFAULT_PLANS[2][i].weeklyAverage[key])}`;
}

export default function HealthPage() {
  const groups = [...new Set(BLOOD_RESULTS.map((r) => r.group))];
  const flagged = BLOOD_RESULTS.filter((r) => r.status !== 'normal');
  return (
    <>
      <PageHeader
        title="Health"
        description={`Blood work from ${BLOOD_DATE}, your hair concern, and supplements. Explained in plain language, without diagnosing anything.`}
      />
      <div className="space-y-5">
        <Callout tone="medical">{HEALTH_DISCLAIMER}</Callout>

        <Card>
          <CardHeader title="To do" icon={<ListChecks size={18} />} description="Book these before or soon after starting the plan." />
          <ol className="space-y-2 text-sm">
            {HEALTH_TODO.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-900">{i + 1}</span>
                <span className="text-ink-2">{t}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardHeader title="Summary" icon={<ClipboardList size={18} />} />
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-xl bg-emerald-50/60 p-3">
              <div className="font-medium text-emerald-900">Reassuring</div>
              <p className="mt-1 text-emerald-950/80">
                Blood count, iron markers, thyroid, blood sugar, kidney, liver, lipids and inflammation are all within range.
                Nothing here stops you training hard or eating 110–125 g of protein a day.
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/70 p-3">
              <div className="font-medium text-amber-900">Worth acting on</div>
              <ul className="mt-1 space-y-1 text-amber-950/80">
                {flagged.map((r) => (
                  <li key={r.name}>
                    {r.name}: {r.value} {r.unit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-violet-50/60 p-3">
              <div className="font-medium text-violet-900">Discuss with a doctor</div>
              <p className="mt-1 text-violet-950/80">
                Hair thinning for 6 months (dermatologist), the ~4 kg weight loss, and ferritin, zinc, folate and active B12 to complete the picture.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Blood results" icon={<FlaskConical size={18} />} description="Typical reference ranges shown. Your lab's printed range is what counts." />
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{g}</h3>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {BLOOD_RESULTS.filter((r) => r.group === g).map((r) => (
                    <li key={r.name} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-ink">{r.name}</span>
                          <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                        </div>
                        <div className="tabular mt-1 text-lg font-semibold text-ink">
                          {r.value} <span className="text-xs font-normal text-muted">{r.unit}</span>
                        </div>
                        <div className="text-xs text-muted">Range: {r.labRange}</div>
                      </div>
                      <p className="text-sm text-ink-2">{r.meaning}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <References ids={BLOOD_RESULTS.flatMap((r) => r.refs ?? [])} />
        </Card>

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
            description="Daily need for adult Indian men (ICMR-NIN 2020) against each plan’s average day in Phase 0 → Phase 2, computed from its foods. Supplements are only for what food can’t cover."
          />
          <ul className="divide-y divide-line rounded-xl border border-line">
            {DIET_COVERAGE.map((c) => (
              <li key={c.nutrient} className="grid gap-2 p-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{c.nutrient}</span>
                    <Badge tone={COVERAGE[c.coverage]}>{c.coverage}</Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted">Need: {c.need}</div>
                </div>
                <div>
                  {c.key && (
                    <dl className="tabular mb-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs sm:grid-cols-3">
                      {DEFAULT_PLANS[2].map((p, i) => (
                        <div key={p.def.id} className="flex justify-between gap-2 sm:block">
                          <dt className="text-muted">{p.def.shortName}</dt>
                          <dd className="whitespace-nowrap font-medium text-ink">
                            {planAmount(c.key!, i)} {c.unit}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="text-ink-2">{c.note}</p>
                </div>
              </li>
            ))}
          </ul>
          <References ids={['icmr2020', 'ifct', 'usdaFdc', 'odsIodine', 'odsOmega3']} />
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
