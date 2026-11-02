import { Flame, Info, Repeat } from 'lucide-react';
import { SESSIONS, type SessionId } from '@/lib/data/training';
import { EXERCISE_TUTORIALS, type Tutorial } from '@/lib/data/tutorials';
import { activeExercises, rirFor, setsFor } from '@/lib/training';
import { Card, CardHeader } from '../ui/Card';
import { Disclosure } from '../ui/Disclosure';
import { TutorialLinks } from '../ui/ExternalLink';

const rest = (sec: number) => (sec >= 120 ? `${sec / 60} min` : `${sec} s`);

/** "2" → "stop with 2 reps left"; non-numeric cues are shown as written. */
const effort = (rir: string) => (/^\d(?:–\d)?\+?$/.test(rir) ? `stop with ${rir} reps left` : rir);

/**
 * Today's exercises, in order: how many sets, reps, rest, and a swap that
 * works the same muscles when the machine or bench is taken. Nothing is logged.
 */
export function SessionExercises({ sessionId, week, deload }: { sessionId: SessionId; week: number; deload: boolean }) {
  const session = SESSIONS[sessionId];
  const exercises = activeExercises(sessionId, week, deload);
  const nameOf = (id: string) => session.exercises.find((e) => e.id === id)?.name.replace(/ \(.*\)$/, '') ?? id;
  return (
    <Card>
      <CardHeader title={`Workout · ${exercises.length} exercises`} icon={<Flame size={18} />} description="Do them in this order, after the warm-up." />
      {deload ? (
        <p className="mb-3 rounded-xl bg-sky-50 p-3 text-xs font-medium text-sky-900">Easy (deload) week: half the sets, about 10% lighter. The set counts below already include this.</p>
      ) : week <= 2 ? (
        <p className="mb-3 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-900">Learning weeks (1–2): fewer sets, and stop with 3–4 good reps left. The set counts below already include this.</p>
      ) : null}
      <ol className="space-y-3">
        {exercises.map((ex, i) => {
          const sets = setsFor(ex, week, deload);
          const tutorials = (ex.tutorials ?? []).flatMap((id) => EXERCISE_TUTORIALS[id] as Tutorial[]);
          return (
            <li key={ex.id} className="rounded-xl border border-line p-3">
              <div className="flex items-start gap-3">
                <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-ink-2" aria-hidden>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold leading-snug text-ink">{ex.name}</h3>
                  <p className="text-xs text-muted">{ex.muscles}</p>
                  <p className="tabular mt-1.5 text-sm text-ink">
                    <span className="font-semibold">
                      {sets} {sets === 1 ? 'set' : 'sets'}
                    </span>{' '}
                    × {ex.reps} · {effort(rirFor(ex, week, deload))} ·{' '}
                    {ex.supersetWith ? `straight after ${nameOf(ex.supersetWith)}, then rest` : `rest ${rest(ex.restSec)}`}
                  </p>
                  <p className="mt-2 flex gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-ink-2">
                    <Repeat size={14} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                    <span>
                      <span className="font-medium text-ink">Machine or bench taken? </span>
                      {ex.alternative}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Disclosure summary={<span className="inline-flex items-center gap-1.5"><Info size={14} aria-hidden /> How to do it</span>}>
                  <ul className="list-disc space-y-1 pl-4">
                    {ex.cues.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    <span className="font-medium text-ink">Adding weight: </span>when every set reaches {ex.repRange[1]} reps, next time {ex.increment}.
                  </p>
                  {tutorials.length > 0 && <TutorialLinks tutorials={tutorials} className="mt-3" />}
                </Disclosure>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-ink-2">
        <span className="font-medium text-ink">Finish: </span>
        {session.finisher}
      </p>
    </Card>
  );
}
