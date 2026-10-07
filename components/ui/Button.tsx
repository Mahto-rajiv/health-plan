import Link from 'next/link';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-slate-50',
  ghost: 'text-ink-2 hover:bg-slate-100',
  danger: 'border border-rose-200 bg-surface text-rose-700 hover:bg-rose-50',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
} as const;

type Common = { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string };

const base =
  'inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

export function Button({ variant = 'primary', size = 'md', className, ...props }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  className,
  href,
  children,
}: Common & { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
