import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrainingView } from './TrainingView';

export const metadata: Metadata = { title: 'Training' };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="Training"
        description="4 sessions a week for a beginner. Saturday and Sunday are fixed. Two short weekday sessions happen only if you can be at the gym by 9 PM. Every session starts with a warm-up. Missed sessions are skipped, not made up."
      />
      <TrainingView />
    </>
  );
}
