export type OfferingStatus = "draft" | "published" | "closed" | "canceled";

export type CreateOfferingInput = {
  title: string;
  city?: string;
  state?: string;
  postalCode?: string;
  amountSeeking: number;
  minInvestment: number;
  equityPct?: number;
};

export type CreateOfferingResult = {
  offeringId: string;
  offeringUrl: string;   // Deep link to BD checkout/room
  status: OfferingStatus;
};

export interface BDBridge {
  createOffering(input: CreateOfferingInput): Promise<CreateOfferingResult>;
  // Later: updateOffering, getStatus, webhooks, etc.
}
