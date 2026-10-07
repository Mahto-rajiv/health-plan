import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Native <details>: accessible, zero JS, works in server components. */
export function Disclosure({
  summary,
  children,
  defaultOpen,
  className,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details className={cn('group rounded-xl border border-line bg-surface', className)} open={defaultOpen}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink hover:bg-slate-50">
        <span className="min-w-0">{summary}</span>
        <ChevronDown size={16} className="disclosure-icon shrink-0 text-muted transition-transform" aria-hidden />
      </summary>
      <div className="border-t border-line px-4 py-3 text-sm text-ink-2">{children}</div>
    </details>
  );
}
