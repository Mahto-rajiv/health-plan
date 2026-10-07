import type { Metadata } from 'next';
import { Calculator, Clock, Droplets, Scale, Sprout, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Callout } from '@/components/ui/Callout';
import { ButtonLink } from '@/components/ui/Button';
import { References } from '@/components/References';
import { ENERGY_MATH, GAIN_RULES, GUT, HYDRATION, TARGETS, TRAINING_DAY } from '@/lib/data/nutrition-guide';
import { MEAL_SLOTS, type MealSlot } from '@/lib/data/meal-plans';

export const metadata: Metadata = { title: 'Nutrition' };

export default function NutritionPage() {
  return (
    <>
      <PageHeader
        title="Nutrition"
        description="Your daily targets, why they are set where they are, and how to adjust them. All four meal plans are built to these numbers."
        actions={<ButtonLink href="/meal-plans" variant="primary">Open meal plans</ButtonLink>}
      />

      <div className="space-y-5">
        <section aria-labelledby="targets" className="space-y-3">
          <h2 id="targets" className="sr-only">Daily targets</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {TARGETS.map((t) => (
              <Card key={t.key} as="div" className="p-4">
                <div className="text-xs font-medium text-muted">{t.label}</div>
                <div className="tabular mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {t.key === 'kcal' ? '≈ 2,700' : t.key === 'water' ? '2.5–3.5' : `≈ ${t.value}`}
                  <span className="ml-1 text-sm font-normal text-muted">{t.unit}</span>
                </div>
                <div className="mt-1 text-xs text-muted">{t.range}</div>
              </Card>
            ))}
          </div>
          <Callout tone="info">
            These are ranges, not exact figures. Food labels, portion sizes and your metabolism all vary by 10% or more.
            Hitting protein and eating your four meals matters far more than hitting a calorie number to the gram.
          </Callout>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Where the calorie number comes from" icon={<Calculator size={18} />} />
            <dl className="tabular divide-y divide-line text-sm">
              {ENERGY_MATH.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 py-2">
                  <dt className="text-ink-2">{r.label}</dt>
                  <dd className="shrink-0 font-medium text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-ink-2">
              Your weight is currently stable, so your true maintenance is roughly what you eat now. Prediction equations can
              be off by 10% or more for an individual. The first 3–4 weeks of weigh-ins tell you where you really are, and the
              Progress page then recommends adjustments.
            </p>
            <References ids={['mifflin', 'frankenfield', 'faoEnergy', 'icmr2020']} />
          </Card>

          <Card>
            <CardHeader title="Why each target" icon={<Scale size={18} />} />
            <ul className="space-y-3 text-sm">
              {TARGETS.filter((t) => t.key !== 'kcal').map((t) => (
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
          <CardHeader title="Meal timing" icon={<Clock size={18} />} description="Four meals, no snacks. The timing works around a 10 AM–6 PM office day." />
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
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-2">{MEAL_SLOTS[s].weekday}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-2">{MEAL_SLOTS[s].weekend}</td>
                    <td className="py-2.5 pl-2 text-ink-2">{MEAL_SLOTS[s].role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {[TRAINING_DAY.evening, TRAINING_DAY.morning].map((t) => (
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
              <div className="mb-2 text-sm font-medium text-ink">Decide every 4 weeks</div>
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
