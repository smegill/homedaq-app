'use client';

import * as React from 'react';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { getPitches, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

function fmtMoney(n?: number | null) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(a?: number | null, b?: number | null) {
  if (!a || !b || b <= 0) return 0;
  const p = Math.max(0, Math.min(1, a / b));
  return Math.round(p * 100);
}

export default function ResidentDashboard() {
  const [rows, setRows] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    let alive = true;

    // Works whether getPitches returns Pitch[] or Promise<Pitch[]>
    Promise.resolve(getPitches()).then((ps) => {
      if (!alive) return;
      setRows(ps as Pitch[]);
    });

    const unsub = subscribe((ps: Pitch[]) => {
      if (!alive) return;
      setRows(ps);
    });

    return () => {
      alive = false;
      unsub?.();
    };
  }, []);

  return (
    <main className="space-y-8">
      <Section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink-900">Your pitches</h1>
          <Link
            href="/resident/create/basics"
            className="rounded-xl bg-ink-900 text-white px-4 py-2 text-sm hover:bg-ink-800 transition"
          >
            Start a new pitch
          </Link>
        </div>
        <p className="mt-2 text-zinc-700">
          Draft, review, and publish founder-style pitches. Investors back deals for shared
          appreciation—no bank interest.
        </p>
      </Section>

      <Section className="max-w-6xl mx-auto px-4 pb-12">
        <Card className="p-0 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Valuation</th>
                <th className="text-left font-medium px-5 py-3">Min Invest</th>
                <th className="text-left font-medium px-5 py-3">App Share</th>
                <th className="text-left font-medium px-5 py-3">Funding</th>
                <th className="text-left font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-zinc-500">
                    No pitches yet.{' '}
                    <Link href="/resident/create/basics" className="underline">
                      Create your first pitch
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const progress = pct(p.fundingCommitted, p.fundingGoal);
                  return (
                    <tr key={p.id} className="border-t border-zinc-200">
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink-900">{p.title}</div>
                        <div className="text-xs text-zinc-500">
                          {[p.city, p.state, p.zip].filter(Boolean).join(', ')}
                        </div>
                      </td>
                      <td className="px-5 py-3">{p.status}</td>
                      <td className="px-5 py-3">{fmtMoney(p.referenceValuation)}</td>
                      <td className="px-5 py-3">{fmtMoney(p.minimumInvestment)}</td>
                      <td className="px-5 py-3">
                        {p.appreciationSharePct != null ? `${p.appreciationSharePct}%` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-28 h-2 rounded bg-zinc-200">
                            <div
                              className="h-2 rounded bg-ink-900"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-zinc-600">{progress}%</div>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {fmtMoney(p.fundingCommitted)} / {fmtMoney(p.fundingGoal)}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/resident/edit/${p.id}`}
                            className="text-ink-900 hover:underline"
                          >
                            Edit
                          </Link>
                          <Link
                            href="/resident/create/basics"
                            className="text-zinc-600 hover:underline"
                          >
                            Duplicate
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </Section>
    </main>
  );
}
