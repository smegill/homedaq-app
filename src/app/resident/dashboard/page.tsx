'use client';

import * as React from 'react';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getPitches, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

export default function ResidentDashboardPage() {
  const [rows, setRows] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    setRows(getPitches());
    const off = subscribe(setRows);
    return () => off();
  }, []);

  return (
    <Section className="max-w-5xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Your Pitches</h1>
        {/* Button without asChild */}
        <Link href="/resident/create">
          <Button>Start a Pitch</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-ink-700">You don’t have any pitches yet.</div>
          </CardBody>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-600">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Valuation</th>
                <th className="py-2 pr-4">Min Inv</th>
                <th className="py-2 pr-4">Equity</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-ink-100">
                  <td className="py-2 pr-4">{p.title}</td>
                  <td className="py-2 pr-4">{p.status}</td>
                  <td className="py-2 pr-4">
                    {p.valuation != null
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }).format(p.valuation)
                      : '—'}
                  </td>
                  <td className="py-2 pr-4">
                    {p.minInvestment != null ? `$${p.minInvestment.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-2 pr-4">{p.equityPct != null ? `${p.equityPct}%` : '—'}</td>
                  <td className="py-2 pr-4">
                    {/* Button without asChild */}
                    <Link href={`/resident/edit/${p.id}`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
