'use client';

import { useState } from 'react';
import { BedDouble, CheckCircle2, Clock, Dumbbell, Footprints, Move, RefreshCw, Trash2 } from 'lucide-react';
import { DAYS } from '@/lib/data/meal-plans';
import { CARDIO, MOBILITY, SESSIONS, SESSION_ORDER, WEEK_PLAN, WEEKDAY_GYM_CUTOFF, type SessionId } from '@/lib/data/training';
import { useCheckIns, useSettings, useWorkoutDraft, useWorkoutLog, type WorkoutRecord } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { dayName, longDate, programWeek, shortDate, weekStart } from '@/lib/dates';
import { estimateMinutes, todayTraining } from '@/lib/training';
import { cn } from '@/lib/utils';
import { Segmented } from '@/components/ui/Segmented';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { WorkoutLogger } from '@/components/training/WorkoutLogger';
import { ProgramDetails, ScheduleRules, CardioMobility, ProgressionGuide } from './TrainingContent';
import { WarmupSteps } from './WarmupSteps';

type Tab = 'today' | 'week' | 'program' | 'cardio' | 'progression';

export function TrainingView() {
  const [tab, setTab] = useState<Tab>('today');
  return (
    <div className="space-y-5">
      {/* Phones: all five tabs visible in a 2-column grid (a scrolling row hid the last ones at 320 px). */}
      <Segmented<Tab>
        label="Training sections"
        value={tab}
        onChange={setTab}
        wrap
        className="sm:hidden"
        options={[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'Week' },
          { value: 'program', label: 'Program' },
          { value: 'cardio', label: 'Cardio & mobility' },
          { value: 'progression', label: 'Progression' },
        ]}
      />
      <Segmented<Tab>
        label="Training sections"
        value={tab}
        onChange={setTab}
        className="hidden sm:block"
        options={[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'Week & rescheduling' },
          { value: 'program', label: 'Program' },
          { value: 'cardio', label: 'Cardio & mobility' },
          { value: 'progression', label: 'Progression' },
        ]}
      />
      {tab === 'today' && <TodayTab />}
      {tab === 'week' && <WeekTab />}
      {tab === 'program' && <ProgramDetails />}
      {tab === 'cardio' && <CardioMobility />}
      {tab === 'progression' && <ProgressionTab />}
    </div>
  );
}

function TodayTab() {
  const today = useToday();
  const [settings] = useSettings();
  const [log, setLog] = useWorkoutLog();
  const [draft] = useWorkoutDraft();
  const [override, setOverride] = useState<SessionId | null>(null);
  const [justSaved, setJustSaved] = useState<WorkoutRecord | null>(null);

  if (!today) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;

  const week = programWeek(settings.programStart, today);
  const deload = settings.deloadWeek === weekStart(today);
  const plan = todayTraining(log, today);
  // An unfinished workout from today always comes back, even on a cardio/rest day.
  const resumed = draft && draft.date === today ? draft.sessionId : undefined;
  const sessionId: SessionId | undefined = override ?? resumed ?? (plan.kind === 'fixed' ? plan.sessionId : undefined);

  const save = (rec: WorkoutRecord) => {
    setLog((prev) => [...prev, rec]);
    setOverride(null);
    setJustSaved(rec);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{longDate(today)}</span>
          <span aria-hidden>·</span>
          <span>Program week {week}</span>
          {deload && <Badge tone="info">Deload (easy) week</Badge>}
        </div>
        <div className="mt-2 flex items-start gap-3">
          {plan.kind === 'done' ? (
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} aria-hidden />
          ) : plan.kind === 'rest' || plan.kind === 'late' ? (
            <BedDouble className="mt-0.5 shrink-0 text-muted" size={20} aria-hidden />
          ) : plan.kind === 'flex' ? (
            <Clock className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden />
          ) : (
            <Dumbbell className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden />
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">
              {plan.kind === 'done'
                ? `Done: ${SESSIONS[plan.sessionId!].short}`
                : plan.kind === 'fixed' || plan.kind === 'flex'
                  ? `${SESSIONS[plan.sessionId!].name} · about ${estimateMinutes(plan.sessionId!, week, deload)} min`
                  : plan.kind === 'late'
                    ? 'Skip tonight'
                    : WEEK_PLAN[dayName(today)].label}
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">{plan.note}</p>
          </div>
        </div>
        {plan.kind !== 'fixed' && !sessionId && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {plan.kind === 'flex' && (
              <Button size="sm" className="h-auto min-h-10 shrink py-1.5" onClick={() => setOverride(plan.sessionId!)}>
                Start {SESSIONS[plan.sessionId!].short} (at the gym by {WEEKDAY_GYM_CUTOFF.label})
              </Button>
            )}
            {plan.kind !== 'done' && <LogOtherSession onPick={setOverride} />}
          </div>
        )}
      </Card>

      {justSaved && (
        <Callout tone="good" title={`${SESSIONS[justSaved.sessionId].short} saved`}>
          {Object.values(justSaved.sets).flat().length} sets logged. Eat Meal 4 in the next hour or two. Be in bed by 12:30 AM.
        </Callout>
      )}

      {!sessionId && (plan.kind === 'rest' || plan.kind === 'late') && <OffDayPanel today={today} />}

      {sessionId && <WarmupSteps key={`warmup-${sessionId}-${today}`} sessionId={sessionId} week={week} deload={deload} checkable />}

      {sessionId && (
        <WorkoutLogger key={`${sessionId}-${today}`} sessionId={sessionId} date={today} week={week} deload={deload} log={log} onComplete={save} />
      )}
    </div>
  );
}

function OffDayPanel({ today }: { today: string }) {
  const [checkins, setCheckins] = useCheckIns();
  const minutes = checkins[today]?.cardioMin;
  const add = (m: number) => setCheckins((prev) => ({ ...prev, [today]: { ...(prev[today] ?? {}), cardioMin: (prev[today]?.cardioMin ?? 0) + m } }));
  const mobility = MOBILITY[0];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Walk or easy cardio" icon={<Footprints size={18} />} description={CARDIO.weeklyTarget} />
        <p className="text-sm text-ink-2">{CARDIO.steps}</p>
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <div className="tabular text-sm text-ink">
            Walking / cardio logged today: <span className="font-semibold">{minutes ?? 0} min</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[10, 20, 30].map((m) => (
              <Button key={m} variant="secondary" size="sm" onClick={() => add(m)}>
                +{m} min
              </Button>
            ))}
            {minutes ? (
              <Button variant="ghost" size="sm" onClick={() => setCheckins((prev) => ({ ...prev, [today]: { ...(prev[today] ?? {}), cardioMin: 0 } }))}>
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title={mobility.title} icon={<Move size={18} />} description={mobility.when} />
        <ul className="divide-y divide-line text-sm">
          {mobility.items.map((it) => (
            <li key={it.name} className="flex justify-between gap-3 py-2">
              <span className="text-ink">{it.name}</span>
              <span className="shrink-0 text-xs text-muted">{it.dose}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Videos for each are in the Cardio &amp; mobility tab.</p>
      </Card>
    </div>
  );
}

function LogOtherSession({ onPick }: { onPick: (id: SessionId) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
      <label htmlFor="lift-anyway-select">Already trained today? Log it:</label>
      <select
        id="lift-anyway-select"
        className="h-10 rounded-lg border border-line-strong bg-surface px-2 text-sm text-ink"
        defaultValue=""
        onChange={(e) => e.target.value && onPick(e.target.value as SessionId)}
      >
        <option value="" disabled>
          Choose session…
        </option>
        {SESSION_ORDER.map((id) => (
          <option key={id} value={id}>
            {SESSIONS[id].short}
          </option>
        ))}
      </select>
    </div>
  );
}

function WeekTab() {
  const today = useToday();
  const [log] = useWorkoutLog();
  const thisWeek = today ? log.filter((w) => weekStart(w.date) === weekStart(today)) : [];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Your week"
          description={`Saturday and Sunday are fixed. Lower B (Mon–Wed) and Upper B (Tue–Fri) happen only if you can be at the gym by ${WEEKDAY_GYM_CUTOFF.label}. One session a day at most.`}
          action={today ? <Badge tone={thisWeek.length >= 4 ? 'good' : 'neutral'}>{thisWeek.length}/4 this week</Badge> : null}
        />
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {DAYS.map((d) => {
            const p = WEEK_PLAN[d];
            const isToday = today ? dayName(today) === d : false;
            return (
              <li
                key={d}
                className={cn(
                  'rounded-xl border p-3',
                  isToday ? 'border-accent bg-accent-soft/50' : 'border-line',
                  p.type === 'lift-flex' && 'border-dashed',
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted">{d}</span>
                  {isToday && <Badge tone="accent">Today</Badge>}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink">{p.label}</div>
                <div className="mt-0.5 text-xs text-muted">{p.detail}</div>
              </li>
            );
          })}
        </ol>
      </Card>
      <ScheduleRules />
    </div>
  );
}

function ProgressionTab() {
  const [log, setLog] = useWorkoutLog();
  const recent = [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  return (
    <div className="space-y-4">
      <ProgressionGuide />
      <Card>
        <CardHeader title="Workout history" description="Your most recent logged sessions." icon={<RefreshCw size={18} />} />
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No workouts logged yet. Complete one from the Today tab and it appears here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((w) => {
              const sets = Object.values(w.sets).flat().length;
              return (
                <li key={w.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-ink">
                      {SESSIONS[w.sessionId].short}
                      {w.short && <span className="ml-1.5 text-xs font-normal text-muted">(short)</span>}
                    </div>
                    <div className="text-xs text-muted">
                      {shortDate(w.date)} · {sets} sets
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${SESSIONS[w.sessionId].short} on ${shortDate(w.date)}`}
                    onClick={() => {
                      if (window.confirm('Delete this workout from your history?')) setLog((prev) => prev.filter((x) => x.id !== w.id));
                    }}
                  >
                    <Trash2 size={15} aria-hidden />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
