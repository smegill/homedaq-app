'use client';

import type { RiskProfile } from '@/types/pitch';

export type InvestorPrefs = {
  riskProfiles: RiskProfile[];
  zip?: string;
  minInvestment?: number;
};

const LS_KEY = 'homedaq:prefs:v1';
const listeners: Set<(p: InvestorPrefs) => void> = new Set();

let prefs: InvestorPrefs = { riskProfiles: [] };

// ---- persistence helpers ----
function load(): InvestorPrefs {
  if (typeof window === 'undefined') return prefs;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const parsed = raw ? (JSON.parse(raw) as InvestorPrefs) : null;
    if (!parsed) return { riskProfiles: [] };
    return {
      riskProfiles: Array.isArray(parsed.riskProfiles) ? parsed.riskProfiles : [],
      zip: parsed.zip || undefined,
      minInvestment:
        typeof parsed.minInvestment === 'number' ? parsed.minInvestment : undefined,
    };
  } catch {
    return { riskProfiles: [] };
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

function notify() {
  for (const fn of listeners) fn({ ...prefs });
}

// initialize from localStorage in the browser
if (typeof window !== 'undefined') {
  prefs = load();
  // keep tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) {
      prefs = load();
      notify();
    }
  });
}

// ---- public API ----
export function getPrefs(): InvestorPrefs {
  return { ...prefs };
}

/** Replace the current preferences with `next` and notify subscribers. */
export function setPrefs(next: InvestorPrefs): InvestorPrefs {
  prefs = {
    riskProfiles: next.riskProfiles ?? [],
    zip: next.zip || undefined,
    minInvestment:
      typeof next.minInvestment === 'number' ? next.minInvestment : undefined,
  };
  persist();
  notify();
  return getPrefs();
}

/** Merge in partial updates to preferences. */
export function updatePrefs(patch: Partial<InvestorPrefs>): InvestorPrefs {
  return setPrefs({ ...prefs, ...patch });
}

export function subscribePrefs(fn: (p: InvestorPrefs) => void): () => void {
  listeners.add(fn);
  fn(getPrefs()); // immediate snapshot
  return () => {
    listeners.delete(fn);
  };
}
