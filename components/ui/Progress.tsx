import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max,
  className,
  tone = 'accent',
  label,
}: {
  value: number;
  max: number;
  className?: string;
  tone?: 'accent' | 'good' | 'caution' | 'muted';
  label?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = { accent: 'bg-accent', good: 'bg-emerald-500', caution: 'bg-amber-500', muted: 'bg-slate-400' }[tone];
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-300', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
