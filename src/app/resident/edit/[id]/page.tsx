'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PitchWizardClient from '@/components/forms/PitchWizardClient';
import { getPitchById } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

export default function EditPitchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = React.useState<Pitch | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        const p = await getPitchById(id);
        if (!on) return;
        if (p) setInitial(p);
        else setNotFound(true);
      } catch {
        if (on) setNotFound(true);
      }
    })();
    return () => {
      on = false;
    };
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-ink-800">
        <h1 className="text-xl font-semibold">Pitch not found</h1>
        <p className="mt-2">We couldn’t find a pitch with id <code>{id}</code>.</p>
        <button
          className="mt-4 rounded-lg border px-3 py-2"
          onClick={() => router.push('/resident/dashboard')}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!initial) {
    return <div className="mx-auto max-w-3xl p-8 text-ink-700">Loading…</div>;
  }

  // IMPORTANT: pass only stable, loaded data; no Date.now() here.
  return <PitchWizardClient initial={initial} pitchId={initial.id} />;
}
