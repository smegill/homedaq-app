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
  amountSeeking: number;      // total amount to raise, USD
  valuation: number;          // implied property valuation, USD
  minInvestment: number;      // minimum ticket size, USD

  // Media
  heroImageUrl?: string;      // primary image for cards
  photos?: string[];          // optional gallery (data URLs for prototype)

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
