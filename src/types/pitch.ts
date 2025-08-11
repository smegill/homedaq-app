export type PitchId = string;

export type PitchStatus = 'draft' | 'submitted' | 'listed';

export interface Pitch {
  id: PitchId;
  // Display
  title: string;
  summary: string;

  // Property
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;

  // Offer
  amountSeeking: number;      // total amount to raise, in USD
  valuation: number;          // pre- or implied property valuation, in USD
  minInvestment: number;      // minimum ticket size, in USD

  // Media (optional for now)
  heroImageUrl?: string;

  // Owner
  residentName: string;
  residentEmail: string;

  status: PitchStatus;

  // Timestamps
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// For create/edit forms; id and timestamps are injected by storage
export type PitchInput = Omit<Pitch, 'id' | 'createdAt' | 'updatedAt'>;
