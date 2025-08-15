'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDraft, numFromStr } from '@/lib/draft';
import type { Pitch } from '@/types/pitch';
import { computeMatch } from '@/lib/match';

function fmtMoney(n?: number | null) {
  const v = typeof n === 'number' ? n : 0;
  return v
    ? v.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    : '—';
}

export default function LiveListingPreview() {
  const { draft } = useDraft();

  // Build a temporary Pitch-like object from the draft for preview only.
  const preview: Pitch = {
    id: 'preview',
    title: draft.title || 'Dream Home',
    city: draft.city || '',
    state: draft.state || '',
    zip: draft.postalCode || '',

    // investment inputs
    minimumInvestment: numFromStr(draft.minInvestmentStr) || 0,

    // SEA structure
    referenceValuation: numFromStr(draft.valuationStr) || null,
    fundingGoal: numFromStr(draft.fundingGoalStr) || null,
    fundingCommitted: numFromStr(draft.fundingCommittedStr) || 0,
    appreciationSharePct: numFromStr(draft.appreciationSharePctStr) || null,
    horizonYears: numFromStr(draft.horizonYearsStr) || null,
    buybackAllowed: draft.buybackAllowed,

    // legacy optional fields kept as nulls (do not reintroduce)
    equityOfferedPct: null,
    expectedAppreciationPct: null,
    targetYieldPct: null,

    riskProfile: 'Balanced',
    heroImageUrl: draft.heroImageUrl,
    gallery: Array.isArray(draft.gallery) ? draft.gallery : [],
    offeringUrl: draft.offeringUrl,
    status: draft.status ?? 'review',

    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const match = computeMatch(preview);
  const funded = (() => {
    const goal = preview.fundingGoal || 0;
    if (!goal) return 0;
    const pct = Math.max(0, Math.min(1, (preview.fundingCommitted || 0) / goal));
    return Math.round(pct * 100);
  })();

  const openOffering = React.useCallback(() => {
    const url = preview.offeringUrl || 'https://example.com';
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // no-op
    }
  }, [preview.offeringUrl]);

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full bg-zinc-100 flex items-center justify-center text-zinc-400">
        <span className="text-2xl font-semibold">Listing Preview</span>
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-zinc-800/90 px-2.5 py-1 text-xs font-medium text-white">
          Balanced Blend
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-zinc-800/90 px-2.5 py-1 text-xs font-medium text-white">
          Match {match.score}%
        </span>
      </div>

      <div className="p-5 space-y-4">
        <h3 className="text-lg font-semibold text-ink-900">{preview.title}</h3>

        <div className="grid grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <div className="text-zinc-500">Valuation</div>
            <div className="text-ink-900">{fmtMoney(preview.referenceValuation)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-zinc-500">Min</div>
            <div className="text-ink-900">{fmtMoney(preview.minimumInvestment)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-zinc-500">AppShare</div>
            <div className="text-ink-900">
              {preview.appreciationSharePct != null ? `${preview.appreciationSharePct}%` : '—'}
            </div>
          </div>
        </div>

        {/* Funding progress */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-zinc-600">{funded}% funded</div>
          <div className="text-zinc-600">
            {preview.fundingGoal ? `Goal ${fmtMoney(preview.fundingGoal)}` : 'Goal not set'}
          </div>
        </div>
        <div className="h-2 w-full rounded bg-zinc-200">
          <div
            className="h-2 rounded bg-ink-900 transition-all"
            style={{ width: `${funded}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button onClick={openOffering}>Demo — Learn How</Button>
          <div className="text-xs text-zinc-500">
            {preview.city
              ? `${preview.city}, ${preview.state || ''} ${preview.zip || ''}`.trim()
              : ''}
          </div>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          This preview updates as you type. It won’t be published until you save from the Review step.
        </p>
      </div>
    </Card>
  );
}
