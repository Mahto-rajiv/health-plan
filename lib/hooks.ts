'use client';

import { useSyncExternalStore } from 'react';
import { todayISO } from './dates';

const subscribeMidnight = (cb: () => void) => {
  // Re-render once a minute so "today" rolls over at midnight if the tab stays open.
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};

/** Local date (YYYY-MM-DD) on the client; null during SSR/hydration. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribeMidnight, todayISO, () => null);
}
