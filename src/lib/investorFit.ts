'use client';

import type { Pitch } from '@/types/pitch';

export type InvestorType =
  | 'MaxReturn'
  | 'GrowthUpside'
  | 'SteadyIncome'
  | 'BalancedBlend'
  | 'QuickFlip'
  | 'CommunityImpact';

export const INVESTOR_LABELS: Record<InvestorType, string> = {
  MaxReturn: 'Max Return',
  GrowthUpside: 'Growth Upside',
  SteadyIncome: 'Steady Income',
  BalancedBlend: 'Balanced Blend',
  QuickFlip: 'Quick Flip',
  CommunityImpact: 'Community Impact',
};

export type InvestorFit = {
  type: InvestorType;
  label: string;   // human-readable label
  reason: string;  // short explanation
  confidence: number; // 0..1
};

/** Compute a plain-English investor fit based on tags, narrative, and basic economics. */
export function computeInvestorFit(p: Pitch): InvestorFit {
  const tags = (p.strategyTags ?? []).map((t) => t.toLowerCase());
  const text = [
    p.summary, p.problem, p.solution, p.plan, p.useOfFunds,
    p.exitStrategy, p.improvements, p.timeline, p.residentStory,
  ].filter(Boolean).join(' ').toLowerCase();

  const scores: Record<InvestorType, number> = {
    MaxReturn: 0,
    GrowthUpside: 0,
    SteadyIncome: 0,
    BalancedBlend: 0,
    QuickFlip: 0,
    CommunityImpact: 0,
  };
  const bump = (k: InvestorType, n = 1) => { scores[k] += n; };

  // --- Tag-based signals ---
  if (tags.includes('flip')) bump('QuickFlip', 4);
  if (tags.includes('buy-back') || tags.includes('preservation')) bump('CommunityImpact', 4);
  if (tags.includes('value-add') || tags.includes('lease-up')) bump('GrowthUpside', 3);
  if (tags.includes('adu') || tags.includes('condo map') || tags.includes('entitlement')) bump('GrowthUpside', 3);
  if (tags.includes('light reno') || tags.includes('design') || tags.includes('house hack') || tags.includes('hybrid')) bump('BalancedBlend', 2);
  if (tags.includes('ltr') || tags.includes('stabilization') || tags.includes('yield')) bump('SteadyIncome', 2);

  // --- Narrative keywords ---
  if (/\bflip|resell|sell upon completion|list in \d+\s*days|90[-\s]?day\b/.test(text)) bump('QuickFlip', 3);
  if (/\bbuy[-\s]?back|repurchase|keep the (home|house)|hardship|preservation\b/.test(text)) bump('CommunityImpact', 3);
  if (/\blease[-\s]?up|renovat(e|ion)|reposition|add unit|reconfigure|refi|appraisal|arv\b/.test(text)) bump('GrowthUpside', 2);
  if (/\bstabiliz(e|ation)|cash[-\s]?flow|dscr|reserves|hold\b/.test(text)) bump('SteadyIncome', 2);
  if (/\blight reno|cosmetic|furnish|add laundry|optimiz(e|ation)\b/.test(text)) bump('BalancedBlend', 1);
  if (/\bspecial situation|outsized upside|asymmetric\b/.test(text)) bump('MaxReturn', 2);

  // --- Economics nudges ---
  const equity = p.equityPct ?? 0;
  const goal = p.fundingGoal ?? 0;
  if (equity >= 18 || goal > 400_000) bump('MaxReturn', 1);
  if (equity >= 12 && equity < 18) bump('GrowthUpside', 1);
  if (equity <= 10) bump('BalancedBlend', 1);

  // --- Defaults when ambiguous ---
  if (Object.values(scores).every((v) => v === 0)) {
    // No clear signals → conservative bias
    bump('SteadyIncome', 1);
    bump('BalancedBlend', 1);
  }

  // Winner & confidence
  const winner = (Object.keys(scores) as InvestorType[]).reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  const sorted = Object.values(scores).sort((a, b) => b - a);
  const top = sorted[0] || 0;
  const runner = sorted[1] || 0;
  const confidence = Math.max(0.2, Math.min(1, (top - runner + top) / (top + (runner || 1))));

  const REASONS: Record<InvestorType, string> = {
    MaxReturn: 'Aims for the highest total gain.',
    GrowthUpside: 'Targets equity growth via improvements or added units.',
    SteadyIncome: 'Prioritizes reliable cash yield from stabilized operations.',
    BalancedBlend: 'Some yield today with measured upside later.',
    QuickFlip: 'Short duration; renovate and resell.',
    CommunityImpact: 'Resident-first outcomes (e.g., buy-back preservation).',
  };

  return {
    type: winner,
    label: INVESTOR_LABELS[winner],
    reason: REASONS[winner],
    confidence,
  };
}
