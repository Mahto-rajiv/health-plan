'use client';

import { useCheckIns, type CheckIn } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { addDays, shortDate } from '@/lib/dates';
import { averageSleep } from '@/lib/progress';
import { cn } from '@/lib/utils';

const SCALE = [1, 2, 3, 4, 5] as const;

function ScalePicker({ label, value, onChange, low, high }: { label: string; value?: number; onChange: (v: 1 | 2 | 3 | 4 | 5) => void; low: string; high: string }) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-muted">{label}</legend>
      <div className="mt-1 flex gap-1.5">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={cn(
              'tabular h-10 min-w-9 flex-1 rounded-lg border text-sm font-medium',
              value === n ? 'border-accent bg-accent text-white' : 'border-line-strong text-ink-2 hover:bg-slate-50',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-0.5 flex justify-between text-[11px] text-muted">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </fieldset>
  );
}

function Field({ label, value, onChange, suffix, step = '0.5', placeholder }: { label: string; value?: number; onChange: (v: number | undefined) => void; suffix: string; step?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-1 flex h-10 items-center rounded-lg border border-line-strong bg-surface focus-within:border-accent">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="tabular h-full w-full min-w-0 rounded-lg bg-transparent px-3 text-[15px] outline-none"
        />
        <span className="pr-3 text-xs text-muted">{suffix}</span>
      </span>
    </label>
  );
}

/** Daily recovery check-in: sleep, energy, soreness, cardio and steps. */
export function CheckInForm({ compact }: { compact?: boolean }) {
  const today = useToday();
  const [log, setLog] = useCheckIns();
  if (!today) return <div className="h-48 animate-pulse rounded-xl bg-slate-50" aria-hidden />;
  const entry: CheckIn = log[today] ?? {};
  const update = (patch: Partial<CheckIn>) => setLog((prev) => ({ ...prev, [today]: { ...(prev[today] ?? {}), ...patch } }));
  const avg = averageSleep(log, today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-3', !compact && 'sm:grid-cols-2')}>
        <Field label="Sleep last night" value={entry.sleepHours} onChange={(v) => update({ sleepHours: v })} suffix="hours" placeholder="7.5" />
        {!compact && <Field label="Cardio today" value={entry.cardioMin} onChange={(v) => update({ cardioMin: v })} suffix="min" step="5" placeholder="0" />}
        {!compact && <Field label="Steps today" value={entry.steps} onChange={(v) => update({ steps: v })} suffix="steps" step="100" placeholder="8000" />}
      </div>
      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <ScalePicker label="Energy" value={entry.energy} onChange={(v) => update({ energy: v })} low="drained" high="great" />
        {!compact && <ScalePicker label="Muscle soreness" value={entry.soreness} onChange={(v) => update({ soreness: v })} low="none" high="very sore" />}
      </div>
      {!compact && (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
            <span>Sleep, last 7 days</span>
            <span className="tabular">{avg !== null ? `avg ${avg.toFixed(1)} h` : 'no entries yet'}</span>
          </div>
          <ol className="grid grid-cols-7 items-end gap-1.5" aria-label="Sleep hours for the last 7 days">
            {week.map((d) => {
              const h = log[d]?.sleepHours;
              const pct = h ? Math.min(100, (h / 9) * 100) : 0;
              return (
                <li key={d} className="flex flex-col items-center gap-1">
                  <div className="flex h-20 w-full items-end rounded-md bg-slate-50">
                    <div
                      className={cn('w-full rounded-md', h === undefined ? '' : h >= 7 ? 'bg-accent' : 'bg-amber-400')}
                      style={{ height: `${pct}%` }}
                      title={h !== undefined ? `${h} h` : 'no entry'}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{shortDate(d).split(' ')[0]}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-1.5 text-[11px] text-muted">Teal = 7 h or more. Amber = under 7 h.</p>
        </div>
      )}
    </div>
  );
}
