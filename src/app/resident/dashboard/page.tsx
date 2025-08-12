'use client';

import * as React from 'react';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitches, deletePitch, type Pitch } from '@/lib/storage';

export default function ResidentDashboard() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  const refresh = React.useCallback(() => {
    setPitches(getPitches());
  }, []);

  React.useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('homedaq:pitches:changed', onChange as any);
    return () => window.removeEventListener('homedaq:pitches:changed', onChange as any);
  }, [refresh]);

  function onDelete(id: string) {
    const ok = confirm('Delete this pitch? This cannot be undone.');
    if (!ok) return;
    deletePitch(id);
    refresh();
  }

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">My Pitches</h1>
        <Link href="/resident/create">
          <Button>Create New</Button>
        </Link>
      </div>

      {pitches.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold text-ink-900">No pitches yet</h2>
          <p className="text-ink-700 mt-2">
            Create your first pitch to invite investors and start building equity.
          </p>
          <div className="mt-4">
            <Link href="/resident/create">
              <Button>Start a Pitch</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {pitches.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="col-span-1 bg-ink-50 border-r border-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.heroImageUrl ? (
                    <img
                      src={p.heroImageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-ink-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="col-span-2 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-ink-900 font-semibold">{p.title || 'Untitled'}</h3>
                      <p className="text-sm text-ink-700">
                        {p.address1}, {p.city}, {p.state} {p.postalCode}
                      </p>
                    </div>
                    <span className="rounded-full border border-ink-200 bg-ink-50 text-ink-800 text-xs px-2 py-1">
                      {p.status ?? 'submitted'}
                    </span>
                  </div>

                  {/* badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {typeof p.offeredEquityPct === 'number' && (
                      <Badge>{p.offeredEquityPct}% equity</Badge>
                    )}
                    {typeof p.monthlyDividendPct === 'number' && (
                      <Badge>{p.monthlyDividendPct}%/mo dividend</Badge>
                    )}
                    {typeof p.expectedAppreciationPct === 'number' && (
                      <Badge>{p.expectedAppreciationPct}%/yr appreciation</Badge>
                    )}
                    {typeof p.minInvestment === 'number' && p.minInvestment > 0 && (
                      <Badge>Min ${p.minInvestment.toLocaleString()}</Badge>
                    )}
                  </div>

                  {/* money line */}
                  <div className="mt-3 text-sm text-ink-800">
                    Seeking <strong>${p.amountSeeking.toLocaleString()}</strong>{' '}
                    at valuation <strong>${p.valuation.toLocaleString()}</strong>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link href={`/resident/edit/${p.id}`}>
                      <Button>Edit</Button>
                    </Link>
                    <Button type="button" onClick={() => onDelete(p.id)} variant="secondary">
                      Delete
                    </Button>
                    <Link href="/invest">
                      <Button variant="secondary">Preview on Invest</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-ink-100 text-ink-800 text-xs px-2 py-1">
      {children}
    </span>
  );
}
