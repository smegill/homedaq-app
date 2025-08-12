import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { gunzipSync } from 'zlib';

// Remote sources (sometimes 403 behind certain networks)
// We’ll try these first, then fall back to a local file.
const REDFIN_SOURCES = [
  'https://redfin-public-data.s3-us-west-2.amazonaws.com/redfin_market_trends/zip_code_market_tracker/csv/zip_code_market_tracker.csv',
  'https://s3-us-west-2.amazonaws.com/redfin-public-data/redfin_market_trends/zip_code_market_tracker/csv/zip_code_market_tracker.csv',
];

// Simple in-memory cache
type CacheEntry = { ts: number; data: any };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60 * 12; // 12h

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = (searchParams.get('zip') || '').trim();
    const months = Math.max(6, Math.min(36, Number(searchParams.get('months') || 12)));
    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ error: 'Provide ?zip=12345' }, { status: 400 });
    }

    const cacheKey = `${zip}:${months}`;
    const now = Date.now();
    const cached = CACHE.get(cacheKey);
    if (cached && now - cached.ts < TTL_MS) {
      return NextResponse.json(cached.data, { status: 200 });
    }

    // 1) Try remote CSV
    let csv: string | null = null;
    try {
      csv = await fetchRedfinCSV();
    } catch (e: any) {
      // 2) If remote fails, try local file(s)
      csv = await readLocalCSV().catch(() => null);
      if (!csv) throw e; // rethrow original fetch error if no local fallback
    }

    // Parse CSV (wide schema)
    const rows = parseCSV(csv);
    const header = rows.shift() ?? [];
    const I = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    const idx = {
      regionType: I('region_type'),
      region: I('region'),
      periodEnd: I('period_end'),
      periodBegin: I('period_begin'),
      monthYYYYMM: I('month_date_yyyymm'),
      medianSalePrice: I('median_sale_price'),
      newListings: I('new_listings'),
      inventory: I('inventory'),
      medianDom: I('median_dom'),
    };
    if (idx.regionType === -1 || idx.region === -1) {
      return NextResponse.json({ error: 'Unexpected Redfin schema (region columns missing)' }, { status: 502 });
    }

    // Filter to this ZIP
    const zipRows = rows.filter(
      (r) => (r[idx.regionType] || '').toLowerCase() === 'zip_code' && (r[idx.region] || '') === zip
    );
    if (zipRows.length === 0) {
      return NextResponse.json({ error: `No rows for ZIP ${zip}` }, { status: 404 });
    }

    type Pt = {
      period: string;
      median_sale_price: number | null;
      new_listings: number | null;
      inventory: number | null;
      median_dom: number | null;
    };

    const points: Pt[] = zipRows.map((r) => {
      const srcPeriod =
        (idx.periodEnd !== -1 && r[idx.periodEnd]) ||
        (idx.periodBegin !== -1 && r[idx.periodBegin]) ||
        (idx.monthYYYYMM !== -1 && r[idx.monthYYYYMM]) ||
        '';
      return {
        period: normalizePeriod(srcPeriod),
        median_sale_price: num(r[idx.medianSalePrice]),
        new_listings: num(r[idx.newListings]),
        inventory: num(r[idx.inventory]),
        median_dom: num(r[idx.medianDom]),
      };
    });

    const series = points.filter((p) => p.period).sort((a, b) => a.period.localeCompare(b.period));

    // Build price history for sparkline
    const priceHistory = series
      .map((s) => ({ period: s.period, value: s.median_sale_price }))
      .filter((d) => d.value != null) as { period: string; value: number }[];
    const history = priceHistory.slice(-months);

    // Latest non-null values
    const last = (getter: (p: Pt) => number | null) => {
      for (let i = series.length - 1; i >= 0; i--) {
        const v = getter(series[i]);
        if (v != null && Number.isFinite(v)) return { v, period: series[i].period };
      }
      return undefined;
    };
    const lastPrice = last((p) => p.median_sale_price);
    const lastListings = last((p) => p.new_listings);
    const lastInv = last((p) => p.inventory);
    const lastDom = last((p) => p.median_dom);

    // MoM / YoY
    const mom = (() => {
      if (history.length < 2) return null;
      const a = history[history.length - 2].value;
      const b = history[history.length - 1].value;
      return a ? (b - a) / a : null;
    })();
    const yoy = (() => {
      if (priceHistory.length < 13) return null;
      const a = priceHistory[priceHistory.length - 13].value;
      const b = priceHistory[priceHistory.length - 1].value;
      return a ? (b - a) / a : null;
    })();

    const data = {
      zip,
      latest: {
        period: lastPrice?.period ?? null,
        median_sale_price: lastPrice?.v ?? null,
        new_listings: lastListings?.v ?? null,
        inventory: lastInv?.v ?? null,
        median_dom: lastDom?.v ?? null,
        mom_change: mom,
        yoy_change: yoy,
      },
      history,
    };

    CACHE.set(cacheKey, { ts: now, data });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

async function fetchRedfinCSV(): Promise<string> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 HomeDAQ/1.0',
    Accept: 'text/csv,*/*;q=0.1',
  } as const;

  let lastErr: any = null;
  for (const url of REDFIN_SOURCES) {
    try {
      const res = await fetch(url, { headers, next: { revalidate: 60 * 60 * 6 } });
      if (res.ok) return await res.text();
      lastErr = new Error(`Redfin fetch failed ${res.status} (${url})`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('All Redfin sources failed');
}

async function readLocalCSV(): Promise<string> {
  // You can override with an absolute/relative path via env:
  // REDFIN_ZIP_CSV_FILE=/absolute/path/to/zip_code_market_tracker.csv(.gz)
  const envPath = process.env.REDFIN_ZIP_CSV_FILE || '';
  const candidates = [
    envPath,
    path.join(process.cwd(), 'public', 'data', 'zip_code_market_tracker.csv'),
    path.join(process.cwd(), 'public', 'data', 'zip_code_market_tracker.csv.gz'),
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      const buf = await fs.readFile(p);
      if (p.endsWith('.gz')) {
        return gunzipSync(buf).toString('utf8');
      }
      return buf.toString('utf8');
    } catch {
      // try next
    }
  }
  throw new Error(
    'Redfin CSV not available locally. Put the file at public/data/zip_code_market_tracker.csv (or .gz), or set REDFIN_ZIP_CSV_FILE.'
  );
}

function num(n: any): number | null {
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}
function normalizePeriod(s: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4)}-01`;
  return s;
}

/** Minimal CSV parser that handles quoted fields and commas. */
function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;

  while (i < input.length) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\r') {
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}
