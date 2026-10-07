import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrainingView } from './TrainingView';

export const metadata: Metadata = { title: 'Training' };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="Training"
        description="A 4-day upper/lower program for a beginner, aiming for strength first, then visible muscle, fitness and mobility. Log sets as you go; the plan adapts to missed days."
      />
      <TrainingView />
    </>
  );
}
