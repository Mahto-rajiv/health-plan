import { cn } from '@/lib/utils';

export function Stat({
  label,
  value,
  unit,
  sub,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="tabular mt-0.5 truncate text-xl font-semibold tracking-tight text-ink">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}
