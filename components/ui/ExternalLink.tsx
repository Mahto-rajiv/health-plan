import { ExternalLink as ExternalIcon, PlayCircle, FileText } from 'lucide-react';
import type { Tutorial } from '@/lib/data/tutorials';
import { cn } from '@/lib/utils';

export function ExternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1 text-accent underline-offset-2 hover:underline', className)}
    >
      {children}
      <ExternalIcon size={12} aria-hidden className="shrink-0" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** List of verified tutorials. Each opens in a new tab and is marked external. */
export function TutorialLinks({ tutorials, className }: { tutorials: Tutorial[]; className?: string }) {
  if (!tutorials.length) return null;
  return (
    <ul className={cn('space-y-1.5', className)}>
      {tutorials.map((t) => {
        const Icon = t.kind === 'video' ? PlayCircle : FileText;
        return (
          <li key={t.url}>
            <a
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:border-line-strong hover:bg-slate-50"
            >
              <Icon size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-ink group-hover:underline">{t.title}</span>
                <span className="block text-xs text-muted">
                  {t.source} · {t.kind === 'video' ? 'Video' : 'Article'} · external site
                </span>
              </span>
              <ExternalIcon size={14} className="mt-1 shrink-0 text-muted" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
