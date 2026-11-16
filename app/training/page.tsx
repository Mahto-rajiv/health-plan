import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrainingView } from './TrainingView';

export const metadata: Metadata = { title: 'Training' };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="Training"
        description="A beginner split: Chest + Triceps, Back + Biceps, Legs + Shoulders, done in order on any 5 days a week. On work days, go only if you can be at the gym by 9 PM. Every session starts with a warm-up."
      />
      <TrainingView />
    </>
  );
}
