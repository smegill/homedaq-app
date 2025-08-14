export type PitchStatus = 'draft' | 'review' | 'live' | 'funded' | 'closed' | 'archived';
export type RiskProfile = 'Balanced' | 'Yield' | 'Growth';

export interface Pitch {
  id: string;
  title: string;

  // Location
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;

  // Core economics
  valuation?: number;       // asking/target valuation for the property/LLC
  minInvestment?: number;   // minimum a single investor can put in
  equityPct?: number;       // equity offered to outside investors (0–100)

  // Presentation
  summary?: string;
  heroImageUrl?: string;
  gallery?: string[];

  // External raise link (outbound)
  offeringUrl?: string;

  // Marketplace state
  status: PitchStatus;

  // Founder-style narrative
  problem?: string;
  solution?: string;
  plan?: string;
  useOfFunds?: string;
  exitStrategy?: string;
  improvements?: string;
  timeline?: string;
  residentStory?: string;
  strategyTags?: string[];

  // Small “Investor Fit” chip
  riskProfile?: RiskProfile;

  createdAt: number;
  updatedAt: number;
}

export type PitchInput = Partial<Pitch>;
