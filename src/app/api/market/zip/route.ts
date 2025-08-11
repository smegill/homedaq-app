import { NextRequest, NextResponse } from 'next/server';

// Redfin ZIP tracker (long format)
const REDFIN_ZIP_CSV =
  'https://redfin-public-data.s3-us-west-2.amazonaws.com/redfin_market_trends/zip_code_market_tracker/csv/zip_code_market_tracker.csv';

// simple in-memory cache
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

    // fetch CSV
    const res = await fetch(REDFIN_ZIP_CSV, { next: { revalidate: 60 * 60 * 6 } }); // 6h CDN cache
    if (!res.ok) throw new Error(`Redfin fetch failed ${res.status}`);
    const csv = await res.text();

    // parse
    const rows = parseCSV(csv);
    const header = rows.shift() || [];
    const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

    // Try to map the flexible schema Redfin uses
    const iRegionType = idx('region_type');
    const iRegion = idx('region');
    const iTable = idx('table') !== -1 ? idx('table') : idx('table_id');
    const iBegin = idx('period_begin') !== -1 ? idx('period_begin') : idx('period');
    const iEnd = idx('period_end') !== -1 ? idx('period_end') : -1;
    const iValue = idx('value');

    if (iRegionType === -1 || iRegion === -1 || iTable === -1 || iBegin === -1 || iValue === -1) {
      return NextResponse.json({ error: 'Unexpected Redfin schema' }, { status: 502 });
    }

    // Keep only this ZIP and a few metrics we care about
    const wantTables = new Set(['median_sale_price', 'new_listings', 'inventory', 'median_dom']);
    const zipRows = rows.filter(
      (r) =>
        (r[iRegionType] || '').toLowerCase() === 'zip_code' &&
        (r[iRegion] || '') === zip &&
        wantTables.has((r[iTable] || '').toLowerCase())
    );

    if (zipRows.length === 0) {
      return NextResponse.json({ error: `No rows for ZIP ${zip}` }, { status: 404 });
    }

    // bucket by table -> [{period_begin, period_end, value}]
    type Point = { begin: string; end?: string; value: number };
    const byTable = new Map<string, Point[]>();
    for (const r of zipRows) {
      const t = (r[iTable] || '').toLowerCase();
      const val = Number(r[iValue] ?? '');
      if (!Number.isFinite(val)) continue;
      const p: Point = { begin: r[iBegin], end: iEnd !== -1 ? r[iEnd] : undefined, value: val };
      const arr = byTable.get(t) || [];
      arr.push(p);
      byTable.set(t, arr);
    }

    // sort each series by begin date asc
    for (const [k, arr] of byTable) {
      arr.sort((a, b) => a.begin.localeCompare(b.begin));
      byTable.set(k, arr);
    }

    // latest values
    const latest = (key: string) => {
      const arr = byTable.get(key);
      return arr && arr.length ? arr[arr.length - 1] : undefined;
    };

    const latestPrice = latest('median_sale_price');
    const latestListings = latest('new_listings');
    const latestInventory = latest('inventory');
    const latestDom = latest('median_dom');

    // Build price history for sparkline (last N months)
    const priceSeries = (byTable.get('median_sale_price') || []).slice(-months);
    const history = priceSeries.map((p) => ({ period: p.begin, value: p.value }));

    // derive MoM/YoY from series (last value vs previous / 12 months back)
    const mom = (() => {
      if (priceSeries.length < 2) return null;
      const a = priceSeries[priceSeries.length - 2].value;
      const b = priceSeries[priceSeries.length - 1].value;
      return a ? (b - a) / a : null;
    })();
    const yoy = (() => {
      if (priceSeries.length < 13) return null;
      const a = priceSeries[priceSeries.length - 13].value;
      const b = priceSeries[priceSeries.length - 1].value;
      return a ? (b - a) / a : null;
    })();

    const data = {
      zip,
      latest: {
        period: latestPrice?.begin ?? null,
        median_sale_price: latestPrice?.value ?? null,
        new_listings: latestListings?.value ?? null,
        inventory: latestInventory?.value ?? null,
        median_dom: latestDom?.value ?? null,
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
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      if (ch === '\r') {
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }
  // push last
  row.push(field);
  rows.push(row);
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}
