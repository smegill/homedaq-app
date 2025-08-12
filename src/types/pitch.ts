// Central types for pitch data used across the app

export type PitchStatus = 'draft' | 'submitted' | 'funding' | 'funded' | 'archived';

export interface PitchInput {
  // Core
  title: string;
  summary: string;

  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;

  valuation: number;            // current estimated value (USD)
  amountSeeking: number;        // raise target (USD)
  minInvestment: number;        // minimum investment (USD)

  // Media
  photos?: string[];            // data URLs for now
  heroImageUrl?: string;

  // Contact
  residentName: string;
  residentEmail: string;

  // Status
  status: PitchStatus;

  // New: resident-controlled “offer knobs”
  offeredEquityPct?: number;          // % of LLC offered to investors
  monthlyDividendPct?: number;        // % per month of invested capital (e.g., 0.8)
  expectedAppreciationPct?: number;   // % per year
  storyStrength?: number;             // 1–5 (self-assessed)
  horizonYears?: number;              // illustrative horizon for scenarios
}

export interface Pitch extends PitchInput {
  id: string;
  createdAt: number;   // epoch ms
  updatedAt: number;   // epoch ms
}
