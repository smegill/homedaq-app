'use client';

import * as React from 'react';
import type { Pitch } from '@/types/pitch';

const STORAGE_KEY = 'homedaq.pitchDraft.v1';

export type Draft = {
  // Basics
  title: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  status: Pitch['status'];

  // Economics (store as strings; parse where used)
  valuationStr: string;
  equityPctStr: string;
  minInvestmentStr: string;
  fundingGoalStr: string;
  fundingCommittedStr: string;
  targetYieldPctStr: string;
  expectedAppreciationPctStr: string;

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
  strategyTags: string; // comma-separated

  // Media
  heroImageUrl: string;
  offeringUrl: string;
  gallery: string[];

  // Source pitch id (when editing)
  pitchId?: string;
};

export const defaultDraft: Draft = {
  title: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  status: 'review',

  valuationStr: '',
  equityPctStr: '',
  minInvestmentStr: '',
  fundingGoalStr: '',
  fundingCommittedStr: '',
  targetYieldPctStr: '',
  expectedAppreciationPctStr: '',

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
};

type DraftCtx = {
  draft: Draft;
  setField: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  reset: () => void;
  loadFromPitch: (p: Partial<Pitch>) => void;
};

const Ctx = React.createContext<DraftCtx | null>(null);

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<Draft>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultDraft;
      const parsed = JSON.parse(raw) as Draft;
      return { ...defaultDraft, ...parsed };
    } catch {
      return defaultDraft;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage failures
    }
  }, [draft]);

  const setField = React.useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const reset = React.useCallback(() => setDraft(defaultDraft), []);

  const loadFromPitch = React.useCallback((p: Partial<Pitch>) => {
    const loose = p as Record<string, unknown>;
    const s = (k: string) => (typeof loose[k] === 'string' ? (loose[k] as string) : '');
    const n = (k: string) => (typeof loose[k] === 'number' ? String(loose[k]) : '');
    const postal = (loose['postalCode'] as string) ?? (loose['zip'] as string) ?? '';

    setDraft((d) => ({
      ...d,
      pitchId: typeof loose['id'] === 'string' ? (loose['id'] as string) : undefined,
      title: s('title'),
      address1: s('address1'),
      address2: s('address2'),
      city: s('city'),
      state: s('state'),
      postalCode: postal,
      status: (loose['status'] as Pitch['status']) ?? 'review',

      valuationStr: n('valuation'),
      equityPctStr: n('equityPct') || n('equityOfferedPct'),
      minInvestmentStr: n('minInvestment') || n('minimumInvestment'),
      fundingGoalStr: n('fundingGoal'),
      fundingCommittedStr: n('fundingCommitted'),
      targetYieldPctStr: n('targetYieldPct'),
      expectedAppreciationPctStr: n('expectedAppreciationPct'),

      summary: s('summary'),
      problem: s('problem'),
      solution: s('solution'),
      plan: s('plan'),
      useOfFunds: s('useOfFunds'),
      exitStrategy: s('exitStrategy'),
      improvements: s('improvements'),
      timeline: s('timeline'),
      residentStory: s('residentStory'),
      strategyTags: Array.isArray(loose['strategyTags'])
        ? (loose['strategyTags'] as string[]).join(', ')
        : s('strategyTags'),

      heroImageUrl: s('heroImageUrl'),
      offeringUrl: s('offeringUrl'),
      gallery: Array.isArray(loose['gallery']) ? (loose['gallery'] as string[]) : [],
    }));
  }, []);

  const value = React.useMemo(
    () => ({ draft, setField, reset, loadFromPitch }),
    [draft, setField, reset, loadFromPitch]
  );

  // No JSX so this can remain .ts
  return React.createElement(Ctx.Provider, { value }, children);
}

export function useDraft(): DraftCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useDraft must be used within DraftProvider');
  return v;
}

export const numFromStr = (s: string): number | undefined => {
  if (!s) return undefined;
  const n = Number(s.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};
