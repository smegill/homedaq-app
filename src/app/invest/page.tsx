'use client';

import * as React from 'react';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitches, subscribe } from '@/lib/storage';
import type { Pitch } from '@/types/pitch';
import ListingCard from '@/components/ListingCard';
import InvestorPrefsForm from '@/components/InvestorPrefsForm';
import { getPrefs, subscribePrefs } from '@/lib/prefs';
import { computeMatch, type MatchResult } from '@/lib/match';
import MarketSnapshot from '@/components/MarketSnapshot';
import { useRouter } from 'next/navigation';

function isDemoOffering(url?: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://local');
    return u.hostname.toLowerCase() === 'example.com';
  } catch {
    return true;
  }
}

export default function InvestPage() {
  const router = useRouter();
  const [rows, setRows] = React.useState<Pitch[]>([]);
  const [prefs, setPrefs] = React.useState(getPrefs());
  const [active, setActive] = React.useState<Pitch | null>(null);
  const [breakdown, setBreakdown] = React.useState<MatchResult | null>(null);
  const [sortMode, setSortMode] = React.useState<'match' | 'newest'>('match');

  React.useEffect(() => {
    setRows(getPitches());
    const off1 = subscribe(setRows);
    const off2 = subscribePrefs(setPrefs);
    return () => { off1(); off2(); };
  }, []);

  const candidates = React.useMemo(() => rows.filter((r) => !['archived', 'funded', 'draft'].includes(r.status)), [rows]);

  const withScores = React.useMemo(() => candidates.map((p) => {
    const m = computeMatch(p, prefs);
    return { pitch: p, score: m.total, detail: m };
  }), [candidates, prefs]);

  const sorted = React.useMemo(() => {
    const arr = [...withScores];
    if (sortMode === 'match') arr.sort((a, b) => b.score - a.score);
    else arr.sort((a, b) => (b.pitch.updatedAt ?? 0) - (a.pitch.updatedAt ?? 0));
    return arr;
  }, [withScores, sortMode]);

  const money = React.useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    []
  );

  function openOffering(url?: string, disabled?: boolean) {
    if (disabled) return;
    const demo = isDemoOffering(url);
    if (demo) {
      router.push('/investors?demo=1');
      return;
    }
    try {
      window.open(url as string, '_blank', 'noopener,noreferrer');
    } catch {}
  }

  return (
    <Section className="max-w-6xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Find your best match</h1>
          <p className="text-ink-700 mt-1 text-sm">Set your preferences. We’ll score listings and put the best matches first.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-700">Sort</label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as 'match' | 'newest')}
            className="rounded-xl border border-ink-200 px-2 py-1 bg-white"
          >
            <option value="match">Best Match</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <InvestorPrefsForm />

      {sorted.length === 0 ? (
        <Card>
          <CardBody><div className="text-ink-700">No listings available yet.</div></CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map(({ pitch, score, detail }) => (
            <ListingCard
              key={pitch.id}
              p={pitch}
              matchScore={score}
              onView={(p) => { setActive(p); setBreakdown(detail); }}
            />
          ))}
        </div>
      )}

      {active ? (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => { setActive(null); setBreakdown(null); }}>
          <div
            className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[560px] bg-white rounded-t-2xl md:rounded-l-2xl shadow-xl overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink-900">{active.title}</h2>
                <Button variant="ghost" onClick={() => { setActive(null); setBreakdown(null); }}>Close</Button>
              </div>

              <div className="text-sm text-ink-700">
                {active.address1 ? <div>{active.address1}</div> : null}
                <div>{active.city}, {active.state} {active.postalCode ?? ''}</div>
              </div>

              {/* Funding progress */}
              <div>
                <div className="rounded-2xl bg-ink-100 h-3 overflow-hidden">
                  <div
                    className={`h-3 ${(active.fundingGoal ?? 0) > 0 && (active.fundingCommitted ?? 0) >= (active.fundingGoal ?? 0) ? 'bg-green-600' : 'bg-ink-900'}`}
                    style={{
                      width: `${
                        (active.fundingGoal ?? 0) > 0
                          ? Math.min(100, Math.max(0, Math.floor(((active.fundingCommitted ?? 0) / (active.fundingGoal ?? 1)) * 100)))
                          : 0
                      }%`,
                    }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={
                      (active.fundingGoal ?? 0) > 0
                        ? Math.min(100, Math.max(0, Math.floor(((active.fundingCommitted ?? 0) / (active.fundingGoal ?? 1)) * 100)))
                        : 0
                    }
                  />
                </div>
                <div className="mt-1 text-sm text-ink-700">
                  {(active.fundingGoal ?? 0) > 0 ? (
                    <>
                      {Math.min(100, Math.max(0, Math.floor(((active.fundingCommitted ?? 0) / (active.fundingGoal ?? 1)) * 100)))}% funded •{' '}
                      {money.format(active.fundingCommitted ?? 0)} / {money.format(active.fundingGoal ?? 0)}
                    </>
                  ) : (
                    'Funding goal not set'
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-ink-600">Valuation</div>
                  <div className="font-medium text-ink-900">{active.valuation != null ? money.format(active.valuation) : '—'}</div>
                </div>
                <div>
                  <div className="text-ink-600">Min Investment</div>
                  <div className="font-medium text-ink-900">{active.minInvestment != null ? `$${active.minInvestment.toLocaleString()}` : '—'}</div>
                </div>
                <div>
                  <div className="text-ink-600">Equity</div>
                  <div className="font-medium text-ink-900">{active.equityPct != null ? `${active.equityPct}%` : '—'}</div>
                </div>
                <div>
                  <div className="text-ink-600">Risk</div>
                  <div className="font-medium text-ink-900">{active.riskProfile ?? '—'}</div>
                </div>
              </dl>

              <div className="space-y-3 text-sm">
                {active.summary ? <p className="text-ink-800">{active.summary}</p> : null}
                {active.problem ? <div><div className="text-ink-600">Problem / Opportunity</div><p className="text-ink-900">{active.problem}</p></div> : null}
                {active.solution ? <div><div className="text-ink-600">Solution / Why this property</div><p className="text-ink-900">{active.solution}</p></div> : null}
                {active.plan ? <div><div className="text-ink-600">Execution Plan</div><p className="text-ink-900">{active.plan}</p></div> : null}
                {active.useOfFunds ? <div><div className="text-ink-600">Use of Funds</div><p className="text-ink-900">{active.useOfFunds}</p></div> : null}
                {active.improvements ? <div><div className="text-ink-600">Improvements</div><p className="text-ink-900">{active.improvements}</p></div> : null}
                {active.timeline ? <div><div className="text-ink-600">Timeline</div><p className="text-ink-900">{active.timeline}</p></div> : null}
                {active.exitStrategy ? <div><div className="text-ink-600">Exit Strategy</div><p className="text-ink-900">{active.exitStrategy}</p></div> : null}
                {active.residentStory ? <div><div className="text-ink-600">Resident Story</div><p className="text-ink-900">{active.residentStory}</p></div> : null}
              </div>

              {active.postalCode ? (
                <div className="pt-2"><MarketSnapshot zip={active.postalCode} /></div>
              ) : null}

              <div className="pt-3">
                <Button
                  onClick={() =>
                    openOffering(
                      active.offeringUrl,
                      (active.fundingGoal ?? 0) > 0 && (active.fundingCommitted ?? 0) >= (active.fundingGoal ?? 0)
                    )
                  }
                  disabled={(active.fundingGoal ?? 0) > 0 && (active.fundingCommitted ?? 0) >= (active.fundingGoal ?? 0)}
                >
                  {((active.fundingGoal ?? 0) > 0 && (active.fundingCommitted ?? 0) >= (active.fundingGoal ?? 0))
                    ? 'Fully Funded'
                    : isDemoOffering(active.offeringUrl)
                    ? 'Demo — Learn How'
                    : 'Invest / Learn More'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
