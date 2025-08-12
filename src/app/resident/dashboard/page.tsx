'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Pitch } from '@/types/pitch';
import { getPitches, subscribe } from '@/lib/storage';

function investorFitLabel(p: Pitch): 'Yield' | 'Balanced' | 'Story' {
  const div = Number(p.dividendPct ?? 0);
  const appr = Number(p.expectedAppreciationPct ?? 0);
  if (div >= 6) return 'Yield';
  if (appr >= 4) return 'Balanced';
  return 'Story';
}

export default function ResidentDashboard() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    setPitches(getPitches());
    const off = subscribe(() => setPitches(getPitches()));
    return () => { try { off(); } catch { /* no-op */ } };
  }, []);

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Pitches</h1>
        <Link href="/resident/create">
          <Button>Create new pitch</Button>
        </Link>
      </div>

      {pitches.length === 0 ? (
        <Card>
          <CardBody className="p-8 text-center">
            <h2 className="text-lg font-semibold">No pitches yet</h2>
            <p className="mt-2 text-ink-700">Create your first pitch to start attracting investors.</p>
            <div className="mt-4">
              <Link href="/resident/create"><Button>Start a Pitch</Button></Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {pitches.map((p) => {
            const fit = investorFitLabel(p);
            return (
              <li key={p.id} className="group">
                <Card>
                  <CardBody className="p-0 overflow-hidden">
                    <div className="relative h-44 w-full">
                      <Image
                        src={p.heroImageUrl || '/hero/homedaq-hero.jpg'}
                        alt={p.title || 'Home pitch'}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority={false}
                      />
                      <span
                        className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                          ${fit === 'Yield' ? 'bg-green-50 text-green-700 border border-green-200'
                            : fit === 'Balanced' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
                      >
                        Investor Fit: {fit}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold">{p.title || 'Untitled pitch'}</h3>
                      <p className="mt-1 text-sm text-ink-700 line-clamp-2">
                        {p.summary || 'No summary provided.'}
                      </p>

                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-ink-600">Amount Seeking</dt>
                          <dd className="font-medium">
                            {p.amountSeeking ? `$${Number(p.amountSeeking).toLocaleString()}` : '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-600">Min Investment</dt>
                          <dd className="font-medium">
                            {p.minInvestment ? `$${Number(p.minInvestment).toLocaleString()}` : '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-600">Dividend</dt>
                          <dd className="font-medium">{p.dividendPct != null ? `${p.dividendPct}%` : '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-ink-600">Equity Offered</dt>
                          <dd className="font-medium">{p.equityPct != null ? `${p.equityPct}%` : '—'}</dd>
                        </div>
                      </dl>

                      <div className="mt-5 flex gap-2">
                        <Link href={`/resident/edit/${encodeURIComponent(p.id)}`}>
                          <Button size="sm">Edit</Button>
                        </Link>
                        <Link href="/invest">
                          <Button size="sm" variant="secondary">View in marketplace</Button>
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
