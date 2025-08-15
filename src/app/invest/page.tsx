import type { Pitch } from '@/types/pitch';

export type InvestorFit = {
  label: string;
  reason?: string;
};

export type MatchResult = {
  score: number;           // 0–100
  total: number;           // legacy alias of score (for /invest)
  breakdown: string[];     // human-readable reasons
  fit: InvestorFit | null; // category + narrative
};

// ---------- Safe getters ----------
function num(o: Record<string, unknown>, k: string): number | undefined {
  const v = o[k];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function str(o: Record<string, unknown>, k: string): string {
  const v = o[k];
  return typeof v === 'string' ? v : '';
}
function strArr(o: Record<string, unknown>, k: string): string[] {
  const v = o[k];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  const s = str(o, k);
  return s ? s.split(',').map((t) => t.trim()) : [];
}
function pct(n?: number, d?: number): number | undefined {
  if (d == null || d <= 0) return undefined;
  const p = Math.floor(((n ?? 0) / d) * 100);
  return Math.min(100, Math.max(0, p));
}

// ---------- Heuristic helpers ----------
const KEYWORDS_IMPACT = [
  'medical',
  'hospital',
  'cancer',
  'veteran',
  'single mom',
  'disability',
  'fire',
  'flood',
  'eviction',
  'foreclosure',
  'job loss',
  'teacher',
  'nurse',
  'community',
];

function looksLikeImpact(o: Record<string, unknown>): boolean {
  const story = [str(o, 'residentStory'), str(o, 'summary')].join(' ').toLowerCase();
  if (story.length > 240) return true;
  return KEYWORDS_IMPACT.some((k) => story.includes(k));
}

function looksLikeFlip(o: Record<string, unknown>, tags: string[]): boolean {
  const tagHit = tags.some((t) =>
    ['flip', 'quick flip', 'flip catalyst', 'renovation', 'rehab'].includes(t.toLowerCase()),
  );
  const improvements = str(o, 'improvements').toLowerCase();
  const timeline = str(o, 'timeline').toLowerCase();
  const timeHit = /\b(weeks?|months?|90|120)\b/.test(timeline);
  const renoHit = /(reno|rehab|remodel|update|fix)/.test(improvements);
  return tagHit || (renoHit && timeHit);
}

function looksLikeBuyBack(o: Record<string, unknown>, tags: string[]): boolean {
  const tagHit = tags.some((t) => /buy[-\s]?back/i.test(t));
  const exit = str(o, 'exitStrategy').toLowerCase();
  return tagHit || /buy[-\s]?back|resident buyback|share repurchase/.test(exit);
}

// ---------- Public: computeInvestorFit ----------
export function computeInvestorFit(
  pitch: Partial<Pitch> | (Partial<Pitch> & Record<string, unknown>),
): InvestorFit | null {
  const o = (pitch ?? {}) as Record<string, unknown>;

  // Canonical first, legacy fallback
  const minInvestment = num(o, 'minInvestment') ?? num(o, 'minimumInvestment');
  const equityPct = num(o, 'equityPct') ?? num(o, 'equityOfferedPct');
  const targetYieldPct = num(o, 'targetYieldPct');
  const expectedAppreciationPct = num(o, 'expectedAppreciationPct');
  const fundingGoal = num(o, 'fundingGoal');
  const fundingCommitted = num(o, 'fundingCommitted');
  const fundedPct = pct(fundingCommitted, fundingGoal);

  const tags = strArr(o, 'strategyTags').map((t) => t.toLowerCase());

  if (looksLikeFlip(o, tags)) {
    return {
      label: 'Flip Catalyst',
      reason:
        'Short timeline and renovation focus — likely to attract event-driven investors seeking quick turnarounds.',
    };
  }
  if (looksLikeBuyBack(o, tags)) {
    return {
      label: 'Resident Buy-Back',
      reason:
        'Exit centered on resident share repurchase — aligns with investors who value long-term owner outcomes.',
    };
  }
  if (looksLikeImpact(o)) {
    return {
      label: 'Impact Ally',
      reason:
        'Strong personal/community story — ideal for mission-aligned capital prioritizing outcomes over max yield.',
    };
  }

  const y = targetYieldPct ?? 0;
  const a = expectedAppreciationPct ?? 0;

  const incomeScore = y * 1.2 + (minInvestment != null && minInvestment <= 5000 ? 1 : 0);
  const growthScore = a * 1.2 + (equityPct ?? 0) * 0.2;
  const balancedScore = (y + a) / 2 + (equityPct ?? 0) * 0.1;
  const momentum = fundedPct != null && fundedPct >= 50 ? 0.8 : 0;

  const best = [
    { key: 'income', score: incomeScore + momentum },
    { key: 'growth', score: growthScore + momentum },
    { key: 'balanced', score: balancedScore + momentum * 0.5 },
  ].sort((a, b) => b.score - a.score)[0]?.key;

  if (best === 'income') {
    return {
      label: 'Income Seeker',
      reason: `Emphasis on steady yield${y ? ` (~${y}% target)` : ''}${
        minInvestment ? ` with approachable minimum (${minInvestment.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })})` : ''
      }.`,
    };
  }
  if (best === 'growth') {
    return {
      label: 'Growth Hunter',
      reason: `Higher upside profile${a ? ` (~${a}% appreciation target)` : ''}${
        equityPct ? ` with ~${equityPct}% equity offered` : ''
      }.`,
    };
  }
  return {
    label: 'Balanced Return',
    reason: `Mix of income${y ? ` (~${y}% yield)` : ''} and upside${a ? ` (~${a}% appreciation)` : ''} with pragmatic terms.`,
  };
}

// ---------- Public: computeMatch (used by /invest) ----------
export function computeMatch(
  pitch: Partial<Pitch> | (Partial<Pitch> & Record<string, unknown>),
  _prefs?: Record<string, unknown>, // reserved for future prefs
): MatchResult {
  const o = (pitch ?? {}) as Record<string, unknown>;
  const fit = computeInvestorFit(o);

  // Signals
  const fundingGoal = num(o, 'fundingGoal');
  const fundingCommitted = num(o, 'fundingCommitted');
  const fundedPct = pct(fundingCommitted, fundingGoal) ?? 0;

  const minInvestment = num(o, 'minInvestment') ?? num(o, 'minimumInvestment') ?? 0;
  const equityPct = num(o, 'equityPct') ?? num(o, 'equityOfferedPct') ?? 0;

  let score = 50;
  const breakdown: string[] = [];

  // Momentum
  score += Math.min(25, Math.floor(fundedPct / 2));
  if (fundedPct > 0) breakdown.push(`Momentum: ${fundedPct}% funded`);

  // Accessibility
  if (minInvestment > 0) {
    const bump = minInvestment <= 2500 ? 15 : minInvestment <= 5000 ? 8 : minInvestment <= 10000 ? 3 : 0;
    score += bump;
    breakdown.push(
      `Minimum investment ${minInvestment.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })} (+${bump})`,
    );
  }

  // Upside
  if (equityPct > 0) {
    const bump = Math.min(10, Math.round(equityPct / 5));
    score += bump;
    breakdown.push(`Equity offered ~${equityPct}% (+${bump})`);
  }

  // Fit nudge
  if (fit) {
    const map: Record<string, number> = {
      'Growth Hunter': 8,
      'Income Seeker': 8,
      'Balanced Return': 5,
      'Flip Catalyst': 10,
      'Resident Buy-Back': 6,
      'Impact Ally': 4,
    };
    const bump = map[fit.label] ?? 0;
    if (bump) {
      score += bump;
      breakdown.push(`Profile "${fit.label}" (+${bump})`);
    }
  }

  score = Math.max(0, Math.min(100, score));

  return { score, total: score, breakdown, fit };
}

export default computeInvestorFit;
