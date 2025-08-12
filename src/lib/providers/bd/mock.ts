import type { BDBridge, CreateOfferingInput, CreateOfferingResult } from "./types";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const mockBD: BDBridge = {
  async createOffering(input: CreateOfferingInput): Promise<CreateOfferingResult> {
    // Fake an ID/URL that looks like a partner room
    const id = `off_${Math.random().toString(36).slice(2, 10)}`;
    const slug = slugify(input.title || "homedaq-offering");
    // Swap this base domain with your partner BD later
    const url = `https://example-bd.com/offerings/${slug}?id=${id}`;
    return { offeringId: id, offeringUrl: url, status: "published" };
  },
};
