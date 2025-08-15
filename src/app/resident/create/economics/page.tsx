'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/lib/draft';

const input =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function EconomicsStep() {
  const { draft, setField } = useDraft();
  const router = useRouter();

  const equity = clamp(Number(draft.equityPctStr || '0'), 0, 100);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push('/resident/create/narrative');
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Valuation</span>
          <input
            className={input}
            inputMode="numeric"
            value={draft.valuationStr}
            onChange={(e) => setField('valuationStr', e.target.value.replace(/[^\d]/g, ''))}
            placeholder="350000"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Equity offered (%)</span>
          <input
            className={input}
            inputMode="numeric"
            value={draft.equityPctStr}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.]/g, '');
              setField('equityPctStr', raw === '' ? '' : String(clamp(Number(raw), 0, 100)));
            }}
            placeholder="10"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={equity}
            onChange={(e) => setField('equityPctStr', (e.target as HTMLInputElement).value)}
            onInput={(e) => setField('equityPctStr', (e.target as HTMLInputElement).value)}
            className="w-full"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Minimum investment</span>
          <input
            className={input}
            inputMode="numeric"
            value={draft.minInvestmentStr}
            onChange={(e) => setField('minInvestmentStr', e.target.value.replace(/[^\d]/g, ''))}
            placeholder="5000"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Target dividend yield (%)</span>
          <input
            className={input}
            inputMode="numeric"
            value={draft.targetYieldPctStr}
            onChange={(e) => setField('targetYieldPctStr', e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="5"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Expected appreciation (%)</span>
          <input
            className={input}
            inputMode="numeric"
            value={draft.expectedAppreciationPctStr}
            onChange={(e) => setField('expectedAppreciationPctStr', e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="3"
          />
        </label>

        <div className="space-y-2 md:col-span-2">
          <div className="text-sm text-ink-600">Funding goal & progress</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className={input}
              inputMode="numeric"
              value={draft.fundingGoalStr}
              onChange={(e) => setField('fundingGoalStr', e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Goal (e.g., 250000)"
            />
            <input
              className={input}
              inputMode="numeric"
              value={draft.fundingCommittedStr}
              onChange={(e) => setField('fundingCommittedStr', e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Committed (e.g., 75000)"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="rounded-xl border px-4 py-2"
          onClick={() => history.back()}
        >
          Back
        </button>
        <button className="rounded-xl bg-ink-900 text-white px-4 py-2">Continue</button>
      </div>
    </form>
  );
}
