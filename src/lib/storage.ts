// src/lib/storage.ts
'use client';

import { Pitch, PitchInput } from '@/types/pitch';

const STORAGE_KEY = 'homedaq:pitches';

type Listener = (rows: Pitch[]) => void;
const listeners = new Set<Listener>();

function read(): Pitch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Pitch[]) : [];
  } catch {
    return [];
  }
}
function write(rows: Pitch[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  for (const fn of listeners) fn(rows);
}

let cache: Pitch[] = read();

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function getPitches(): Promise<Pitch[]> {
  return cache.slice();
}
export async function getPitchById(id: string): Promise<Pitch | null> {
  return cache.find((p) => p.id === id) ?? null;
}

export async function savePitch(partial: PitchInput, id?: string): Promise<Pitch> {
  const now = Date.now();

  // Normalize common synonyms from forms
  const normalized: PitchInput = {
    ...partial,
    postalCode: partial.postalCode ?? partial.zip,
    zip: partial.zip ?? partial.postalCode,
    minimumInvestment: partial.minimumInvestment ?? partial.minInvestment,
    valuation: partial.valuation ?? partial.price ?? null,
  };

  if (id) {
    const idx = cache.findIndex((p) => p.id === id);
    if (idx === -1) {
      const created = materializePitch({ ...normalized, id }, now);
      cache = [created, ...cache];
      write(cache);
      return created;
    }
    const merged = materializePitch(
      { ...cache[idx], ...normalized, id },
      now,
      cache[idx].createdAt
    );
    cache[idx] = merged;
    write(cache);
    return merged;
  }

  const newId = cryptoId();
  const created = materializePitch({ ...normalized, id: newId }, now);
  cache = [created, ...cache];
  write(cache);
  return created;
}

function materializePitch(input: PitchInput, updatedAt: number, createdAt?: number): Pitch {
  const p: Pitch = {
    id: String(input.id ?? cryptoId()),
    title: String(input.title ?? 'Untitled Pitch'),

    // Location
    address1: input.address1,
    address2: input.address2,
    city: input.city,
    state: input.state,
    zip: input.zip,
    postalCode: input.postalCode,

    // Media
    heroImageUrl: input.heroImageUrl,
    gallery: input.gallery ?? [],
    offeringUrl: input.offeringUrl,

    // Economics
    price: input.price,
    valuation: input.valuation ?? null,
    referenceValuation: input.referenceValuation ?? null,
    minimumInvestment: input.minimumInvestment,
    minInvestment: input.minInvestment,
    equityOfferedPct: input.equityOfferedPct ?? null,
    expectedAppreciationPct: input.expectedAppreciationPct ?? null,
    appreciationSharePct: input.appreciationSharePct ?? null,
    targetYieldPct: input.targetYieldPct ?? null,

    // Holding / options
    horizonYears: input.horizonYears ?? null,
    buybackAllowed: input.buybackAllowed ?? false,

    // Funding
    fundingGoal: input.fundingGoal ?? null,
    fundingCommitted: input.fundingCommitted ?? null,

    // Narrative
    summary: input.summary,
    problem: input.problem,
    solution: input.solution,
    plan: input.plan,
    useOfFunds: input.useOfFunds,
    exitStrategy: input.exitStrategy,
    improvements: input.improvements,
    timeline: input.timeline,
    residentStory: input.residentStory,

    // Fit
    riskProfile: input.riskProfile,
    strategyTags: input.strategyTags ?? [],
    investorPersonas: input.investorPersonas,

    // Lifecycle
    status: input.status ?? 'draft',
    createdAt: createdAt ?? input.createdAt ?? updatedAt,
    updatedAt,
  };
  return p;
}

/** Robust, typed ID generator without augmenting `Crypto`. */
function cryptoId(): string {
  try {
    const c: Crypto | undefined =
      typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

    // Prefer native UUID if present
    if (c?.randomUUID) return c.randomUUID();

    // RFC4122 v4 fallback via getRandomValues
    if (c?.getRandomValues) {
      const bytes = new Uint8Array(16);
      c.getRandomValues(bytes);
      // Version & variant bits
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      const hex = Array.from(bytes, toHex).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  } catch {
    // ignore and fall back
  }
  // Last-resort entropy
  return 'p_' + Math.random().toString(36).slice(2, 10);
}
