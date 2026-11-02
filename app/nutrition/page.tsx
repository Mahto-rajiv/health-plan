import type { Metadata } from 'next';
import { Calculator, Clock, Droplets, Scale, Sprout, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Callout } from '@/components/ui/Callout';
import { ButtonLink } from '@/components/ui/Button';
import { References } from '@/components/References';
import { ENERGY_MATH, ENERGY_NOTE, GAIN_RULES, GUT, HYDRATION, TARGETS, TRAINING_DAY } from '@/lib/data/nutrition-guide';
import { MEAL_PLAN_DEFINITIONS, MEAL_SLOTS, fillSlots, itemKey, solvedGrams, type Meal, type MealSlot, type PlanItem } from '@/lib/data/meal-plans';
import type { PhaseId } from '@/lib/config';
import { FOODS } from '@/lib/data/foods';
import { DAILY, PHASES, PHASE_IDS } from '@/lib/config';

export const metadata: Metadata = { title: 'Nutrition' };

const SLOT_NAME = { fruit1: 'Papaya', fruit3: 'Banana', sabzi: 'Vegetables', salad: 'Salad', greens: 'Greens' } as const;

/** Grams of an item in a phase. */
const rampCell = (m: Meal, it: PlanItem, p: PhaseId): string => String(solvedGrams(m, it, p));

export default function NutritionPage() {
  // Meals 1 and 3 are fixed, so the gut ramp can be shown as exact quantities per phase.
  const fixedMeals: Meal[] = [...new Map(MEAL_PLAN_DEFINITIONS.flatMap((p) => [p.meal1, p.weekdayMeal3]).map((m) => [m.id, m])).values()];
  return (
    <>
      <PageHeader
        title="Nutrition"
        description="Your targets by phase, why they are set where they are, and how to adjust them. All three meal plans are built to these numbers."
        actions={<ButtonLink href="/meal-plans" variant="primary">Open meal plans</ButtonLink>}
      />

      <div className="space-y-5">
        <section aria-labelledby="phases" className="space-y-3">
          <h2 id="phases" className="sr-only">Phases</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {PHASE_IDS.map((id) => {
              const p = PHASES[id];
              return (
                <Card key={id} as="div" className="p-4">
                  <div className="text-xs font-medium text-muted">
                    {p.name} · weeks {p.weeks[0]}
                    {p.weeks[1] ? `–${p.weeks[1]}` : '+'}
                  </div>
                  <div className="tabular mt-1 text-2xl font-semibold tracking-tight text-ink">
                    {p.kcal[0].toLocaleString('en-IN')}–{p.kcal[1].toLocaleString('en-IN')}
                    <span className="ml-1 text-sm font-normal text-muted">kcal</span>
                  </div>
                  <div className="tabular mt-1 text-sm text-ink-2">
                    Protein {Math.round(p.protein[0])}–{Math.round(p.protein[1])} g · fibre ≤ {p.fibreMax} g
                    {p.caps.soyaChunks ? ` · soya ≤ ${p.caps.soyaChunks} g, sattu ≤ ${p.caps.sattu} g` : ''}
                  </div>
                  <p className="mt-2 text-xs text-muted">{p.goal}</p>
                </Card>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {TARGETS.map((t) => (
              <Card key={t.key} as="div" className="p-3">
                <div className="text-xs font-medium text-muted">{t.label}</div>
                <div className="mt-0.5 text-sm font-semibold text-ink">{t.value}</div>
              </Card>
            ))}
          </div>
          <Callout tone="info">
            Fat {DAILY.fatEnergy[0] * 100}–{DAILY.fatEnergy[1] * 100}% of energy, fluids {DAILY.fluidsL[0]}–{DAILY.fluidsL[1]} L, salt ~{DAILY.saltG} g (iodised) in
            every phase. These are ranges, not exact figures: food labels, portions and your metabolism all vary by 10% or more.
          </Callout>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Where the calorie numbers come from" icon={<Calculator size={18} />} />
            <dl className="tabular divide-y divide-line text-sm">
              {ENERGY_MATH.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 py-2">
                  <dt className="text-ink-2">{r.label}</dt>
                  <dd className="shrink-0 font-medium text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-ink-2">
              You lost ~4 kg in about 6 months on under ~2,000 kcal, so your maintenance was probably a little above that: about 2,000–2,100 kcal.
              That is an estimate from your own figures, not a measurement. Phase 0 adds ~100–200 kcal for that, plus ~100–200 kcal for the new
              training. Your weekly weight averages then show where you really are.
            </p>
            <p className="mt-2 text-xs text-muted">{ENERGY_NOTE}</p>
            <References ids={['mifflin', 'frankenfield', 'faoEnergy', 'faoFoodEnergy', 'icmr2020']} />
          </Card>

          <Card>
            <CardHeader title="Why each target" icon={<Scale size={18} />} />
            <ul className="space-y-3 text-sm">
              {TARGETS.map((t) => (
                <li key={t.key}>
                  <span className="font-medium text-ink">{t.label}: </span>
                  <span className="text-ink-2">{t.basis}</span>
                </li>
              ))}
            </ul>
            <References ids={TARGETS.flatMap((t) => t.refs)} />
          </Card>
        </div>

        <Card>
          <CardHeader title="Meal timing" icon={<Clock size={18} />} description="Four meals, no snacks, around a 9-hour office day (leave ~8:30–9 AM, home ~8–9 PM)." />
          <ul className="divide-y divide-line sm:hidden">
            {([1, 2, 3, 4] as MealSlot[]).map((s) => (
              <li key={s} className="py-3 text-sm">
                <div className="font-medium text-ink">{MEAL_SLOTS[s].name}</div>
                <div className="tabular mt-0.5 text-xs text-muted">
                  Weekdays {MEAL_SLOTS[s].weekday} · Weekends {MEAL_SLOTS[s].weekend}
                </div>
                <p className="mt-1 text-ink-2">{MEAL_SLOTS[s].role}</p>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-2 font-medium">Meal</th>
                  <th className="px-2 py-2 font-medium">Weekdays</th>
                  <th className="px-2 py-2 font-medium">Weekends</th>
                  <th className="py-2 pl-2 font-medium">Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {([1, 2, 3, 4] as MealSlot[]).map((s) => (
                  <tr key={s}>
                    <td className="whitespace-nowrap py-2.5 pr-2 font-medium text-ink">{MEAL_SLOTS[s].name}</td>
                    <td className="px-2 py-2.5 text-ink-2">{MEAL_SLOTS[s].weekday}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-2">{MEAL_SLOTS[s].weekend}</td>
                    <td className="py-2.5 pl-2 text-ink-2">{MEAL_SLOTS[s].role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {[TRAINING_DAY.weekday, TRAINING_DAY.weekend].map((t) => (
            <Card key={t.title}>
              <CardHeader title={t.title} />
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <Callout tone="info" title="Training days vs rest days">
          {TRAINING_DAY.same}
        </Callout>

        <Card>
          <CardHeader title="Weight-gain system" icon={<TrendingUp size={18} />} description={GAIN_RULES.rate} />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3 text-sm text-ink-2">
              <p>{GAIN_RULES.why}</p>
              <p>{GAIN_RULES.timeline}</p>
              <Callout tone="caution" title="Is 75 kg the right target?">
                {GAIN_RULES.target}
              </Callout>
              <div>
                <div className="mb-1 font-medium text-ink">How to measure</div>
                <ul className="list-disc space-y-1 pl-5">
                  {GAIN_RULES.measure.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-ink">Decide on weekly averages</div>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {GAIN_RULES.decisions.map((d) => (
                  <li key={d.when} className="grid gap-1 p-3 text-sm sm:grid-cols-[1fr_1fr] sm:gap-4">
                    <span className="text-ink-2">{d.when}</span>
                    <span className="font-medium text-ink">{d.then}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/progress" className="mt-3 w-full sm:w-auto">
                See your current status
              </ButtonLink>
            </div>
          </div>
          <References ids={[...GAIN_RULES.refs, ...GAIN_RULES.targetRefs]} />
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardHeader title="Digestive comfort" icon={<Sprout size={18} />} description={GUT.intro} />
            <ul className="grid gap-3 sm:grid-cols-2">
              {GUT.steps.map((s) => (
                <li key={s.title} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="font-medium text-ink">{s.title}</div>
                  <p className="mt-1 text-ink-2">{s.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 overflow-x-auto">
              <table className="tabular w-full min-w-[22rem] text-left text-sm">
                <caption className="mb-1 text-left text-xs font-medium text-ink">The ramp for Meals 1 and 3 (grams per day)</caption>
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th scope="col" className="py-1.5 pr-2 font-medium">Food</th>
                    {PHASE_IDS.map((p) => (
                      <th key={p} scope="col" className="px-2 py-1.5 text-right font-medium">
                        Phase {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                {fixedMeals.map((m) => (
                  <tbody key={m.id} className="divide-y divide-line">
                    <tr>
                      <th colSpan={4} scope="rowgroup" className="pt-3 pb-1 text-left text-xs font-semibold text-ink-2">
                        {m.id.startsWith('m1') ? 'Meal 1' : 'Meal 3'}: {fillSlots(m.title)}
                      </th>
                    </tr>
                    {m.items
                      .filter((it) => PHASE_IDS.some((p) => solvedGrams(m, it, p) > 0))
                      .map((it) => (
                        <tr key={itemKey(it)}>
                          <th scope="row" className="py-1 pr-2 font-normal text-ink-2">{it.slot ? SLOT_NAME[it.slot] : FOODS[it.food!].name}</th>
                          {PHASE_IDS.map((p) => (
                            <td key={p} className="px-2 py-1 text-right">
                              {rampCell(m, it, p)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                ))}
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">{GUT.curdNote}</p>
            <Callout tone="medical" className="mt-4" title="See a doctor rather than adjusting diet if you notice">
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {GUT.redFlags.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Callout>
            <References ids={GUT.refs} />
          </Card>
          <Card className="h-fit">
            <CardHeader title="Hydration" icon={<Droplets size={18} />} description="2.5–3.5 L of fluid a day" />
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
              {HYDRATION.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <References ids={['efsaWater', 'namWater', 'icmr2024', 'odsIodine']} />
          </Card>
        </div>
      </div>
    </>
  );
}
