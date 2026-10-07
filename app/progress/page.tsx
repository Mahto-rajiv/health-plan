import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressView } from './ProgressView';

export const metadata: Metadata = { title: 'Progress' };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progress"
        description="Weight, waist, strength and consistency, with a clear rule for when to keep gaining, slow down or stop."
      />
      <ProgressView />
    </>
  );
}
