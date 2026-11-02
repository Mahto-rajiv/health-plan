'use client';

import Link from 'next/link';
import { useBodyLog, useSettings } from '@/lib/storage';
import { weightLoss } from '@/lib/progress';

/** The "tell the doctor" to-do, worded from your own weights rather than fixed text. */
export function WeightTodo() {
  const [settings] = useSettings();
  const [body] = useBodyLog();
  const w = weightLoss(body, settings);
  const kg = (v: number) => (Math.round(v * 10) / 10).toLocaleString('en-IN');
  return (
    <>
      {w.loss > 0.2
        ? `Tell the doctor you lost about ${kg(w.loss)} kg (${kg(w.before)} → ${kg(w.now)} kg) in about 6 months, while eating under ~2,000 kcal a day (your estimate).`
        : `Tell the doctor about your weight over the last 6 months (${kg(w.before)} → ${kg(w.now)} kg) and how much you were eating.`}{' '}
      {!w.confirmed && (
        <span className="text-muted">
          These weights come from Settings, not a weigh-in yet.{' '}
          <Link href="/progress" className="text-accent underline">
            Log your weight in Progress
          </Link>{' '}
          to confirm them; Phase 0’s targets assume the weight in Settings.
        </span>
      )}
    </>
  );
}
