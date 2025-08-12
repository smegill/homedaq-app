'use client';

import * as React from 'react';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitches } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

export default function InvestPage() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    const load = () => {
      const all = getPitches();
      const ordered = [...all].sort((a, b) => b.createdAt - a.createdAt);
      setPitches(ordered);
    };
    load();

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

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Browse listings</h1>
          <p className="text-ink-700 mt-1 text-sm">
            Discover resident-led offerings and invest via our broker-dealer partner.
          </p>
        </div>
      </div>

      {pitches.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-ink-100 bg-white p-8 text-center text-ink-700">
          No listings yet. Check back soon.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pitches.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative h-44 w-full bg-ink-100">
                {p.heroImageUrl ? (
                  <Image
                    src={p.heroImageUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-ink-500 text-sm">No photo</div>
                )}
              </div>
              <CardBody className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-ink-900 font-semibold line-clamp-1">{p.title}</h3>
                  <span className="text-xs rounded-lg bg-ink-100 px-2 py-0.5 text-ink-700">
                    {p.city}, {p.state}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-700 line-clamp-2">{p.summary}</p>

                <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-ink-50 p-2 text-center">
                    <dt className="text-ink-600">Seeking</dt>
                    <dd className="font-medium text-ink-900">
                      {p.amountSeeking ? `$${p.amountSeeking.toLocaleString()}` : '—'}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-2 text-center">
                    <dt className="text-ink-600">Min</dt>
                    <dd className="font-medium text-ink-900">
                      {p.minInvestment ? `$${p.minInvestment.toLocaleString()}` : '—'}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-2 text-center">
                    <dt className="text-ink-600">Equity</dt>
                    <dd className="font-medium text-ink-900">{p.equityPct != null ? `${p.equityPct}%` : '—'}</dd>
                  </div>
                </dl>

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
      )}
    </Section>
  );
}
