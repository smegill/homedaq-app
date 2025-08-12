'use client';

import * as React from 'react';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitches, type Pitch } from '@/lib/storage';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';
import MarketSnapshot from '@/components/MarketSnapshot';

export default function InvestPage() {
  const [pitches, setPitches] = React.useState<Pitch[]>([]);
  const [zip, setZip] = React.useState('');

  const refresh = React.useCallback(() => {
    setPitches(getPitches());
  }, []);

  React.useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('homedaq:pitches:changed', onChange as any);
    return () => window.removeEventListener('homedaq:pitches:changed', onChange as any);
  }, [refresh]);

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Browse Listings</h1>
        <Link href="/resident/create">
          <Button>Start a Pitch</Button>
        </Link>
      </div>

      {/* Market snapshot helper */}
      <div className="mb-6 grid gap-3 md:grid-cols-[260px_1fr] items-start">
        <Card className="p-4">
          <label className="grid gap-2">
            <span className="text-sm text-ink-700">ZIP code for market snapshot</span>
            <input
              className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. 73301"
              value={zip}
              onChange={(e) => setZip(e.currentTarget.value.slice(0, 5))}
            />
          </label>
        </Card>
        <MarketSnapshot zip={zip} />
      </div>

      {pitches.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-ink-700">
            No listings yet. Be the first to create a pitch.
          </p>
          <div className="mt-4">
            <Link href="/resident/create">
              <Button>Create a Pitch</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pitches.map((p) => (
            <ListingCard key={p.id} pitch={p} />
          ))}
        </div>
      )}
    </Section>
  );
}

/* ----------------- Listing card ----------------- */

function ListingCard({ pitch }: { pitch: Pitch }) {
  const fit = computeInvestorFit(pitch); // { label, score }
  const addressQuery = [pitch.address1, pitch.city, pitch.state, pitch.postalCode]
    .filter(Boolean)
    .join(', ');

  const [showMap, setShowMap] = React.useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="h-48 w-full bg-ink-50 border-b border-ink-100 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {pitch.heroImageUrl ? (
          <img src={pitch.heroImageUrl} alt={pitch.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ink-400 text-sm">
            No photo
          </div>
        )}
        {/* Investor Fit chip */}
        <div className="absolute top-3 left-3">
          <FitChip label={fit.label} />
        </div>
      </div>

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

        {/* badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {typeof pitch.monthlyDividendPct === 'number' && (
            <Badge>{pitch.monthlyDividendPct}%/mo dividend</Badge>
          )}
          {typeof pitch.offeredEquityPct === 'number' && <Badge>{pitch.offeredEquityPct}% equity</Badge>}
          {typeof pitch.expectedAppreciationPct === 'number' && (
            <Badge>{pitch.expectedAppreciationPct}%/yr appreciation</Badge>
          )}
          {typeof pitch.minInvestment === 'number' && pitch.minInvestment > 0 && (
            <Badge>Min ${pitch.minInvestment.toLocaleString()}</Badge>
          )}
        </div>

        {pitch.summary && <p className="mt-3 text-sm text-ink-800">{truncate(pitch.summary, 180)}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" type="button" onClick={() => setShowMap((s) => !s)}>
            {showMap ? 'Hide Map' : 'View Map'}
          </Button>
          <Link href="/resident/dashboard">
            <Button variant="secondary">Creator Dashboard</Button>
          </Link>
        </div>

        {showMap && (
          <div className="mt-4">
            <GoogleMapEmbed query={addressQuery} height={200} zoom={14} />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ----------------- small UI bits ----------------- */

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

/* ----------------- heuristics & utils ----------------- */

function computeInvestorFit(p: Pitch): { label: 'Yield' | 'Balanced' | 'Impact' | 'Value'; score: number } {
  const monthly = typeof p.monthlyDividendPct === 'number' ? p.monthlyDividendPct : 0.5; // %/mo
  const growth = typeof p.expectedAppreciationPct === 'number' ? p.expectedAppreciationPct : 3;   // %/yr
  const story  = typeof p.storyStrength === 'number' ? p.storyStrength : 3;                        // 1–5

  const yieldScore  = clamp(mapRange(monthly, 0.2, 1.5, 10, 95));
  const growthScore = clamp(mapRange(growth,  0,   8,   5,  95));
  const storyScore  = clamp(mapRange(story,   1,   5,  10,  95));

  const segments = [
    { key: 'Yield' as const,    score: weighted([yieldScore, 0.6], [growthScore, 0.2], [storyScore, 0.2]) },
    { key: 'Balanced' as const, score: weighted([yieldScore, 0.4], [growthScore, 0.4], [storyScore, 0.2]) },
    { key: 'Impact' as const,   score: weighted([yieldScore, 0.15],[growthScore, 0.25],[storyScore, 0.6]) },
    { key: 'Value' as const,    score: weighted([yieldScore, 0.2], [growthScore, 0.6], [storyScore, 0.2]) },
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
