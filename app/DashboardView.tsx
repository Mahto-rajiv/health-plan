'use client';

import Link from 'next/link';
import { ChevronRight, Clock, Dumbbell, Utensils, ListTodo } from 'lucide-react';
import { useToday } from '@/lib/hooks';
import { addDays, dayName, longDate } from '@/lib/dates';
import { SESSIONS, WEEK_PLAN, WEEKDAY_GYM_CUTOFF } from '@/lib/data/training';
import { MEAL_SLOTS } from '@/lib/data/meal-plans';
import { PHASES } from '@/lib/config';
import { useActivePlan } from '@/lib/plan-hooks';
import { weekLabel, weekOn } from '@/lib/phase';
import { roundKcal } from '@/lib/nutrition';
import { activeExercises, estimateMinutes, plannedFor, sessionsFor, setsFor } from '@/lib/training';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function DashboardView() {
  const today = useToday();
  if (!today) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-14 w-64 animate-pulse rounded-xl bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }
  return <Dashboard today={today} />;
}

function Dashboard({ today }: { today: string }) {
  const week = weekOn(today);
  const { plan, phase } = useActivePlan(today);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{longDate(today)}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{greeting()}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="outline">{weekLabel(today)}</Badge>
          <Badge tone="outline">{PHASES[phase].name.split(' · ')[0]}</Badge>
          <Badge tone="outline">{plan.def.shortName} plan</Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrainingCard today={today} week={week} />
        <TonightCard today={today} />
        <MealsCard today={today} />
      </div>
    </div>
  );
}

function TrainingCard({ today, week }: { today: string; week: number }) {
  const options = sessionsFor(today);
  const s = SESSIONS[options[0]];
  const exercises = activeExercises(s.id, week);
  const weekday = s.slot === 'weekday';
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Today's training"
        icon={<Dumbbell size={18} />}
        action={
          <Link href="/training" className="inline-flex min-h-8 items-center gap-0.5 text-sm text-accent hover:underline">
            Training <ChevronRight size={16} aria-hidden />
          </Link>
        }
      />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold text-ink">{options.length > 1 ? options.map((id) => SESSIONS[id].short).join(' or ') : s.name}</h3>
        <span className="text-sm text-muted">≈ {estimateMinutes(s.id, week)} min</span>
        {weekday && (
          <Badge tone="caution">
            <Clock size={12} aria-hidden /> at the gym by {WEEKDAY_GYM_CUTOFF.label}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {options.length > 1
          ? 'Do the one you haven’t done this week. If you can’t get to the gym in time, walk 20–30 min instead.'
          : weekday
            ? 'If you can’t get to the gym in time, skip it and walk 20–30 min. Don’t make it up later.'
            : WEEK_PLAN[dayName(today)].detail}
      </p>
      {options.length === 1 && (
        <ol className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {exercises.map((ex, i) => (
            <li key={ex.id} className="flex items-baseline justify-between gap-3 border-b border-line/70 py-1">
              <span className="min-w-0 truncate text-ink">
                <span className="tabular mr-2 text-xs text-muted">{i + 1}</span>
                {ex.name}
              </span>
              <span className="tabular shrink-0 text-xs text-muted">
                {setsFor(ex, week)} × {ex.reps}
              </span>
            </li>
          ))}
        </ol>
      )}
      <ButtonLink href="/training" variant="primary" className="mt-4 w-full sm:w-auto">
        See warm-up and workout
      </ButtonLink>
    </Card>
  );
}

function MealsCard({ today }: { today: string }) {
  const { plan, phase } = useActivePlan(today);
  const target = PHASES[phase];
  const day = plan.days.find((d) => d.day === dayName(today))!;

  return (
    <Card className="lg:col-span-3">
      <CardHeader
        title="Today's meals"
        icon={<Utensils size={18} />}
        description={`${plan.def.name}, ${target.name}.`}
        action={
          <Link href="/meal-plans" className="inline-flex min-h-8 items-center gap-0.5 text-sm text-accent hover:underline">
            Recipes and amounts <ChevronRight size={16} aria-hidden />
          </Link>
        }
      />
      <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {day.meals.map((pm, i) => (
          <li key={pm.slot} className="rounded-xl border border-line p-3">
            <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-muted">
              <span>{MEAL_SLOTS[pm.slot].name}</span>
              <span>{pm.time}</span>
            </span>
            <span className="mt-0.5 block text-sm font-medium leading-snug text-ink">{pm.meal.title}</span>
            <span className="tabular mt-0.5 block text-xs text-muted">
              {roundKcal(day.mealTotals[i].kcal)} kcal · {Math.round(day.mealTotals[i].protein)} g protein
            </span>
          </li>
        ))}
      </ul>
      <p className="tabular mt-3 text-sm text-ink-2">
        Day total: <span className="font-semibold text-ink">{roundKcal(day.totals.kcal).toLocaleString('en-IN')} kcal</span>,{' '}
        <span className="font-semibold text-ink">{Math.round(day.totals.protein)} g protein</span>, {Math.round(day.totals.fiber)} g fibre. Phase target:{' '}
        {target.kcal[0].toLocaleString('en-IN')}–{target.kcal[1].toLocaleString('en-IN')} kcal and {Math.round(target.protein[0])}–{Math.round(target.protein[1])} g protein.
      </p>
    </Card>
  );
}

function TonightCard({ today }: { today: string }) {
  const todayName = dayName(today);
  const tomorrow = addDays(today, 1);
  const tomorrowName = dayName(tomorrow);
  const { plan } = useActivePlan(tomorrow);
  const tomorrowDay = plan.days.find((d) => d.day === tomorrowName)!;
  const [meal1, lunch, meal3, dinner] = tomorrowDay.meals;
  const tasks: string[] = [];
  if (meal1.meal.items.some((i) => i.food === 'egg')) tasks.push('Boil tomorrow’s eggs while dinner cooks and refrigerate them.');
  if (!tomorrowDay.isWeekend) {
    tasks.push('Freeze a water bottle and an ice pack for tomorrow’s lunch bag.');
    if (lunch.meal.madeWhen === 'night-before') tasks.push(`Make tomorrow’s lunch filling tonight and refrigerate it: ${lunch.meal.title.toLowerCase()}.`);
    if (lunch.meal.dayBefore) tasks.push(lunch.meal.dayBefore);
    tasks.push(`Morning: pack Meal 3 (${meal3.meal.title.toLowerCase()}) with the lunch.`);
  }
  if (dinner.meal.dayBefore) tasks.push(`For tomorrow’s dinner: ${dinner.meal.dayBefore.charAt(0).toLowerCase()}${dinner.meal.dayBefore.slice(1)}`);
  tasks.push('Set curd from milk for tomorrow.');
  if (todayName === 'Sunday') tasks.push(plan.def.prepStrategy[0]);
  const tomorrowTraining = plannedFor(tomorrow);
  return (
    <Card>
      <CardHeader title="Tonight & tomorrow" icon={<ListTodo size={18} />} />
      <ul className="space-y-2 text-sm text-ink-2">
        {tasks.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <span className="text-muted">Tomorrow ({tomorrowName}): </span>
        <span className="font-medium text-ink">{tomorrowTraining}</span>
      </div>
      <p className="mt-3 text-xs text-muted">Lights out by 12:30 AM; an 8:00 AM alarm gives 7.5 h.</p>
    </Card>
  );
}
