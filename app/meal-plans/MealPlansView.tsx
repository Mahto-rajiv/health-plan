'use client';

import { useMemo, useState } from 'react';
import { Repeat, ShoppingBasket, CalendarDays, ArrowLeftRight, Wallet } from 'lucide-react';
import { PLANS, getPlan } from '@/lib/meal-plans';
import { DAYS, type DayName, type PlanId } from '@/lib/data/meal-plans';
import { TARGETS, BUDGET_NOTES, BUDGET_SWAPS } from '@/lib/data/nutrition-guide';
import { useSettings } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { dayName } from '@/lib/dates';
import { formatINR, roundTo, cn } from '@/lib/utils';
import { roundKcal } from '@/lib/nutrition';
import type { Nutrients } from '@/lib/data/foods';
import { Segmented } from '@/components/ui/Segmented';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { ProgressBar } from '@/components/ui/Progress';
import { MealCard } from '@/components/meals/MealCard';

type View = 'day' | 'grocery' | 'prep';
const BUDGET_MAX = 5000;

export function MealPlansView() {
  const [settings, setSettings] = useSettings();
  const today = useToday();
  const [pickedDay, setPickedDay] = useState<DayName | null>(null);
  const [view, setView] = useState<View>('day');

  const plan = getPlan(settings.planId);
  const day: DayName = pickedDay ?? (today ? dayName(today) : 'Monday');
  const computed = plan.days.find((d) => d.day === day)!;

  const planOptions = useMemo(
    () =>
      PLANS.map((p) => ({
        value: p.def.id,
        label: p.def.shortName,
        hint: `≈ ${formatINR(roundTo(p.monthlyCost, 100))}/mo`,
      })),
    [],
  );

  return (
    <div className="space-y-5">
      <Segmented<PlanId>
        label="Meal plan"
        options={planOptions}
        value={plan.def.id}
        onChange={(id) => setSettings((s) => ({ ...s, planId: id }))}
      />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-ink">{plan.def.name}</h2>
          <Badge tone="outline">{plan.def.diet}</Badge>
          {plan.eggsPerWeek > 0 && <Badge tone="neutral">{plan.eggsPerWeek} eggs/week</Badge>}
        </div>
        <p className="text-sm text-ink-2">{plan.def.summary}</p>
        <div className="tabular grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm sm:grid-cols-4">
          <PlanStat label="Calories / day" value={`${roundKcal(plan.ranges.kcal[0])}–${roundKcal(plan.ranges.kcal[1])}`} />
          <PlanStat label="Protein / day" value={`${Math.round(plan.ranges.protein[0])}–${Math.round(plan.ranges.protein[1])} g`} />
          <PlanStat label="Fibre / day" value={`${Math.round(plan.ranges.fiber[0])}–${Math.round(plan.ranges.fiber[1])} g`} />
          <PlanStat
            label="Est. cost / month"
            value={formatINR(roundTo(plan.monthlyCost, 100))}
            tone={plan.monthlyCost > BUDGET_MAX ? 'caution' : 'good'}
          />
        </div>
      </Card>

      <Segmented<View>
        label="Section"
        value={view}
        onChange={setView}
        options={[
          { value: 'day', label: 'Daily meals' },
          { value: 'grocery', label: 'Groceries & cost' },
          { value: 'prep', label: 'Prep & swaps' },
        ]}
      />

      {view === 'day' && (
        <section aria-label="Daily meals" className="space-y-4">
          <div className="scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5" role="tablist" aria-label="Day of week">
              {DAYS.map((d) => {
                const active = d === day;
                const isToday = today ? dayName(today) === d : false;
                return (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPickedDay(d)}
                    className={cn(
                      'flex min-w-[3.25rem] shrink-0 flex-col items-center rounded-xl border px-2.5 py-1.5 text-sm font-medium',
                      active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-2 hover:bg-slate-50',
                    )}
                  >
                    {d.slice(0, 3)}
                    <span className={cn('text-[10px] font-normal', active ? 'text-white/80' : 'text-muted')}>
                      {isToday ? 'today' : d === 'Saturday' || d === 'Sunday' ? 'home' : 'office'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Callout tone="info" title="The 4-meal structure">
            Exactly four meals, no snacks. <strong>Meal 1</strong> is the same every day.{' '}
            <strong>Meal 3</strong> is the same Monday–Friday. Weekday lunch is the extra portion of last
            night&apos;s dinner (cook once, eat twice). Weekends are freer.
          </Callout>

          <DayTotals totals={computed.totals} />

          <div className="grid gap-4 xl:grid-cols-2">
            {computed.meals.map((pm, i) => (
              <MealCard key={`${day}-${pm.slot}`} planned={pm} totals={computed.mealTotals[i]} />
            ))}
          </div>
          <p className="text-xs text-muted">
            Nutrient values are estimates from the Indian Food Composition Tables (2017) and USDA data. Weigh dry pulses
            and grains a few times to calibrate your eye; after that, household measures are fine.
          </p>
        </section>
      )}

      {view === 'grocery' && <GroceryView planId={plan.def.id} />}
      {view === 'prep' && <PrepView planId={plan.def.id} />}
    </div>
  );
}

function PlanStat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'caution' }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={cn('font-semibold', tone === 'caution' ? 'text-amber-700' : tone === 'good' ? 'text-emerald-700' : 'text-ink')}>{value}</div>
    </div>
  );
}

function DayTotals({ totals }: { totals: Nutrients }) {
  const rows = [
    { t: TARGETS.find((x) => x.key === 'kcal')!, v: totals.kcal, fmt: (v: number) => `${roundKcal(v)}` },
    { t: TARGETS.find((x) => x.key === 'protein')!, v: totals.protein, fmt: (v: number) => `${Math.round(v)}` },
    { t: TARGETS.find((x) => x.key === 'carbs')!, v: totals.carbs, fmt: (v: number) => `${Math.round(v)}` },
    { t: TARGETS.find((x) => x.key === 'fat')!, v: totals.fat, fmt: (v: number) => `${Math.round(v)}` },
    { t: TARGETS.find((x) => x.key === 'fiber')!, v: totals.fiber, fmt: (v: number) => `${Math.round(v)}` },
  ];
  return (
    <Card as="div" className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">Day total vs target</h3>
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map(({ t, v, fmt }) => (
          <div key={t.key}>
            <div className="tabular flex items-baseline justify-between gap-2 text-xs">
              <span className="text-muted">{t.label}</span>
              <span>
                <span className="font-semibold text-ink">{fmt(v)}</span>
                <span className="text-muted"> / {t.value.toLocaleString('en-IN')}{t.unit === 'kcal' ? '' : ` ${t.unit}`}</span>
              </span>
            </div>
            <ProgressBar value={v} max={t.value} className="mt-1.5" label={`${t.label} vs target`} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function GroceryView({ planId }: { planId: PlanId }) {
  const plan = getPlan(planId);
  const over = plan.monthlyCost > BUDGET_MAX;
  return (
    <section aria-label="Groceries and cost" className="space-y-4">
      <Card>
        <CardHeader title="Budget" icon={<Wallet size={18} />} description="Target: ₹4,000–5,000 a month" />
        <div className="tabular grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted">Food per week</div>
            <div className="text-lg font-semibold">{formatINR(roundTo(plan.weeklyFoodCost, 10))}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Per month (incl. ₹300 basics)</div>
            <div className={cn('text-lg font-semibold', over ? 'text-amber-700' : 'text-emerald-700')}>
              ≈ {formatINR(roundTo(plan.monthlyCost, 100))}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-xs text-muted">All four plans</div>
            <ul className="mt-0.5 space-y-0.5 text-sm">
              {PLANS.map((p) => (
                <li key={p.def.id} className="flex justify-between gap-2">
                  <span className={p.def.id === planId ? 'font-medium' : 'text-muted'}>{p.def.shortName}</span>
                  <span className={p.monthlyCost > BUDGET_MAX ? 'text-amber-700' : ''}>≈ {formatINR(roundTo(p.monthlyCost, 100))}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {over ? (
          <Callout tone="caution" className="mt-4" title="This plan is above ₹5,000 at current prices">
            The trade-off is cost versus food preference. You can stay on it, use the swaps below to bring it under budget,
            or switch to Plan 2 or 3, which reach the same targets for less.
          </Callout>
        ) : (
          <Callout tone="good" className="mt-4" title="Fits the ₹4,000–5,000 budget">
            Prices vary by city and season, so use the swaps below if your local prices are higher.
          </Callout>
        )}
        <ul className="mt-4 space-y-1.5 text-sm">
          {BUDGET_SWAPS.map((s) => (
            <li key={s.swap} className="flex flex-col justify-between gap-0.5 rounded-lg bg-slate-50 px-3 py-2 sm:flex-row sm:items-center">
              <span>{s.swap}</span>
              <span className="text-xs font-medium text-emerald-700">{s.saves}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted">
          {BUDGET_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Weekly grocery list"
          icon={<ShoppingBasket size={18} />}
          description="Quantities for one week, as weighed (dry pulses and grains, edible portion for meat and fish)."
        />
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {plan.grocery.map((g) => (
            <div key={g.category}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g.category}</h3>
              <ul className="divide-y divide-line text-sm">
                {g.lines.map((l) => (
                  <li key={l.food} className="tabular flex items-baseline justify-between gap-3 py-1.5">
                    <span className="min-w-0 text-ink">{l.name}</span>
                    <span className="shrink-0 text-right">
                      <span className="text-ink-2">{l.buy}</span>
                      <span className="ml-2 inline-block w-14 text-xs text-muted">{formatINR(l.weeklyCost)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function PrepView({ planId }: { planId: PlanId }) {
  const plan = getPlan(planId);
  return (
    <section aria-label="Preparation and substitutions" className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Preparation strategy" icon={<CalendarDays size={18} />} description="Light weekend prep plus cook once, eat twice." />
        <ol className="space-y-3 text-sm">
          {plan.def.prepStrategy.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">{i + 1}</span>
              <span className="text-ink-2">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-ink-2">
          <p className="mb-1 font-medium text-ink">Office food safety (fridge + kettle)</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Refrigerate cooked food within 2 hours. Pack lunch straight from the fridge, and put it in the office fridge when you arrive.</li>
            <li>Eat cooked rice, chicken and fish leftovers within 24 hours. Dals and sabzis keep 1–2 days.</li>
            <li>An insulated lunch box lets food packed hot in the morning still be warm at 1 PM. Without a microwave, choose roti or pulao days for cold eating.</li>
          </ul>
        </div>
      </Card>
      <Card>
        <CardHeader title="Substitutions" icon={<ArrowLeftRight size={18} />} description="Swap like for like to keep the totals similar." />
        <ul className="divide-y divide-line text-sm">
          {plan.def.substitutions.map((s) => (
            <li key={s.swap} className="py-2.5">
              <div className="flex flex-wrap items-center gap-x-2">
                <span className="font-medium text-ink">{s.swap}</span>
                <span className="text-muted">→</span>
                <span className="text-ink-2">{s.with}</span>
              </div>
              {s.note && <p className="mt-0.5 text-xs text-muted">{s.note}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          {plan.def.notes.map((n) => (
            <p key={n} className="flex gap-2 text-sm text-ink-2">
              <Repeat size={14} className="mt-1 shrink-0 text-accent" aria-hidden />
              {n}
            </p>
          ))}
        </div>
      </Card>
    </section>
  );
}
