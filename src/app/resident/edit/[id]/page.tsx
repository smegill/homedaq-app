'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPitchById } from '@/lib/storage';
import type { Draft } from '@/lib/draft';
import type { PitchStatus } from '@/types/pitch';

const DRAFT_KEY = 'homedaq.pitchDraft.v1';

// helpers
const s = (v: unknown): string => (typeof v === 'string' ? v : '');
const nstr = (v: unknown): string =>
  typeof v === 'number' ? String(v) : typeof v === 'string' && v.trim() !== '' ? v : '';

const isPitchStatus = (v: unknown): v is PitchStatus =>
  v === 'draft' || v === 'review' || v === 'live' || v === 'funded' || v === 'closed';

function toDraft(p: Record<string, unknown>): Draft {
  const postal = (p['postalCode'] as string) ?? (p['zip'] as string) ?? '';
  const status: PitchStatus = isPitchStatus(p['status']) ? p['status'] : 'review';

  return {
    // Basics
    title: s(p['title']),
    address1: s(p['address1']),
    address2: s(p['address2']),
    city: s(p['city']),
    state: s(p['state']),
    postalCode: postal,
    status,

    // Economics (strings)
    valuationStr: nstr(p['valuation']),
    equityPctStr: nstr(p['equityOfferedPct'] ?? p['equityPct']),
    minInvestmentStr: nstr(p['minInvestment'] ?? p['minimumInvestment']),
    fundingGoalStr: nstr(p['fundingGoal']),
    fundingCommittedStr: nstr(p['fundingCommitted']),
    targetYieldPctStr: nstr(p['targetYieldPct']),
    expectedAppreciationPctStr: nstr(p['expectedAppreciationPct']),

    // Narrative
    summary: s(p['summary']),
    problem: s(p['problem']),
    solution: s(p['solution']),
    plan: s(p['plan']),
    useOfFunds: s(p['useOfFunds']),
    exitStrategy: s(p['exitStrategy']),
    improvements: s(p['improvements']),
    timeline: s(p['timeline']),
    residentStory: s(p['residentStory']),
    strategyTags: Array.isArray(p['strategyTags'])
      ? (p['strategyTags'] as string[]).join(', ')
      : s(p['strategyTags']),

    // Media
    heroImageUrl: s(p['heroImageUrl']),
    offeringUrl: s(p['offeringUrl']),
    gallery: Array.isArray(p['gallery']) ? (p['gallery'] as string[]) : [],

    // source id for later overwrite
    pitchId: (p['id'] as string) ?? undefined,
  };
}

export default function EditPitchRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = React.useState<'loading' | 'missing'>('loading');

  React.useEffect(() => {
    let on = true;
    (async () => {
      const pitch = await getPitchById(id);
      if (!on) return;

      if (!pitch) {
        setState('missing');
        return;
      }

      try {
        const draft = toDraft(pitch as unknown as Record<string, unknown>);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // ignore storage failures
      }

      router.replace('/resident/create/basics');
    })();

    return () => {
      on = false;
    };
  }, [id, router]);

  if (state === 'missing') {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-semibold">Pitch not found</h1>
        <p className="mt-2 text-ink-700">
          We couldn’t find a pitch with id <code>{id}</code>.
        </p>
      </div>
    );
  }

  return <div className="mx-auto max-w-3xl p-8 text-ink-700">Loading…</div>;
}
