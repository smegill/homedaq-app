/** Align investor types with the new persona model. */

import type { InvestorPersona } from '@/lib/investorFit';

// Back-compat aliases (old code may import these)
export type RiskProfile = InvestorPersona;
export type InvestorType = InvestorPersona;

export interface InvestorPreferences {
  zip?: string;
  minInvestment?: number;
  persona?: InvestorPersona | null;
  personas?: InvestorPersona[];
  tags?: string[];
}
