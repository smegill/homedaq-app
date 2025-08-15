'use client';

import type { Pitch } from '@/types/pitch';
import type { InvestorPrefs } from '@/lib/prefs';
import { computeInvestorFit, type InvestorType } from '@/lib/investorFit';

export type MatchPart = { label: string; weight: number; score: number; detail?: string };
export type MatchResult = { total: number; parts: MatchPart[] };

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
function pct(n: number) { return Math.round(n * 100); }

// Similarity between a selected investor type and a pitch's computed type.
function typeSimilarity(sel: InvestorType, fit: InvestorType): number {
  if (sel === fit) return 1;

  // Symmetric soft matches
  const softPairs: Array<[InvestorType, InvestorType, number]> = [
    ['BalancedBlend', 'SteadyIncome', 0.75],
    ['BalancedBlend', 'GrowthUpside', 0.75],
    ['SteadyIncome', 'BalancedBlend', 0.75],
    ['GrowthUpside', 'BalancedBlend', 0.75],

    ['MaxReturn', 'GrowthUpside', 0.7],
    ['GrowthUpside', 'MaxReturn', 0.7],
    ['MaxReturn', 'QuickFlip', 0.6],
    ['QuickFlip', 'MaxReturn', 0.6],

    ['SteadyIncome', 'CommunityImpact', 0.6],
    ['CommunityImpact', 'SteadyIncome', 0.6],

    ['GrowthUpside', 'SteadyIncome', 0.4],
    ['SteadyIncome', 'GrowthUpside', 0.4],

    ['QuickFlip', 'GrowthUpside', 0.3],
    ['GrowthUpside', 'QuickFlip', 0.3],

    ['BalancedBlend', 'CommunityImpact', 0.5],
    ['CommunityImpact', 'BalancedBlend', 0.5],
  ];

  for (const [a, b, s] of softPairs) {
    if (sel === a && fit === b) return s;
  }
  // distant combos get a light baseline so nothing is "zeroed out" entirely
  return 0.2;
}

export function computeMatch(p: Pitch, prefs: InvestorPrefs): MatchResult {
  const parts: MatchPart[] = [];

  // 1) Investor Fit alignment (40%)
  const fit = computeInvestorFit(p);
  let fitScore = 0.5;
  let fitDetail = fit.label;
  const selected = prefs.investorTypes ?? [];
  if (selected.length > 0) {
    // use the best similarity across selected types
    fitScore = Math.max(...selected.map((t) => typeSimilarity(t, fit.type)));
    fitDetail = `${fit.label}${fitScore < 1 ? ' (partial overlap)' : ''}`;
  }
  parts.push({ label: 'Investor Type Fit', weight: 0.4, score: fitScore, detail: fitDetail });

  // 2) Budget alignment (20%) — minInvestment ≤ user ceiling
  let budgetScore = 1;
  if (prefs.minInvestment != null && p.minInvestment != null) {
    budgetScore = p.minInvestment <= prefs.minInvestment ? 1 : clamp01(1 - (p.minInvestment - prefs.minInvestment) / Math.max(1, prefs.minInvestment));
  }
  parts.push({ label: 'Min investment', weight: 0.2, score: budgetScore, detail: p.minInvestment != null ? `$${p.minInvestment.toLocaleString()}` : '—' });

  // 3) ZIP preference (20%)
  let zipScore = 1;
  if (prefs.zip) zipScore = p.postalCode && p.postalCode === prefs.zip ? 1 : 0.25;
  parts.push({ label: 'ZIP preference', weight: 0.2, score: zipScore, detail: p.postalCode ?? '—' });

  // 4) Available capacity (20%) — penalize fully funded
  const goal = p.fundingGoal ?? 0;
  const committed = p.fundingCommitted ?? 0;
  let capScore = 1;
  if (goal > 0) capScore = committed >= goal ? 0 : clamp01(1 - (committed / goal) * 0.6);
  parts.push({
    label: 'Available capacity',
    weight: 0.2,
    score: capScore,
    detail: goal > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      .format(Math.max(0, goal - committed)) + ' left' : '—',
  });

  const total = pct(parts.reduce((acc, p) => acc + p.score * p.weight, 0));
  return { total, parts };
}
