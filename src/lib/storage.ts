'use client';

import { Pitch, PitchId, PitchInput } from '@/types/pitch';
export type { Pitch, PitchId, PitchInput };

// LocalStorage key
const KEY = 'homedaq:pitches:v1';

// In-memory cache
let cache: Pitch[] | null = null;

// Seed example so first run has something to render
const SAMPLE: Pitch[] = [
  {
    id: 'seed-001',
    title: 'Sunny Bungalow on Maple',
    summary: '2-bed starter home near city park. Light renovation, strong rental comps.',
    address1: '123 Maple St',
    city: 'Wilmington',
    state: 'DE',
    postalCode: '19801',
    amountSeeking: 85000,
    valuation: 275000,
    minInvestment: 500,
    residentName: 'Alex Johnson',
    residentEmail: 'alex@example.com',
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function read(): Pitch[] {
  if (!isBrowser()) return cache ?? [];
  if (cache) return cache;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(SAMPLE));
    cache = SAMPLE.slice();
    return cache;
  }
  try {
    const parsed = JSON.parse(raw) as Pitch[];
    cache = Array.isArray(parsed) ? parsed : [];
    return cache;
  } catch {
    cache = [];
    return cache;
  }
}

function write(pitches: Pitch[]) {
  cache = pitches.slice();
  if (isBrowser()) {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
    // Notify any listeners (and other tabs)
    window.dispatchEvent(new CustomEvent('homedaq:pitches:changed'));
  }
}

function uid(): PitchId {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function listPitches(): Pitch[] {
  return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// Back-compat alias for pages that import { getPitches }
export function getPitches(): Pitch[] {
  return listPitches();
}

export function getPitch(id: PitchId): Pitch | undefined {
  return read().find((p) => p.id === id);
}

export function createPitch(input: PitchInput): Pitch {
  const now = new Date().toISOString();
  const pitch: Pitch = {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  const next = [pitch, ...read()];
  write(next);
  return pitch;
}

// Back-compat alias for pages that import { savePitch }
export function savePitch(input: PitchInput): Pitch {
  return createPitch(input);
}

export function updatePitch(id: PitchId, partial: Partial<PitchInput>): Pitch | undefined {
  const now = new Date().toISOString();
  const next = read().map((p) =>
    p.id === id ? { ...p, ...partial, updatedAt: now } : p
  );
  write(next);
  return next.find((p) => p.id === id);
}

export function deletePitch(id: PitchId): void {
  const next = read().filter((p) => p.id !== id);
  write(next);
}

// Subscribe to changes across tabs or programmatic writes
export function subscribe(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const localHandler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener('homedaq:pitches:changed', localHandler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener('homedaq:pitches:changed', localHandler);
    window.removeEventListener('storage', storageHandler);
  };
}
