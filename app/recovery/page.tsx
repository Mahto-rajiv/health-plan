import type { Metadata } from 'next';
import { Armchair, BatteryCharging, CalendarDays, MoonStar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { References } from '@/components/References';
import { CheckInForm } from '@/components/recovery/CheckInForm';
import { DESK, RECOVERY_SIGNS, REST_DAYS, SLEEP } from '@/lib/data/recovery';

export const metadata: Metadata = { title: 'Recovery' };

export default function RecoveryPage() {
  return (
    <>
      <PageHeader
        title="Recovery"
        description="Sleep, rest days and movement outside the gym. Training is where you create the stimulus; recovery is where you adapt to it."
      />
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Card>
            <CardHeader title="Daily check-in" icon={<BatteryCharging size={18} />} description="Takes 20 seconds. Feeds the dashboard and deload decisions." />
            <CheckInForm />
          </Card>
          <Card>
            <CardHeader title="Sleep" icon={<MoonStar size={18} />} description={SLEEP.target} />
            <p className="text-sm text-ink-2">{SLEEP.current}</p>
            <ol className="mt-3 space-y-2.5">
              {SLEEP.plan.map((p, i) => (
                <li key={p.title} className="flex gap-3 text-sm">
                  <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">{i + 1}</span>
                  <span>
                    <span className="font-medium text-ink">{p.title}. </span>
                    <span className="text-ink-2">{p.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">{SLEEP.why}</p>
            <References ids={SLEEP.refs} />
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Desk-job movement" icon={<Armchair size={18} />} description={DESK.intro} />
            <ul className="divide-y divide-line rounded-xl border border-line">
              {DESK.routine.map((r) => (
                <li key={r.time} className="grid gap-0.5 p-3 text-sm sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <span className="font-medium text-ink">{r.time}</span>
                  <span className="text-ink-2">{r.action}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-2">
              {DESK.setup.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="mt-3">
              <ButtonLink href="/training" size="sm">
                Desk reset routine &amp; mobility videos
              </ButtonLink>
            </div>
            <References ids={DESK.refs} />
          </Card>

          <Card>
            <CardHeader title="Rest & cardio days" icon={<CalendarDays size={18} />} />
            <ul className="space-y-2.5">
              {REST_DAYS.map((r) => (
                <li key={r.day} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="font-medium text-ink">{r.day}</div>
                  <div className="mt-0.5 text-ink-2">{r.what}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <CardHeader title="Am I recovering?" description="Use these signs rather than soreness to judge recovery." />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-emerald-50/60 p-3 text-sm">
              <div className="font-medium text-emerald-900">Good signs</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-emerald-950/80">
                {RECOVERY_SIGNS.good.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-amber-50/70 p-3 text-sm">
              <div className="font-medium text-amber-900">Warning signs</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-amber-950/80">
                {RECOVERY_SIGNS.watch.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line p-3 text-sm">
              <div className="font-medium text-ink">What to do</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink-2">
                {RECOVERY_SIGNS.actions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
