'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Scale, Ruler, Utensils, Compass, Camera } from 'lucide-react';
import { useBodyLog, useMealLog, useSettings, type BodyEntry } from '@/lib/storage';
import { useToday } from '@/lib/hooks';
import { addDays, daysBetween, shortDate } from '@/lib/dates';
import { DOCTOR_WEIGHT_LOSS, mealAdherence, recalledWeights, rollingAverage, waistLimits, weeklyAverages, type GainStatus } from '@/lib/progress';
import { assessToday } from '@/lib/phase';
import { SAMPLE_BODY, SAMPLE_END, SAMPLE_MEALS } from '@/lib/data/sample';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { SampleBadge } from '@/components/SampleNotice';
import { TrendChart, BarsChart } from '@/components/charts';
import { cn } from '@/lib/utils';

const STATUS_TONE: Record<GainStatus, BadgeTone> = {
  'not-enough-data': 'neutral',
  'still-losing': 'alert',
  stable: 'good',
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
  const [meals] = useMealLog();

  const bodySample = body.filter((e) => e.weightKg !== undefined && !e.recalled).length < 2;
  const mealSample = Object.keys(meals).length < 3;

  const bodyData = bodySample ? SAMPLE_BODY : body;
  const refDate = today ?? SAMPLE_END;

  const weightSeries = useMemo(() => {
    const measuredPoints = rollingAverage(bodyData).map((p) => ({ date: p.date, weight: p.weight, avg: p.avg as number | undefined, recalled: undefined as number | undefined }));
    const recalled = recalledWeights(body).map((e) => ({ date: e.date, weight: undefined, avg: undefined, recalled: e.weightKg }));
    return [...recalled, ...measuredPoints].sort((a, b) => a.date.localeCompare(b.date)).map((p) => ({ ...p, label: shortDate(p.date) }));
  }, [bodyData, body]);
  const limits = waistLimits(settings.heightCm);
  const photos = body.filter((e) => e.photo).map((e) => e.date).sort();
  const waistSeries = useMemo(
    () => weeklyAverages(bodyData).filter((w) => w.waist !== undefined).map((w) => ({ label: shortDate(w.weekStart), waist: Math.round((w.waist as number) * 10) / 10 })),
    [bodyData],
  );
  const assessment = useMemo(() => assessToday(bodyData, settings, today ?? SAMPLE_END), [bodyData, settings, today]);

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
            description={`Phase 0–1: stop the loss (±0.5 kg). Phase 2: +${assessment.targetRange[0]}–${assessment.targetRange[1]} kg/month. Weekly averages only.`}
            action={bodySample ? <SampleBadge /> : <Badge tone={STATUS_TONE[assessment.status]}>{assessment.headline}</Badge>}
          />
          <div className="tabular grid grid-cols-3 gap-3 border-b border-line pb-4">
            <Metric label="Latest weekly avg" value={assessment.latestWeight !== undefined ? `${assessment.latestWeight.toFixed(1)} kg` : '—'} />
            <Metric
              label={assessment.ratePerMonth !== undefined ? 'Rate' : 'Since start'}
              value={
                assessment.ratePerMonth !== undefined
                  ? `${assessment.ratePerMonth > 0 ? '+' : ''}${assessment.ratePerMonth.toFixed(2)} kg/mo`
                  : assessment.sinceStart !== undefined
                    ? `${assessment.sinceStart > 0 ? '+' : ''}${assessment.sinceStart.toFixed(1)} kg`
                    : '—'
              }
            />
            <Metric label="Waist" value={assessment.latestWaist !== undefined ? `${assessment.latestWaist.toFixed(1)} cm` : '—'} />
          </div>
          <div className="mt-4">
            <div className="text-sm font-semibold text-ink">{assessment.headline}</div>
            <p className="mt-1 text-sm text-ink-2">{assessment.action}</p>
            {assessment.doctor && !bodySample && (
              <Callout tone="caution" className="mt-3" title="Discuss unexplained weight loss with a doctor">
                {DOCTOR_WEIGHT_LOSS}
              </Callout>
            )}
          </div>
          {bodySample && (
            <p className="mt-3 text-xs text-muted">
              This assessment uses sample data. It switches to your own data once you log two or more weigh-ins.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Body weight"
          icon={<Scale size={18} />}
          sample={bodySample}
          description={`Weigh-ins (grey dots), 7-day average (line) and recalled weights (orange). First checkpoint: ${settings.preLossWeightKg} kg.`}
        >
          <TrendChart
            data={weightSeries}
            xKey="label"
            unit=" kg"
            series={[
              { key: 'weight', name: 'Weigh-in', color: '#94a3b8', dots: true, width: 0 },
              { key: 'avg', name: '7-day average', color: '#0f766e', width: 2.5 },
              { key: 'recalled', name: 'Recalled (not a weigh-in)', color: '#c2410c', dots: true, width: 0 },
            ]}
            refLines={[{ y: settings.preLossWeightKg, label: `${settings.preLossWeightKg} checkpoint`, color: '#0e7490' }]}
          />
        </ChartCard>
        <ChartCard
          title="Waist"
          icon={<Ruler size={18} />}
          sample={bodySample}
          description={`Weekly average. From your height (${settings.heightCm} cm): ${limits.review} cm (47%) = slow down and review; ${limits.stop} cm (50%) = stop gaining.`}
        >
          <TrendChart
            data={waistSeries}
            xKey="label"
            unit=" cm"
            domain={[70, limits.stop + 2]}
            refLines={[
              { y: limits.review, label: `${limits.review} review`, color: '#d97706' },
              { y: limits.stop, label: `${limits.stop} stop`, color: '#e11d48' },
            ]}
            series={[{ key: 'waist', name: 'Waist', color: '#0f766e', dots: true }]}
          />
        </ChartCard>
        <Card>
          <CardHeader title="Progress photos" icon={<Camera size={18} />} description="Every 4 weeks: same place, light, time and clothes. Photos stay on your phone; tick “photo taken” when you log a weigh-in." />
          {photos.length ? (
            <p className="text-sm text-ink-2">
              {photos.length} photo day{photos.length === 1 ? '' : 's'} logged; last on {shortDate(photos[photos.length - 1])}.
              {today && daysBetween(photos[photos.length - 1], today) >= 28 ? ' Time for the next one.' : ` Next one around ${shortDate(addDays(photos[photos.length - 1], 28))}.`}
            </p>
          ) : (
            <p className="text-sm text-muted">No photos logged yet. Take a front, side and back photo in your first week.</p>
          )}
        </Card>
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
  const [recalled, setRecalled] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const effectiveDate = date || today || '';
  const recent = [...body].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = weight ? Number(weight) : undefined;
    const c = waist ? Number(waist) : undefined;
    if (w === undefined && c === undefined && !photo) return setError('Enter a weight, a waist measurement, or both.');
    if (recalled && w === undefined) return setError('A recalled entry needs a weight.');
    if (w !== undefined && (w < 35 || w > 150)) return setError('Weight looks off. Enter it in kg.');
    if (c !== undefined && (c < 50 || c > 140)) return setError('Waist looks off. Enter it in cm.');
    if (!effectiveDate) return;
    setError(null);
    setBody((prev) => {
      const existing = prev.find((p) => p.date === effectiveDate);
      const merged: BodyEntry = {
        date: effectiveDate,
        weightKg: w ?? existing?.weightKg,
        waistCm: c ?? existing?.waistCm,
        ...(recalled ? { recalled: true } : w !== undefined ? {} : existing?.recalled ? { recalled: true } : {}),
        ...(photo || existing?.photo ? { photo: true } : {}),
      };
      return [...prev.filter((p) => p.date !== effectiveDate), merged];
    });
    setWeight('');
    setWaist('');
    setRecalled(false);
    setPhoto(false);
  };

  return (
    <Card>
      <CardHeader
        title="Log weight & waist"
        icon={<Plus size={18} />}
        description="Morning, after the toilet, before food. Waist at the navel once a week. Past weights can be added with a past date; mark remembered ones so they are charted but not used for decisions."
      />
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
          <input type="number" inputMode="decimal" step="0.1" placeholder="64.0" value={weight} onChange={(e) => setWeight(e.target.value)} className="tabular mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted">Waist (cm)</span>
          <input type="number" inputMode="decimal" step="0.5" placeholder="77" value={waist} onChange={(e) => setWaist(e.target.value)} className="tabular mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px]" />
        </label>
        <Button type="submit" className="col-span-2 sm:col-span-1">
          Save
        </Button>
        <div className="col-span-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2 sm:col-span-4">
          <label className="inline-flex min-h-10 items-center gap-2">
            <input type="checkbox" checked={recalled} onChange={(e) => setRecalled(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            Past weight from memory or an old record (e.g. 68 kg six months ago)
          </label>
          <label className="inline-flex min-h-10 items-center gap-2">
            <input type="checkbox" checked={photo} onChange={(e) => setPhoto(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            Progress photo taken
          </label>
        </div>
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
                {r.recalled && <span className="text-xs text-orange-700"> · recalled</span>}
                {r.photo && <span className="text-xs text-muted"> · photo</span>}
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
