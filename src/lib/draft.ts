'use client';

import * as React from 'react';
import type { PitchStatus } from '@/types/pitch';

export type Draft = {
  // Basics
  title: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  status: PitchStatus;

  // Economics (strings for controlled inputs)
  valuationStr: string;        // Reference Valuation (RV)
  fundingGoalStr: string;
  fundingCommittedStr: string;
  minInvestmentStr: string;

  // SEA fields
  appreciationSharePctStr: string;
  horizonYearsStr: string;
  buybackAllowed?: boolean;

  // Narrative
  summary: string;
  problem: string;
  solution: string;
  plan: string;
  useOfFunds: string;
  exitStrategy: string;
  improvements: string;
  timeline: string;
  residentStory: string;
  strategyTags: string;

  // Media / links
  heroImageUrl: string;
  offeringUrl: string;
  gallery: string[];

  // edit flow
  pitchId?: string;
};

const DEFAULT: Draft = {
  title: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  status: 'review',

  valuationStr: '',
  fundingGoalStr: '',
  fundingCommittedStr: '',
  minInvestmentStr: '',

  appreciationSharePctStr: '',
  horizonYearsStr: '',
  buybackAllowed: true,

  summary: '',
  problem: '',
  solution: '',
  plan: '',
  useOfFunds: '',
  exitStrategy: '',
  improvements: '',
  timeline: '',
  residentStory: '',
  strategyTags: '',

  heroImageUrl: '',
  offeringUrl: '',
  gallery: [],

  pitchId: undefined,
};

const KEY = 'homedaq.pitchDraft.v1';

export function loadDraft(): Draft {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

export function saveDraft(d: Draft) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(d));
    }
  } catch {}
}

export function clearDraft() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEY);
    }
  } catch {}
}

/** Hook used by the new route-based builder */
export function useDraft() {
  const [draft, setDraft] = React.useState<Draft>(DEFAULT);

  React.useEffect(() => {
    setDraft(loadDraft());
  }, []);

  const setField = React.useCallback(
    <K extends keyof Draft>(key: K, value: Draft[K]) => {
      setDraft((prev) => {
        const next = { ...prev, [key]: value };
        saveDraft(next);
        return next;
      });
    },
    []
  );

  return { draft, setField, resetDraft: clearDraft };
}

/** Compatibility helper for older components */
export function numFromStr(s?: string): number {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Compatibility provider: some older pages import DraftProvider.
 * Our new builder doesn’t need context, so this is a no-op wrapper.
 * Implemented without JSX so this file can remain .ts.
 */
export function DraftProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  return React.createElement(React.Fragment, null, children);
}
