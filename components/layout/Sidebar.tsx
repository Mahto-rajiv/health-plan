'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Dumbbell, Salad, UtensilsCrossed, TrendingUp,
  Heart, Activity, Settings, X, Menu
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: Salad },
  { href: '/meal-plans', label: 'Meal Plans', icon: UtensilsCrossed },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/recovery', label: 'Recovery', icon: Heart },
  { href: '/health', label: 'Health', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">HP</span>
          </div>
          <span className="font-semibold text-slate-800">Health Plan</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 h-full z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HP</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Health Plan</p>
              <p className="text-xs text-slate-500">Rajiv · 66 kg → 75 kg</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5',
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon size={18} className={active ? 'text-sky-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 z-30">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HP</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">Health Plan</p>
              <p className="text-xs text-slate-400">Personal System</p>
            </div>
          </div>
        </div>

        {/* User summary */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-semibold text-sm">
              R
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Rajiv</p>
              <p className="text-xs text-slate-500">66 kg → 75 kg target</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5',
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon
                  size={17}
                  className={cn(
                    'flex-shrink-0',
                    active ? 'text-sky-600' : 'text-slate-400'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom note */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            Sample data shown. Connect a backend to persist real data.
          </p>
        </div>
      </aside>
    </>
  );
}

