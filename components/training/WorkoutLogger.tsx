'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Flame, ListChecks, Scissors } from 'lucide-react';
import { SESSIONS, type SessionId } from '@/lib/data/training';
import { KEYS, readStore, writeStore, removeStore, type LoggedSet, type WorkoutDraft, type WorkoutRecord } from '@/lib/storage';
import { activeExercises, lastPerformance, rirFor, setsFor } from '@/lib/training';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/Progress';
import { ExerciseLogCard } from './ExerciseLogCard';
import { RestTimer, type RestRequest } from './RestTimer';

function freshSets(sessionId: SessionId, week: number, deload: boolean): Record<string, LoggedSet[]> {
  const out: Record<string, LoggedSet[]> = {};
  for (const ex of activeExercises(sessionId, week, deload)) {
    out[ex.id] = Array.from({ length: setsFor(ex, week, deload) }, () => ({ kg: null, reps: null, done: false }));
  }
  return out;
}

export function WorkoutLogger({
  sessionId,
  date,
  week,
  deload,
  log,
  onComplete,
}: {
  sessionId: SessionId;
  date: string;
  week: number;
  deload: boolean;
  log: WorkoutRecord[];
  onComplete: (record: WorkoutRecord) => void;
}) {
  const session = SESSIONS[sessionId];
  const exercises = useMemo(() => activeExercises(sessionId, week, deload), [sessionId, week, deload]);

  // Resume an unfinished workout for the same session and day, otherwise start fresh.
  const [sets, setSets] = useState<Record<string, LoggedSet[]>>(() => {
    const draft = readStore<WorkoutDraft | null>(KEYS.draft, null);
    if (draft && draft.sessionId === sessionId && draft.date === date) return draft.sets;
    return freshSets(sessionId, week, deload);
  });
  const [short, setShort] = useState(false);
  const [rest, setRest] = useState<RestRequest | null>(null);

  // Persist the in-progress workout (debounced) so a reload or tab switch loses nothing.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => writeStore<WorkoutDraft>(KEYS.draft, { sessionId, date, sets }), 250);
    return () => window.clearTimeout(id);
  }, [sets, sessionId, date]);

  const onChange = useCallback((exerciseId: string, setIndex: number, patch: Partial<LoggedSet>) => {
    setSets((prev) => {
      const list = prev[exerciseId] ?? [];
      const next = list.map((s, i) => (i === setIndex ? { ...s, ...patch } : s));
      return { ...prev, [exerciseId]: next };
    });
  }, []);
  const onSetDone = useCallback((restSec: number) => setRest({ seconds: restSec, startedAt: Date.now() }), []);

  const shown = short ? exercises.slice(0, 3) : exercises;
  const total = shown.reduce((s, ex) => s + (sets[ex.id]?.length ?? 0), 0);
  const done = shown.reduce((s, ex) => s + (sets[ex.id]?.filter((x) => x.done).length ?? 0), 0);

  const lastByExercise = useMemo(() => {
    const out: Record<string, ReturnType<typeof lastPerformance>> = {};
    for (const ex of exercises) out[ex.id] = lastPerformance(log, ex.id, date);
    return out;
  }, [exercises, log, date]);

  const complete = () => {
    const kept: Record<string, LoggedSet[]> = {};
    for (const ex of shown) {
      const doneSets = (sets[ex.id] ?? []).filter((s) => s.done);
      if (doneSets.length) kept[ex.id] = doneSets;
    }
    const record: WorkoutRecord = {
      id: `${date}-${sessionId}-${Date.now()}`,
      date,
      sessionId,
      sets: kept,
      short: short || undefined,
      completedAt: new Date().toISOString(),
    };
    removeStore(KEYS.draft);
    onComplete(record);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-canvas/95 px-4 py-2.5 backdrop-blur lg:top-0 lg:mx-0 lg:rounded-xl lg:border lg:bg-surface">
        <div className="flex items-center gap-3">
          <ListChecks size={18} className="shrink-0 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="tabular flex justify-between text-xs text-muted">
              <span className="truncate font-medium text-ink">{session.name}</span>
              <span>
                {done}/{total} sets
              </span>
            </div>
            <ProgressBar value={done} max={total} className="mt-1.5 h-1.5" label="Workout progress" tone={done === total && total > 0 ? 'good' : 'accent'} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={short ? 'primary' : 'secondary'} size="sm" onClick={() => setShort((s) => !s)} aria-pressed={short}>
          <Scissors size={14} aria-hidden />
          {short ? 'Short version on' : 'Short on time? First 3 only'}
        </Button>
        {deload && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">Easy (deload) week: about 10% lighter, half the sets</span>
        )}
        {week <= 2 && !deload && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            <Flame size={12} aria-hidden /> Learning weeks: stop with 3–4 good reps left
          </span>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {shown.map((ex, i) => (
          <ExerciseLogCard
            key={ex.id}
            index={i}
            exercise={ex}
            sets={sets[ex.id] ?? []}
            rir={rirFor(ex, week, deload)}
            last={lastByExercise[ex.id]}
            onChange={onChange}
            onSetDone={onSetDone}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2">
        <span className="font-medium text-ink">Finish: </span>
        {session.finisher}
      </div>

      <Button size="lg" className="w-full" onClick={complete} disabled={done === 0}>
        <CheckCircle2 size={18} aria-hidden />
        {done === total ? 'Complete workout' : `Finish workout (${done}/${total} sets)`}
      </Button>

      {rest && <RestTimer key={rest.startedAt} request={rest} onClose={() => setRest(null)} />}
    </div>
  );
}
