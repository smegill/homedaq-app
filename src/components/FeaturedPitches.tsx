'use client';

import * as React from 'react';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitches } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

export default function FeaturedPitches() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    const load = () => {
      const all = getPitches();
      // choose some “featured” criteria; show newest first
      const liveFirst = [...all].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
      setPitches(liveFirst);
    };
    load();

    // live updates across tabs / same tab saves
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'homedaq:pitches') load();
    };
    const onCustom = () => load();

    window.addEventListener('storage', onStorage);
    window.addEventListener('homedaq:pitches:changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('homedaq:pitches:changed', onCustom as EventListener);
    };
  }, []);

  if (pitches.length === 0) {
    return null;
  }

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink-900">Featured listings</h2>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pitches.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative h-40 w-full bg-ink-100">
              {p.heroImageUrl ? (
                <Image
                  src={p.heroImageUrl}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-ink-500 text-sm">No photo</div>
              )}
            </div>
            <CardBody className="p-4">
              <div className="text-sm text-ink-600">{p.city}, {p.state} {p.postalCode}</div>
              <h3 className="mt-1 text-ink-900 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-700 line-clamp-2">{p.summary}</p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="text-ink-700">
                  Seeking{' '}
                  <span className="font-semibold">
                    {p.amountSeeking ? `$${p.amountSeeking.toLocaleString()}` : '—'}
                  </span>
                </div>
                <div className="text-ink-600">
                  Min{' '}
                  <span className="font-medium">
                    {p.minInvestment ? `$${p.minInvestment.toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                {p.offeringUrl ? (
                  <a
                    href={p.offeringUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
                    aria-label={`Invest in ${p.title} (opens partner site)`}
                  >
                    Invest
                  </a>
                ) : (
                  <Button variant="secondary" disabled aria-label="Invest coming soon">
                    Coming soon
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
