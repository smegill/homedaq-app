'use client';

import * as React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPrefs, setPrefs, subscribePrefs, type InvestorPrefs } from '@/lib/prefs';
import type { InvestorType } from '@/lib/investorFit';
import { INVESTOR_LABELS } from '@/lib/investorFit';

type Choice = { type: InvestorType; label: string; blurb: string };

const CHOICES: Choice[] = [
  { type: 'MaxReturn',       label: INVESTOR_LABELS.MaxReturn,       blurb: 'Highest total gain' },
  { type: 'GrowthUpside',    label: INVESTOR_LABELS.GrowthUpside,    blurb: 'Build equity over time' },
  { type: 'SteadyIncome',    label: INVESTOR_LABELS.SteadyIncome,    blurb: 'Reliable cash yield' },
  { type: 'BalancedBlend',   label: INVESTOR_LABELS.BalancedBlend,   blurb: 'Some yield + growth' },
  { type: 'QuickFlip',       label: INVESTOR_LABELS.QuickFlip,       blurb: 'Short-duration resale' },
  { type: 'CommunityImpact', label: INVESTOR_LABELS.CommunityImpact, blurb: 'Resident-first outcomes' },
];

export default function InvestorPrefsForm() {
  const [prefs, setLocal] = React.useState<InvestorPrefs>(getPrefs());
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => subscribePrefs(setLocal), []);

  function toggle(t: InvestorType) {
    const cur = new Set(prefs.investorTypes ?? []);
    cur.has(t) ? cur.delete(t) : cur.add(t);
    setPrefs({ ...prefs, investorTypes: Array.from(cur) });
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Your Preferences</h2>
            <p className="text-sm text-ink-600">Choose 1–3 investor types and set optional filters.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setPrefs({ investorTypes: [], zip: undefined, minInvestment: undefined })}
          >
            Reset
          </Button>
        </div>

        {/* Investor type chips */}
        <div className="flex flex-wrap gap-2">
          {CHOICES.map((c) => {
            const active = mounted && (prefs.investorTypes ?? []).includes(c.type);
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => toggle(c.type)}
                className={`px-3 py-1.5 rounded-full border text-sm transition ${
                  active ? 'bg-ink-900 text-white' : 'bg-white'
                }`}
                aria-pressed={active}
                title={c.blurb}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ZIP + Min investment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm text-ink-700">ZIP (optional)</span>
            <input
              inputMode="numeric"
              maxLength={5}
              value={mounted ? (prefs.zip ?? '') : ''}
              onChange={(e) => {
                const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
                setPrefs({ ...prefs, zip: zip || undefined });
              }}
              placeholder="e.g., 19103"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-700">Min investment ≤ (USD)</span>
            <input
              inputMode="numeric"
              value={mounted && prefs.minInvestment != null ? String(prefs.minInvestment) : ''}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                setPrefs({ ...prefs, minInvestment: v ? Number(v) : undefined });
              }}
              placeholder="e.g., 10000"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
        </div>
      </CardBody>
    </Card>
  );
}
