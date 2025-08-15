'use client';

import * as React from 'react';
import ListingCard from '@/components/ListingCard';
import type { Pitch } from '@/types/pitch';
import { useDraft, numFromStr } from '@/lib/draft';

function pct(n?: number, d?: number) {
  if (!d || d <= 0) return 0;
  const p = Math.floor(((n ?? 0) / d) * 100);
  return Math.max(0, Math.min(100, p));
}

export default function LiveListingPreview() {
  const { draft } = useDraft();

  // Build loose and cast, so schema changes (minInvestment vs minimumInvestment) don't break dev.
  const base: Record<string, unknown> = {
    id: draft.pitchId ?? 'preview',
    title: draft.title || 'Untitled pitch',
    city: draft.city || undefined,
    state: draft.state || undefined,
    postalCode: draft.postalCode || undefined,
    zip: draft.postalCode || undefined, // in case your card still reads zip
    minInvestment: numFromStr(draft.minInvestmentStr),
    minimumInvestment: numFromStr(draft.minInvestmentStr), // tolerate either key
    equityOfferedPct: numFromStr(draft.equityPctStr) ?? null,
    expectedAppreciationPct: numFromStr(draft.expectedAppreciationPctStr) ?? null,
    targetYieldPct: numFromStr(draft.targetYieldPctStr) ?? null,
    status: draft.status,
    heroImageUrl:
      draft.heroImageUrl || 'https://placehold.co/1200x675/png?text=Listing+Preview',
    offeringUrl: draft.offeringUrl || undefined,
    gallery: draft.gallery,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const fundingGoal = numFromStr(draft.fundingGoalStr);
  const fundingCommitted = numFromStr(draft.fundingCommittedStr);
  const fundedPct = pct(fundingCommitted, fundingGoal);

  const p = base as unknown as Pitch;

  return (
    <div>
      <div className="text-sm text-ink-700 mb-3">Live preview</div>
      {/* ListingCard in your repo expects prop "p" */}
      <ListingCard p={p} matchScore={fundedPct} />
      <div className="mt-3 text-xs text-ink-600">
        This preview updates as you type. It won’t be published until you save from the Review step.
      </div>
    </div>
  );
}
