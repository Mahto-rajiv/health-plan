'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  hint?: React.ReactNode;
}

/**
 * Accessible tab list. Scrolls horizontally on small screens instead of
 * wrapping or overflowing. Arrow keys move between options.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = 'md',
  stretch,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  size?: 'sm' | 'md';
  stretch?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = options.findIndex((o) => o.value === value);
    const next = options[(idx + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length];
    onChange(next.value);
    const btn = ref.current?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`);
    btn?.focus();
  };
  return (
    <div className={cn('scroll-x -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <div
        ref={ref}
        role="tablist"
        aria-label={label}
        onKeyDown={onKey}
        className={cn('inline-flex min-w-full gap-1 rounded-xl bg-slate-100 p-1 sm:min-w-0', stretch && 'flex w-full')}
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              data-value={o.value}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(o.value)}
              className={cn(
                'flex shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors',
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
                stretch && 'flex-1',
                active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              <span>{o.label}</span>
              {o.hint && <span className={cn('text-[11px] font-normal', active ? 'text-muted' : 'text-slate-400')}>{o.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
