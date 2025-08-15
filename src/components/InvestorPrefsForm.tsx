'use client';

import * as React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { RiskProfile } from '@/types/pitch';
import { getPrefs, setPrefs, subscribePrefs } from '@/lib/prefs';

/**
 * Hydration-safe investor preferences panel.
 * Key idea: render with a "mounted" guard so the very first client render
 * matches the server output (no user-specific classes yet).
 */

type Prefs = ReturnType<typeof getPrefs>;

const RISK_CHOICES: RiskProfile[] = ['Yield', 'Balanced', 'Growth'];

export default function InvestorPrefsForm() {
  // Local prefs that mirror the prefs store
  const [prefs, setLocal] = React.useState<Prefs>(getPrefs());

  // Guard to avoid SSR/client mismatch: only apply user-specific styling after mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Keep in sync with the prefs store
  React.useEffect(() => {
    const off = subscribePrefs(setLocal);
    return () => off();
  }, []);

  function toggleRisk(r: RiskProfile) {
    const current = new Set((prefs.riskProfiles ?? []) as RiskProfile[]);
    if (current.has(r)) current.delete(r);
    else current.add(r);
    const next = { ...prefs, riskProfiles: Array.from(current) };
    setPrefs(next);
  }

  function updateZip(e: React.ChangeEvent<HTMLInputElement>) {
    const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
    setPrefs({ ...prefs, zip });
  }

  function updateMinInvestment(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '');
    const minInvestment = v ? Number(v) : undefined;
    setPrefs({ ...prefs, minInvestment });
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Your Preferences</h2>
            <p className="text-sm text-ink-600">Tune results to your goals. Changes apply instantly.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              setPrefs({
                riskProfiles: [],
                zip: undefined,
                minInvestment: undefined,
              })
            }
          >
            Reset
          </Button>
        </div>

        {/* Risk profile chips */}
        <div className="space-y-2">
          <div className="text-sm text-ink-700">Investor fit</div>
          <div className="flex flex-wrap gap-2">
            {RISK_CHOICES.map((r) => {
              // Hydration-safe: treat all as inactive until mounted
              const active = mounted && (prefs.riskProfiles ?? []).includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleRisk(r)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    active ? 'bg-ink-900 text-white' : 'bg-white'
                  }`}
                  type="button"
                  aria-pressed={active}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* ZIP + Min investment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm text-ink-700">ZIP (optional)</span>
            <input
              inputMode="numeric"
              maxLength={5}
              value={mounted ? prefs.zip ?? '' : ''} // hydration-safe
              onChange={updateZip}
              placeholder="e.g., 19103"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-700">Min investment ≤ (USD)</span>
            <input
              inputMode="numeric"
              value={mounted && prefs.minInvestment != null ? String(prefs.minInvestment) : ''}
              onChange={updateMinInvestment}
              placeholder="e.g., 10000"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
        </div>
      </CardBody>
    </Card>
  );
}
