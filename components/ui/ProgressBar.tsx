'use client';

import { cn, calcProgress } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showPercent?: boolean;
  height?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  max,
  color = 'bg-sky-500',
  label,
  showPercent = false,
  height = 'sm',
  className,
}: ProgressBarProps) {
  const pct = calcProgress(value, max);

  const heightClass = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
  }[height];

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-slate-600">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heightClass)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
}

export function MacroProgress({ label, current, target, unit, color, bgColor }: MacroProgressProps) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs text-slate-500">{current}<span className="text-slate-400">/{target}{unit}</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

