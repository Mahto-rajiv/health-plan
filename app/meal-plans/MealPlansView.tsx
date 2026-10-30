'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBasket, CalendarDays, Wallet, Scale, Printer, ShieldCheck } from 'lucide-react';
import { budgetSwaps, findPlan, ingredientValues, type ComputedPlan } from '@/lib/meal-plans';
import { DAYS, type DayName, type PlanId } from '@/lib/data/meal-plans';
import { BUDGET_NOTES, PANTRY_MONTHLY, FOOD_SAFETY, ENERGY_NOTE } from '@/lib/data/nutrition-guide';
import { BUDGET, BUDGET_LABEL, DAILY, PHASES, PHASE_IDS, budgetStatus, type PhaseId } from '@/lib/config';
import { PRICES_AS_OF } from '@/lib/data/prices';
import { useSettings } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { usePlans, usePrices } from '@/lib/plan-hooks';
import { phaseOn } from '@/lib/phase';
import { dayName } from '@/lib/dates';
import { formatINR, roundTo, cn } from '@/lib/utils';
import { roundKcal } from '@/lib/nutrition';
import type { Nutrients } from '@/lib/data/foods';
import { Segmented } from '@/components/ui/Segmented';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { MealCard } from '@/components/meals/MealCard';
import { References } from '@/components/References';

type View = 'day' | 'grocery' | 'prep';

const STATUS_TONE = {
  'below-target': 'text-emerald-700',
  'within-target': 'text-emerald-700',
  'above-target': 'text-amber-700',
  'above-max': 'text-rose-700',
} as const;

export function MealPlansView() {
  const [settings, setSettings] = useSettings();
  const today = useToday();
  const activePhase = phaseOn(settings, today);
  const [pickedPhase, setPickedPhase] = useState<PhaseId | null>(null);
  const phase = pickedPhase ?? activePhase;
  const plans = usePlans(phase);
  const [pickedDay, setPickedDay] = useState<DayName | null>(null);
  const [view, setView] = useState<View>('day');

  const plan = findPlan(plans, settings.planId);
  const day: DayName = pickedDay ?? (today ? dayName(today) : 'Monday');
  const computed = plan.days.find((d) => d.day === day)!;
  const status = budgetStatus(plan.monthlyCost);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 text-xs font-medium text-muted">Phase</div>
        <Segmented<string>
          wrap
          label="Phase"
          value={String(phase)}
          onChange={(v) => setPickedPhase(Number(v) as PhaseId)}
          options={PHASE_IDS.map((p) => ({ value: String(p), label: `Phase ${p}${p === activePhase ? ' · now' : ''}` }))}
        />
        <p className="mt-1.5 text-xs text-muted">
          Weeks {PHASES[phase].weeks[0]}
          {PHASES[phase].weeks[1] ? `–${PHASES[phase].weeks[1]}` : '+'}: {PHASES[phase].goal}
        </p>
      </div>

      <PlanPicker plans={plans} value={plan.def.id} onChange={(id) => setSettings((s) => ({ ...s, planId: id }))} />

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
          <PlanStat label="Est. cost / month" value={formatINR(roundTo(plan.monthlyCost, 100))} className={STATUS_TONE[status]} hint={BUDGET_LABEL[status]} />
        </div>
      </Card>

      <Segmented<View>
        label="Section"
        value={view}
        onChange={setView}
        options={[
          { value: 'day', label: 'Daily meals' },
          { value: 'grocery', label: 'Groceries & cost' },
          { value: 'prep', label: 'Prep & safety' },
        ]}
      />

      {view === 'day' && (
        <section aria-label="Daily meals" className="space-y-4">
          <div className="scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5" role="group" aria-label="Day of week">
              {DAYS.map((d) => {
                const active = d === day;
                const isToday = today ? dayName(today) === d : false;
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${d}${isToday ? ' (today)' : ''}`}
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
            Exactly four meals, no snacks. <strong>Meal 1</strong> is the same every day (about 10 minutes).{' '}
            <strong>Meal 2</strong> on weekdays is eaten cold at the office: no rice, dal, gravy or reheating.{' '}
            <strong>Meal 3</strong> is the same Monday–Friday and is your pre-workout meal at 6:15–6:45 PM. Quantities step up
            with each phase; the foods stay the same.
          </Callout>

          <DayTotals totals={computed.totals} minutes={computed.activeMinutes} cost={computed.cost} phase={phase} />

          <div className="grid gap-4 xl:grid-cols-2">
            {computed.meals.map((pm, i) => (
              <MealCard key={`${day}-${pm.slot}`} planned={pm} totals={computed.mealTotals[i]} cost={computed.mealCosts[i]} />
            ))}
          </div>
          <p className="text-xs text-muted">
            Nutrient values are estimates from the Indian Food Composition Tables (2017) and USDA data. {ENERGY_NOTE}
          </p>
        </section>
      )}

      {view === 'grocery' && <GroceryView plan={plan} plans={plans} />}
      {view === 'prep' && <PrepView plan={plan} />}
    </div>
  );
}

function PlanPicker({ plans, value, onChange }: { plans: ComputedPlan[]; value: PlanId; onChange: (id: PlanId) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Meal plan</legend>
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
        {plans.map((p) => {
          const active = p.def.id === value;
          const status = budgetStatus(p.monthlyCost);
          return (
            <label
              key={p.def.id}
              className={cn(
                'relative flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-slate-50',
              )}
            >
              <input type="radio" name="meal-plan" value={p.def.id} checked={active} onChange={() => onChange(p.def.id)} className="sr-only" />
              <span className={cn('font-semibold', active ? 'text-accent-strong' : 'text-ink')}>{p.def.shortName}</span>
              <span className={cn('tabular text-xs', STATUS_TONE[status])}>
                ≈ {formatINR(roundTo(p.monthlyCost, 100))}/mo · {BUDGET_LABEL[status]}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function PlanStat({ label, value, className, hint }: { label: string; value: string; className?: string; hint?: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={cn('font-semibold text-ink', className)}>{value}</div>
      {hint && <div className={cn('text-[11px]', className)}>{hint}</div>}
    </div>
  );
}

function DayTotals({ totals, minutes, cost, phase }: { totals: Nutrients; minutes: number; cost: number; phase: PhaseId }) {
  const P = PHASES[phase];
  const fatPct = ((totals.fat * 9) / totals.kcal) * 100;
  const rows = [
    { label: 'Calories', value: `${roundKcal(totals.kcal)}`, target: `${P.kcal[0].toLocaleString('en-IN')}–${P.kcal[1].toLocaleString('en-IN')}`, ok: totals.kcal >= P.kcal[0] && totals.kcal <= P.kcal[1] },
    { label: 'Protein', value: `${Math.round(totals.protein)} g`, target: `${Math.round(P.protein[0])}–${Math.round(P.protein[1])} g`, ok: totals.protein >= P.protein[0] && totals.protein <= P.protein[1] },
    { label: 'Fibre', value: `${Math.round(totals.fiber)} g`, target: `≤ ${P.fibreMax} g`, ok: totals.fiber <= P.fibreMax },
    { label: 'Fat', value: `${Math.round(totals.fat)} g (${Math.round(fatPct)}%)`, target: `${DAILY.fatEnergy[0] * 100}–${DAILY.fatEnergy[1] * 100}% of energy`, ok: fatPct >= 24 && fatPct <= 31 },
    { label: 'Carbs (available)', value: `${Math.round(totals.carbs)} g`, target: 'the rest', ok: true },
  ];
  return (
    <Card as="div" className="p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold text-ink">Day total vs {P.name.split(' · ')[0]} target</h3>
        <p className="tabular text-xs text-muted">
          ~{minutes} min hands-on cooking · food ≈ {formatINR(cost)}
        </p>
      </div>
      <dl className="tabular grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="text-xs text-muted">{r.label}</dt>
            <dd className={cn('text-sm font-semibold', r.ok ? 'text-ink' : 'text-amber-700')}>{r.value}</dd>
            <dd className="text-[11px] text-muted">target {r.target}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function GroceryView({ plan, plans }: { plan: ComputedPlan; plans: ComputedPlan[] }) {
  const prices = usePrices();
  const status = budgetStatus(plan.monthlyCost);
  const swaps = budgetSwaps(plan, prices);
  const gap = plan.monthlyCost - BUDGET.targetMax;
  const allSwapsCost = plan.monthlyCost - swaps.reduce((s, x) => s + x.monthlySaving, 0);
  const cheapest = Math.min(...plans.map((p) => p.costPer10gProtein));
  return (
    <section aria-label="Groceries and cost" className="space-y-4">
      <Card>
        <CardHeader
          title="Budget"
          icon={<Wallet size={18} />}
          description={`Target ${formatINR(BUDGET.targetMin)}–${formatINR(BUDGET.targetMax)} a month; acceptable range ${formatINR(BUDGET.min)}–${formatINR(BUDGET.max)}. Food only — supplements are costed on the Health page. Prices are estimates (${PRICES_AS_OF}); edit them in Settings.`}
        />
        <div className="tabular grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted">Food per week</div>
            <div className="text-lg font-semibold">{formatINR(roundTo(plan.weeklyFoodCost, 10))}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Per month (incl. {formatINR(PANTRY_MONTHLY)} basics)</div>
            <div className={cn('text-lg font-semibold', STATUS_TONE[status])}>≈ {formatINR(roundTo(plan.monthlyCost, 100))}</div>
            <div className={cn('text-xs', STATUS_TONE[status])}>{BUDGET_LABEL[status]}</div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="tabular w-full text-left text-sm">
            <caption className="mb-1 text-left text-xs text-muted">All three plans in {PHASES[plan.phase].name.split(' · ')[0]}</caption>
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="py-1.5 pr-2 font-medium">Plan</th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">Per month</th>
                <th scope="col" className="py-1.5 pl-2 text-right font-medium">₹ / 10 g protein</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {plans.map((p) => {
                const st = budgetStatus(p.monthlyCost);
                return (
                  <tr key={p.def.id}>
                    <th scope="row" className={cn('py-1.5 pr-2 font-normal', p.def.id === plan.def.id ? 'font-medium text-ink' : 'text-ink-2')}>
                      {p.def.shortName}
                    </th>
                    <td className={cn('px-2 py-1.5 text-right', STATUS_TONE[st])}>
                      ≈ {formatINR(roundTo(p.monthlyCost, 100))}
                      <span className="block text-[11px]">{BUDGET_LABEL[st]}</span>
                    </td>
                    <td className="py-1.5 pl-2 text-right">
                      ₹{p.costPer10gProtein.toFixed(1)}
                      <span className="block text-[11px] text-muted">
                        {p.costPer10gProtein > cheapest + 0.05 ? `+${Math.round((p.costPer10gProtein / cheapest - 1) * 100)}% vs cheapest` : 'cheapest'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-muted">
            Same calorie, protein and micronutrient targets for all three; the non-veg plan is not healthier, it costs what it costs.
          </p>
        </div>

        {status === 'above-target' || status === 'above-max' ? (
          <Callout tone="caution" className="mt-4" title={`About ${formatINR(roundTo(gap, 50))} a month above the target`}>
            Mostly milk, curd and paneer: dairy is the low-fibre protein that lets the plans meet the protein target under the fibre caps.
            {swaps.length > 0 && <> All the swaps below together bring it to ≈ {formatINR(roundTo(allSwapsCost, 50))}.</>}
          </Callout>
        ) : (
          <Callout tone="good" className="mt-4" title={`Within the ${formatINR(BUDGET.targetMin)}–${formatINR(BUDGET.targetMax)} target`}>
            Prices vary by city and season; edit them in Settings and the totals update.
          </Callout>
        )}
        {swaps.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1.5 text-sm font-semibold text-ink">Ways to spend less on this plan</h3>
            <ul className="space-y-1.5 text-sm">
              {swaps.map((s) => (
                <li key={s.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex flex-col justify-between gap-0.5 sm:flex-row sm:items-baseline">
                    <span className="font-medium text-ink">{s.label}</span>
                    <span className="tabular shrink-0 text-xs font-medium text-emerald-700">saves ≈ {formatINR(roundTo(s.monthlySaving, 10))}/month</span>
                  </div>
                  <p className="tabular mt-0.5 text-xs text-muted">
                    {s.note} Change per day: {signed(s.proteinDeltaPerDay)} g protein, {signed(s.kcalDeltaPerDay)} kcal.
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
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
          description="Quantities for one week, as bought: dry weight for pulses and grains, whole produce including peel and trimmings, edible portion for meat and fish."
        />
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {plan.grocery.map((g) => (
            <div key={g.category}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g.category}</h3>
              <ul className="divide-y divide-line text-sm">
                {g.lines.map((l) => (
                  <li key={l.food} className="tabular flex items-baseline justify-between gap-3 py-1.5">
                    <span className="min-w-0">
                      <span className="block text-ink">{l.name}</span>
                      <span className="block text-xs text-muted">{l.pack}</span>
                    </span>
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

      <IngredientValueCard />
    </section>
  );
}

const signed = (v: number) => {
  const r = Math.round(v);
  return r === 0 ? '±0' : `${r > 0 ? '+' : '−'}${Math.abs(r)}`;
};

function IngredientValueCard() {
  const prices = usePrices();
  const rows = ingredientValues(prices);
  return (
    <Card>
      <CardHeader
        title="Protein for your money"
        icon={<Scale size={18} />}
        description="Main ingredients, cheapest protein first: cost of a typical serving and of 10 g of protein, with the calories and fibre that come with that protein."
      />
      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[30rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="py-1.5 pr-2 font-medium">Food</th>
              <th scope="col" className="px-2 py-1.5 font-medium">Serving</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">₹ / serving</th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">₹ / 10 g protein</th>
              <th scope="col" className="py-1.5 pl-2 text-right font-medium">kcal · fibre per 10 g</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.food}>
                <th scope="row" className="py-1.5 pr-2 font-normal text-ink">{r.name}</th>
                <td className="px-2 py-1.5 text-xs text-muted">{r.serving}</td>
                <td className="px-2 py-1.5 text-right">{formatINR(r.costPerServing)}</td>
                <td className="px-2 py-1.5 text-right font-semibold">₹{r.costPer10gProtein.toFixed(1)}</td>
                <td className="py-1.5 pl-2 text-right text-xs text-muted">
                  {Math.round(r.kcalPer10gProtein)} kcal · {r.fiberPer10gProtein.toFixed(1)} g
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
        <li>Weights are dry for pulses, grains and soya, and raw edible portion for chicken and fish.</li>
        <li>
          Cheap is not the only test. Pulses bring a lot of fibre with their protein, which is why the plans cap them early on and
          lean on dairy; grains and pulses also complement each other’s amino acids.
        </li>
        <li>Paneer and ghee: buy sealed, branded packs. They carry an FSSAI licence number, ingredients and a use-by date; loose ones are cheaper but their quality and freshness can’t be checked.</li>
      </ul>
    </Card>
  );
}

function PrepView({ plan }: { plan: ComputedPlan }) {
  return (
    <section aria-label="Preparation and safety" className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Weekly preparation" icon={<CalendarDays size={18} />} description="What to do ahead, so weekday mornings stay short." />
        <ol className="space-y-3 text-sm">
          {plan.def.prepStrategy.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">{i + 1}</span>
              <span className="text-ink-2">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/meal-plans/cards?plan=${plan.def.id}&phase=${plan.phase}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-medium text-ink hover:bg-slate-50"
          >
            <Printer size={16} aria-hidden /> Printable dinner cooking cards
          </Link>
        </div>
        {plan.def.notes.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-2">
            {plan.def.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <CardHeader title="Food safety" icon={<ShieldCheck size={18} />} description="The office lunch travels ~2 h and is eaten cold." />
        <p className="mb-1 text-sm font-medium text-ink">Office lunch</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
          {FOOD_SAFETY.office.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mb-1 mt-4 text-sm font-medium text-ink">Buying and storing ingredients</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
          {FOOD_SAFETY.buying.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <References ids={FOOD_SAFETY.refs} />
      </Card>
    </section>
  );
}
