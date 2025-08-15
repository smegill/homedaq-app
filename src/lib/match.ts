import type { Pitch } from '@/types/pitch';

export type MatchBreakdown = {
  economics: number; // 0..1
  market: number;    // 0..1
  story: number;     // 0..1
  structure: number; // 0..1
};

export type MatchResult = {
  score: number;              // 0..100
  breakdown: MatchBreakdown;  // components
  tags: string[];
};

export function computeMatch(p: Pitch): MatchResult {
  const rv = num(p.referenceValuation);
  const goal = num(p.fundingGoal);
  const share = pct(p.appreciationSharePct);
  const horizon = Math.max(0, Math.min(15, Math.round(num(p.horizonYears))));
  const buyback = !!p.buybackAllowed;

  // Raise cushion vs reference valuation (lower raise => better cushion)
  const cushion = rv && goal ? clamp01(1 - clamp01(goal / rv)) : 0.5;

  // Economics weight SEA fields primarily
  const econ =
    0.48 * scale(share, 0.05, 0.25) +   // 5%..25% AppShare
    0.32 * scale(horizon || 5, 2, 10) + // 2..10 years
    0.20 * cushion;

  // Simple market proxy: presence of location data
  const market = p.zip || (p.city && p.state) ? 0.6 : 0.5;

  // “Story” without using `any`: presence of public-facing signals
  const storySignals = [
    !!p.title && p.title.trim().length > 8,
    !!p.heroImageUrl,
    Array.isArray(p.gallery) && p.gallery.length > 0,
    !!p.offeringUrl,
  ];
  const story = presence(storySignals);

  // Structure: buyback + clarity of min ticket
  const structure =
    0.6 * (buyback ? 1 : 0.5) +
    0.4 * (p.minimumInvestment ? 1 : 0.6);

  const breakdown: MatchBreakdown = {
    economics: clamp01(econ),
    market: clamp01(market),
    story: clamp01(story),
    structure: clamp01(structure),
  };

  const score = Math.round(
    100 *
      (0.5 * breakdown.economics +
       0.25 * breakdown.market +
       0.15 * breakdown.story +
       0.10 * breakdown.structure)
  );

  const tags = [
    share ? `${Math.round(share * 100)}% AppShare` : 'SEA structure',
    horizon ? `${horizon}y horizon` : 'Flexible horizon',
    buyback ? 'Resident buyback' : 'Investor-held until exit',
    cushion >= 0.5 ? 'Cushion in raise vs RV' : 'Tight raise vs RV',
  ];

  return { score, breakdown, tags };
}

// ---------- helpers ----------
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const num = (n?: number | null) => (typeof n === 'number' ? n : 0);
const pct = (n?: number | null) =>
  typeof n === 'number' ? clamp01(n / 100) : 0;

function scale(v: number, lo: number, hi: number) {
  if (hi === lo) return 0.5;
  return clamp01((v - lo) / (hi - lo));
}
function presence(flags: boolean[]) {
  const count = flags.filter(Boolean).length;
  return clamp01(count / Math.max(1, flags.length));
}
