'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';

type Latest = {
  period: string | null;
  median_sale_price: number | null;
  new_listings: number | null;
  inventory: number | null;
  median_dom: number | null;
  mom_change: number | null;
  yoy_change: number | null;
};

type Snapshot = {
  zip: string;
  latest: Latest | null;
  history: Array<{ period: string; value: number }>;
};

function formatCurrency(n: number | null | undefined) {
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
function pct(v: number | null | undefined) {
  if (v == null) return '—';
  const abs = Math.abs(v);
  return `${(v * 100).toFixed(abs >= 0.1 ? 0 : 1)}%`;
}

export default function MarketSnapshot({ zip }: { zip: string }) {
  const [data, setData] = React.useState<Snapshot | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Build tag so we can verify in prod console
    // eslint-disable-next-line no-console
    console.log('MarketSnapshot build tag: 2025-08-12-05');

    if (!zip || !/^\d{5}$/.test(zip)) {
      setData(null);
      setErr(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/market/zip?zip=${encodeURIComponent(zip)}&months=12`, {
          headers: { Accept: 'application/json' },
        });

        // Handle non-OK responses gracefully
        if (!res.ok) {
          const msg = `ZIP ${zip}: ${res.status} ${res.statusText || ''}`.trim();
          if (!cancelled) {
            setErr(msg);
            setData(null);
          }
          return;
        }

        // Defensive JSON parse
        let j: unknown = null;
        try {
          j = await res.json();
        } catch {
          if (!cancelled) {
            setErr('ZIP data: invalid JSON');
            setData(null);
          }
          return;
        }

        // Narrow the unknown into our shape as best we can
        const snap = normalizeSnapshot(j, zip);
        if (!cancelled) {
          setData(snap);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zip]);

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-ink-900">
          Market snapshot <span className="text-ink-500">(ZIP {zip || '—'})</span>
        </h3>
        {loading && <span className="text-xs text-ink-500">Loading…</span>}
      </div>

      {/* Error state (includes 404) */}
      {err && (
        <p className="mt-3 text-sm text-red-600 break-all">
          {err}
        </p>
      )}

      {/* Empty/invalid data */}
      {!err && !loading && !data?.latest && (
        <p className="mt-3 text-sm text-ink-600">
          No recent data found for this ZIP. Try another ZIP or continue without a snapshot.
        </p>
      )}

      {/* Happy path */}
      {!err && data?.latest && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Metric label="Median sale price" value={formatCurrency(data.latest.median_sale_price)} />
          <Metric label="New listings (mo)" value={data.latest.new_listings ?? '—'} />
          <Metric label="Inventory (mo supply)" value={data.latest.inventory ?? '—'} />
          <Metric label="Median days on market" value={data.latest.median_dom ?? '—'} />
          <Metric label="MoM change" value={pct(data.latest.mom_change)} />
          <Metric label="YoY change" value={pct(data.latest.yoy_change)} />
        </div>
      )}

      {/* Tiny history sparkline summary (optional, safe when empty) */}
      {!err && (data?.history?.length || 0) > 0 && (
        <p className="mt-4 text-[11px] text-ink-500">
          Last {data!.history.length} months of pricing available.
        </p>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3">
      <div className="text-xs text-ink-600">{label}</div>
      <div className="text-base font-semibold text-ink-900">{value}</div>
    </div>
  );
}

/** Coerce unknown JSON into a Snapshot-like object without throwing. */
function normalizeSnapshot(j: unknown, zip: string): Snapshot | null {
  if (!j || typeof j !== 'object') return null;

  // try to pull latest
  const latestObj = (j as Record<string, unknown>).latest as Record<string, unknown> | undefined;
  const historyArr = (j as Record<string, unknown>).history as Array<Record<string, unknown>> | undefined;

  const latest: Latest | null = latestObj && typeof latestObj === 'object'
    ? {
        period: (latestObj.period as string) ?? null,
        median_sale_price: toNum(latestObj.median_sale_price),
        new_listings: toNum(latestObj.new_listings),
        inventory: toNum(latestObj.inventory),
        median_dom: toNum(latestObj.median_dom),
        mom_change: toNum(latestObj.mom_change),
        yoy_change: toNum(latestObj.yoy_change),
      }
    : null;

  const history =
    Array.isArray(historyArr)
      ? historyArr
          .map((r) => {
            const period = String(r?.period ?? '');
            const value = toNum(r?.value);
            return period && typeof value === 'number'
              ? { period, value }
              : null;
          })
          .filter(Boolean) as Array<{ period: string; value: number }>
      : [];

  // If neither latest nor history is valid, treat as no data
  if (!latest && history.length === 0) return null;

  return { zip, latest, history };
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
