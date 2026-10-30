import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrainingView } from './TrainingView';

export const metadata: Metadata = { title: 'Training' };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="Training"
        description="4 sessions a week for a beginner: Saturday and Sunday are fixed, plus two short weekday sessions if you can be at the gym by 9 PM. Strength first, then muscle, fitness and mobility. Missed sessions are skipped, not made up."
      />
      <TrainingView />
    </>
  );
}
