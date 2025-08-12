'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';

type SnapshotLoose = {
  zip?: string;
  latest?: Record<string, unknown> | null;
  history?: Array<{ period?: string; value?: number | string | null }>;
  notFound?: boolean;
  error?: string;
};

function fmtUSD(n: unknown) {
  const num = typeof n === 'string' ? Number(n) : (n as number | null | undefined);
  if (!Number.isFinite(num ?? NaN)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    num as number
  );
}
function fmtNum(n: unknown) {
  const num = typeof n === 'string' ? Number(n) : (n as number | null | undefined);
  if (!Number.isFinite(num ?? NaN)) return '—';
  return Math.round(num as number).toLocaleString();
}
function fmtPct(n: unknown) {
  const num = typeof n === 'string' ? Number(n) : (n as number | null | undefined);
  if (!Number.isFinite(num ?? NaN)) return '—';
  return ((num as number) * 100).toFixed(1) + '%';
}
const isZip = (z?: string) => !!z && /^\d{5}$/.test(z);

export default function MarketSnapshot({ zip }: { zip?: string }) {
  const [data, setData] = React.useState<SnapshotLoose | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Build tag so we can confirm which code is running on Vercel
  React.useEffect(() => {
    // update this when you redeploy to verify in the browser console
    console.log('MarketSnapshot build tag: 2025-08-12-03');
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
        try {
          const json = JSON.parse(text) as SnapshotLoose;
          if (!r.ok) throw new Error((json as any)?.error || `HTTP ${r.status}`);
          return json;
        } catch {
          throw new Error(text || `HTTP ${r.status}`);
        }
      })
      .then((json) => {
        setData(json ?? {});
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

  const latest = data?.latest ?? {}; // <- ALWAYS defined object

  // We accept either snake_case or camelCase from the API
  const medianSalePrice = (latest as any).median_sale_price ?? (latest as any).medianSalePrice;
  const medianListPrice = (latest as any).median_list_price ?? (latest as any).medianListPrice;
  const homesSold = (latest as any).homes_sold ?? (latest as any).homesSold;
  const inventory = (latest as any).inventory ?? (latest as any).active_inventory ?? (latest as any).activeInventory;
  const medianDom = (latest as any).median_dom ?? (latest as any).medianDaysOnMarket;
  const saleToList = (latest as any).avg_sale_to_list ?? (latest as any).saleToList;
  const priceYoY = (latest as any).yoy_change ?? (latest as any).priceYoY;
  const period = (latest as any).period ?? (latest as any).month ?? null;

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

      {!err && !loading && !data?.notFound && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Metric label="Median sale price" value={fmtUSD(medianSalePrice)} />
          <Metric label="Median list price" value={fmtUSD(medianListPrice)} />
          <Metric label="Homes sold (mo)" value={fmtNum(homesSold)} />
          <Metric label="Inventory (active)" value={fmtNum(inventory)} />
          <Metric label="Median days on market" value={fmtNum(medianDom)} />
          <Metric label="Sale-to-list (avg)" value={fmtPct(saleToList)} />
          <Metric label="YoY price change" value={fmtPct(priceYoY)} />
          <Metric label="As of" value={period ?? '—'} />
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
