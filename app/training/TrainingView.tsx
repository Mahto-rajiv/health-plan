'use client';

import { useState } from 'react';
import { Clock, Dumbbell } from 'lucide-react';
import { GYM_DAYS_PER_WEEK, MAX_DAYS_IN_A_ROW, ROTATION_RULE, SESSIONS, SESSION_ORDER, WORKDAY_GYM_CUTOFF, type SessionId } from '@/lib/data/training';
import { useToday } from '@/lib/hooks';
import { longDate } from '@/lib/dates';
import { weekLabel, weekOn } from '@/lib/phase';
import { estimateMinutes, isWorkday, sessionsFor } from '@/lib/training';
import { Segmented } from '@/components/ui/Segmented';
import { Card, CardHeader } from '@/components/ui/Card';
import { SessionExercises } from '@/components/training/SessionExercises';
import { ProgramDetails, SafetyRules, CardioMobility } from './TrainingContent';
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
          { value: 'week', label: 'Week' },
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
  const options = sessionsFor();
  const sessionId = picked ?? options[0];
  const session = SESSIONS[sessionId];
  const workday = isWorkday(today);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{longDate(today)}</span>
          <span aria-hidden>·</span>
          <span>{weekLabel(today)}</span>
        </div>
        <div className="mt-2 flex items-start gap-3">
          {workday ? <Clock className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden /> : <Dumbbell className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden />}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">
              {session.name} · about {estimateMinutes(sessionId, week)} min
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">
              {workday
                ? `Work day: be at the gym by ${WORKDAY_GYM_CUTOFF.label} (it closes at 10).`
                : 'Day off work: any time of day is fine.'}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Segmented<SessionId>
            size="sm"
            label="Which session"
            value={sessionId}
            onChange={setPicked}
            options={options.map((id) => ({ value: id, label: SESSIONS[id].short }))}
          />
          <p className="mt-1.5 text-xs text-muted">Pick the session after the one you did last. Any of them can be done on any day.</p>
        </div>
      </Card>

      <WarmupSteps key={`warmup-${sessionId}`} sessionId={sessionId} week={week} />
      <SessionExercises sessionId={sessionId} week={week} />
    </div>
  );
}

function WeekTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Your week"
          description={`${GYM_DAYS_PER_WEEK} gym days a week, on any days. One session a day, at most ${MAX_DAYS_IN_A_ROW} in a row. On work days, be at the gym by ${WORKDAY_GYM_CUTOFF.label}.`}
        />
        <p className="mb-3 rounded-xl bg-accent-soft/60 p-3 text-sm font-medium text-ink">{ROTATION_RULE}</p>
        <ol className="grid gap-2 sm:grid-cols-3">
          {SESSION_ORDER.map((id, i) => (
            <li key={id} className="rounded-xl border border-line p-3">
              <div className="text-xs font-medium text-muted">Session {i + 1}</div>
              <div className="mt-1 text-sm font-semibold text-ink">{SESSIONS[id].short}</div>
              <div className="mt-0.5 text-xs text-muted">{SESSIONS[id].focus}</div>
            </li>
          ))}
        </ol>
      </Card>
      <SafetyRules />
    </div>
  );
}
