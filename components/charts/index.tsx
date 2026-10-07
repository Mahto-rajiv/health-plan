'use client';

import dynamic from 'next/dynamic';

// Recharts is ~100 kB; load it only where a chart is actually on screen and
// reserve the space so the layout doesn't jump when it arrives.
function Skeleton({ height = 220 }: { height?: number }) {
  return <div style={{ height }} className="w-full animate-pulse rounded-lg bg-slate-50" aria-hidden />;
}

export const TrendChart = dynamic(() => import('./TrendChart'), {
  ssr: false,
  loading: () => <Skeleton />,
});

export const BarsChart = dynamic(() => import('./TrendChart').then((m) => m.Bars), {
  ssr: false,
  loading: () => <Skeleton height={200} />,
});
