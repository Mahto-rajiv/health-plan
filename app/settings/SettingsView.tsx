'use client';

import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, User, CalendarRange, Database } from 'lucide-react';
import { useSettings, useHydrated, exportAll, importAll, clearAll, type Settings } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { programWeek, shortDate, weekStart, addDays } from '@/lib/dates';
import { PLANS } from '@/lib/meal-plans';
import type { PlanId } from '@/lib/data/meal-plans';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Segmented } from '@/components/ui/Segmented';

function NumField({ label, value, onChange, suffix, step = '0.5' }: { label: string; value: number; onChange: (v: number) => void; suffix: string; step?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-1 flex h-10 items-center rounded-lg border border-line-strong bg-surface focus-within:border-accent">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))}
          className="tabular h-full w-full min-w-0 rounded-lg bg-transparent px-3 text-[15px] outline-none"
        />
        <span className="pr-3 text-xs text-muted">{suffix}</span>
      </span>
    </label>
  );
}

export function SettingsView() {
  const hydrated = useHydrated();
  const today = useToday();
  const [settings, setSettings] = useSettings();
  const [message, setMessage] = useState<{ tone: 'good' | 'caution'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;
  const thisWeek = today ? weekStart(today) : null;
  const deloadOn = !!thisWeek && settings.deloadWeek === thisWeek;

  const download = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-plan-${today ?? 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: 'good', text: 'Backup downloaded.' });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      importAll(await file.text());
      setMessage({ tone: 'good', text: 'Backup restored.' });
    } catch {
      setMessage({ tone: 'caution', text: 'That file is not a Health Plan backup.' });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Profile & goal" icon={<User size={18} />} description="Used for the waist limit, weight-progress bar and decisions." />
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Height" value={settings.heightCm} onChange={(v) => update({ heightCm: v })} suffix="cm" step="1" />
          <NumField label="Start weight" value={settings.startWeightKg} onChange={(v) => update({ startWeightKg: v })} suffix="kg" />
          <NumField label="Long-term target" value={settings.targetWeightKg} onChange={(v) => update({ targetWeightKg: v })} suffix="kg" />
          <label className="block">
            <span className="text-xs font-medium text-muted">Program start</span>
            <input
              type="date"
              value={settings.programStart}
              onChange={(e) => e.target.value && update({ programStart: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted">
          Waist limit at your height: {Math.round(settings.heightCm / 2)} cm (half your height). Review point: {Math.round(settings.heightCm * 0.47)} cm.
        </p>
      </Card>

      <Card>
        <CardHeader title="Plan & schedule" icon={<CalendarRange size={18} />} />
        <div className="space-y-4">
          <div>
            <div className="mb-1 text-xs font-medium text-muted">Active meal plan</div>
            <Segmented<PlanId> label="Active meal plan" value={settings.planId} onChange={(v) => update({ planId: v })} options={PLANS.map((p) => ({ value: p.def.id, label: p.def.shortName }))} />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-muted">Usual training time</div>
            <Segmented
              label="Usual training time"
              value={settings.trainingTime}
              onChange={(v) => update({ trainingTime: v })}
              options={[
                { value: 'evening', label: 'Evening' },
                { value: 'morning', label: 'Morning' },
              ]}
            />
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">Deload this week</div>
                <div className="text-xs text-muted">
                  {thisWeek ? `Week of ${shortDate(thisWeek)}–${shortDate(addDays(thisWeek, 6))} · program week ${programWeek(settings.programStart, today!)}` : ''}
                </div>
              </div>
              <Button variant={deloadOn ? 'primary' : 'secondary'} size="sm" aria-pressed={deloadOn} onClick={() => update({ deloadWeek: deloadOn ? null : thisWeek })}>
                {deloadOn ? 'On — turn off' : 'Turn on'}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted">Halves the sets and lowers effort in the workout logger for this calendar week only. Use it when fatigue signals appear (see Training → Progression).</p>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Your data" icon={<Database size={18} />} description="Everything is stored only in this browser (localStorage). No account, no server." />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download}>
            <Download size={16} aria-hidden /> Download backup
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden /> Restore backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Delete all logged workouts, weights, meals, check-ins and settings? This cannot be undone.')) {
                clearAll();
                setMessage({ tone: 'good', text: 'All local data cleared.' });
              }
            }}
          >
            <RotateCcw size={16} aria-hidden /> Reset everything
          </Button>
        </div>
        {message && (
          <Callout tone={message.tone} className="mt-4">
            {message.text}
          </Callout>
        )}
        <p className="mt-4 text-xs text-muted">
          Clearing your browser data deletes this information, so download a backup now and then. The data format is plain JSON and is ready to
          move to a backend later.
        </p>
      </Card>
    </div>
  );
}
