'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DraftProvider } from '@/lib/draft';
import LiveListingPreview from '@/app/resident/create/_components/LiveListingPreview';
import StepNav from '@/app/resident/create/_components/StepNav';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const steps = [
    { href: '/resident/create/basics', label: 'Basics' },
    { href: '/resident/create/economics', label: 'Economics' },
    { href: '/resident/create/narrative', label: 'Narrative' },
    { href: '/resident/create/media', label: 'Media' },
    { href: '/resident/create/review', label: 'Review' },
  ];

  return (
    <DraftProvider>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink-900">Start a Pitch</h1>
          <Link href="/resident/dashboard" className="text-sm text-ink-700 underline-offset-2 hover:underline">
            Back to dashboard
          </Link>
        </div>

        <StepNav steps={steps} activeHref={pathname} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-ink-200 bg-white p-4">{children}</div>
          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <LiveListingPreview />
          </div>
        </div>
      </div>
    </DraftProvider>
  );
}
