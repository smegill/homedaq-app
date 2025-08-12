// Lightweight localStorage “backend” for pitches.
// Safe to import in client components only.

export type { Pitch, PitchInput, PitchStatus } from '@/types/pitch';
import type { Pitch, PitchInput } from '@/types/pitch';

const STORAGE_KEY = 'homedaq:pitches';

function readAll(): Pitch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Pitch[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(pitches: Pitch[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pitches));
  // Notify any listeners (and other tabs)
  window.dispatchEvent(
    new CustomEvent('homedaq:pitches:changed', { detail: { count: pitches.length } })
  );
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Create a new pitch */
export function savePitch(input: PitchInput): Pitch {
  const now = Date.now();
  const pitch: Pitch = {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  const all = readAll();
  all.unshift(pitch);
  writeAll(all);
  return pitch;
}

/** Update an existing pitch by id */
export function updatePitch(id: string, patch: Partial<PitchInput>): Pitch | null {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next: Pitch = { ...all[idx], ...patch, updatedAt: Date.now() };
  all[idx] = next;
  writeAll(all);
  return next;
}

/** Delete a pitch by id */
export function deletePitch(id: string): boolean {
  const all = readAll();
  const next = all.filter((p) => p.id !== id);
  writeAll(next);
  return next.length !== all.length;
}

/** Get a single pitch */
export function getPitch(id: string): Pitch | null {
  const all = readAll();
  return all.find((p) => p.id === id) ?? null;
}

/** Get all pitches (most recent first) */
export function getPitches(): Pitch[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}
