import { cn } from '@/lib/utils';

const tones = {
  neutral: 'bg-slate-100 text-slate-700',
  accent: 'bg-accent-soft text-accent-strong',
  good: 'bg-emerald-50 text-emerald-800',
  caution: 'bg-amber-50 text-amber-800',
  alert: 'bg-rose-50 text-rose-800',
  info: 'bg-sky-50 text-sky-800',
  outline: 'border border-line text-ink-2',
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}
