'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Section from '@/components/ui/Section';
import ResidentPitchForm from '@/components/forms/ResidentPitchForm';

export default function CreatePitchPage() {
  const router = useRouter();
  return (
    <Section className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Start a Pitch</h1>
      <p className="text-sm text-ink-700">
        Pitch your opportunity like a founder. Keep it clear and concise.
      </p>
      <ResidentPitchForm onSaved={() => router.push('/resident/dashboard')} />
    </Section>
  );
}
