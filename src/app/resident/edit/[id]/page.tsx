'use client';

import * as React from 'react';
import Section from '@/components/ui/Section';
import { getPitchById } from '@/lib/storage';
import ResidentPitchForm from '@/components/forms/ResidentPitchForm';
import type { Pitch } from '@/types/pitch';

export default function EditPitchPage({ params }: { params: { id: string } }) {
  const [row, setRow] = React.useState<Pitch | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await getPitchById(params.id);
      if (mounted) {
        // Guard against undefined from older storage versions
        setRow(p ?? null);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  return (
    <Section className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Edit Pitch</h1>
      {loading ? (
        <div className="text-ink-700">Loading…</div>
      ) : row ? (
        <ResidentPitchForm initial={row} pitchId={row.id} />
      ) : (
        <div className="text-ink-700">Pitch not found.</div>
      )}
    </Section>
  );
}
