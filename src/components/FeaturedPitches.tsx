'use client';

import * as React from 'react';
import type { Pitch } from '@/types/pitch';
import { getPitches, subscribe } from '@/lib/storage';
import ListingCard from './ListingCard';

export default function FeaturedPitches() {
  const [rows, setRows] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      const ps = await getPitches();
      if (alive) setRows(ps.slice(0, 6));
    })();

    const off = subscribe((ps) => {
      if (alive) setRows(ps.slice(0, 6));
    });

    return () => {
      alive = false;
      off();
    };
  }, []);

  if (!rows.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((p) => (
        <ListingCard key={p.id} p={p} />
      ))}
    </div>
  );
}
