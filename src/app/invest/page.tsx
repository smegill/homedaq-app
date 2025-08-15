'use client';

import * as React from 'react';
import type { Pitch } from '@/types/pitch';
import { getPitches, subscribe } from '@/lib/storage';
import ListingCard from '@/components/ListingCard';

export default function InvestBrowsePage() {
  const [rows, setRows] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    let on = true;
    (async () => {
      const initial = await getPitches();
      if (on) setRows(initial);
    })();
    const unsub = subscribe((r) => setRows(r));
    return () => {
      on = false;
      unsub();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Browse Pitches</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <ListingCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
