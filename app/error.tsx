'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <Callout tone="caution" title="Something went wrong on this page">
        Your logged data is still in this browser. Try again; if it keeps happening, the saved data may be in an old format — download a
        backup from Settings first, then reset.
      </Callout>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/settings" className="inline-flex min-h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-ink hover:bg-slate-50">
          Open Settings
        </Link>
      </div>
    </div>
  );
}
