'use client';

import * as React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { isValidUSZip } from '@/utils/validation';

export type InvestorFilters = {
  postalCode?: string;
  minValuation?: number;
  maxValuation?: number;
  maxMinInvestment?: number;
  minEquityPct?: number;
  maxEquityPct?: number;
};

export default function InvestorFilterBar({
  value,
  onChange,
}: {
  value?: InvestorFilters;
  onChange: (v: InvestorFilters) => void;
}) {
  const [st, setSt] = React.useState<InvestorFilters>(value ?? {});

  React.useEffect(() => {
    if (value) setSt(value);
  }, [value]);

  function apply() {
    onChange(st);
  }
  function clear() {
    const v: InvestorFilters = {};
    setSt(v);
    onChange(v);
  }

  const inputClass =
    'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="text-sm text-ink-600">ZIP</label>
            <input
              inputMode="numeric"
              maxLength={5}
              className={inputClass + ' mt-1'}
              placeholder="19103"
              value={st.postalCode ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))
              }
            />
            {st.postalCode && !isValidUSZip(st.postalCode) ? (
              <div className="text-xs text-amber-600 mt-1">ZIP looks off. We’ll still filter.</div>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-ink-600">Min valuation</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="0"
              value={st.minValuation ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, minValuation: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Max valuation</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="1,000,000"
              value={st.maxValuation ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, maxValuation: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Max required min investment</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="5000"
              value={st.maxMinInvestment ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, maxMinInvestment: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Min equity %</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="0"
              value={st.minEquityPct ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, minEquityPct: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-ink-600">Max equity %</label>
            <input
              inputMode="numeric"
              className={inputClass + ' mt-1'}
              placeholder="100"
              value={st.maxEquityPct ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, maxEquityPct: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={apply}>Apply</Button>
          <Button variant="ghost" onClick={clear}>Clear</Button>
        </div>
      </CardBody>
    </Card>
  );
}
