'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';

type Snapshot = {
  zip: string;
  latest: {
    period: string | null;
    median_sale_price: number | null;
    new_listings: number | null;
    inventory: number | null;
    median_dom: number | null;
    mom_change: number | null;
    yoy_change: number | null;
  };
  history: { period: string; value: number }[];
};

function fmtUSD(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}
function fmtPct(v: number | null) {
  if (v == null || Number.isNaN(v)) return '—';
  const abs = Math.abs(v);
  return `${(v * 100).toFixed(abs >= 0.1 ? 0 : 1)}%`;
}
function toNum(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}
function normalize(zip: string, j: any): Snapshot {
  const latest = j?.latest ?? {};
  return {
    zip,
    latest: {
      period: latest?.period ?? null,
      median_sale_price: toNum(latest?.median_sale_price),
      new_listings: toNum(latest?.new_listings),
      inventory: toNum(latest?.inventory),
      median_dom: toNum(latest?.median_dom),
      mom_change: toNum(latest?.mom_change),
      yoy_change: toNum(latest?.yoy_change),
    },
    history: Array.isArray(j?.history)
      ? j.history
          .map((r: any) => ({ period: r?.period ?? '', value: toNum(r?.value) }))
          .filter((r: any) => r.period && r.value != null)
      : [],
  };
}

export default function MarketSnapshot({ zip }: { zip: string }) {
  const [data, setData] = React.useState<Snapshot | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setData(null);
      setErr(null);
      return;
    }
    setLoading(true);
    fetch(`/api/market/zip?zip=${encodeURIComponent(zip)}&months=12`)
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) {
          throw new Error(j?.error ? `HTTP ${r.status} — ${j.error}` : `HTTP ${r.status}`);
        }
        return j;
      })
      .then((j) => {
        setData(normalize(zip, j ?? {}));
        setErr(null);
      })
      .catch((e) => {
        setErr(String(e?.message || e));
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [zip]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-ink-900">
        Market snapshot <span className="text-ink-500">(ZIP {zip || '—'})</span>
      </h3>

      {loading && <p className="mt-3 text-sm text-ink-600">Loading market data…</p>}
      {err && !loading && <p className="mt-3 text-sm text-red-600">{err}</p>}

      {!loading && !err && data && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Stat label="Median sale price" value={fmtUSD(data.latest.median_sale_price)} />
          <Stat label="New listings (mo)" value={data.latest.new_listings ?? '—'} />
          <Stat label="Inventory (active)" value={data.latest.inventory ?? '—'} />
          <Stat label="Median days on market" value={data.latest.median_dom ?? '—'} />
          <Stat label="MoM change" value={fmtPct(data.latest.mom_change)} />
          <Stat label="YoY change" value={fmtPct(data.latest.yoy_change)} />
        </div>
      )}

      {!loading && !err && !data && (
        <p className="mt-3 text-sm text-ink-600">Enter a 5-digit ZIP to see recent market stats.</p>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3">
      <div className="text-xs text-ink-600">{label}</div>
      <div className="mt-1 text-base font-semibold text-ink-900">{value}</div>
    </div>
  );
}
