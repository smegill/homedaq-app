'use client';

import dynamic from 'next/dynamic';

// Client-only wrapper that disables SSR and guarantees a single mount.
const PitchWizardClient = dynamic(() => import('./PitchWizard'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-3xl p-8 text-ink-700">Loading pitch builder…</div>
  ),
});

export default PitchWizardClient;
