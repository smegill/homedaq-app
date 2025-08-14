'use client';

import { DEFAULT_PREFERENCES, type InvestorPreferences } from '@/types/investor';

const LS_KEY = 'homedaq:investor:prefs';
const listeners: Set<(prefs: InvestorPreferences) => void> = new Set();

function read(): InvestorPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as InvestorPreferences;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function write(prefs: InvestorPreferences) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  for (const fn of listeners) fn(prefs);
}

export function getPrefs(): InvestorPreferences {
  return read();
}

export function savePrefs(next: InvestorPreferences) {
  write(next);
}

export function subscribePrefs(fn: (prefs: InvestorPreferences) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
