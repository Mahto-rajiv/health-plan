'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Scale, Ruler, Dumbbell, CalendarCheck, Utensils, Compass } from 'lucide-react';
import { useBodyLog, useMealLog, useSettings, useWorkoutLog, type BodyEntry } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { daysBetween, shortDate } from '@/lib/dates';
import { assessGain, mealAdherence, rollingAverage, sessionsPerWeek, strengthSeries, weeklyAverages, MAIN_LIFTS, type GainStatus } from '@/lib/progress';
import { SAMPLE_BODY, SAMPLE_END, SAMPLE_MEALS, SAMPLE_WORKOUTS } from '@/lib/data/sample';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { Segmented } from '@/components/ui/Segmented';
import { SampleBadge } from '@/components/SampleNotice';
import { TrendChart, BarsChart } from '@/components/charts';
import { cn } from '@/lib/utils';

const LIFT_LABELS: Record<string, string> = { bench: 'Bench', squat: 'Squat', ohp: 'Overhead press', pullup: 'Pull-up', deadlift: 'Deadlift' };

const STATUS_TONE: Record<GainStatus, BadgeTone> = {
  'not-enough-data': 'neutral',
  'too-slow': 'caution',
  'on-track': 'good',
  'too-fast': 'caution',
  'waist-watch': 'caution',
  'waist-stop': 'alert',
  checkpoint: 'info',
};

export function ProgressView() {
  const today = useToday();
  const [settings] = useSettings();
  const [body, setBody] = useBodyLog();
  const [workouts] = useWorkoutLog();
  const [meals] = useMealLog();
  const [lift, setLift] = useState(MAIN_LIFTS[0].id);

  const bodySample = body.filter((e) => e.weightKg !== undefined).length < 2;
  const liftSample = workouts.length < 2;
  const mealSample = Object.keys(meals).length < 3;

  const bodyData = bodySample ? SAMPLE_BODY : body;
  const refDate = today ?? SAMPLE_END;

  const weightSeries = useMemo(() => rollingAverage(bodyData).map((p) => ({ ...p, label: shortDate(p.date) })), [bodyData]);
  const waistSeries = useMemo(
    () => weeklyAverages(bodyData).filter((w) => w.waist !== undefined).map((w) => ({ label: shortDate(w.weekStart), waist: Math.round((w.waist as number) * 10) / 10 })),
    [bodyData],
  );
  const assessment = useMemo(() => {
    const monthsIn = today ? Math.max(0, daysBetween(settings.programStart, today) / 30.4) : 0;
    return assessGain(bodyData, { heightCm: settings.heightCm, monthsIn });
  }, [bodyData, settings.heightCm, settings.programStart, today]);

  const strength = useMemo(() => strengthSeries(liftSample ? SAMPLE_WORKOUTS : workouts), [liftSample, workouts]);
  const liftPoints = (strength.find((s) => s.id === lift)?.points ?? []).map((p) => ({ ...p, label: shortDate(p.date) }));

  const consistency = useMemo(
    () => sessionsPerWeek(liftSample ? SAMPLE_WORKOUTS : workouts, 12, liftSample ? SAMPLE_END : refDate).map((w) => ({ ...w, label: shortDate(w.weekStart) })),
    [liftSample, workouts, refDate],
  );
  const adherence = useMemo(
    () => mealAdherence(mealSample ? SAMPLE_MEALS : meals, 12, mealSample ? SAMPLE_END : refDate).map((w) => ({ ...w, label: shortDate(w.weekStart), pct: w.pct ?? 0 })),
    [mealSample, meals, refDate],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
        <LogCard today={today} body={body} setBody={setBody} />
        <Card>
          <CardHeader
            title="Should I keep gaining?"
            icon={<Compass size={18} />}
            description={`Target rate ${assessment.targetRange[0]}–${assessment.targetRange[1]} kg/month · reviewed on 4-week trends`}
            action={bodySample ? <SampleBadge /> : <Badge tone={STATUS_TONE[assessment.status]}>{assessment.headline}</Badge>}
          />
          <div className="tabular grid grid-cols-3 gap-3 border-b border-line pb-4">
            <Metric label="Latest weekly avg" value={assessment.latestWeight !== undefined ? `${assessment.latestWeight.toFixed(1)} kg` : '—'} />
            <Metric label="Rate" value={assessment.ratePerMonth !== undefined ? `${assessment.ratePerMonth > 0 ? '+' : ''}${assessment.ratePerMonth.toFixed(2)} kg/mo` : '—'} />
            <Metric label="Waist" value={assessment.latestWaist !== undefined ? `${assessment.latestWaist.toFixed(1)} cm` : '—'} />
          </div>
          <div className="mt-4">
            <div className="text-sm font-semibold text-ink">{assessment.headline}</div>
            <p className="mt-1 text-sm text-ink-2">{assessment.action}</p>
          </div>
          {bodySample && (
            <p className="mt-3 text-xs text-muted">
              This assessment uses sample data. It switches to your own data once you log two or more weigh-ins.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Body weight" icon={<Scale size={18} />} sample={bodySample} description="Daily weigh-ins (dots) and 7-day average (line). Judge the line, not the dots.">
          <TrendChart
            data={weightSeries}
            xKey="label"
            unit=" kg"
            series={[
              { key: 'weight', name: 'Weigh-in', color: '#94a3b8', dots: true, width: 0 },
              { key: 'avg', name: '7-day average', color: '#0f766e', width: 2.5 },
            ]}
          />
        </ChartCard>
        <ChartCard title="Waist" icon={<Ruler size={18} />} sample={bodySample} description="Weekly average. 85 cm = slow down and review; 90 cm = stop gaining.">
          <TrendChart
            data={waistSeries}
            xKey="label"
            unit=" cm"
            domain={[70, 92]}
            refLines={[
              { y: 85, label: '85 review', color: '#d97706' },
              { y: 90, label: '90 stop', color: '#e11d48' },
            ]}
            series={[{ key: 'waist', name: 'Waist', color: '#0f766e', dots: true }]}
          />
        </ChartCard>
        <ChartCard
          title="Strength"
          icon={<Dumbbell size={18} />}
          sample={liftSample}
          description="Estimated 1-rep max from your best logged set (Epley). It shows the trend; don't treat it as a max test. Pull-ups count assistance as negative kg."
        >
          <Segmented size="sm" label="Lift" value={lift} onChange={setLift} options={MAIN_LIFTS.map((l) => ({ value: l.id, label: LIFT_LABELS[l.id] ?? l.name }))} className="mb-3" />
          {liftPoints.length ? (
            <TrendChart data={liftPoints} xKey="label" unit=" kg" series={[{ key: 'e1rm', name: 'Est. 1RM', color: '#0f766e', dots: true }]} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">No sets logged for this lift yet.</p>
          )}
        </ChartCard>
        <ChartCard title="Training consistency" icon={<CalendarCheck size={18} />} sample={liftSample} description="Lifting sessions per week (target line: 4). Three is a good week too.">
          <BarsChart data={consistency} xKey="label" barKey="sessions" name="Sessions" target={4} max={5} />
        </ChartCard>
        <ChartCard title="Nutrition adherence" icon={<Utensils size={18} />} sample={mealSample} description="Share of planned meals eaten as planned each week, from the dashboard checkboxes. Aim for 80% or more.">
          <BarsChart data={adherence} xKey="label" barKey="pct" name="Adherence" unit="%" target={80} max={100} color="#0e7490" />
        </ChartCard>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="truncate text-sm font-semibold text-ink sm:text-base">{value}</div>
    </div>
  );
}

function ChartCard({ title, description, icon, sample, children }: { title: string; description: string; icon: React.ReactNode; sample: boolean; children: React.ReactNode }) {
  return (
    <Card className={cn(sample && 'border-dashed')}>
      <CardHeader title={title} description={description} icon={icon} action={sample ? <SampleBadge /> : undefined} />
      {children}
    </Card>
  );
}

function LogCard({ today, body, setBody }: { today: string | null; body: BodyEntry[]; setBody: (fn: (p: BodyEntry[]) => BodyEntry[]) => void }) {
  const [date, setDate] = useState<string>('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [error, setError] = useState<string | null>(null);
  const effectiveDate = date || today || '';
  const recent = [...body].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = weight ? Number(weight) : undefined;
    const c = waist ? Number(waist) : undefined;
    if (w === undefined && c === undefined) return setError('Enter a weight, a waist measurement, or both.');
    if (w !== undefined && (w < 35 || w > 150)) return setError('Weight looks off. Enter it in kg.');
    if (c !== undefined && (c < 50 || c > 140)) return setError('Waist looks off. Enter it in cm.');
    if (!effectiveDate) return;
    setError(null);
    setBody((prev) => {
      const existing = prev.find((p) => p.date === effectiveDate);
      const merged: BodyEntry = { date: effectiveDate, weightKg: w ?? existing?.weightKg, waistCm: c ?? existing?.waistCm };
      return [...prev.filter((p) => p.date !== effectiveDate), merged];
    });
    setWeight('');
    setWaist('');
  };

  return (
    <Card>
      <CardHeader title="Log weight & waist" icon={<Plus size={18} />} description="Morning, after the toilet, before food. Waist at the navel once a week." />
      <form onSubmit={submit} className="grid grid-cols-2 gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end" noValidate>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-xs font-medium text-muted">Date</span>
          <input
            type="date"
            value={effectiveDate}
            max={today ?? undefined}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted">Weight (kg)</span>
          <input type="number" inputMode="decimal" step="0.1" placeholder="66.0" value={weight} onChange={(e) => setWeight(e.target.value)} className="tabular mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted">Waist (cm)</span>
          <input type="number" inputMode="decimal" step="0.5" placeholder="77" value={waist} onChange={(e) => setWaist(e.target.value)} className="tabular mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]" />
        </label>
        <Button type="submit" className="col-span-2 sm:col-span-1">
          Save
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {recent.length > 0 ? (
        <ul className="tabular mt-4 divide-y divide-line text-sm">
          {recent.map((r) => (
            <li key={r.date} className="flex items-center justify-between gap-3 py-2">
              <span className="text-muted">{shortDate(r.date)}</span>
              <span className="flex-1 text-ink">
                {r.weightKg !== undefined && <span>{r.weightKg} kg</span>}
                {r.weightKg !== undefined && r.waistCm !== undefined && <span className="text-muted"> · </span>}
                {r.waistCm !== undefined && <span>{r.waistCm} cm waist</span>}
              </span>
              <Button variant="ghost" size="sm" aria-label={`Delete entry for ${shortDate(r.date)}`} onClick={() => setBody((prev) => prev.filter((p) => p.date !== r.date))}>
                <Trash2 size={15} aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Callout tone="info" className="mt-4">
          Charts show labelled <strong>sample data</strong> until you log your own. Start with today&apos;s weight and waist.
        </Callout>
      )}
    </Card>
  );
}
