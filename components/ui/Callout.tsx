import { Info, AlertTriangle, CheckCircle2, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

const tones = {
  info: { cls: 'border-sky-200 bg-sky-50/60 text-sky-950', Icon: Info, icon: 'text-sky-600' },
  caution: { cls: 'border-amber-200 bg-amber-50/70 text-amber-950', Icon: AlertTriangle, icon: 'text-amber-600' },
  good: { cls: 'border-emerald-200 bg-emerald-50/60 text-emerald-950', Icon: CheckCircle2, icon: 'text-emerald-600' },
  medical: { cls: 'border-violet-200 bg-violet-50/60 text-violet-950', Icon: Stethoscope, icon: 'text-violet-600' },
} as const;

export function Callout({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3.5 text-sm', t.cls, className)}>
      <t.Icon size={18} className={cn('mt-0.5 shrink-0', t.icon)} aria-hidden />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="leading-relaxed [&_a]:underline">{children}</div>}
      </div>
    </div>
  );
}
