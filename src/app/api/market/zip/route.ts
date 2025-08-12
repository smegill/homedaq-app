import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

type CsvRow = Record<string, string>;
type Snapshot = {
  zip: string;
  periodEnd: string;
  medianSalePrice?: number;
  medianDaysOnMarket?: number;
  homesSold?: number;
  inventory?: number;
  medianSalePriceMoM?: number;
  medianSalePriceYoY?: number;
};

function parseNumber(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const clean = s.replace(/[\$,]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : undefined;
}

function parseCSV(csv: string): CsvRow[] {
  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map((h) => h.trim());

  return lines.map((line) => {
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cols.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current);

    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    return row;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zip = (searchParams.get('zip') || '').trim();

  if (!/^\d{5}$/.test(zip)) {
    return new Response(JSON.stringify({ error: 'zip must be 5 digits' }), { status: 400 });
  }

  // Read CSV from /public
  const filePath = path.join(process.cwd(), 'public', 'data', 'zip_code_market_tracker.csv');
  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    return new Response(JSON.stringify({ error: 'dataset not found' }), { status: 404 });
  }

  const rows = parseCSV(content);

  // Filter to this ZIP; Redfin uses region_type=zip_code and region=<ZIP>
  const zipRows = rows.filter(
    (r) =>
      (r['region_type'] || r['regiontype']) === 'zip_code' &&
      (r['region'] || r['postal_code'] || r['zip_code']) === zip,
  );

  if (zipRows.length === 0) {
    return new Response(JSON.stringify({ zip, data: null }), { status: 200 });
  }

  // Pick latest by period_end or period_begin
  const sorted = [...zipRows].sort((a, b) => {
    const da = Date.parse(a['period_end'] || a['period_begin'] || '');
    const db = Date.parse(b['period_end'] || b['period_begin'] || '');
    return db - da;
  });
  const latest = sorted[0];

  const snapshot: Snapshot = {
    zip,
    periodEnd: latest['period_end'] || latest['period_begin'] || '',
    medianSalePrice: parseNumber(latest['median_sale_price']),
    medianDaysOnMarket: parseNumber(latest['median_days_on_market']),
    homesSold: parseNumber(latest['homes_sold']),
    inventory: parseNumber(latest['inventory']),
    medianSalePriceMoM: parseNumber(latest['median_sale_price_mom']),
    medianSalePriceYoY: parseNumber(latest['median_sale_price_yoy']),
  };

  return new Response(JSON.stringify(snapshot), {
    headers: { 'content-type': 'application/json' },
  });
}
