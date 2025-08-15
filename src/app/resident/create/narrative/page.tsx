'use client';

import * as React from 'react';
import { useDraft } from '@/lib/draft';

export default function NarrativeStep() {
  const { draft, setField } = useDraft();

  const input =
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[15px] leading-6 outline-none focus:border-zinc-500 focus:ring-0';
  const textarea =
    'w-full min-h-[120px] rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[15px] leading-6 outline-none focus:border-zinc-500 focus:ring-0';

  // NOTE: no grid here — parent layout owns the two-pane layout.
  return (
    <div className="space-y-6">
      <Section title="Problem / Opportunity">
        <textarea
          className={textarea}
          placeholder="What’s the story? What problem or opportunity exists here?"
          value={draft.problem}
          onChange={(e) => setField('problem', e.target.value)}
        />
      </Section>

      <Section title="Solution / Why this property">
        <textarea
          className={textarea}
          placeholder="Why this property? What makes it compelling?"
          value={draft.solution}
          onChange={(e) => setField('solution', e.target.value)}
        />
      </Section>

      <Section title="Execution plan">
        <textarea
          className={textarea}
          placeholder="How will you execute? Contractors, permits, timeline, key risks."
          value={draft.plan}
          onChange={(e) => setField('plan', e.target.value)}
        />
      </Section>

      <Section title="Use of funds">
        <textarea
          className={textarea}
          placeholder="Breakdown of how funds will be used."
          value={draft.useOfFunds}
          onChange={(e) => setField('useOfFunds', e.target.value)}
        />
      </Section>

      <Section title="Timeline">
        <textarea
          className={textarea}
          placeholder="Milestones and expected dates."
          value={draft.timeline}
          onChange={(e) => setField('timeline', e.target.value)}
        />
      </Section>

      <Section title="Exit strategy">
        <textarea
          className={textarea}
          placeholder="Flip, refinance, or resident buy-back? What are the triggers?"
          value={draft.exitStrategy}
          onChange={(e) => setField('exitStrategy', e.target.value)}
        />
      </Section>

      <Section title="Resident story">
        <textarea
          className={textarea}
          placeholder="Who benefits? Share the human story, respectfully."
          value={draft.residentStory}
          onChange={(e) => setField('residentStory', e.target.value)}
        />
      </Section>

      <Section title="Strategy tags (comma-separated)">
        <input
          className={input}
          placeholder="flip, BRRRR, buyback, cosmetic, value-add"
          value={draft.strategyTags}
          onChange={(e) => setField('strategyTags', e.target.value)}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="mb-2 text-sm font-medium text-zinc-800">{title}</div>
      {children}
    </div>
  );
}
