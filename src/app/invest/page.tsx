'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { listPitches, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      .format(Number.isFinite(n) ? n : 0);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

export default function InvestPage() {
  const router = useRouter();
  const search = useSearchParams();
  const previewId = search.get('preview') ?? undefined;

  const [pitches, setPitches] = React.useState<Pitch[]>([]);
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    setPitches(listPitches());
    const unsub = subscribe(() => setPitches(listPitches()));
    return unsub;
  }, []);

  React.useEffect(() => {
    if (!previewId) return;
    const el = cardRefs.current[previewId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [previewId, pitches.length]);

  const clearPreview = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('preview');
    router.replace(url.pathname + (url.search ? `?${url.searchParams.toString()}` : ''));
  };

  const displayed = pitches; // later: only "listed"

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Browse Listings</h1>
        {previewId && <Button onClick={clearPreview}>Clear preview</Button>}
      </div>

      {displayed.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-medium text-ink-900 mb-2">No listings yet</h2>
          <p className="text-ink-600">Once pitches are submitted, they will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayed.map((p) => {
            const isPreview = previewId === p.id;
            const thumbs = (p.photos ?? []).slice(0, 4);
            const address = `${p.address1}, ${p.city}, ${p.state} ${p.postalCode}`;

            return (
              <Card
                key={p.id}
                ref={(el) => (cardRefs.current[p.id] = el)}
                className={['p-5 transition-shadow', isPreview ? 'ring-2 ring-brand-500 shadow-lg' : ''].join(' ')}
              >
                {/* Hero image */}
                {p.heroImageUrl ? (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-ink-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.heroImageUrl} alt={p.title} className="w-full h-40 object-cover" />
                  </div>
                ) : (
                  <div className="mb-4 h-40 rounded-2xl border border-dashed border-ink-200 bg-ink-50" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{p.title}</h3>
                    <p className="text-sm text-ink-600 mt-1">{p.summary}</p>
                  </div>
                  <span className="rounded-full bg-ink-100 text-ink-700 px-3 py-1 text-xs">{p.status}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="text-ink-500">Location</div>
                  <div className="text-ink-900">
                    {p.city}, {p.state} {p.postalCode}
                  </div>
                  <div className="text-ink-500">Seeking</div>
                  <div className="text-ink-900">{formatCurrency(p.amountSeeking)}</div>
                  <div className="text-ink-500">Min Investment</div>
                  <div className="text-ink-900">{formatCurrency(p.minInvestment)}</div>
                </div>

                {/* Thumbnails */}
                {thumbs.length > 1 && (
                  <ul className="mt-4 grid grid-cols-4 gap-2">
                    {thumbs.map((u, i) => (
                      <li key={i} className="overflow-hidden rounded-xl border border-ink-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt={`Photo ${i + 1}`} className="w-full h-16 object-cover" />
                      </li>
                    ))}
                  </ul>
                )}

                {/* Map preview */}
                <GoogleMapEmbed className="mt-4" query={address} height={160} />

                <div className="mt-5 flex gap-3">
                  <Link href={`/invest?preview=${encodeURIComponent(p.id)}`}>
                    <Button>View Details</Button>
                  </Link>
                  {isPreview && <Button onClick={clearPreview}>Done Previewing</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}
