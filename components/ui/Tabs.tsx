'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'segmented';
}

export function Tabs({ tabs, activeTab, onChange, className, variant = 'underline' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <div className={cn('flex bg-slate-100 rounded-lg p-1 gap-1', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // underline (default)
  return (
    <div className={cn('flex border-b border-slate-200 gap-0', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap',
            activeTab === tab.id
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

