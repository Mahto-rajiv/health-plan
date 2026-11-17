import { AlertTriangle, Gauge, HeartPulse, Move, Ban } from 'lucide-react';
import {
  CARDIO,
  EASY_WEEK_SIGNS,
  GLOSSARY,
  MOBILITY,
  MOBILITY_NOTES,
  NEVER_DO,
  INJURY_PREVENTION,
  PHASES,
  PROGRESSION_RULES,
  SESSIONS,
  SESSION_ORDER,
} from '@/lib/data/training';
import { EXERCISE_LINKS, EXERCISE_TUTORIALS, type Tutorial } from '@/lib/data/tutorials';
import { effortText, estimateMinutes, sessionTime, TIME_MODEL } from '@/lib/training';
import { WarmupSteps } from './WarmupSteps';
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
          description="A split: each session trains two muscle groups. Three sessions in a fixed order, on any 5 days of the week. Strength first, muscle second."
        />
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ['Why a split works', 'Muscle growth depends mostly on how many hard sets a muscle gets in a week. A split and a full-body plan give about the same strength and muscle when the weekly sets match.'],
            ['How often', '5 gym days a week, so each muscle comes round about 1.7 times a week. Strength grows a little faster with more practice.'],
            ['Rest for each muscle', 'A new lifter’s muscle can take about 3 days to recover after a hard session. Three sessions over 5 days gives each muscle about that long.'],
            ['Main lifts', 'Bench press, pull-ups and squat. 5–8 reps (pull-ups 5–10), for strength.'],
            ['Smaller exercises', '8–20 reps, for muscle and balance. About 8–13 hard sets per big muscle each week.'],
            ['Effort', 'Stop with 1–3 good reps left. In weeks 1–2, stop with 3–4 left.'],
            ['Session length', 'About 45–55 min with the warm-up, 5 exercises. Any session fits a work morning, before you leave.'],
            ['Progression', 'Add reps until every set reaches the top of the range. Then add the smallest weight step.'],
            ['Easy week', 'When the warning signs show up, or at the latest every 8–10 weeks: half the sets, about 10% lighter, for one week.'],
          ].map(([k, v]) => (
            <li key={k} className="rounded-xl bg-slate-50 p-3">
              <div className="font-medium text-ink">{k}</div>
              <div className="mt-0.5 text-ink-2">{v}</div>
            </li>
          ))}
        </ul>
        <References ids={['ramosCampoSplit', 'pedersenSplit', 'schoenfeldSplit2015', 'bartolomeiSplit', 'schoenfeldFrequency2019', 'schoenfeldFrequency', 'pelland', 'grgicFrequency', 'rutherfordJones', 'radaelliRecovery', 'gentilArms2013', 'gentilArms2015', 'mannarinoArms', 'acsm2026', 'acsm2009', 'schoenfeldVolume', 'singer', 'schoenfeldRest']} />
      </Card>

      <Card>
        <CardHeader title="Words used here" description="Gym words, explained once." />
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt className="font-medium text-ink">{g.term}</dt>
              <dd className="text-ink-2">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {SESSION_ORDER.map((id) => {
        const s = SESSIONS[id];
        return (
          <Card key={id}>
            <CardHeader
              title={s.name}
              description={`${s.focus} About ${estimateMinutes(id, 1)} min in weeks 1–2, ${estimateMinutes(id, 3)} min from week 3.`}
            />
            <TimeBreakdown id={id} />
            <div className="my-4">
              <WarmupSteps sessionId={id} />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-ink">Exercises</h3>
            <ul className="divide-y divide-line sm:hidden">
              {s.exercises.map((ex) => (
                <li key={ex.id} className="py-2.5 text-sm">
                  <div className="font-medium text-ink">{ex.name}</div>
                  <div className="tabular mt-0.5 text-xs text-ink-2">
                    {ex.sets.build} × {ex.reps} · {effortText(ex.repsLeft)} · {ex.pairedWith ? 'after the pair' : `rest ${rest(ex.restSec)}`}
                  </div>
                  <div className="text-xs text-muted">
                    {ex.muscles}
                    {ex.sets.learn !== ex.sets.build ? ` · ${ex.sets.learn} sets in weeks 1–2` : ''}
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
                    <th className="px-2 py-2 font-medium">Effort</th>
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
                        </div>
                      </td>
                      <td className="px-2 py-2 text-ink-2">
                        {ex.sets.build}
                        {ex.sets.learn !== ex.sets.build && <span className="text-xs text-muted"> ({ex.sets.learn} wk 1–2)</span>}
                      </td>
                      <td className="px-2 py-2 text-ink-2">{ex.reps}</td>
                      <td className="px-2 py-2 text-ink-2">{effortText(ex.repsLeft)}</td>
                      <td className="py-2 pl-2 text-ink-2">{ex.pairedWith ? 'after the pair' : rest(ex.restSec)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              <span className="font-medium text-ink-2">Finish{s.finisherMin ? ` (${s.finisherMin} min)` : ''}: </span>
              {s.finisher}
            </p>
            <div className="mt-3 space-y-2">
              {s.exercises.map((ex) => {
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
                    <TutorialLinks tutorials={[EXERCISE_LINKS[ex.link]]} className="mt-3" />
                    <p className="mt-3">
                      <span className="font-medium text-ink">Equipment taken? </span>
                      {ex.alternative.name} ({ex.alternative.equipment}).{ex.alternative.note ? ` ${ex.alternative.note}` : ''}
                    </p>
                    <TutorialLinks tutorials={[EXERCISE_LINKS[ex.alternative.link]]} className="mt-2" />
                  </Disclosure>
                );
              })}
            </div>
          </Card>
        );
      })}

      <ProgressionGuide />
    </div>
  );
}

export function SafetyRules() {
  return (
    <Card>
      <CardHeader title="Never do this" icon={<Ban size={18} />} />
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
  );
}

const rest = (sec: number) => (sec >= 120 ? `${sec / 60} min` : `${sec} s`);
const fmt = (min: number) => String(Math.round(min * 10) / 10);

/** Shows how the session length is worked out, so the number can be checked. */
function TimeBreakdown({ id }: { id: keyof typeof SESSIONS }) {
  const t = sessionTime(id, 3);
  const lifting = t.total - t.warmup - t.finisher - t.ramp;
  return (
    <p className="rounded-xl bg-slate-50 p-3 text-xs text-ink-2">
      <span className="font-medium text-ink">How the time adds up (from week 3): </span>
      warm-up {fmt(t.warmup)} + exercises {fmt(lifting)} + lighter sets before later lifts {fmt(t.ramp)} + finish {fmt(t.finisher)} = {fmt(t.total)} min.
      Each set counts as {TIME_MODEL.workSec} s of work ({TIME_MODEL.perSideWorkSec} s if one side at a time) plus its rest, and each exercise adds {TIME_MODEL.setupMin} min to set up.
    </p>
  );
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
        <CardHeader title="Mobility & flexibility" icon={<Move size={18} />} description="Two short routines. Lifting through a full range of motion does the rest." />
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

function ProgressionGuide() {
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
            <AlertTriangle size={16} className="text-amber-600" aria-hidden /> Take an easy week when…
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950">
            {EASY_WEEK_SIGNS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <References ids={['bellEasyWeek', 'colemanEasyWeek']} />
      </Card>
    </>
  );
}
