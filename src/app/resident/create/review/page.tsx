'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDraft, numFromStr } from '@/lib/draft';
import { savePitch } from '@/lib/storage';
import type { PitchInput } from '@/types/pitch';

function buildPitchFromDraft(draft: ReturnType<typeof useDraft>['draft']): PitchInput {
  return {
    // basics
    title: (draft.title || 'Untitled Pitch').trim(),
    city: draft.city || '',
    state: draft.state || '',
    zip: draft.postalCode || '',

    // minimum ticket
    minimumInvestment: numFromStr(draft.minInvestmentStr) || 0,

    // SEA model
    referenceValuation: numFromStr(draft.valuationStr) || null,
    fundingGoal: numFromStr(draft.fundingGoalStr) || null,
    fundingCommitted: numFromStr(draft.fundingCommittedStr) || 0,
    appreciationSharePct: numFromStr(draft.appreciationSharePctStr) || null,
    horizonYears: numFromStr(draft.horizonYearsStr) || null,
    buybackAllowed: draft.buybackAllowed,

    // media / links
    heroImageUrl: draft.heroImageUrl,
    gallery: Array.isArray(draft.gallery) ? draft.gallery : [],
    offeringUrl: draft.offeringUrl,

    // workflow
    status: 'review',
  };
}

export default function ReviewStep() {
  const router = useRouter();
  const { draft, resetDraft } = useDraft(); // ← use resetDraft
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSave = async () => {
    setBusy(true);
    setError(null);
    try {
      const input = buildPitchFromDraft(draft);
      await savePitch(input);
      resetDraft();
      router.push('/resident/dashboard');
    } catch (e) {
      setError('Sorry — something went wrong saving your pitch.');
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="space-y-8">
      <Section className="max-w-5xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-semibold text-ink-900">Review & Save</h1>
        <p className="mt-2 text-zinc-700">
          Check your details, then save your pitch. You can publish after a quick review.
        </p>
      </Section>

      <Section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Title</div>
              <div className="text-ink-900 font-medium">{draft.title || 'Untitled Pitch'}</div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-zinc-500">Valuation</div>
                <div className="text-ink-900">{draft.valuationStr || '—'}</div>
              </div>
              <div>
                <div className="text-zinc-500">Min Investment</div>
                <div className="text-ink-900">{draft.minInvestmentStr || '—'}</div>
              </div>
              <div>
                <div className="text-zinc-500">Appreciation Share</div>
                <div className="text-ink-900">
                  {draft.appreciationSharePctStr ? `${draft.appreciationSharePctStr}%` : '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-zinc-500">Funding Goal</div>
                <div className="text-ink-900">{draft.fundingGoalStr || '—'}</div>
              </div>
              <div>
                <div className="text-zinc-500">Committed</div>
                <div className="text-ink-900">{draft.fundingCommittedStr || '—'}</div>
              </div>
              <div>
                <div className="text-zinc-500">Horizon</div>
                <div className="text-ink-900">
                  {draft.horizonYearsStr ? `${draft.horizonYearsStr} yrs` : '—'}
                </div>
              </div>
            </div>

            <div className="text-sm text-zinc-600">
              {draft.city ? `${draft.city}, ${draft.state || ''} ${draft.postalCode || ''}`.trim() : 'Location not set'}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button onClick={onSave} disabled={busy} className="w-full">
              {busy ? 'Saving…' : 'Save pitch'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetDraft();
                router.push('/resident/create/basics');
              }}
              className="w-full"
            >
              Start over
            </Button>
          </Card>
        </div>
      </Section>
    </main>
  );
}
