import { AlertTriangle, CalendarClock, Gauge, HeartPulse, Move, Ban } from 'lucide-react';
import {
  CARDIO,
  DELOAD_SIGNALS,
  MOBILITY,
  MOBILITY_NOTES,
  NEVER_DO,
  INJURY_PREVENTION,
  MISSED_SESSION_RULE,
  PHASES,
  PROGRESSION_RULES,
  SCHEDULE_RULES,
  SESSIONS,
  SESSION_ORDER,
} from '@/lib/data/training';
import { EXERCISE_TUTORIALS, type Tutorial } from '@/lib/data/tutorials';
import { estimateMinutes } from '@/lib/training';
import { Card, CardHeader } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { TutorialLinks } from '@/components/ui/ExternalLink';
import { References } from '@/components/References';

const tut = (ids?: (keyof typeof EXERCISE_TUTORIALS)[]) => (ids ?? []).flatMap((id) => EXERCISE_TUTORIALS[id] as Tutorial[]);

export function ProgramDetails() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="How the program works"
          description="Upper/lower split, 4 sessions a week, each muscle trained twice: two fixed weekend sessions and two short weekday ones. Strength first, muscle second."
        />
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ['Main lifts', 'Squat, bench, overhead press, deadlift and pull-ups at 4–8 reps to build strength.'],
            ['Accessories', '8–20 reps to build muscle and balance, with roughly 8–12 hard sets per muscle each week.'],
            ['Effort', 'Stop 1–3 reps short of failure (RIR 1–3, RPE 7–9), or 3–4 reps short (RPE 6–7) in weeks 1–2.'],
            ['Session length', 'Saturday and Sunday 60–75 minutes including warm-up and a 10-minute finisher; weekday sessions ≤ 45 minutes with 5 exercises.'],
            ['Progression', 'Double progression: add reps up to the top of the range on every set, then add the smallest load step.'],
            ['Deload', 'When fatigue signals appear, and at the latest every 8–10 weeks: half the sets, ~10% lighter, for one week.'],
          ].map(([k, v]) => (
            <li key={k} className="rounded-xl bg-slate-50 p-3">
              <div className="font-medium text-ink">{k}</div>
              <div className="mt-0.5 text-ink-2">{v}</div>
            </li>
          ))}
        </ul>
        <References ids={['acsm2026', 'acsm2009', 'schoenfeldFrequency', 'schoenfeldVolume', 'pelland', 'zourdos', 'singer', 'schoenfeldRest']} />
      </Card>

      {SESSION_ORDER.map((id) => {
        const s = SESSIONS[id];
        return (
          <Card key={id}>
            <CardHeader title={s.name} description={`${s.focus} · ≈ ${estimateMinutes(id, 1)} min in weeks 1–2, ≈ ${estimateMinutes(id, 3)} min from week 3`} />
            <ul className="divide-y divide-line sm:hidden">
              {s.exercises.map((ex) => (
                <li key={ex.id} className="py-2.5 text-sm">
                  <div className="font-medium text-ink">{ex.name}</div>
                  <div className="tabular mt-0.5 text-xs text-ink-2">
                    {ex.sets.build} × {ex.reps} · {effort(ex.rir)} · rest {ex.restSec >= 120 ? `${ex.restSec / 60} min` : `${ex.restSec} s`}
                  </div>
                  <div className="text-xs text-muted">
                    {ex.muscles}
                    {ex.sets.learn !== ex.sets.build ? ` · ${ex.sets.learn} sets in weeks 1–2` : ''}
                    {ex.fromWeek ? ` · from week ${ex.fromWeek}` : ''}
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-2 pr-2 font-medium">Exercise</th>
                    <th className="px-2 py-2 font-medium">Sets</th>
                    <th className="px-2 py-2 font-medium">Reps</th>
                    <th className="px-2 py-2 font-medium">Effort (RIR / RPE)</th>
                    <th className="py-2 pl-2 font-medium">Rest</th>
                  </tr>
                </thead>
                <tbody className="tabular divide-y divide-line">
                  {s.exercises.map((ex) => (
                    <tr key={ex.id}>
                      <td className="py-2 pr-2">
                        <div className="font-medium text-ink">{ex.name}</div>
                        <div className="text-xs text-muted">
                          {ex.muscles}
                          {ex.fromWeek ? ` · from week ${ex.fromWeek}` : ''}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-ink-2">
                        {ex.sets.build}
                        {ex.sets.learn !== ex.sets.build && <span className="text-xs text-muted"> ({ex.sets.learn} wk 1–2)</span>}
                      </td>
                      <td className="px-2 py-2 text-ink-2">{ex.reps}</td>
                      <td className="px-2 py-2 text-ink-2">{effort(ex.rir)}</td>
                      <td className="py-2 pl-2 text-ink-2">{ex.restSec >= 120 ? `${ex.restSec / 60} min` : `${ex.restSec} s`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">Finish: {s.finisher}</p>
            <div className="mt-3 space-y-2">
              {s.exercises.map((ex) => {
                const links = tut(ex.tutorials);
                return (
                  <Disclosure key={ex.id} summary={`${ex.name}: how to`}>
                    <ul className="list-disc space-y-1 pl-4">
                      {ex.cues.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      <span className="font-medium text-ink">Progress: </span>
                      {ex.increment}.
                    </p>
                    {ex.alternatives && (
                      <p className="mt-1">
                        <span className="font-medium text-ink">Alternative: </span>
                        {ex.alternatives}
                      </p>
                    )}
                    {links.length > 0 ? (
                      <TutorialLinks tutorials={links} className="mt-3" />
                    ) : (
                      <p className="mt-2 text-xs text-muted">No verified tutorial link for this one. The cues above cover it.</p>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function ScheduleRules() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader
          title="Missed sessions and real life"
          icon={<CalendarClock size={18} />}
          description="Consistency over perfection. The Today tab applies these rules automatically."
        />
        <p className="mb-3 rounded-xl bg-accent-soft/60 p-3 text-sm font-medium text-ink">{MISSED_SESSION_RULE}</p>
        <ul className="space-y-3">
          {SCHEDULE_RULES.map((r) => (
            <li key={r.situation} className="rounded-xl border border-line p-3">
              <div className="text-sm font-semibold text-ink">{r.situation}</div>
              <p className="mt-1 text-sm text-ink-2">{r.action}</p>
              {r.why && <p className="mt-1 text-xs text-muted">{r.why}</p>}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="h-fit">
        <CardHeader title="Never do this" icon={<Ban size={18} />} description="Catch-up training costs more than a missed session." />
        <ul className="space-y-2.5 text-sm text-ink-2">
          {NEVER_DO.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold text-ink">Injury prevention</h3>
        <ul className="mt-2 space-y-2 text-sm text-ink-2">
          {INJURY_PREVENTION.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/** "2" → "RIR 2 (RPE 8)"; non-numeric cues are shown as written. */
function effort(rir: string): string {
  const m = rir.match(/^(\d)(?:–(\d))?$/);
  if (!m) return rir;
  const rpe = m[2] ? `${10 - Number(m[2])}–${10 - Number(m[1])}` : `${10 - Number(m[1])}`;
  return `RIR ${rir} (RPE ${rpe})`;
}

export function CardioMobility() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Cardio" icon={<HeartPulse size={18} />} description={CARDIO.weeklyTarget} />
        <div className="grid gap-3 md:grid-cols-2">
          {[CARDIO.zone2, CARDIO.intervals].map((c) => (
            <div key={c.title} className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="font-medium text-ink">{c.title}</div>
              <p className="mt-1 text-ink-2">{c.how}</p>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-2 text-sm text-ink-2">
          <li>{CARDIO.steps}</li>
          <li>{CARDIO.sitting}</li>
          <li>{CARDIO.interference}</li>
        </ul>
        <TutorialLinks tutorials={tut(CARDIO.tutorials)} className="mt-4" />
        <References ids={['who2020', 'schumann', 'paluch', 'dunstan']} />
      </Card>
      <Card>
        <CardHeader title="Mobility & flexibility" icon={<Move size={18} />} description="Two short routines. Everything else comes from lifting through a full range of motion." />
        <div className="grid gap-4 lg:grid-cols-2">
          {MOBILITY.map((r) => (
            <div key={r.title}>
              <div className="text-sm font-semibold text-ink">{r.title}</div>
              <div className="mb-2 text-xs text-muted">{r.when}</div>
              <ul className="space-y-2">
                {r.items.map((it) => (
                  <li key={it.name} className="rounded-xl border border-line p-3 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-medium text-ink">{it.name}</span>
                      <span className="text-xs text-muted">{it.dose}</span>
                    </div>
                    {it.tutorials && <TutorialLinks tutorials={tut(it.tutorials)} className="mt-2" />}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-2">
          {MOBILITY_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <References ids={['alizadeh', 'konrad', 'behm']} />
      </Card>
    </div>
  );
}

export function ProgressionGuide() {
  return (
    <>
      <Card>
        <CardHeader title="Phases" icon={<Gauge size={18} />} />
        <ol className="grid gap-3 md:grid-cols-2">
          {PHASES.map((p) => (
            <li key={p.name} className="rounded-xl border border-line p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">{p.weeks}</div>
              <div className="mt-0.5 font-semibold text-ink">{p.name}</div>
              <p className="mt-1 text-sm text-ink-2">{p.summary}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted">
                {p.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Card>
      <Card>
        <CardHeader title="Progression rules" />
        <dl className="grid gap-3 md:grid-cols-2">
          {PROGRESSION_RULES.map((r) => (
            <div key={r.title} className="rounded-xl bg-slate-50 p-3 text-sm">
              <dt className="font-medium text-ink">{r.title}</dt>
              <dd className="mt-1 text-ink-2">{r.body}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-amber-950">
            <AlertTriangle size={16} className="text-amber-600" aria-hidden /> Take a deload week when…
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950">
            {DELOAD_SIGNALS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <References ids={['bellDeload', 'colemanDeload', 'zourdos']} />
      </Card>
    </>
  );
}
