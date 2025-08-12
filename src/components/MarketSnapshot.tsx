'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';

type Latest = {
  period: string | null;
  medianSalePrice: number | null;
  medianListPrice: number | null;
  homesSold: number | null;
  inventory: number | null;
  medianDom: number | null;
  saleToList: number | null;
  priceYoY: number | null;
};

type HistoryPoint = { period: string; value: number };

type Snapshot = {
  zip: string;
  notFound?: boolean;
  latest: Latest;
  history: HistoryPoint[];
};

function isObject(u: unknown): u is Record<string, unknown> {
  return typeof u === 'object' && u !== null && !Array.isArray(u);
}
function toNumber(u: unknown): number | null {
  if (typeof u === 'number' && Number.isFinite(u)) return u;
  if (typeof u === 'string') {
    const n = Number(u.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function toString(u: unknown): string | null {
  return typeof u === 'string' ? u : null;
}

function fmtUSD(n: number | null) {
  if (n == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}
function fmtNum(n: number | null) {
  if (n == null) return '—';
  return Math.round(n).toLocaleString();
}
function fmtPct(n: number | null) {
  if (n == null) return '—';
  return (n * 100).toFixed(1) + '%';
}
const isZip = (z?: string) => !!z && /^\d{5}$/.test(z);

function normalize(zip: string, raw: unknown): Snapshot {
  const r = isObject(raw) ? raw : {};

  const latestRaw = isObject(r.latest) ? (r.latest as Record<string, unknown>) : {};
  const latest: Latest = {
    period: toString(latestRaw['period']) ?? toString(latestRaw['month']),
    medianSalePrice: toNumber(latestRaw['median_sale_price'] ?? latestRaw['medianSalePrice']),
    medianListPrice: toNumber(latestRaw['median_list_price'] ?? latestRaw['medianListPrice']),
    homesSold: toNumber(latestRaw['homes_sold'] ?? latestRaw['homesSold']),
    inventory: toNumber(
      latestRaw['inventory'] ?? latestRaw['active_inventory'] ?? latestRaw['activeInventory']
    ),
    medianDom: toNumber(latestRaw['median_dom'] ?? latestRaw['medianDaysOnMarket']),
    saleToList: toNumber(latestRaw['avg_sale_to_list'] ?? latestRaw['saleToList']),
    priceYoY: toNumber(latestRaw['yoy_change'] ?? latestRaw['priceYoY']),
  };

  const history: HistoryPoint[] = Array.isArray((r as Record<string, unknown>)['history'])
    ? ((r as Record<string, unknown>)['history'] as unknown[])
        .map((row): HistoryPoint | null => {
          if (!isObject(row)) return null;
          const period = toString(row['period']) ?? '';
          const value = toNumber(row['value']);
          if (!period || value == null) return null;
          return { period, value };
        })
        .filter((p): p is HistoryPoint => !!p)
    : [];

  const notFound = (r['notFound'] === true) || false;

  return {
    zip: toString(r['zip']) ?? zip,
    notFound,
    latest,
    history,
  };
}

export default function MarketSnapshot({ zip }: { zip?: string }) {
  const [data, setData] = React.useState<Snapshot | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Build tag to verify which version is deployed
  React.useEffect(() => {
    console.log('MarketSnapshot build tag: 2025-08-12-04');
  }, []);

  React.useEffect(() => {
    if (!isZip(zip)) {
      setData(null);
      setErr(null);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setErr(null);

    fetch(`/api/market/zip?zip=${zip}&months=12`, { cache: 'no-store', signal: ac.signal })
      .then(async (r) => {
        const text = await r.text();
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          // leave parsed null; will be handled below
        }
        if (!r.ok) {
          const msg = isObject(parsed) && typeof parsed['error'] === 'string' ? String(parsed['error']) : text || `HTTP ${r.status}`;
          throw new Error(msg);
        }
        return parsed;
      })
      .then((parsed) => {
        setData(normalize(zip!, parsed));
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : String(e));
        setData(null);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [zip]);

  if (!isZip(zip)) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ink-900">Market snapshot</h3>
        <p className="mt-2 text-sm text-ink-600">Enter a valid 5-digit ZIP to see local comps.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink-900">
          Market snapshot <span className="text-ink-500">(ZIP {zip})</span>
        </h3>
        {loading && <span className="text-xs text-ink-500">Loading…</span>}
      </div>

      {err && !loading && <p className="mt-3 text-sm text-red-600">{err}</p>}

      {!err && !loading && data?.notFound && (
        <p className="mt-3 text-sm text-ink-600">No recent data available for {zip}.</p>
      )}

      {!err && !loading && data && !data.notFound && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Metric label="Median sale price" value={fmtUSD(data.latest.medianSalePrice)} />
          <Metric label="Median list price" value={fmtUSD(data.latest.medianListPrice)} />
          <Metric label="Homes sold (mo)" value={fmtNum(data.latest.homesSold)} />
          <Metric label="Inventory (active)" value={fmtNum(data.latest.inventory)} />
          <Metric label="Median days on market" value={fmtNum(data.latest.medianDom)} />
          <Metric label="Sale-to-list (avg)" value={fmtPct(data.latest.saleToList)} />
          <Metric label="YoY price change" value={fmtPct(data.latest.priceYoY)} />
          <Metric label="As of" value={data.latest.period ?? '—'} />
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3 bg-white">
      <div className="text-xs text-ink-600">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}
