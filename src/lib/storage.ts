// src/lib/storage.ts
// Lightweight client-side persistence for pitches with a simple pub/sub.
//
// Notes
// - Works during SSR by keeping an in-memory mirror. LocalStorage is used in the browser.
// - No `any` usage; we cast through `unknown` when we must bridge types.
// - `subscribe` returns a React-safe cleanup: () => void (NOT a boolean).

import type { Pitch, PitchInput } from '@/types/pitch';

const STORAGE_KEY = 'homedaq:pitches:v1';

// In-memory mirror for non-browser environments (SSR / build)
let memory: Pitch[] = [];

// --- utilities ----------------------------------------------------------------

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown as T;
  } catch {
    return null;
  }
}

function read(): Pitch[] {
  if (typeof window === 'undefined') {
    return memory;
  }
  const parsed = safeParse<Pitch[]>(window.localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function write(next: Pitch[]): void {
  if (typeof window === 'undefined') {
    memory = [...next];
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  // notify
  for (const fn of listeners) {
    try {
      fn(next);
    } catch {
      // no-op: listeners must be resilient
    }
  }
}

function ensureId(): string {
  // crypto.randomUUID when available; fallback to timestamp + random
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try {
      // @ts-expect-error: runtime feature detection
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- public API ----------------------------------------------------------------

/** Get all pitches (snapshot, not reactive) */
export function getPitches(): Pitch[] {
  return read();
}

/** Back-compat alias some components still import */
export const listPitches = getPitches;

/** Find a single pitch by id */
export function getPitchById(id: string): Pitch | undefined {
  return read().find((p) => p.id === id);
}

/** Back-compat alias (some pages still import `getPitch`) */
export const getPitch = getPitchById;

/**
 * Create a new pitch.
 * Accepts `PitchInput` (what your forms collect) and fills ids/timestamps.
 * We cast through `unknown` to avoid leaking `any` while letting the stored
 * object remain strongly typed as `Pitch` for consumers.
 */
export function savePitch(input: PitchInput): Pitch {
  const now = Date.now();

  // Build the new record by layering system fields over user input.
  // We don't assume which optional fields exist in your Pitch type here;
  // instead we cast through `unknown` at the boundary.
  const newPitch = {
    ...(input as unknown as Record<string, unknown>),
    id: ensureId(),
    createdAt: now,
    updatedAt: now,
  } as unknown as Pitch;

  const all = read();
  write([newPitch, ...all]);
  return newPitch;
}

/** Update an existing pitch by id with a partial set of fields */
export function updatePitch(id: string, changes: Partial<Pitch>): Pitch | undefined {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;

  const updated = {
    ...(all[idx] as unknown as Record<string, unknown>),
    ...(changes as unknown as Record<string, unknown>),
    updatedAt: Date.now(),
  } as unknown as Pitch;

  const next = [...all];
  next[idx] = updated;
  write(next);
  return updated;
}

/** Remove a pitch by id */
export function deletePitch(id: string): boolean {
  const before = read();
  const next = before.filter((p) => p.id !== id);
  const changed = next.length !== before.length;
  if (changed) write(next);
  return changed;
}

// --- subscriptions -------------------------------------------------------------

type Listener = (pitches: Pitch[]) => void;
const listeners = new Set<Listener>();

/**
 * Subscribe to changes to the pitches collection.
 * Returns a cleanup function suitable for React's useEffect (`() => void`).
 */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  // fire once with the current snapshot so UI can sync immediately
  try {
    fn(read());
  } catch {
    // ignore listener errors
  }

  // IMPORTANT: return a void cleanup (NOT the boolean from Set.delete)
  return () => {
    listeners.delete(fn);
  };
}
