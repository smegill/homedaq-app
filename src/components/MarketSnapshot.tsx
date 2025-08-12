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

function formatCurrency(n: number | null) {
  if (n == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}
function pct(v: number | null) {
  if (v == null) return '—';
  const abs = Math.abs(v);
  return `${(v * 100).toFixed(abs >= 0.1 ? 0 : 1)}%`;
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
        return j as Snapshot;
      })
      .then((j) => {
        setData(j);
        setErr(null);
      })
      .catch((e) => setErr(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [zip]);

  const asOf =
    data?.latest?.period ? new Date(data.latest.period).toLocaleDateString() : undefined;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink-900">
          Market snapshot <span className="text-ink-500">(ZIP {zip || '—'})</span>
        </h3>
        {asOf && <div className="text-xs text-ink-600">as of {asOf}</div>}
      </div>

      {!zip || !/^\d{5}$/.test(zip) ? (
        <div className="mt-3 text-sm text-ink-600">Enter a 5-digit ZIP to see local stats.</div>
      ) : loading ? (
        <div className="mt-4 h-24 w-full animate-pulse rounded-xl bg-ink-100" />
      ) : err ? (
        <div className="mt-3 text-sm text-red-600">{err}</div>
      ) : data ? (
        <>
          {/* Top stat + sparkline */}
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-ink-600">Median sale price</div>
              <div className="text-2xl font-semibold text-ink-900">
                {formatCurrency(data.latest.median_sale_price)}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <Chip value={data.latest.mom_change} label="MoM" />
                <Chip value={data.latest.yoy_change} label="YoY" />
              </div>
            </div>
            <div className="md:col-span-2">
              <Sparkline series={data.history.map((d) => d.value)} />
            </div>
          </div>

          {/* Secondary stats */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
            <Stat label="New listings" value={fmtNum(data.latest.new_listings)} />
            <Stat label="Active inventory" value={fmtNum(data.latest.inventory)} />
            <Stat label="Median DOM" value={fmtNum(data.latest.median_dom)} />
          </div>
        </>
      ) : (
        <div className="mt-3 text-sm text-ink-600">No data available.</div>
      )}
    </Card>
  );
}

function fmtNum(n: number | null) {
  return n == null ? '—' : Number(n).toLocaleString();
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 p-3 bg-white">
      <div className="text-ink-600">{label}</div>
      <div className="text-ink-900 font-medium">{value}</div>
    </div>
  );
}

function Chip({ value, label }: { value: number | null; label: string }) {
  const up = (value ?? 0) > 0;
  const cls =
    value == null
      ? 'bg-ink-100 text-ink-700'
      : up
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 ${cls} text-[11px]`}>
      {label}: {pct(value)}
    </span>
  );
}

function Sparkline({ series }: { series: number[] }) {
  if (!series?.length) {
    return <div className="h-20 w-full rounded-xl bg-ink-50 border border-ink-200" />;
  }
  const w = 320;
  const h = 80;
  const pad = 4;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const x = (i: number) => (i / Math.max(1, series.length - 1)) * (w - pad * 2) + pad;
  const y = (v: number) =>
    max === min ? h / 2 : h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const d = series.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const lastY = y(series[series.length - 1]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full">
      <path d={d} fill="none" stroke="currentColor" className="text-brand-600" strokeWidth="2" />
      <circle cx={x(series.length - 1)} cy={lastY} r="3" className="fill-brand-600" />
    </svg>
  );
}
