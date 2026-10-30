import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { SettingsView } from './SettingsView';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Profile, active plan, phase, food prices, deload weeks and your locally stored data." />
      <SettingsView />
      <p className="mt-6 text-xs leading-relaxed text-muted">
        Health Plan gives educational guidance based on published research and your own inputs. It isn’t medical advice. See a doctor for
        diagnosis or treatment, and before starting supplements if you have any condition or take medication.
      </p>
    </>
  );
}
