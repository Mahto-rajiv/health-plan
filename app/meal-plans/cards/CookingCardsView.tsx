'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { MEAL_PLAN_DEFINITIONS, planDinners, resolveMeal, type PlanId } from '@/lib/data/meal-plans';
import { FOODS } from '@/lib/data/foods';
import { PHASES, PHASE_IDS, type PhaseId } from '@/lib/config';
import { formatQuantity, itemsNutrients, roundKcal } from '@/lib/nutrition';
import { useSettings } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { phaseOn } from '@/lib/phase';
import { Button } from '@/components/ui/Button';

/** One printable card per dinner: what Mom needs at the stove, nothing else. */
export function CookingCardsView() {
  const params = useSearchParams();
  const [settings] = useSettings();
  const today = useToday();
  const planParam = params.get('plan') as PlanId | null;
  const phaseParam = Number(params.get('phase'));
  const def = MEAL_PLAN_DEFINITIONS.find((p) => p.id === (planParam ?? settings.planId)) ?? MEAL_PLAN_DEFINITIONS[0];
  const phase: PhaseId = PHASE_IDS.includes(phaseParam as PhaseId) && params.get('phase') !== null ? (phaseParam as PhaseId) : phaseOn(settings, today);
  const dinners = planDinners(def);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/meal-plans" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-accent hover:underline">
          <ArrowLeft size={16} aria-hidden /> Meal plans
        </Link>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} aria-hidden /> Print
        </Button>
      </div>
      <header>
        <h1 className="text-xl font-semibold text-ink">Dinner cooking cards</h1>
        <p className="text-sm text-muted">
          {def.name} · {PHASES[phase].name}. Quantities are for one portion (raw weights); multiply for the family. At most 2 pots.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 print:block">
        {dinners.map(({ days, meal }) => {
          const m = resolveMeal(meal, phase);
          const n = itemsNutrients(m.items);
          return (
            <article key={meal.id} className="break-inside-avoid rounded-2xl border border-line bg-surface p-4 print:mb-4 print:rounded-none print:border-slate-400">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{days.join(' · ')}</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">{m.title}</h2>
              <p className="tabular mt-0.5 text-xs text-muted">
                {m.activeMin} min hands-on · {m.totalMin} min total · {m.pots} pot{m.pots === 1 ? '' : 's'} · ≈ {roundKcal(n.kcal)} kcal, {Math.round(n.protein)} g protein
              </p>
              {m.dayBefore && <p className="mt-2 text-sm font-medium text-ink">Day before: {m.dayBefore}</p>}
              <h3 className="mt-3 text-sm font-semibold text-ink">Ingredients (one portion)</h3>
              <ul className="mt-1 space-y-0.5 text-sm">
                {m.items.map((it, i) => (
                  <li key={`${it.food}-${i}`} className="flex flex-wrap justify-between gap-x-3 border-b border-dotted border-line py-0.5">
                    <span className="min-w-0">{FOODS[it.food].name}</span>
                    <span className="tabular min-w-0 text-right text-ink-2">
                      {formatQuantity(it)}
                      {it.note ? ` · ${it.note}` : ''}
                    </span>
                    {it.alt && (
                      <span className="w-full text-xs text-muted">
                        Not in the market? {FOODS[it.alt.food].name}, {formatQuantity(it.alt)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted">Plus salt, spices, onion, tomato, ginger-garlic and herbs as usual.</p>
              <h3 className="mt-3 text-sm font-semibold text-ink">Steps</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                {m.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-2 text-sm">
                <span className="font-medium">Tip: </span>
                {m.flavour}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
