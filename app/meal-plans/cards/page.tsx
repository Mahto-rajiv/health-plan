import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CookingCardsView } from './CookingCardsView';

export const metadata: Metadata = { title: 'Cooking cards' };

export default function CookingCardsPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-hidden />}>
      <CookingCardsView />
    </Suspense>
  );
}
