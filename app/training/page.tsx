import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrainingView } from './TrainingView';

export const metadata: Metadata = { title: 'Training' };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="Training"
        description="A beginner split: Chest + Triceps, Back + Biceps, Legs + Shoulders, done in order on any 5 days a week. Every session is in the morning. Every session starts with a warm-up."
      />
      <TrainingView />
    </>
  );
}
