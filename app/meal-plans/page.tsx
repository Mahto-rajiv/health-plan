import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { MealPlansView } from './MealPlansView';

export const metadata: Metadata = { title: 'Meal plans' };

export default function MealPlansPage() {
  return (
    <>
      <PageHeader
        title="Meal plans"
        description="Three 7-day plans (vegetarian, vegetarian + eggs, non-vegetarian) built to the same targets, with quantities for each phase. Your choice drives the dashboard."
      />
      <MealPlansView />
    </>
  );
}
