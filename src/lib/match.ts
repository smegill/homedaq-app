import type { InvestorPreferences } from '@/types/investor';
import type { Pitch, RiskProfile } from '@/types/pitch';

export interface MatchBreakdownItem {
  label: string;
  score: number; // 0..weight
  weight: number;
  detail?: string;
}
export interface MatchResult {
  total: number; // 0..100
  parts: MatchBreakdownItem[];
}

function inRange(value: number | undefined, min?: number, max?: number): boolean {
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function weightScore(ok: boolean, weight: number): number {
  return ok ? weight : 0;
}

function regionalZipMatch(a?: string, b?: string): 'exact' | 'region' | 'none' {
  if (!a || !b) return 'none';
  if (a === b) return 'exact';
  if (a.length >= 3 && b.length >= 3 && a.slice(0, 3) === b.slice(0, 3)) return 'region';
  return 'none';
}

function riskOk(pitch: RiskProfile | undefined, prefs: RiskProfile[] | undefined): boolean {
  if (!prefs || prefs.length === 0) return true; // neutral if not set
  if (!pitch) return false;
  return prefs.includes(pitch);
}

function keywordHits(texts: Array<string | undefined>, keywords: string[] | undefined): number {
  if (!keywords || keywords.length === 0) return 0;
  const blob = texts.filter(Boolean).join(' ').toLowerCase();
  let hits = 0;
  for (const k of keywords) {
    if (k && blob.includes(k.toLowerCase())) hits++;
  }
  return hits;
}

/**
 * Compute a 0–100 score with a transparent breakdown.
 * Weights sum to 100.
 */
export function computeMatch(pitch: Pitch, prefs: InvestorPreferences): MatchResult {
  const parts: MatchBreakdownItem[] = [];

  // 1) ZIP preference (25)
  const zipRel = regionalZipMatch(pitch.postalCode, prefs.zip);
  const zipScore = zipRel === 'exact' ? 25 : zipRel === 'region' ? 12 : 0;
  parts.push({
    label: 'Location fit',
    score: zipScore,
    weight: 25,
    detail: zipRel === 'exact' ? 'Exact ZIP match' : zipRel === 'region' ? 'Same 3-digit region' : 'No ZIP preference match',
  });

  // 2) Valuation range (20)
  const valOK = inRange(pitch.valuation, prefs.minValuation, prefs.maxValuation);
  parts.push({
    label: 'Valuation range',
    score: weightScore(valOK, 20),
    weight: 20,
    detail: pitch.valuation != null ? `Pitch valuation: ${pitch.valuation}` : 'No valuation',
  });

  // 3) Min investment cap (20) — investor wants pitch.minInvestment <= max
  let minInvOK = true;
  if (prefs.maxMinInvestment != null) {
    minInvOK = (pitch.minInvestment ?? Number.POSITIVE_INFINITY) <= prefs.maxMinInvestment;
  }
  parts.push({
    label: 'Minimum investment',
    score: weightScore(minInvOK, 20),
    weight: 20,
    detail:
      pitch.minInvestment != null
        ? `Pitch minimum: ${pitch.minInvestment} (your max: ${prefs.maxMinInvestment ?? '—'})`
        : 'No min investment specified',
  });

  // 4) Equity offered range (15)
  const eqOK = inRange(pitch.equityPct, prefs.minEquityPct, prefs.maxEquityPct);
  parts.push({
    label: 'Equity offered',
    score: weightScore(eqOK, 15),
    weight: 15,
    detail: pitch.equityPct != null ? `Pitch equity: ${pitch.equityPct}%` : 'No equity % specified',
  });

  // 5) Risk profile (15)
  const riskOKFlag = riskOk(pitch.riskProfile, prefs.riskProfiles);
  parts.push({
    label: 'Risk appetite',
    score: weightScore(riskOKFlag, 15),
    weight: 15,
    detail: pitch.riskProfile ?? 'No risk profile',
  });

  // 6) Strategy keywords — up to +5 (light boost)
  const hits = keywordHits(
    [pitch.strategyTags?.join(' '), pitch.plan, pitch.improvements, pitch.summary],
    prefs.strategyKeywords
  );
  const kwScore = Math.min(5, hits * 2.5); // 2 keywords = full 5
  parts.push({
    label: 'Strategy keywords',
    score: kwScore,
    weight: 5,
    detail: hits > 0 ? `${hits} keyword match(es)` : 'No keyword matches',
  });

  const total = Math.max(0, Math.min(100, Math.round(parts.reduce((s, p) => s + p.score, 0))));
  return { total, parts };
}
