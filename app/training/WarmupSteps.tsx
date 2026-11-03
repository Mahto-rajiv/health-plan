import { Flame } from 'lucide-react';
import { SESSIONS, type SessionId } from '@/lib/data/training';
import { EXERCISE_TUTORIALS, type Tutorial } from '@/lib/data/tutorials';
import { activeExercises, warmupMinutes } from '@/lib/training';
import { Card, CardHeader } from '@/components/ui/Card';

/** The session's warm-up as numbered steps, done in order before the first exercise. */
export function WarmupSteps({ sessionId, week = 3 }: { sessionId: SessionId; week?: number }) {
  const session = SESSIONS[sessionId];
  const later = activeExercises(sessionId, week).filter((ex) => ex.rampSets);

  const steps = (
    <ol className="space-y-2">
      {session.warmup.map((st, i) => {
        const links = (st.tutorials ?? []).flatMap((id) => EXERCISE_TUTORIALS[id] as Tutorial[]).filter((t) => t.kind === 'video').slice(0, 1);
        return (
          <li key={st.name} className="flex gap-3 rounded-xl border border-line p-3">
            <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-ink-2" aria-hidden>
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-medium text-ink">{st.name}</span>
                <span className="tabular text-xs text-muted">{st.minutes} min</span>
              </div>
              {st.dose !== `${st.minutes} min` && <div className="tabular mt-0.5 text-xs font-medium text-ink-2">{st.dose}</div>}
              <p className="mt-1 text-ink-2">{st.how}</p>
              {links.map((t) => (
                <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline">
                  Video: {t.title} ({t.source})
                </a>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );

  return (
    <Card>
      <CardHeader
        title={`Warm-up · ${warmupMinutes(sessionId)} min`}
        icon={<Flame size={18} />}
        description="Do these in order, before the first exercise. Don’t skip it: it gets your body and your form ready."
      />
      {steps}
      {later.length > 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-ink-2">
          <span className="font-medium text-ink">Later in the session: </span>
          {later.map((ex) => `${ex.rampSets} lighter set before ${ex.name.replace(/ \(.*\)$/, '')}`).join(' · ')}. This time is counted in the session length.
        </p>
      )}
      {(EXERCISE_TUTORIALS.warmUp as Tutorial[]).map((t) => (
        <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline">
          Full warm-up demo: {t.title} ({t.source})
        </a>
      ))}
    </Card>
  );
}
