// Simple in-memory + localStorage persistence layer for pitches.
// Strongly typed, no `any`, with a small pub/sub.

'use client';

import type { Pitch, PitchInput } from '@/types/pitch';

const LS_KEY = 'homedaq:pitches:v1';

const listeners: Set<(rows: Pitch[]) => void> = new Set();
let rows: Pitch[] = [];

// Utilities
function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function load() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    rows = raw ? (JSON.parse(raw) as Pitch[]) : [];
  } catch {
    rows = [];
  }
}
function save() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch {}
  for (const fn of listeners) fn([...rows]);
}

// Init
if (typeof window !== 'undefined') load();

export function subscribe(fn: (rows: Pitch[]) => void): () => void {
  listeners.add(fn);
  fn([...rows]); // immediate snapshot
  return () => {
    listeners.delete(fn);
  };
}

export function getPitches(): Pitch[] {
  return [...rows];
}

export async function getPitchById(id: string): Promise<Pitch | null> {
  const found = rows.find((r) => r.id === id);
  return found ?? null;
}

export async function savePitch(input: PitchInput): Promise<Pitch> {
  const now = Date.now();
  const id = input.id ?? uuid();

  const existingIdx = rows.findIndex((r) => r.id === id);
  if (existingIdx >= 0) {
    const updated: Pitch = {
      ...rows[existingIdx],
      ...input,
      id,
      updatedAt: now,
    } as Pitch;
    rows[existingIdx] = updated;
    save();
    return updated;
  }

  const created: Pitch = {
    id,
    title: input.title ?? 'Untitled pitch',

    // Location
    address1: input.address1,
    address2: input.address2,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,

    // Economics
    valuation: input.valuation,
    minInvestment: input.minInvestment,
    equityPct: input.equityPct,

    // Funding progress
    fundingGoal: input.fundingGoal,
    fundingCommitted: input.fundingCommitted,

    // Presentation
    summary: input.summary,
    heroImageUrl: input.heroImageUrl,
    gallery: input.gallery ?? [],

    // External
    offeringUrl: input.offeringUrl,

    // State
    status: input.status ?? 'review',

    // Narrative
    problem: input.problem,
    solution: input.solution,
    plan: input.plan,
    useOfFunds: input.useOfFunds,
    exitStrategy: input.exitStrategy,
    improvements: input.improvements,
    timeline: input.timeline,
    residentStory: input.residentStory,
    strategyTags: input.strategyTags ?? [],
    riskProfile: input.riskProfile,

    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
  rows.unshift(created);
  save();
  return created;
}
