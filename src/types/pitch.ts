export type PitchStatus = 'draft' | 'submitted' | 'funding' | 'funded' | 'archived';

export type Pitch = {
  id: string;

  // basics
  title: string;
  summary: string;

  // address
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;

  // economics
  valuation: number;
  amountSeeking: number;
  minInvestment: number;
  equityPct?: number;                 // % of LLC offered
  dividendPct?: number;               // monthly dividend % (0–100)
  expectedAppreciationPct?: number;   // annual expected appreciation % (not a promise)

  // media
  heroImageUrl?: string;
  photos?: string[];

  // contact
  residentName?: string;
  residentEmail?: string;

  status: PitchStatus;
  createdAt: number;   // epoch ms
  updatedAt: number;   // epoch ms
};

export type PitchInput =
  Omit<Pitch, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: PitchStatus };
