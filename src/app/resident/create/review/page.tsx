'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDraft, numFromStr } from '@/lib/draft';
import type { Pitch, PitchInput, PitchStatus } from '@/types/pitch';
import { savePitch } from '@/lib/storage';

const box = 'rounded-xl border border-ink-100 p-3';
const label = 'text-xs text-ink-600';
const value = 'text-sm text-ink-900 font-medium';

export default function ReviewStep() {
  const { draft, reset } = useDraft();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleSave(targetStatus: PitchStatus) {
    setBusy(true);

    // Build a safe payload that only includes keys known to exist on your Pitch type.
    const loose: Record<string, unknown> = {
      id: draft.pitchId,
      title: draft.title,
      city: draft.city || undefined,
      state: draft.state || undefined,
      postalCode: draft.postalCode || undefined,
      status: targetStatus,
      minimumInvestment: numFromStr(draft.minInvestmentStr),
      equityOfferedPct: numFromStr(draft.equityPctStr) ?? null,
      expectedAppreciationPct: numFromStr(draft.expectedAppreciationPctStr) ?? null,
      targetYieldPct: numFromStr(draft.targetYieldPctStr) ?? null,
      summary: draft.summary || undefined,
      problem: draft.problem || undefined,
      solution: draft.solution || undefined,
      plan: draft.plan || undefined,
      useOfFunds: draft.useOfFunds || undefined,
      exitStrategy: draft.exitStrategy || undefined,
      improvements: draft.improvements || undefined,
      timeline: draft.timeline || undefined,
      residentStory: draft.residentStory || undefined,
      strategyTags: draft.strategyTags
        ? draft.strategyTags.split(',').map((x) => x.trim()).filter(Boolean)
        : [],
      heroImageUrl: draft.heroImageUrl || undefined,
      offeringUrl: draft.offeringUrl || undefined,
      gallery: draft.gallery,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const saved = await savePitch(loose as PitchInput);
    reset();
    setBusy(false);
    router.push('/resident/dashboard');
    return saved;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={box}><div className={label}>Title</div><div className={value}>{draft.title || '—'}</div></div>
        <div className={box}><div className={label}>Location</div><div className={value}>
          {[draft.city, draft.state, draft.postalCode].filter(Boolean).join(', ') || '—'}
        </div></div>
        <div className={box}><div className={label}>Equity</div><div className={value}>
          {draft.equityPctStr ? `${draft.equityPctStr}%` : '—'}
        </div></div>
        <div className={box}><div className={label}>Min investment</div><div className={value}>
          {draft.minInvestmentStr ? `$${Number(draft.minInvestmentStr).toLocaleString()}` : '—'}
        </div></div>
        <div className={box}><div className={label}>Funding</div><div className={value}>
          {draft.fundingGoalStr
            ? `$${Number(draft.fundingCommittedStr || '0').toLocaleString()} / $${Number(draft.fundingGoalStr).toLocaleString()}`
            : '—'}
        </div></div>
        <div className={box}><div className={label}>Yield target</div><div className={value}>
          {draft.targetYieldPctStr ? `${draft.targetYieldPctStr}%` : '—'}
        </div></div>
        <div className={box}><div className={label}>Appreciation</div><div className={value}>
          {draft.expectedAppreciationPctStr ? `${draft.expectedAppreciationPctStr}%` : '—'}
        </div></div>
        <div className={box + ' md:col-span-2'}>
          <div className={label}>Tags</div>
          <div className={value}>{draft.strategyTags || '—'}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl bg-ink-900 text-white px-4 py-2"
          disabled={busy}
          onClick={() => handleSave('review')}
        >
          {busy ? 'Saving…' : 'Submit for review'}
        </button>
        <button
          type="button"
          className="rounded-xl border px-4 py-2"
          disabled={busy}
          onClick={() => handleSave('draft')}
        >
          Save as draft
        </button>
        <button
          type="button"
          className="rounded-xl border px-4 py-2"
          disabled={busy}
          onClick={() => handleSave('live')}
        >
          Go live
        </button>
      </div>
    </div>
  );
}
