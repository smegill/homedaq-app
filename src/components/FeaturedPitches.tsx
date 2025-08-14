'use client';

import * as React from 'react';
import { getPitches, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';
import ListingCard from '@/components/ListingCard';

export default function FeaturedPitches() {
  const [rows, setRows] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    setRows(getPitches());
    const off = subscribe(setRows);
    return () => off();
  }, []);

  const featured = React.useMemo(() => {
    return rows
      .filter((p) => p.status === 'live' || p.status === 'review')
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      .slice(0, 3);
  }, [rows]);

  if (featured.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {featured.map((p) => (
        <ListingCard key={p.id} p={p} />
      ))}
    </div>
  );
}
