'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/lib/draft';

const input =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

export default function NarrativeStep() {
  const { draft, setField } = useDraft();
  const router = useRouter();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push('/resident/create/media');
      }}
    >
      {[
        ['problem', 'Problem / Opportunity'],
        ['solution', 'Solution / Why this property'],
        ['plan', 'Execution plan'],
        ['useOfFunds', 'Use of funds'],
        ['timeline', 'Timeline'],
        ['exitStrategy', 'Exit strategy'],
        ['residentStory', 'Resident story'],
      ] as const}.map

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Problem / Opportunity</span>
        <textarea className={input} rows={3} value={draft.problem} onChange={(e) => setField('problem', e.target.value)} />
      </label>

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Solution / Why this property</span>
        <textarea className={input} rows={3} value={draft.solution} onChange={(e) => setField('solution', e.target.value)} />
      </label>

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Execution plan</span>
        <textarea className={input} rows={3} value={draft.plan} onChange={(e) => setField('plan', e.target.value)} placeholder="Renovations, rent mix, STR/LTR, milestones." />
      </label>

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Use of funds</span>
        <textarea className={input} rows={3} value={draft.useOfFunds} onChange={(e) => setField('useOfFunds', e.target.value)} />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Timeline</span>
          <textarea className={input} rows={2} value={draft.timeline} onChange={(e) => setField('timeline', e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Exit strategy</span>
          <textarea className={input} rows={2} value={draft.exitStrategy} onChange={(e) => setField('exitStrategy', e.target.value)} />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Resident story</span>
        <textarea className={input} rows={3} value={draft.residentStory} onChange={(e) => setField('residentStory', e.target.value)} placeholder="Who are you and why can you deliver?" />
      </label>

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Strategy tags (comma separated)</span>
        <input
          className={input}
          value={draft.strategyTags}
          onChange={(e) => setField('strategyTags', e.target.value)}
          placeholder="Quick Flip, Growth Upside, ADU, Buy-Back, STR"
        />
      </label>

      <div className="flex justify-between">
        <button type="button" className="rounded-xl border px-4 py-2" onClick={() => history.back()}>
          Back
        </button>
        <button className="rounded-xl bg-ink-900 text-white px-4 py-2">Continue</button>
      </div>
    </form>
  );
}
