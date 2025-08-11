'use client';

import * as React from 'react';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { listPitches, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

export default function FeaturedPitches() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    const load = () => setPitches(listPitches().slice(0, 3));
    load();
    const unsub = subscribe(load);
    return unsub;
  }, []);

  if (pitches.length === 0) return null;

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">Featured listings</h2>
        <Link href="/invest">
          <Button>Browse all</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pitches.map((p) => (
          <Card key={p.id} className="p-5">
            {p.heroImageUrl ? (
              <div className="mb-4 overflow-hidden rounded-2xl border border-ink-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.heroImageUrl} alt={p.title} className="w-full h-40 object-cover" />
              </div>
            ) : (
              <div className="mb-4 h-40 rounded-2xl border border-dashed border-ink-200 bg-ink-50" />
            )}
            <h3 className="text-lg font-semibold text-ink-900">{p.title}</h3>
            <p className="text-sm text-ink-600 mt-1 line-clamp-2">{p.summary}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-ink-700">
                {p.city}, {p.state}
              </span>
              <Link href={`/invest?preview=${encodeURIComponent(p.id)}`}>
                <Button>Preview</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
