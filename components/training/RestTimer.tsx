'use client';

import { useEffect, useState } from 'react';
import { Timer, X, Plus } from 'lucide-react';

export interface RestRequest {
  seconds: number;
  startedAt: number;
}

/**
 * Self-contained countdown: ticking re-renders only this component.
 * The parent remounts it (via `key`) for every new rest period.
 */
export function RestTimer({ request, onClose }: { request: RestRequest; onClose: () => void }) {
  const [extra, setExtra] = useState(0);
  const [now, setNow] = useState(request.startedAt);
  const total = (request.seconds + extra) * 1000;
  const endsAt = request.startedAt + total;
  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const done = left === 0;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [done]);

  const pct = Math.min(100, ((now - request.startedAt) / total) * 100);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 lg:bottom-6 lg:pl-60">
      <div
        role="timer"
        aria-live={done ? 'assertive' : 'off'}
        className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-2xl border px-4 py-2.5 shadow-lg ${done ? 'border-emerald-300 bg-emerald-50' : 'border-line bg-surface'}`}
      >
        <Timer size={18} className={done ? 'text-emerald-600' : 'text-accent'} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="tabular text-lg font-semibold leading-none">
            {done ? 'Rest done — next set' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}
          </div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100">
            <div className="h-1 rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {!done && (
          <button type="button" onClick={() => setExtra((e) => e + 30)} className="rounded-lg p-1.5 text-muted hover:bg-slate-100" aria-label="Add 30 seconds">
            <Plus size={16} />
          </button>
        )}
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-slate-100" aria-label="Close timer">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
