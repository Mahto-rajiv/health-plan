'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { NAV, isActive } from './nav';
import { cn } from '@/lib/utils';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Health Plan — dashboard">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">HP</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">Health Plan</span>
        <span className="block text-xs text-muted">Strength · Food · Recovery</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = NAV.filter((n) => n.primary);
  const secondary = NAV.filter((n) => !n.primary);
  const moreActive = secondary.some((n) => isActive(pathname, n.href));

  // Close the "More" sheet on navigation and on Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>

      {/* Desktop / laptop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-5 py-4">
          <Logo />
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-accent-soft text-accent-strong' : 'text-ink-2 hover:bg-slate-50 hover:text-ink',
                    )}
                  >
                    <item.icon size={18} aria-hidden className={active ? 'text-accent' : 'text-muted'} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-muted">
          Educational guidance, not medical advice. Data stays in this browser.
        </p>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Logo />
      </header>

      <main id="main" className="pb-24 lg:pb-10 lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</div>
      </main>

      {/* Mobile / tablet bottom navigation */}
      <nav aria-label="Main" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden">
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {primary.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                    active ? 'text-accent' : 'text-muted',
                  )}
                >
                  <item.icon size={20} aria-hidden />
                  {item.short}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-controls="more-sheet"
              className={cn(
                'flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                moreActive || moreOpen ? 'text-accent' : 'text-muted',
              )}
            >
              <MoreHorizontal size={20} aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More pages" id="more-sheet">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-slate-900/30" onClick={() => setMoreOpen(false)} />
          <div className="pb-safe absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-surface p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">More</span>
              <button type="button" onClick={() => setMoreOpen(false)} className="rounded-lg p-2 text-muted hover:bg-slate-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {secondary.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium',
                        active ? 'border-accent/30 bg-accent-soft text-accent-strong' : 'border-line text-ink',
                      )}
                    >
                      <item.icon size={18} aria-hidden className={active ? 'text-accent' : 'text-muted'} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
