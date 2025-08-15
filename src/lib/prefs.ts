// src/lib/prefs.ts
'use client';

import { InvestorPersona } from '@/lib/investorFit';

/** User-configurable browsing/filter preferences for investors. */
export type InvestorPrefs = {
  // Optional location/price filters you may already use elsewhere
  zip?: string;
  priceMin?: number;
  priceMax?: number;
  minInvestment?: number;

  /** Chosen investor personas (e.g., 'Growth First', 'Balanced Blend', etc.) */
  personas?: InvestorPersona[];
};

const STORAGE_KEY = 'homedaq:investor-prefs';

type Listener = (prefs: InvestorPrefs) => void;
const listeners: Set<Listener> = new Set();

function safeParse(json: string | null): InvestorPrefs {
  try {
    return json ? (JSON.parse(json) as InvestorPrefs) : {};
  } catch {
    return {};
  }
}

let state: InvestorPrefs = typeof window === 'undefined' ? {} : safeParse(localStorage.getItem(STORAGE_KEY));

function persist(next: InvestorPrefs) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

/** Read current preferences (synchronous). */
export function getPrefs(): InvestorPrefs {
  return state;
}

/** Replace or update preferences. Notifies subscribers. */
export async function setPrefs(next: InvestorPrefs | ((p: InvestorPrefs) => InvestorPrefs)): Promise<void> {
  state = typeof next === 'function' ? (next as (p: InvestorPrefs) => InvestorPrefs)(state) : next;
  persist(state);
  for (const fn of listeners) fn(state);
}

/** Subscribe to preference changes. Returns an unsubscribe function. */
export function subscribePrefs(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export { STORAGE_KEY as PREFS_STORAGE_KEY };
