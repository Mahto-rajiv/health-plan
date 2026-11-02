import { Clock, Repeat, Briefcase, Timer, CookingPot, Snowflake, Leaf } from 'lucide-react';
import { FOODS, type Nutrients } from '@/lib/data/foods';
import { MEAL_SLOTS, type PlannedMeal } from '@/lib/data/meal-plans';
import { cookingTutorials } from '@/lib/data/tutorials';
import { formatQuantity, itemNutrients, roundKcal } from '@/lib/nutrition';
import { storageAdvice } from '@/lib/meal-plans';
import { formatINR } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import { Disclosure } from '../ui/Disclosure';
import { TutorialLinks } from '../ui/ExternalLink';

const TAGS = {
  'fixed-daily': { label: 'Same every day', tone: 'accent', Icon: Repeat },
  'fixed-weekday': { label: 'Same Mon–Fri', tone: 'accent', Icon: Repeat },
  'office-lunch': { label: 'Eaten cold at the office', tone: 'info', Icon: Briefcase },
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

export function MealCard({ planned, totals, cost }: { planned: PlannedMeal; totals: Nutrients; cost: number }) {
  const { meal, slot, time, tag } = planned;
  const t = tag ? TAGS[tag] : null;
  const tutorials = cookingTutorials(meal.tutorials);
  const storage = storageAdvice(planned);
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
        <div className="tabular mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Timer size={12} aria-hidden />
            {meal.madeWhen === 'night-before'
              ? `${meal.activeMin} min hands-on the evening before · ${meal.morningMin ?? 0} min to pack in the morning`
              : `${meal.activeMin} min hands-on · ${meal.totalMin} min total`}
          </span>
          {meal.pots > 0 && (
            <span className="inline-flex items-center gap-1">
              <CookingPot size={12} aria-hidden />
              {meal.pots} pot{meal.pots === 1 ? '' : 's'}
            </span>
          )}
          {!meal.requiresReheat && tag === 'office-lunch' && (
            <span className="inline-flex items-center gap-1">
              <Snowflake size={12} aria-hidden />
              no reheating
            </span>
          )}
          <span>≈ {formatINR(cost)} a serving</span>
        </div>
      </header>

      <ul className="divide-y divide-line">
        {meal.items.map((it, idx) => {
          const n = itemNutrients(it);
          return (
            <li key={`${it.food}-${idx}`} className="flex items-start justify-between gap-3 px-4 py-2 text-sm">
              <div className="min-w-0">
                <div className="text-ink">
                  {FOODS[it.food].name}
                  {it.slot && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] text-emerald-700">
                      <Leaf size={11} aria-hidden /> seasonal
                    </span>
                  )}
                </div>
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
        <Disclosure summary="Preparation, swaps, storage & nutrients">
          <div className="space-y-3">
            {meal.dayBefore && (
              <p>
                <span className="font-medium text-ink">Day before: </span>
                {meal.dayBefore}
              </p>
            )}
            <ol className="list-decimal space-y-1 pl-5">
              {meal.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {meal.why && <p className="text-muted">{meal.why}</p>}
            <p>
              <span className="font-medium text-ink">Flavour: </span>
              {meal.flavour}
            </p>
            {meal.substitutions.length > 0 && (
              <div>
                <p className="font-medium text-ink">Swaps</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {meal.substitutions.map((s) => (
                    <li key={s.swap}>
                      {s.swap} → {s.with}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {storage.length > 0 && (
              <div>
                <p className="font-medium text-ink">Storage and safety</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {storage.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <dl className="tabular grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              {[
                ['Iron', `${totals.iron.toFixed(1)} mg`],
                ['Calcium', `${Math.round(totals.calcium)} mg`],
                ['Zinc', `${totals.zinc.toFixed(1)} mg`],
                ['Vitamin C', `${Math.round(totals.vitC)} mg`],
                ['Vitamin B12', `${totals.b12.toFixed(1)} µg`],
                ['Folate', `${Math.round(totals.folate)} µg`],
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
