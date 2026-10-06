'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }[padding];

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 shadow-sm',
      paddingClass,
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('font-semibold text-slate-800 text-sm tracking-tight', className)}>{children}</h3>;
}

