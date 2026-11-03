'use client';

import { useState } from 'react';
import { Clock, Dumbbell } from 'lucide-react';
import { DAYS } from '@/lib/data/meal-plans';
import { SESSIONS, WEEK_PLAN, WEEKDAY_GYM_CUTOFF, type SessionId } from '@/lib/data/training';
import { useToday } from '@/lib/hooks';
import { dayName, longDate } from '@/lib/dates';
import { weekLabel, weekOn } from '@/lib/phase';
import { estimateMinutes, sessionsFor } from '@/lib/training';
import { cn } from '@/lib/utils';
import { Segmented } from '@/components/ui/Segmented';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SessionExercises } from '@/components/training/SessionExercises';
import { ProgramDetails, ScheduleRules, CardioMobility } from './TrainingContent';
import { WarmupSteps } from './WarmupSteps';

type Tab = 'today' | 'week' | 'program' | 'cardio';

export function TrainingView() {
  const [tab, setTab] = useState<Tab>('today');
  return (
    <div className="space-y-5">
      {/* Phones: all tabs visible in a 2-column grid (a scrolling row hid the last ones at 320 px). */}
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
        ]}
      />
      {tab === 'today' && <TodayTab />}
      {tab === 'week' && <WeekTab />}
      {tab === 'program' && <ProgramDetails />}
      {tab === 'cardio' && <CardioMobility />}
    </div>
  );
}

function TodayTab() {
  const today = useToday();
  const [picked, setPicked] = useState<SessionId | null>(null);

  if (!today) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;

  const week = weekOn(today);
  const options = sessionsFor(today);
  const sessionId = picked && options.includes(picked) ? picked : options[0];
  const session = SESSIONS[sessionId];
  const weekday = session.slot === 'weekday';

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{longDate(today)}</span>
          <span aria-hidden>·</span>
          <span>{weekLabel(today)}</span>
        </div>
        <div className="mt-2 flex items-start gap-3">
          {weekday ? <Clock className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden /> : <Dumbbell className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden />}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">
              {session.name} · about {estimateMinutes(sessionId, week)} min
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">
              {weekday
                ? `Go only if you can be at the gym by ${WEEKDAY_GYM_CUTOFF.label} (it closes at 10). If not, skip it and walk 20–30 min instead. Don’t make it up later.`
                : WEEK_PLAN[dayName(today)].detail}
            </p>
          </div>
        </div>
        {options.length > 1 && (
          <div className="mt-3">
            <Segmented<SessionId>
              size="sm"
              label="Which weekday session"
              value={sessionId}
              onChange={setPicked}
              options={options.map((id) => ({ value: id, label: SESSIONS[id].short }))}
            />
            <p className="mt-1.5 text-xs text-muted">Both are allowed today. Pick the one you haven’t done this week. Each is done once a week.</p>
          </div>
        )}
      </Card>

      <WarmupSteps key={`warmup-${sessionId}`} sessionId={sessionId} week={week} />
      <SessionExercises sessionId={sessionId} week={week} />
    </div>
  );
}

function WeekTab() {
  const today = useToday();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Your week"
          description={`Saturday and Sunday are fixed. Lower B (Mon–Wed) and Upper B (Tue–Fri) happen only if you can be at the gym by ${WEEKDAY_GYM_CUTOFF.label}. One session a day at most.`}
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
