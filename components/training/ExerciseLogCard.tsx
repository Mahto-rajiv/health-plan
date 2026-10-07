'use client';

import { memo } from 'react';
import { Check, History, Info } from 'lucide-react';
import type { Exercise } from '@/lib/data/training';
import { EXERCISE_TUTORIALS, type Tutorial } from '@/lib/data/tutorials';
import type { LoggedSet } from '@/lib/storage';
import { formatSet, progressionHint } from '@/lib/training';
import { shortDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { Disclosure } from '../ui/Disclosure';
import { TutorialLinks } from '../ui/ExternalLink';

interface Props {
  index: number;
  exercise: Exercise;
  sets: LoggedSet[];
  rir: string;
  last: { date: string; sets: LoggedSet[] } | null;
  onChange: (exerciseId: string, setIndex: number, patch: Partial<LoggedSet>) => void;
  onSetDone: (restSec: number) => void;
}

function NumberInput({ value, onChange, label, step = 'any', placeholder }: { value: number | null; onChange: (v: number | null) => void; label: string; step?: string; placeholder?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      aria-label={label}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="tabular h-10 w-full min-w-0 rounded-lg border border-line-strong bg-surface px-2 text-center text-[15px] text-ink placeholder:text-slate-300 focus:border-accent"
    />
  );
}

function ExerciseLogCardImpl({ index, exercise: ex, sets, rir, last, onChange, onSetDone }: Props) {
  const tutorials = (ex.tutorials ?? []).flatMap((id) => EXERCISE_TUTORIALS[id] as Tutorial[]);
  const hint = progressionHint(ex, last, sets.length);
  const doneCount = sets.filter((s) => s.done).length;
  const repsLabel = ex.unit === 'metres' ? 'Metres' : 'Reps';
  return (
    <article className={cn('rounded-2xl border bg-surface', doneCount === sets.length && sets.length > 0 ? 'border-emerald-200' : 'border-line')}>
      <header className="flex items-start gap-3 px-4 pt-3.5">
        <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-ink-2">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{ex.name}</h3>
          <p className="tabular mt-0.5 text-xs text-muted">
            {sets.length} × {ex.reps} · RIR {rir} · rest {ex.restSec >= 120 ? `${ex.restSec / 60} min` : `${ex.restSec} s`}
          </p>
        </div>
        <span className="tabular shrink-0 text-xs text-muted">
          {doneCount}/{sets.length}
        </span>
      </header>

      {(last || hint) && (
        <div className="mx-4 mt-2.5 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-2">
          <History size={14} className="mt-0.5 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0">
            {last && (
              <div>
                Last ({shortDate(last.date)}): <span className="tabular font-medium">{last.sets.map((s) => formatSet(s, ex.unit)).join(', ')}</span>
              </div>
            )}
            {hint && <div className="text-muted">{hint}</div>}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem] items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted">
          <span>Set</span>
          <span className="text-center">kg</span>
          <span className="text-center">{repsLabel}</span>
          <span className="text-center">Done</span>
        </div>
        <ol className="mt-1.5 space-y-1.5">
          {sets.map((s, i) => (
            <li key={i} className="grid grid-cols-[2rem_1fr_1fr_2.75rem] items-center gap-2">
              <span className="tabular text-sm text-muted">{i + 1}</span>
              <NumberInput label={`Set ${i + 1} load in kg`} value={s.kg} onChange={(v) => onChange(ex.id, i, { kg: v })} placeholder={last?.sets[i]?.kg?.toString() ?? last?.sets[0]?.kg?.toString() ?? '—'} />
              <NumberInput label={`Set ${i + 1} ${repsLabel.toLowerCase()}`} step="1" value={s.reps} onChange={(v) => onChange(ex.id, i, { reps: v })} placeholder={String(ex.repRange[0])} />
              <button
                type="button"
                aria-pressed={s.done}
                aria-label={`Mark set ${i + 1} ${s.done ? 'not done' : 'done'}`}
                onClick={() => {
                  const patch: Partial<LoggedSet> = { done: !s.done };
                  if (!s.done) {
                    // Fill empty fields from the placeholder targets so a tap is enough.
                    if (s.kg === null) patch.kg = last?.sets[i]?.kg ?? last?.sets[0]?.kg ?? null;
                    if (s.reps === null) patch.reps = ex.repRange[0];
                    onSetDone(ex.restSec);
                  }
                  onChange(ex.id, i, patch);
                }}
                className={cn(
                  'flex h-10 w-full items-center justify-center rounded-lg border transition-colors',
                  s.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line-strong text-muted hover:border-accent hover:text-accent',
                )}
              >
                <Check size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="px-3 pb-3">
        <Disclosure summary={<span className="inline-flex items-center gap-1.5"><Info size={14} aria-hidden /> Technique, progression{tutorials.length ? ' & tutorials' : ''}</span>}>
          <div className="space-y-3">
            <ul className="list-disc space-y-1 pl-4">
              {ex.cues.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p>
              <span className="font-medium text-ink">Progression: </span>when every set reaches {ex.repRange[1]}
              {ex.unit === 'metres' ? ' m' : ' reps'} at RIR {rir}, next time {ex.increment}.
            </p>
            {ex.alternatives && (
              <p>
                <span className="font-medium text-ink">Alternative: </span>
                {ex.alternatives}
              </p>
            )}
            {tutorials.length > 0 && <TutorialLinks tutorials={tutorials} />}
          </div>
        </Disclosure>
      </div>
    </article>
  );
}

export const ExerciseLogCard = memo(ExerciseLogCardImpl);
