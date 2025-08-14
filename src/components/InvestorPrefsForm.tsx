'use client';

import * as React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPrefs, savePrefs, subscribePrefs } from '@/lib/prefs';
import type { InvestorPreferences } from '@/types/investor';
import type { RiskProfile } from '@/types/pitch';

const ALL_RISKS: RiskProfile[] = ['Balanced', 'Yield', 'Growth'];

const inputClass =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

export default function InvestorPrefsForm() {
  const [prefs, setPrefs] = React.useState<InvestorPreferences>(getPrefs());
  React.useEffect(() => subscribePrefs(setPrefs), []);

  function toggleRisk(r: RiskProfile) {
    const list = new Set(prefs.riskProfiles ?? []);
    if (list.has(r)) list.delete(r);
    else list.add(r);
    const next = { ...prefs, riskProfiles: Array.from(list) };
    setPrefs(next);
    savePrefs(next);
  }

  function update<K extends keyof InvestorPreferences>(key: K, value: InvestorPreferences[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
  }

  function reset() {
    const next: InvestorPreferences = { riskProfiles: [], strategyKeywords: [] };
    setPrefs(next);
    savePrefs(next);
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Your match settings</h2>
          <Button variant="ghost" onClick={reset}>Reset</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="text-sm text-ink-600">Preferred ZIP</label>
            <input
              inputMode="numeric"
              maxLength={5}
              className={inputClass + ' mt-1'}
              placeholder="19103"
              value={prefs.zip ?? ''}
              onChange={(e) =>
                update('zip', e.target.value.replace(/\D/g, '').slice(0, 5) || undefined)
              }
            />
            <p className="text-xs text-ink-500 mt-1">Exact match scores highest; same 3-digit region scores modestly.</p>
          </div>

          <div>
            <label className="text-sm text-ink-600">Min valuation</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="0"
              value={prefs.minValuation ?? ''}
              onChange={(e) => update('minValuation', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Max valuation</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="1,000,000"
              value={prefs.maxValuation ?? ''}
              onChange={(e) => update('maxValuation', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Max required min investment</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="5000"
              value={prefs.maxMinInvestment ?? ''}
              onChange={(e) => update('maxMinInvestment', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Min equity %</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="0"
              value={prefs.minEquityPct ?? ''}
              onChange={(e) => update('minEquityPct', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Max equity %</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="100"
              value={prefs.maxEquityPct ?? ''}
              onChange={(e) => update('maxEquityPct', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-600">Risk appetite</span>
          {ALL_RISKS.map((r) => {
            const active = (prefs.riskProfiles ?? []).includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRisk(r)}
                className={`px-3 py-1 rounded-full border text-sm transition ${active ? 'bg-ink-900 text-white' : 'bg-white'}`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-sm text-ink-600">Strategy keywords (comma separated)</label>
          <input
            className={inputClass + ' mt-1'}
            placeholder="STR, Light Reno, BRRRR"
            value={(prefs.strategyKeywords ?? []).join(', ')}
            onChange={(e) =>
              update(
                'strategyKeywords',
                e.target.value
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>
      </CardBody>
    </Card>
  );
}
