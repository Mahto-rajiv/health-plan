import { Clock, Repeat, Briefcase, CookingPot } from 'lucide-react';
import { FOODS, type Nutrients } from '@/lib/data/foods';
import { MEAL_SLOTS, type PlannedMeal } from '@/lib/data/meal-plans';
import { cookingTutorials } from '@/lib/data/tutorials';
import { formatQuantity, itemNutrients, roundKcal } from '@/lib/nutrition';
import { Badge } from '../ui/Badge';
import { Disclosure } from '../ui/Disclosure';
import { TutorialLinks } from '../ui/ExternalLink';

const TAGS = {
  'fixed-daily': { label: 'Same every day', tone: 'accent', Icon: Repeat },
  'fixed-weekday': { label: 'Same Mon–Fri', tone: 'accent', Icon: Repeat },
  leftover: { label: "Last night's dinner, packed", tone: 'info', Icon: Briefcase },
  'cook-double': { label: 'Cook double → tomorrow’s lunch', tone: 'neutral', Icon: CookingPot },
} as const;

export function MacroLine({ n, compact }: { n: Nutrients; compact?: boolean }) {
  return (
    <div className="tabular flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
      <span>
        <span className="font-semibold text-ink">{roundKcal(n.kcal)}</span> kcal
      </span>
      <span>
        <span className="font-semibold text-ink">{Math.round(n.protein)}</span> g protein
      </span>
      {!compact && (
        <>
          <span>{Math.round(n.carbs)} g carbs</span>
          <span>{Math.round(n.fat)} g fat</span>
          <span>{Math.round(n.fiber)} g fibre</span>
        </>
      )}
    </div>
  );
}

export function MealCard({ planned, totals }: { planned: PlannedMeal; totals: Nutrients }) {
  const { meal, slot, time, tag } = planned;
  const t = tag ? TAGS[tag] : null;
  const tutorials = cookingTutorials(meal.tutorials);
  return (
    <article className="rounded-2xl border border-line bg-surface">
      <header className="border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="font-medium text-ink-2">{MEAL_SLOTS[slot].name}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden />
            {time}
          </span>
          {t && (
            <Badge tone={t.tone} className="ml-auto">
              <t.Icon size={12} aria-hidden />
              {t.label}
            </Badge>
          )}
        </div>
        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{meal.title}</h3>
        <div className="mt-1">
          <MacroLine n={totals} />
        </div>
      </header>

      <ul className="divide-y divide-line">
        {meal.items.map((it, idx) => {
          const n = itemNutrients(it);
          return (
            <li key={`${it.food}-${idx}`} className="flex items-start justify-between gap-3 px-4 py-2 text-sm">
              <div className="min-w-0">
                <div className="text-ink">{FOODS[it.food].name}</div>
                <div className="text-xs text-muted">
                  {formatQuantity(it)}
                  {it.note && <> · {it.note}</>}
                </div>
              </div>
              <div className="tabular shrink-0 text-right text-xs text-muted">
                <div>{Math.round(n.kcal)} kcal</div>
                <div>{n.protein.toFixed(n.protein < 10 ? 1 : 0)} g P</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 p-3">
        <Disclosure summary="Preparation, nutrients & tutorials">
          <div className="space-y-3">
            <p>{meal.prep}</p>
            {meal.why && <p className="text-muted">{meal.why}</p>}
            <dl className="tabular grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {[
                ['Iron', `${totals.iron.toFixed(1)} mg`],
                ['Calcium', `${Math.round(totals.calcium)} mg`],
                ['Zinc', `${totals.zinc.toFixed(1)} mg`],
                ['Vitamin C', `${Math.round(totals.vitC)} mg`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-medium text-ink">≈ {v}</dd>
                </div>
              ))}
            </dl>
            {tutorials.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Cooking tutorials</p>
                <TutorialLinks tutorials={tutorials} />
              </div>
            )}
          </div>
        </Disclosure>
      </div>
    </article>
  );
}
