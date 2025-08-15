'use client';

import * as React from 'react';
import { useDraft } from '@/lib/draft';
import LiveListingPreview from '../_components/LiveListingPreview';

export default function EconomicsStep() {
  const { draft, setField } = useDraft();

  const input =
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[15px] leading-6 outline-none focus:border-zinc-500 focus:ring-0';
  const label = 'text-sm font-medium text-zinc-800';
  const box = 'rounded-2xl border border-zinc-200 bg-white p-4';

  const appShare = toNum(draft.appreciationSharePctStr);
  const rv = toNum(draft.valuationStr); // reuse valuationStr as Reference Valuation (RV)
  const goal = toNum(draft.fundingGoalStr);
  const horizon = toNum(draft.horizonYearsStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: form */}
      <div className="space-y-6">
        <div className={box}>
          <div className={label}>Reference valuation (RV)</div>
          <input
            type="number"
            className={input + ' mt-2'}
            placeholder="e.g. 350000"
            value={draft.valuationStr}
            onChange={(e) => setField('valuationStr', e.target.value)}
          />
          <p className="mt-2 text-xs text-zinc-600">
            Use a recent appraisal or an AVM. Investors’ upside is measured relative to this.
          </p>
        </div>

        <div className={box}>
          <div className={label}>Funding goal</div>
          <input
            type="number"
            className={input + ' mt-2'}
            placeholder="e.g. 60000"
            value={draft.fundingGoalStr}
            onChange={(e) => setField('fundingGoalStr', e.target.value)}
          />
        </div>

        <div className={box}>
          <div className={label}>Appreciation share (%)</div>
          <input
            type="number"
            className={input + ' mt-2'}
            placeholder="e.g. 12"
            value={draft.appreciationSharePctStr}
            onChange={(e) => setField('appreciationSharePctStr', e.target.value)}
          />
          <p className="mt-2 text-xs text-zinc-600">
            Investors receive this share of appreciation above RV at exit (sale/refi/buyback).
          </p>
        </div>

        <div className={box}>
          <div className={label}>Investment horizon (years)</div>
          <input
            type="number"
            className={input + ' mt-2'}
            placeholder="e.g. 5"
            value={draft.horizonYearsStr}
            onChange={(e) => setField('horizonYearsStr', e.target.value)}
          />
        </div>

        <div className={box}>
          <label className="inline-flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!draft.buybackAllowed}
              onChange={(e) => setField('buybackAllowed', e.target.checked)}
            />
            <span className={label}>Resident buyback allowed</span>
          </label>
          <p className="mt-2 text-xs text-zinc-600">
            Resident can repurchase by paying principal + SEA share at the then-current valuation.
          </p>
        </div>

        <div className={box}>
          <div className={label}>Minimum investment (optional)</div>
          <input
            type="number"
            className={input + ' mt-2'}
            placeholder="e.g. 2500"
            value={draft.minInvestmentStr}
            onChange={(e) => setField('minInvestmentStr', e.target.value)}
          />
        </div>
      </div>

      {/* RIGHT: single live preview */}
      <div className="lg:sticky lg:top-4 h-fit">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <LiveListingPreview />
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-700">
            <Scenario label="0% HPA" rv={rv} share={appShare} goal={goal} horizon={horizon} rate={0} />
            <Scenario label="2% HPA" rv={rv} share={appShare} goal={goal} horizon={horizon} rate={0.02} />
            <Scenario label="5% HPA" rv={rv} share={appShare} goal={goal} horizon={horizon} rate={0.05} />
            <Scenario label="8% HPA" rv={rv} share={appShare} goal={goal} horizon={horizon} rate={0.08} />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Illustration only. Not investment advice. Actual outcomes vary.
          </p>
        </div>
      </div>
    </div>
  );
}

function Scenario({
  label,
  rv,
  share,
  goal,
  horizon,
  rate,
}: {
  label: string;
  rv: number;
  share: number;
  goal: number;
  horizon: number;
  rate: number; // annual HPA
}) {
  if (!rv || !share || !horizon) {
    return (
      <div className="rounded-lg border border-zinc-200 p-3">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-zinc-600">Set RV, share, and horizon</div>
      </div>
    );
  }
  const exit = rv * Math.pow(1 + rate, Math.max(0, horizon));
  const upside = Math.max(0, exit - rv);
  const investorApp = (share / 100) * upside;
  const proceeds = (goal || 0) + investorApp;

  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <div className="font-medium">{label}</div>
      <div className="text-xs text-zinc-600">Exit value ~ ${fmt(exit)}</div>
      <div className="mt-1 text-ink-900">Investor total ~ ${fmt(proceeds)}</div>
    </div>
  );
}

// utils
const toNum = (s?: string) => (s ? Number(s) || 0 : 0);
const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });
