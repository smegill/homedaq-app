'use client';

import type { InvestorType } from '@/lib/investorFit';

export type InvestorPrefs = {
  investorTypes: InvestorType[]; // NEW plain-English categories
  zip?: string;
  minInvestment?: number;
};

const LS_KEY_V2 = 'homedaq:prefs:v2';
const LS_KEY_V1 = 'homedaq:prefs:v1'; // legacy (Yield/Balanced/Growth)
const listeners: Set<(p: InvestorPrefs) => void> = new Set();

let prefs: InvestorPrefs = { investorTypes: [] };

// ---- helpers ----
function parseV2(raw: string | null): InvestorPrefs | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as InvestorPrefs;
    return {
      investorTypes: Array.isArray(p.investorTypes) ? (p.investorTypes as InvestorType[]) : [],
      zip: p.zip || undefined,
      minInvestment: typeof p.minInvestment === 'number' ? p.minInvestment : undefined,
    };
  } catch {
    return null;
  }
}

function migrateFromV1(raw: string | null): InvestorPrefs | null {
  if (!raw) return null;
  try {
    // Legacy shape: { riskProfiles: ('Yield'|'Balanced'|'Growth')[], zip?, minInvestment? }
    const legacy = JSON.parse(raw) as { riskProfiles?: string[]; zip?: string; minInvestment?: number };
    const set = new Set<InvestorType>();
    for (const r of legacy.riskProfiles ?? []) {
      if (r === 'Yield') set.add('SteadyIncome');
      if (r === 'Balanced') set.add('BalancedBlend');
      if (r === 'Growth') { set.add('GrowthUpside'); set.add('MaxReturn'); }
    }
    return {
      investorTypes: Array.from(set),
      zip: legacy.zip || undefined,
      minInvestment: typeof legacy.minInvestment === 'number' ? legacy.minInvestment : undefined,
    };
  } catch {
    return null;
  }
}

function load(): InvestorPrefs {
  if (typeof window === 'undefined') return prefs;
  // Prefer v2
  const v2 = parseV2(window.localStorage.getItem(LS_KEY_V2));
  if (v2) return v2;

  // Try migrate v1
  const migrated = migrateFromV1(window.localStorage.getItem(LS_KEY_V1));
  if (migrated) {
    try { window.localStorage.setItem(LS_KEY_V2, JSON.stringify(migrated)); } catch {}
    return migrated;
  }
  return { investorTypes: [] };
}

function persist() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(LS_KEY_V2, JSON.stringify(prefs)); } catch {}
}

function notify() { for (const fn of listeners) fn({ ...prefs }); }

// Init in browser
if (typeof window !== 'undefined') {
  prefs = load();
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY_V2 || e.key === LS_KEY_V1) {
      prefs = load();
      notify();
    }
  });
}

// ---- Public API ----
export function getPrefs(): InvestorPrefs { return { ...prefs }; }

export function setPrefs(next: InvestorPrefs): InvestorPrefs {
  prefs = {
    investorTypes: Array.isArray(next.investorTypes) ? next.investorTypes : [],
    zip: next.zip || undefined,
    minInvestment: typeof next.minInvestment === 'number' ? next.minInvestment : undefined,
  };
  persist();
  notify();
  return getPrefs();
}

export function updatePrefs(patch: Partial<InvestorPrefs>): InvestorPrefs {
  return setPrefs({ ...prefs, ...patch });
}

export function subscribePrefs(fn: (p: InvestorPrefs) => void): () => void {
  listeners.add(fn);
  fn(getPrefs());
  return () => { listeners.delete(fn); };
}
