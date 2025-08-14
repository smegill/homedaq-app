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

export default function InvestPage() {
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

  const candidates = React.useMemo(() => {
    return rows.filter((r) => !['archived', 'funded', 'draft'].includes(r.status));
  }, [rows]);

  const withScores = React.useMemo(() => {
    return candidates.map((p) => {
      const m = computeMatch(p, prefs);
      return { pitch: p, score: m.total, detail: m };
    });
  }, [candidates, prefs]);

  const sorted = React.useMemo(() => {
    const arr = [...withScores];
    if (sortMode === 'match') arr.sort((a, b) => b.score - a.score);
    else arr.sort((a, b) => (b.pitch.updatedAt ?? 0) - (a.pitch.updatedAt ?? 0));
    return arr;
  }, [withScores, sortMode]);

  const money = React.useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), []);

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

              {breakdown ? (
                <div className="pt-4">
                  <div className="text-ink-900 font-medium mb-2">Why this matches you</div>
                  <div className="space-y-2">
                    {breakdown.parts.map((p) => (
                      <div key={p.label} className="flex items-center justify-between gap-3 text-sm">
                        <div className="text-ink-700">{p.label}{p.detail ? <span className="text-ink-500"> — {p.detail}</span> : null}</div>
                        <div className="text-ink-900 font-medium">{Math.round((p.score / p.weight) * 100)}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-ink-600">Overall match: <span className="font-semibold text-ink-900">{breakdown.total}%</span></div>
                </div>
              ) : null}

              <div className="pt-3">
                {active.offeringUrl ? (
                  <Button onClick={() => { try { window.open(active.offeringUrl, '_blank', 'noopener,noreferrer'); } catch {} }}>
                    Invest / Learn More
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>No external raise</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
