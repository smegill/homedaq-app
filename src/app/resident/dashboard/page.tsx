'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Section from '@/components/ui/Section';      // default export
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { listPitches, deletePitch, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      Number.isFinite(n) ? n : 0
    );
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

export default function ResidentDashboardPage() {
  const router = useRouter();
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  React.useEffect(() => {
    setPitches(listPitches());
    const unsub = subscribe(() => setPitches(listPitches()));
    return unsub;
  }, []);

  const handleDelete = (id: string) => {
    const ok = window.confirm('Delete this pitch? This cannot be undone.');
    if (!ok) return;
    deletePitch(id);
    setPitches(listPitches());
  };

  return (
    <Section className="max-w-5xl mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Your Pitches</h1>
        <Link href="/resident/create">
          <Button>New Pitch</Button>
        </Link>
      </div>

      {pitches.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-medium text-ink-900 mb-2">No pitches yet</h2>
          <p className="text-ink-600 mb-6">
            Create your first pitch to start raising capital on HomeDAQ.
          </p>
          <Link href="/resident/create">
            <Button>Create a Pitch</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {pitches.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">{p.title}</h3>
                  <p className="text-sm text-ink-600 mt-1">{p.summary}</p>
                </div>
                <span className="rounded-full bg-ink-100 text-ink-700 px-3 py-1 text-xs">
                  {p.status}
                </span>
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

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/resident/edit/${p.id}`}>
                  <Button>Edit</Button>
                </Link>

                <Link href={`/invest?preview=${encodeURIComponent(p.id)}`}>
                  <Button>Preview</Button>
                </Link>

                <Button onClick={() => handleDelete(p.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
