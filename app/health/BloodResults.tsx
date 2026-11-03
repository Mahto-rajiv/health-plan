'use client';

import { ClipboardList, FlaskConical } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { References } from '@/components/References';
import { BLOOD_TESTS, bloodStatus, type ResultStatus } from '@/lib/data/health';
import { useBloodLog } from '@/lib/storage';
import { longDate } from '@/lib/dates';

const STATUS: Record<ResultStatus, { label: string; tone: BadgeTone }> = {
  normal: { label: 'Normal', tone: 'good' },
  'low-normal': { label: 'Low-normal', tone: 'caution' },
  discuss: { label: 'Borderline', tone: 'caution' },
  outside: { label: 'Outside range', tone: 'alert' },
};

const inputClass = 'tabular h-10 w-full min-w-0 rounded-lg border border-line-strong bg-surface px-3 text-[15px]';

/** Summary of what you typed below. Nothing is shown from the code: the results live in this browser. */
export function BloodSummary() {
  const [log] = useBloodLog();
  const rows = BLOOD_TESTS.map((t) => ({ t, v: log.values[t.id], s: bloodStatus(t, log.values[t.id]) })).filter((r) => r.s);
  const fine = rows.filter((r) => r.s === 'normal');
  const flagged = rows.filter((r) => r.s !== 'normal');
  return (
    <Card>
      <CardHeader title="Summary" icon={<ClipboardList size={18} />} />
      <div className="grid gap-4 text-sm md:grid-cols-3">
        <div className="rounded-xl bg-emerald-50/60 p-3">
          <div className="font-medium text-emerald-900">In range</div>
          <p className="mt-1 text-emerald-950/80">
            {rows.length === 0 ? 'Type your results under Blood results to see them here.' : fine.length ? fine.map((r) => r.t.name).join(', ') + '.' : 'None of the results you typed.'}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50/70 p-3">
          <div className="font-medium text-amber-900">Worth acting on</div>
          {flagged.length ? (
            <ul className="mt-1 space-y-1 text-amber-950/80">
              {flagged.map((r) => (
                <li key={r.t.id}>
                  {r.t.name}: {r.t.bands ? `${r.v} ${r.t.unit}` : 'outside range'} ({STATUS[r.s!].label.toLowerCase()})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-amber-950/80">{rows.length ? 'Nothing flagged in what you typed.' : '—'}</p>
          )}
        </div>
        <div className="rounded-xl bg-violet-50/60 p-3">
          <div className="font-medium text-violet-900">Discuss with a doctor</div>
          <p className="mt-1 text-violet-950/80">
            Hair thinning for 6 months (dermatologist), the recent weight loss, and ferritin, zinc, folate and active B12 to complete the picture.
          </p>
        </div>
      </div>
    </Card>
  );
}

/** One row per test: type your value, see what it means. Stored only in this browser. */
export function BloodResults() {
  const [log, setLog] = useBloodLog();
  const groups = [...new Set(BLOOD_TESTS.map((t) => t.group))];
  const setValue = (id: string, v: string) => setLog((prev) => ({ ...prev, values: { ...prev.values, [id]: v } }));
  return (
    <Card>
      <CardHeader
        title="Blood results"
        icon={<FlaskConical size={18} />}
        description="Type your results from the lab report. They are saved only in this browser (not in the app’s code or any server), included in Settings → Download backup, and deleted by Reset everything. Typical reference ranges are shown; your lab's printed range is what counts."
      />
      <label className="mb-4 block max-w-xs">
        <span className="text-xs font-medium text-muted">Date of the blood test</span>
        <input type="date" value={log.date ?? ''} onChange={(e) => setLog((prev) => ({ ...prev, date: e.target.value || undefined }))} className={`mt-1 ${inputClass}`} />
        {log.date && <span className="mt-1 block text-xs text-muted">{longDate(log.date)}</span>}
      </label>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{g}</h3>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {BLOOD_TESTS.filter((t) => t.group === g).map((t) => {
                const value = log.values[t.id] ?? '';
                const status = bloodStatus(t, value);
                return (
                  <li key={t.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`blood-${t.id}`} className="text-sm font-medium text-ink">
                          {t.name}
                        </label>
                        {status && <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>}
                      </div>
                      {t.bands ? (
                        <span className="mt-1 flex items-center gap-2">
                          <input id={`blood-${t.id}`} type="number" inputMode="decimal" step="any" placeholder="—" value={value} onChange={(e) => setValue(t.id, e.target.value)} className={inputClass} />
                          <span className="shrink-0 text-xs text-muted">{t.unit}</span>
                        </span>
                      ) : (
                        <select id={`blood-${t.id}`} value={value} onChange={(e) => setValue(t.id, e.target.value)} className={`mt-1 ${inputClass}`}>
                          <option value="">—</option>
                          <option value="in">In range</option>
                          <option value="out">Outside range</option>
                        </select>
                      )}
                      <div className="mt-1 text-xs text-muted">Range: {t.labRange}</div>
                    </div>
                    <p className="text-sm text-ink-2">{t.about}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <References ids={BLOOD_TESTS.flatMap((t) => t.refs ?? [])} />
    </Card>
  );
}
