'use client';

import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, User, CalendarRange, Database, IndianRupee } from 'lucide-react';
import { useSettings, useHydrated, usePriceOverrides, exportAll, importAll, clearAll, type Settings } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { programWeek, shortDate, startsLabel, weekStart, addDays } from '@/lib/dates';
import { MEAL_PLAN_DEFINITIONS, type PlanId } from '@/lib/data/meal-plans';
import { FOODS, type FoodId } from '@/lib/data/foods';
import { DEFAULT_PRICES, PRICES_AS_OF } from '@/lib/data/prices';
import { PHASES, PROFILE, phaseForWeek } from '@/lib/config';
import { waistLimits } from '@/lib/progress';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Segmented } from '@/components/ui/Segmented';

function OptField({ label, value, onChange, suffix, step }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; suffix: string; step: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-1 flex h-10 items-center rounded-lg border border-line-strong bg-surface focus-within:border-accent">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          placeholder="—"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="tabular h-full w-full min-w-0 rounded-lg bg-transparent px-3 text-[15px] outline-none"
        />
        <span className="pr-3 text-xs text-muted">{suffix}</span>
      </span>
    </label>
  );
}

/** Every price used by the plans, editable; blank = default. Costs everywhere recompute from this table. */
function PriceTable() {
  const [overrides, setOverrides] = usePriceOverrides();
  const ids = Object.keys(DEFAULT_PRICES) as FoodId[];
  const edited = ids.filter((id) => typeof overrides[id] === 'number').length;
  const set = (id: FoodId, raw: string) =>
    setOverrides((prev) => {
      const next = { ...prev };
      const v = Number(raw);
      if (raw === '' || !Number.isFinite(v) || v <= 0) delete next[id];
      else next[id] = v;
      return next;
    });
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Prices"
        icon={<IndianRupee size={18} />}
        description={`₹ per kg as bought (milk per litre). Defaults are estimates from ${PRICES_AS_OF}, not quotes. Enter your shop's price to replace one; all costs and grocery totals recompute.`}
        action={
          edited ? (
            <Button variant="ghost" size="sm" onClick={() => setOverrides({})}>
              Reset {edited} edited
            </Button>
          ) : undefined
        }
      />
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => {
          const def = DEFAULT_PRICES[id];
          const v = overrides[id];
          return (
            <li key={id} className="flex min-w-0 items-center justify-between gap-3 border-b border-line py-1.5">
              <label htmlFor={`price-${id}`} className="min-w-0 text-sm text-ink">
                <span className="block">{FOODS[id].name}</span>
                <span className="block text-[11px] text-muted">default ₹{def.perKg}{def.note ? ` · ${def.note}` : ''}</span>
              </label>
              <input
                id={`price-${id}`}
                type="number"
                inputMode="decimal"
                min="1"
                placeholder={String(def.perKg)}
                value={typeof v === 'number' ? v : ''}
                onChange={(e) => set(id, e.target.value)}
                className="tabular h-10 w-24 shrink-0 rounded-lg border border-line-strong bg-surface px-2 text-right text-[15px]"
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

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
        <CardHeader title="Profile & goal" icon={<User size={18} />} description={`Defaults: ${PROFILE.sex}, ${PROFILE.age}, ${PROFILE.heightCm} cm, ${PROFILE.weightKg} kg now, ${PROFILE.preLossWeightKg} kg six months ago. Used for the waist limits, the checkpoint and the weight decisions.`} />
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted">Your first name (optional — shown in the greeting)</span>
            <input
              type="text"
              placeholder="e.g. Rajiv"
              value={settings.firstName ?? ''}
              onChange={(e) => update({ firstName: e.target.value || undefined })}
              className="mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Height" value={settings.heightCm} onChange={(v) => update({ heightCm: v })} suffix="cm" step="1" />
            <NumField label="Start weight (now)" value={settings.startWeightKg} onChange={(v) => update({ startWeightKg: v })} suffix="kg" />
            <NumField label="Pre-loss weight (checkpoint)" value={settings.preLossWeightKg} onChange={(v) => update({ preLossWeightKg: v })} suffix="kg" />
            <NumField label="Long-term target" value={settings.targetWeightKg} onChange={(v) => update({ targetWeightKg: v })} suffix="kg" />
            <label className="block">
              <span className="text-xs font-medium text-muted">Program start</span>
              <input
                type="date"
                value={settings.programStart}
                onChange={(e) => e.target.value && update({ programStart: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-2 text-sm min-[360px]:px-3 min-[360px]:text-[15px]"
              />
            </label>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Waist limit at your height: {waistLimits(settings.heightCm).stop} cm (half your height). Review point: {waistLimits(settings.heightCm).review} cm.
        </p>
        <div className="mt-4 border-t border-line pt-3">
          <div className="text-xs font-medium text-muted">What you eat now (optional, your own estimate)</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <OptField label="Calories" value={settings.intakeKcal} onChange={(v) => update({ intakeKcal: v })} suffix="kcal" step="50" />
            <OptField label="Protein" value={settings.intakeProtein} onChange={(v) => update({ intakeProtein: v })} suffix="g" step="5" />
          </div>
          <p className="mt-2 text-xs text-muted">
            Only for comparison with Phase 0 ({PHASES[0].kcal[0].toLocaleString('en-IN')}–{PHASES[0].kcal[1].toLocaleString('en-IN')} kcal, ~90 g protein). If you eat much less than that now, the
            digestive ramp on the Nutrition page matters even more.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Plan & schedule" icon={<CalendarRange size={18} />} />
        <div className="space-y-4">
          <div>
            <div className="mb-1 text-xs font-medium text-muted">Active meal plan</div>
            <Segmented<PlanId> wrap label="Active meal plan" value={settings.planId} onChange={(v) => update({ planId: v })} options={MEAL_PLAN_DEFINITIONS.map((p) => ({ value: p.id, label: p.shortName }))} />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-muted">Phase</div>
            <Segmented<string>
              wrap
              label="Phase"
              value={String(settings.phase)}
              onChange={(v) => update({ phase: v === 'auto' ? 'auto' : (Number(v) as 0 | 1 | 2) })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: '0', label: 'Phase 0' },
                { value: '1', label: 'Phase 1' },
                { value: '2', label: 'Phase 2' },
              ]}
            />
            <p className="mt-1.5 text-xs text-muted">
              Auto follows the program week ({today ? `${startsLabel(settings.programStart, today) ?? `now week ${programWeek(settings.programStart, today)}`} → ${PHASES[phaseForWeek(programWeek(settings.programStart, today))].name}` : '…'}).
              Pick a phase to move up early (e.g. when the Progress page suggests +200 kcal) or to stay longer.
            </p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">Deload this week</div>
                <div className="text-xs text-muted">
                  {thisWeek ? `Week of ${shortDate(thisWeek)}–${shortDate(addDays(thisWeek, 6))} · ${startsLabel(settings.programStart, today!) ?? `program week ${programWeek(settings.programStart, today!)}`}` : ''}
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

      <PriceTable />

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
