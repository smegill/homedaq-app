// src/lib/investorFit.ts
import type { Pitch, InvestorPersona } from '@/types/pitch';

// Re-export the type so other files can safely import from "@/lib/investorFit".
export type { InvestorPersona } from '@/types/pitch';

export const INVESTOR_LABELS: Record<InvestorPersona, string> = {
  'Growth First': 'Growth First',
  'Income First': 'Income First',
  'Balanced Blend': 'Balanced Blend',
  'Community Backer': 'Community Backer',
  'Steady Shelter': 'Steady Shelter',
  'Value-Add / Flip': 'Value-Add / Flip',
};

export type InvestorFit = {
  top: InvestorPersona;
  score: number; // top score (0-100)
  personas: Array<{ persona: InvestorPersona; score: number }>;
  reasons: string[];
};

/** Heuristic fit using yield, appreciation, story, and options. */
export function computeInvestorFit(p: Pitch): InvestorFit {
  const s: Record<InvestorPersona, number> = {
    'Growth First': 0,
    'Income First': 0,
    'Balanced Blend': 0,
    'Community Backer': 0,
    'Steady Shelter': 0,
    'Value-Add / Flip': 0,
  };
  const reasons: string[] = [];

  const yieldPct = p.targetYieldPct ?? 0;
  const appr = p.expectedAppreciationPct ?? 0;
  const share = p.appreciationSharePct ?? 0;
  const hasBuyback = !!p.buybackAllowed;
  const storyLen =
    (p.residentStory ?? '').length +
    (p.summary ?? '').length +
    (p.problem ?? '').length;

  // Income seekers: strong yield
  s['Income First'] += Math.min(1, yieldPct / 8) * 100;
  if (yieldPct >= 6) reasons.push('Attractive target yield');

  // Growth seekers: expected appreciation + investor share
  s['Growth First'] += Math.min(1, (appr + share / 10) / 15) * 100;
  if (appr >= 5 || share >= 25) reasons.push('Compelling upside potential');

  // Balanced: average of both
  s['Balanced Blend'] += (s['Income First'] + s['Growth First']) / 2;

  // Community & shelter: narrative + buyback option
  if (storyLen > 120) {
    s['Community Backer'] += 60;
    reasons.push('Strong human story / impact');
  }
  if (hasBuyback) {
    s['Steady Shelter'] += 40;
    reasons.push('Resident buy-back option');
  }

  // Value-add: improvements/flip language
  if ((p.improvements ?? '').length > 40 || (p.strategyTags ?? []).includes('flip')) {
    s['Value-Add / Flip'] += 55;
    reasons.push('Clear value-add plan');
  }

  const personas = (Object.keys(s) as InvestorPersona[])
    .map((persona) => ({ persona, score: Math.round(Math.max(0, Math.min(100, s[persona]))) }))
    .sort((a, b) => b.score - a.score);

  const top = personas[0]?.persona ?? 'Balanced Blend';
  const score = personas[0]?.score ?? 0;

  return { top, score, personas, reasons };
}
