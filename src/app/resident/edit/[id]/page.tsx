'use client';

import * as React from 'react';
import Section from '@/components/ui/Section';
import { getPitchById } from '@/lib/storage';
import ResidentPitchForm from '@/components/forms/ResidentPitchForm';
import type { Pitch } from '@/types/pitch';
import { useParams } from 'next/navigation';

export default function EditPitchPage() {
  const params = useParams<{ id: string }>();
  // next/navigation can return string | string[]; normalize to string
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [row, setRow] = React.useState<Pitch | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        if (mounted) setLoading(false);
        return;
      }
      const p = await getPitchById(id);
      if (mounted) {
        setRow(p ?? null);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Section className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Edit Pitch</h1>
      {loading ? (
        <div className="text-ink-700">Loading…</div>
      ) : !id ? (
        <div className="text-ink-700">Missing pitch id.</div>
      ) : row ? (
        <ResidentPitchForm initial={row} pitchId={row.id} />
      ) : (
        <div className="text-ink-700">Pitch not found.</div>
      )}
    </Section>
  );
}
