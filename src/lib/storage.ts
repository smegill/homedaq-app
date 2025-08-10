export type Pitch = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  estimatedValue: string;
  equityPercent: string;
  zillowLink: string;
  photos: string[];
  personalStory: string;
  goals: string;
  buybackPlan: string;
};

const STORAGE_KEY = "homedaq_pitches";

export function getPitches(): Pitch[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePitch(pitch: Pitch) {
  const pitches = getPitches();
  const existingIndex = pitches.findIndex((p) => p.id === pitch.id);

  if (existingIndex !== -1) {
    pitches[existingIndex] = pitch;
  } else {
    pitches.push(pitch);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pitches));
}

export function deletePitch(id: string) {
  const pitches = getPitches().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pitches));
}
