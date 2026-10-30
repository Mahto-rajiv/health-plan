import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressView } from './ProgressView';

export const metadata: Metadata = { title: 'Progress' };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progress"
        description="Weight (including past weights), waist, photos, strength and consistency, with clear rules: first stop the loss, then gain slowly, and when to slow down or stop."
      />
      <ProgressView />
    </>
  );
}
