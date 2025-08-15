'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { useDraft } from '@/lib/draft';
import { getPitchById } from '@/lib/storage';


function s(n?: number | null): string {
  return n == null ? '' : String(n);
}

export default function EditPitchRedirect() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = (params?.id ?? '') as string;

  const { resetDraft, setField } = useDraft();
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    if (!id) return;

    Promise.resolve(getPitchById(id)).then((p) => {
      if (!alive) return;

      if (!p) {
        setNotFound(true);
        return;
      }

      // Map Pitch -> Draft (SEA model)
      resetDraft();

      // Basics / location
      setField('title', p.title || 'Untitled Pitch');
      setField('address1', '');
      setField('address2', '');
      setField('city', p.city || '');
      setField('state', p.state || '');
      setField('postalCode', p.zip || '');

      // Media / external (force strings to satisfy strict typing)
      setField('heroImageUrl', p.heroImageUrl ?? '');
      setField('gallery', Array.isArray(p.gallery) ? p.gallery : []);
      setField('offeringUrl', p.offeringUrl ?? '');

      // Economics (strings)
      setField('valuationStr', s(p.referenceValuation));
      setField('minInvestmentStr', s(p.minimumInvestment));
      setField('fundingGoalStr', s(p.fundingGoal));
      setField('fundingCommittedStr', s(p.fundingCommitted));
      setField('appreciationSharePctStr', s(p.appreciationSharePct));
      setField('horizonYearsStr', s(p.horizonYears));

      // Options
      setField('buybackAllowed', !!p.buybackAllowed);

      // Workflow
      setField('status', p.status);

      router.replace('/resident/create/basics');
    });

    return () => {
      alive = false;
    };
  }, [id, resetDraft, setField, router]);

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto px-4">
        <Section className="pt-10">
          <Card className="p-6">
            <h1 className="text-xl font-semibold text-ink-900">Pitch not found</h1>
            <p className="mt-2 text-zinc-700">
              We couldn’t find that pitch. It may have been removed.
            </p>
          </Card>
        </Section>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4">
      <Section className="pt-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-ink-900">Opening your pitch…</h1>
          <p className="mt-2 text-zinc-700">One moment while we load your details.</p>
        </Card>
      </Section>
    </main>
  );
}
