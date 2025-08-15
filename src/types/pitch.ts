// src/types/pitch.ts

export type PitchStatus = 'draft' | 'review' | 'live' | 'funded' | 'closed';

/** Personas used across the app for labels & matching. */
export type InvestorPersona =
  | 'Growth First'
  | 'Income First'
  | 'Balanced Blend'
  | 'Community Backer'
  | 'Steady Shelter'
  | 'Value-Add / Flip';

/**
 * Unified Pitch type: supports existing listing card fields + new wizard (narrative/economics).
 * Many properties are optional so legacy data still validates.
 */
export interface Pitch {
  // Identity
  id: string;
  title: string;

  // Location (legacy + new)
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;          // legacy
  postalCode?: string;   // new

  // Media / links
  heroImageUrl?: string;
  gallery?: string[];
  offeringUrl?: string;

  // Economics (legacy + new)
  price?: number;                       // legacy
  valuation?: number | null;            // new
  referenceValuation?: number | null;   // baseline for appreciation
  minimumInvestment?: number;           // canonical legacy
  minInvestment?: number;               // alias accepted by form
  equityOfferedPct?: number | null;
  expectedAppreciationPct?: number | null;
  appreciationSharePct?: number | null; // investor share of appreciation
  targetYieldPct?: number | null;

  // Holding / options (new)
  horizonYears?: number | null;         // expected hold
  buybackAllowed?: boolean;             // resident buy-back feature

  // Funding progress (new)
  fundingGoal?: number | null;
  fundingCommitted?: number | null;

  // Narrative (new)
  summary?: string;
  problem?: string;
  solution?: string;
  plan?: string;
  useOfFunds?: string;
  exitStrategy?: string;
  improvements?: string;
  timeline?: string;
  residentStory?: string;

  // Tagging / fit
  riskProfile?: 'Balanced' | 'Yield' | 'Growth'; // legacy chip
  strategyTags?: string[];
  investorPersonas?: InvestorPersona[];

  // Lifecycle
  status: PitchStatus;
  createdAt: number;
  updatedAt: number;
}

/** Input shape used by savePitch; still based on the canonical Pitch fields. */
export type PitchInput = Partial<Pitch>;
