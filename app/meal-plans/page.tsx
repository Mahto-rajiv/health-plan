import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { MealPlansView } from './MealPlansView';

export const metadata: Metadata = { title: 'Meal plans' };

export default function MealPlansPage() {
  return (
    <>
      <PageHeader
        title="Meal plans"
        description="Four complete 7-day plans with the same targets, built differently. Pick the one you'll actually follow. Your choice drives the dashboard."
      />
      <MealPlansView />
    </>
  );
}
