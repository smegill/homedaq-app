// src/components/InvestorPrefsForm.tsx
'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';
import { getPrefs, setPrefs, subscribePrefs, type InvestorPrefs } from '@/lib/prefs';
import type { InvestorPersona } from '@/lib/investorFit';
import { INVESTOR_LABELS } from '@/lib/investorFit';

type Choice = { type: InvestorPersona; label: string; blurb: string };

const CHOICES: Choice[] = [
  {
    type: 'Growth First',
    label: INVESTOR_LABELS['Growth First'],
    blurb: 'Chases upside via appreciation share and longer horizons.',
  },
  {
    type: 'Income First',
    label: INVESTOR_LABELS['Income First'],
    blurb: 'Prefers predictable income; de-emphasized in shared-equity deals.',
  },
  {
    type: 'Balanced Blend',
    label: INVESTOR_LABELS['Balanced Blend'],
    blurb: 'Reasonable upside with moderate risk.',
  },
  {
    type: 'Community Backer',
    label: INVESTOR_LABELS['Community Backer'],
    blurb: 'Impact-minded; likes human stories and buy-back paths.',
  },
  {
    type: 'Steady Shelter',
    label: INVESTOR_LABELS['Steady Shelter'],
    blurb: 'Capital preservation first; modest targets, shorter horizons.',
  },
  {
    type: 'Value-Add / Flip',
    label: INVESTOR_LABELS['Value-Add / Flip'],
    blurb: 'Renovations/ADUs/cosmetic uplift potential.',
  },
];

export default function InvestorPrefsForm() {
  const [prefs, setLocal] = React.useState<InvestorPrefs>(() => getPrefs());
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const unsub = subscribePrefs((p) => setLocal(p));
    return () => unsub();
  }, []);

  function toggle(type: InvestorPersona) {
    setLocal((prev) => {
      const current = new Set(prev.personas ?? []);
      current.has(type) ? current.delete(type) : current.add(type);
      const next: InvestorPrefs = { ...prev, personas: Array.from(current) as InvestorPersona[] };
      // optimistic write
      void setPrefs(next);
      return next;
    });
  }

  async function saveNow() {
    setSaving(true);
    try {
      await setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  }

  const selected = new Set(prefs.personas ?? []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHOICES.map((c) => {
          const active = selected.has(c.type);
          return (
            <button
              key={c.type}
              type="button"
              onClick={() => toggle(c.type)}
              className={[
                'rounded-2xl border p-4 text-left transition',
                active ? 'border-ink-900 bg-ink-900 text-white' : 'border-zinc-300 bg-white hover:border-ink-300',
              ].join(' ')}
            >
              <div className="font-medium">{c.label}</div>
              <div className={active ? 'text-white/80 text-sm mt-1' : 'text-zinc-600 text-sm mt-1'}>{c.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600">
          {selected.size > 0
            ? `${selected.size} preference${selected.size === 1 ? '' : 's'} selected`
            : 'Choose one or more investor types you’re interested in.'}
        </div>
        <Button onClick={saveNow} disabled={saving} variant="primary">
          {saving ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </div>
  );
}
