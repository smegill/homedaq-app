import type { RiskProfile } from './pitch';

export interface InvestorPreferences {
  zip?: string;                    // preferred ZIP (exact or regional)
  minValuation?: number;
  maxValuation?: number;
  maxMinInvestment?: number;
  minEquityPct?: number;
  maxEquityPct?: number;
  riskProfiles?: RiskProfile[];    // acceptable fits
  strategyKeywords?: string[];     // e.g. ["STR", "Light Reno", "BRRRR"]
}

export const DEFAULT_PREFERENCES: InvestorPreferences = {
  riskProfiles: [],
  strategyKeywords: [],
};
