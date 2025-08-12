'use client';

import * as React from 'react';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitches, deletePitch, type Pitch } from '@/lib/storage';

export default function ResidentDashboard() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);

  const refresh = React.useCallback(() => setPitches(getPitches()), []);

  React.useEffect(() => {
    refresh();
    const onChange = (_e: Event) => refresh();
    window.addEventListener('homedaq:pitches:changed', onChange);
    return () => window.removeEventListener('homedaq:pitches:changed', onChange);
  }, [refresh]);

  function onDelete(id: string) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this pitch? This cannot be undone.');
    if (!ok) return;
    deletePitch(id);
    // refresh will be triggered by storage event; do it immediately too
    refresh();
  }

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">My Pitches</h1>
        <Link href="/resident/create">
          <Button>New Pitch</Button>
        </Link>
      </div>

      {pitches.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-600">
            🏠
          </div>
          <h2 className="text-lg font-semibold text-ink-900">No pitches yet</h2>
          <p className="text-ink-700 mt-1">Create your first pitch to share with investors.</p>
          <div className="mt-4">
            <Link href="/resident/create">
              <Button>Create a Pitch</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pitches.map((p) => (
            <PitchCard key={p.id} pitch={p} onDelete={onDelete} />
          ))}
        </div>
      )}
    </Section>
  );
}

/* ---------------- Pitch Card ---------------- */

function PitchCard({ pitch, onDelete }: { pitch: Pitch; onDelete: (id: string) => void }) {
  const fit = computeInvestorFit(pitch);

  return (
    <Card className="overflow-hidden">
      {/* Header image */}
      <div className="h-44 w-full bg-ink-50 border-b border-ink-100 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {pitch.heroImageUrl ? (
          <img src={pitch.heroImageUrl} alt={pitch.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ink-400 text-sm">No photo</div>
        )}
        {/* Investor Fit chip */}
        <div className="absolute top-3 left-3">
          <FitChip label={fit.label} />
        </div>
        {/* Photo count */}
        {Array.isArray(pitch.photos) && pitch.photos.length > 1 && (
          <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-xs border border-ink-200 text-ink-800 shadow-sm">
            {pitch.photos.length} photos
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-ink-900 font-semibold">{pitch.title || 'Untitled'}</h3>
            <p className="text-sm text-ink-700">
              {pitch.address1}, {pitch.city}, {pitch.state} {pitch.postalCode}
            </p>
          </div>
          {pitch.status && (
            <span className="rounded-full border border-ink-200 bg-ink-50 text-ink-800 text-xs px-2 py-1">
              {pitch.status}
            </span>
          )}
        </div>

        {pitch.summary && <p className="mt-3 text-sm text-ink-800">{truncate(pitch.summary, 160)}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {typeof pitch.monthlyDividendPct === 'number' && <Badge>{pitch.monthlyDividendPct}%/mo dividend</Badge>}
          {typeof pitch.offeredEquityPct === 'number' && <Badge>{pitch.offeredEquityPct}% equity</Badge>}
          {typeof pitch.expectedAppreciationPct === 'number' && (
            <Badge>{pitch.expectedAppreciationPct}%/yr appreciation</Badge>
          )}
          {typeof pitch.minInvestment === 'number' && pitch.minInvestment > 0 && (
            <Badge>Min ${pitch.minInvestment.toLocaleString()}</Badge>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/resident/edit/${pitch.id}`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Link href="/invest">
            <Button variant="secondary">Preview</Button>
          </Link>
          <Button variant="ghost" onClick={() => onDelete(pitch.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Small UI bits + heuristics ---------------- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-ink-100 text-ink-800 text-xs px-2 py-1">
      {children}
    </span>
  );
}

function FitChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2 py-1 text-xs font-medium border border-ink-200 text-ink-800 shadow-sm">
      Investor Fit: <span className="ml-1 font-semibold text-ink-900">{label}</span>
    </span>
  );
}

function computeInvestorFit(p: Pitch): { label: 'Yield' | 'Balanced' | 'Impact' | 'Value'; score: number } {
  const monthly = typeof p.monthlyDividendPct === 'number' ? p.monthlyDividendPct : 0.5; // %/mo
  const growth = typeof p.expectedAppreciationPct === 'number' ? p.expectedAppreciationPct : 3; // %/yr
  const story = typeof p.storyStrength === 'number' ? p.storyStrength : 3; // 1–5

  const yieldScore = clamp(mapRange(monthly, 0.2, 1.5, 10, 95));
  const growthScore = clamp(mapRange(growth, 0, 8, 5, 95));
  const storyScore = clamp(mapRange(story, 1, 5, 10, 95));

  const segments = [
    { key: 'Yield' as const, score: weighted([yieldScore, 0.6], [growthScore, 0.2], [storyScore, 0.2]) },
    { key: 'Balanced' as const, score: weighted([yieldScore, 0.4], [growthScore, 0.4], [storyScore, 0.2]) },
    { key: 'Impact' as const, score: weighted([yieldScore, 0.15], [growthScore, 0.25], [storyScore, 0.6]) },
    { key: 'Value' as const, score: weighted([yieldScore, 0.2], [growthScore, 0.6], [storyScore, 0.2]) },
  ];

  const best = segments.reduce((a, b) => (b.score > a.score ? b : a));
  return { label: best.key, score: best.score };
}

function truncate(s: string, n: number) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}
function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const clamped = Math.max(inMin, Math.min(inMax, v));
  const t = (clamped - inMin) / Math.max(1e-9, inMax - inMin);
  return outMin + t * (outMax - outMin);
}
function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}
function weighted(...pairs: [number, number][]) {
  const wsum = pairs.reduce((s, [, w]) => s + w, 0) || 1;
  return pairs.reduce((s, [v, w]) => s + v * (w / wsum), 0);
}
