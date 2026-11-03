'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Clock, Dumbbell, MoonStar, Scale, TrendingUp, Utensils, ListTodo } from 'lucide-react';
import { useBodyLog, useCheckIns, useMealLog, useSettings } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { addDays, dayName, longDate, programWeek, shortDate, startsLabel, weekStart } from '@/lib/dates';
import { SESSIONS, WEEK_PLAN, WEEKDAY_GYM_CUTOFF } from '@/lib/data/training';
import { DAYS, MEAL_SLOTS } from '@/lib/data/meal-plans';
import { PHASES } from '@/lib/config';
import { useActivePlan } from '@/lib/plan-hooks';
import { assessToday } from '@/lib/phase';
import { roundKcal, sumNutrients } from '@/lib/nutrition';
import { activeExercises, estimateMinutes, plannedFor, sessionsFor, setsFor } from '@/lib/training';
import { DOCTOR_WEIGHT_LOSS, averageSleep, rollingAverage } from '@/lib/progress';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { Sparkline } from '@/components/charts/Sparkline';
import { CheckInForm } from '@/components/recovery/CheckInForm';
import { cn } from '@/lib/utils';

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
  const [settings] = useSettings();
  const week = programWeek(settings.programStart, today);
  const deload = settings.deloadWeek === weekStart(today);
  const name = settings.firstName?.trim();
  const { plan, phase } = useActivePlan(today);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{longDate(today)}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {greeting()}{name ? `, ${name}` : ''}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="outline">{startsLabel(settings.programStart, today) ?? `Program week ${week}`}</Badge>
          {deload && <Badge tone="info">Deload week</Badge>}
          <Badge tone="outline">{PHASES[phase].name.split(' · ')[0]}</Badge>
          <Badge tone="outline">{plan.def.shortName} plan</Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrainingCard today={today} week={week} deload={deload} />
        <WeightCard />
        <MealsCard today={today} />
        <WeekCard today={today} />
        <RecoveryCard today={today} />
        <TonightCard today={today} />
      </div>
    </div>
  );
}

function TrainingCard({ today, week, deload }: { today: string; week: number; deload: boolean }) {
  const options = sessionsFor(today);
  const s = SESSIONS[options[0]];
  const exercises = activeExercises(s.id, week, deload);
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
        <span className="text-sm text-muted">≈ {estimateMinutes(s.id, week, deload)} min</span>
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
                {setsFor(ex, week, deload)} × {ex.reps}
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

function WeightCard() {
  const [settings] = useSettings();
  const [body, setBody] = useBodyLog();
  const today = useToday()!;
  const [input, setInput] = useState('');
  const series = useMemo(() => rollingAverage(body), [body]);
  const latest = series[series.length - 1];
  const status = useMemo(() => assessToday(body, settings, today), [body, settings, today]);
  const current = latest?.avg ?? settings.startWeightKg;
  const gained = current - settings.startWeightKg;
  // The progress bar runs to the first checkpoint (pre-loss weight), not the long-term goal.
  const span = settings.preLossWeightKg - settings.startWeightKg;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(input);
    if (!input || !Number.isFinite(v) || v < 35 || v > 150) return;
    setBody((prev) => {
      const existing = prev.find((p) => p.date === today);
      return [...prev.filter((p) => p.date !== today), { date: today, weightKg: v, waistCm: existing?.waistCm }];
    });
    setInput('');
  };

  return (
    <Card>
      <CardHeader title="Body weight" icon={<Scale size={18} />} action={<Link href="/progress" className="inline-flex min-h-8 items-center text-sm text-accent hover:underline">Progress</Link>} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="tabular text-3xl font-semibold tracking-tight text-ink">
            {current.toFixed(1)}
            <span className="ml-1 text-base font-normal text-muted">kg</span>
          </div>
          <div className="text-xs text-muted">{latest ? '7-day average' : 'Starting weight. Log a weigh-in.'}</div>
        </div>
        <Sparkline values={series.slice(-21).map((p) => p.avg)} className="h-10 w-28" />
      </div>
      <div className="tabular mt-3 flex justify-between text-xs text-muted">
        <span>{settings.startWeightKg} kg start</span>
        <span>
          {gained >= 0 ? '+' : ''}
          {gained.toFixed(1)} kg
        </span>
        <span>{settings.preLossWeightKg} kg checkpoint</span>
      </div>
      <ProgressBar value={Math.max(0, gained)} max={span > 0 ? span : 1} className="mt-1.5" label="Progress toward the first checkpoint" />
      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
        <span className="font-medium text-ink">{status.headline}.</span> <span className="text-ink-2">{status.action}</span>
        {status.doctor && <p className="mt-1 font-medium text-amber-800">{DOCTOR_WEIGHT_LOSS}</p>}
      </div>
      <form onSubmit={save} className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="quick-weight">
          Today&apos;s weight in kg
        </label>
        <input
          id="quick-weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="Today's weight (kg)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="tabular h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-[15px]"
        />
        <Button type="submit" variant="secondary">
          Log
        </Button>
      </form>
    </Card>
  );
}

function MealsCard({ today }: { today: string }) {
  const [mealLog, setMealLog] = useMealLog();
  const { plan, phase } = useActivePlan(today);
  const target = PHASES[phase];
  const day = plan.days.find((d) => d.day === dayName(today))!;
  const checked = mealLog[today] ?? [false, false, false, false];
  const eaten = sumNutrients(day.mealTotals.filter((_, i) => checked[i]));
  const toggle = (i: number) =>
    setMealLog((prev) => {
      const cur = [...(prev[today] ?? [false, false, false, false])] as [boolean, boolean, boolean, boolean];
      cur[i] = !cur[i];
      return { ...prev, [today]: cur };
    });

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Today's meals"
        icon={<Utensils size={18} />}
        description={`${plan.def.name}, ${target.name}. Tick each meal you eat as planned.`}
        action={
          <Link href="/meal-plans" className="inline-flex min-h-8 items-center gap-0.5 text-sm text-accent hover:underline">
            Details <ChevronRight size={16} aria-hidden />
          </Link>
        }
      />
      <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
        <ul className="space-y-2">
          {day.meals.map((pm, i) => (
            <li key={pm.slot}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={checked[i]}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                  checked[i] ? 'border-emerald-200 bg-emerald-50/50' : 'border-line hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border',
                    checked[i] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line-strong',
                  )}
                  aria-hidden
                >
                  {checked[i] && <Check size={14} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-muted">
                    <span>{MEAL_SLOTS[pm.slot].name}</span>
                    <span>{pm.time}</span>
                  </span>
                  <span className="mt-0.5 block text-sm font-medium leading-snug text-ink">{pm.meal.title}</span>
                  <span className="tabular mt-0.5 block text-xs text-muted">
                    {roundKcal(day.mealTotals[i].kcal)} kcal · {Math.round(day.mealTotals[i].protein)} g protein
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <div>
            <div className="tabular flex items-baseline justify-between text-sm">
              <span className="text-muted">Calories</span>
              <span>
                <span className="font-semibold text-ink">{roundKcal(eaten.kcal).toLocaleString('en-IN')}</span>
                <span className="text-muted"> / {roundKcal(day.totals.kcal).toLocaleString('en-IN')}</span>
              </span>
            </div>
            <ProgressBar value={eaten.kcal} max={day.totals.kcal} className="mt-1.5" label="Calories eaten" />
          </div>
          <div>
            <div className="tabular flex items-baseline justify-between text-sm">
              <span className="text-muted">Protein</span>
              <span>
                <span className="font-semibold text-ink">{Math.round(eaten.protein)}</span>
                <span className="text-muted"> / {Math.round(day.totals.protein)} g</span>
              </span>
            </div>
            <ProgressBar value={eaten.protein} max={day.totals.protein} className="mt-1.5" label="Protein eaten" />
          </div>
          <div>
            <div className="tabular flex items-baseline justify-between text-sm">
              <span className="text-muted">Fibre</span>
              <span>
                <span className="font-semibold text-ink">{Math.round(eaten.fiber)}</span>
                <span className="text-muted"> g</span>
              </span>
            </div>
          </div>
          <p className="text-xs text-muted">
            Phase target: {target.kcal[0].toLocaleString('en-IN')}–{target.kcal[1].toLocaleString('en-IN')} kcal and {Math.round(target.protein[0])}–{Math.round(target.protein[1])} g protein. The bars fill to today&apos;s plan.
          </p>
        </div>
      </div>
    </Card>
  );
}

function WeekCard({ today }: { today: string }) {
  const [meals] = useMealLog();
  const [checkins] = useCheckIns();
  const ws = weekStart(today);
  const dates = DAYS.map((_, i) => addDays(ws, i));
  let eaten = 0;
  let possible = 0;
  for (const d of dates) {
    if (d > today) break;
    possible += 4;
    eaten += (meals[d] ?? []).filter(Boolean).length;
  }
  const cardio = dates.reduce((s, d) => s + (checkins[d]?.cardioMin ?? 0), 0);
  return (
    <Card>
      <CardHeader title="This week" icon={<TrendingUp size={18} />} />
      <ol className="grid grid-cols-7 gap-1" aria-label="Training days this week">
        {dates.map((d) => {
          const planned = WEEK_PLAN[dayName(d)].type === 'lift-fixed';
          const isToday = d === today;
          return (
            <li key={d} className="flex flex-col items-center gap-1">
              <span className={cn('text-[11px]', isToday ? 'font-semibold text-ink' : 'text-muted')}>{dayName(d).slice(0, 1)}</span>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border text-[10px]',
                  planned ? 'border-line-strong text-muted' : 'border-dashed border-line text-muted',
                  isToday && 'border-accent',
                )}
                title={planned ? 'Fixed session' : 'Flexible weekday session or walk'}
              >
                {planned ? 'L' : 'f'}
              </span>
            </li>
          );
        })}
      </ol>
      <dl className="tabular mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-[11px] text-muted">Meals</dt>
          <dd className="text-lg font-semibold text-ink">{possible ? Math.round((eaten / possible) * 100) : 0}%</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-[11px] text-muted">Cardio</dt>
          <dd className="text-lg font-semibold text-ink">{cardio}m</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">Target: 4 sessions (Saturday, Sunday and two flexible weekday ones; 3 is fine), at least 80% of meals as planned, and 150+ minutes of moderate activity a week including walking. L = fixed, f = flexible.</p>
    </Card>
  );
}

function RecoveryCard({ today }: { today: string }) {
  const [checkins] = useCheckIns();
  const avg = averageSleep(checkins, today);
  return (
    <Card>
      <CardHeader
        title="Recovery"
        icon={<MoonStar size={18} />}
        description={avg !== null ? `7-day sleep average: ${avg.toFixed(1)} h` : 'Aim for 7.5–8 h in bed: lights out by 12:30 AM.'}
        action={<Link href="/recovery" className="inline-flex min-h-8 items-center text-sm text-accent hover:underline">Recovery</Link>}
      />
      <CheckInForm compact />
      <p className="mt-3 text-xs text-muted">Last check-in: {checkins[today] ? 'today' : Object.keys(checkins).sort().pop() ? shortDate(Object.keys(checkins).sort().pop()!) : 'none yet'}</p>
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
