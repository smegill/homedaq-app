'use client';

import * as React from 'react';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function OfferDesignerPage() {
  // Core inputs (resident-controlled)
  const [valuation, setValuation] = React.useState<number>(450_000);
  const [amountSeeking, setAmountSeeking] = React.useState<number>(75_000);
  const [equityPct, setEquityPct] = React.useState<number>(15);        // % of LLC sold
  const [minInvestment, setMinInvestment] = React.useState<number>(500);
  const [monthlyDivPct, setMonthlyDivPct] = React.useState<number>(0.8); // % per month (e.g., 0.8% = 9.6% annual)
  const [expAppreciation, setExpAppreciation] = React.useState<number>(3.5); // % per year
  const [horizonYears, setHorizonYears] = React.useState<number>(5);
  const [storyStrength, setStoryStrength] = React.useState<number>(4);  // 1–5

  // Derived metrics
  const impliedEquityPct = safePct((amountSeeking / Math.max(1, valuation)) * 100);
  const equityMismatch = Math.abs(equityPct - impliedEquityPct) > 5; // sanity warning

  const monthlyDivOutflow = amountSeeking * (monthlyDivPct / 100); // total dividends/mo to investors
  const suggestedFeeFloor = monthlyDivOutflow * 1.15; // 15% buffer for reserves/ops

  // Exit value scenario (simple, illustrative)
  const futureValue = valuation * Math.pow(1 + expAppreciation / 100, horizonYears);
  const investorExitValue = (equityPct / 100) * futureValue; // value of investor units at exit
  const totalDividendsPaid = monthlyDivOutflow * (12 * horizonYears);
  const investorTotalReturn = totalDividendsPaid + (investorExitValue - amountSeeking);
  const simpleAnnualYieldPct =
    (investorTotalReturn / Math.max(1, amountSeeking)) / horizonYears * 100;

  // Segment scoring (0–100) — simple heuristics
  const yieldScore = clamp(mapRange(monthlyDivPct, 0.2, 1.5, 10, 95)); // 0.2%–1.5% monthly range
  const growthScore = clamp(mapRange(expAppreciation, 0, 8, 5, 95));    // 0%–8% annual
  const storyScore = clamp(mapRange(storyStrength, 1, 5, 10, 95));

  const segments: Segment[] = [
    {
      key: 'yield',
      title: 'Yield Seekers',
      desc: 'Prioritize steady cash yield; care less about story.',
      score: weighted([yieldScore, 0.6], [growthScore, 0.2], [storyScore, 0.2]),
      tipsLow: 'Boost monthly dividend % a bit, or lower amount seeking to improve coverage.',
      tipsHigh: 'Strong fit. Ensure your occupancy fee covers dividends + reserves.',
    },
    {
      key: 'balanced',
      title: 'Balanced Total-Return',
      desc: 'Like both monthly yield and appreciation.',
      score: weighted([yieldScore, 0.4], [growthScore, 0.4], [storyScore, 0.2]),
      tipsLow: 'Consider nudging dividend OR highlight real comps to support appreciation.',
      tipsHigh: 'Good mix. Keep terms clear and the buy-back plan credible.',
    },
    {
      key: 'impact',
      title: 'Impact / Story-Driven',
      desc: 'Back people & places; accept lower yield when story is strong.',
      score: weighted([yieldScore, 0.15], [growthScore, 0.25], [storyScore, 0.6]),
      tipsLow: 'Strengthen your narrative: plan, milestones, community ties, photos.',
      tipsHigh: 'Leverage story, progress updates, and social proof.',
    },
    {
      key: 'value',
      title: 'Value / Growth-Oriented',
      desc: 'Chase appreciation and catalysts.',
      score: weighted([yieldScore, 0.2], [growthScore, 0.6], [storyScore, 0.2]),
      tipsLow: 'Show before/after scope, ARV comps, and timeline credibility.',
      tipsHigh: 'Highlight exit scenarios and capex plan tied to comps.',
    },
  ];

  const redFlags: string[] = [];
  if (monthlyDivPct < 0.3) {
    redFlags.push('Very low dividend yield (<0.3%/mo). Likely appeals mainly to impact/story-driven investors.');
  }
  if (monthlyDivPct > 1.2) {
    redFlags.push('High dividend yield (>1.2%/mo). Ensure your occupancy fee covers this sustainably.');
  }
  if (equityMismatch) {
    redFlags.push(
      `Equity mismatch: raising ${fmtCurrency(amountSeeking)} vs valuation ${fmtCurrency(valuation)} implies ~${impliedEquityPct.toFixed(
        1
      )}% sold, but you entered ${equityPct}%.\nConsider aligning equity % with raise or revising one of them.`
    );
  }

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-ink-900">Offer Designer</h1>
        <p className="text-ink-700 mt-2">
          Tune your equity %, monthly dividend %, and story to attract the right investors—while keeping
          your cost lower than a mortgage. This is an illustrative tool, not advice.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink-900">Deal basics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Current Property Value (USD)"
                value={valuation}
                onChange={(v) => setValuation(v)}
                min={50_000}
                step={1_000}
              />
              <NumberField
                label="Amount Seeking (USD)"
                value={amountSeeking}
                onChange={(v) => setAmountSeeking(v)}
                min={5_000}
                step={500}
              />
              <PercentField
                label="Equity Offered (%)"
                value={equityPct}
                onChange={(v) => setEquityPct(v)}
                min={1}
                max={80}
                step={0.5}
              />
              <NumberField
                label="Minimum Investment (USD)"
                value={minInvestment}
                onChange={(v) => setMinInvestment(v)}
                min={100}
                step={100}
              />
            </div>

            {equityMismatch && (
              <div className="mt-3 text-xs rounded-xl border border-amber-200 bg-amber-50 text-amber-900 p-3 whitespace-pre-line">
                {`Heads up: raising ${fmtCurrency(amountSeeking)} on a ${fmtCurrency(
                  valuation
                )} valuation implies ~${impliedEquityPct.toFixed(1)}% equity sold, \nwhich differs from your ${equityPct}% entry.`}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink-900">Yield & growth assumptions</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <PercentField
                label="Monthly Dividend % (of invested capital)"
                value={monthlyDivPct}
                onChange={(v) => setMonthlyDivPct(v)}
                min={0}
                max={2.0}
                step={0.05}
                help="e.g., 0.8%/mo ≈ 9.6% annual"
              />
              <PercentField
                label="Expected Appreciation (% per year)"
                value={expAppreciation}
                onChange={(v) => setExpAppreciation(v)}
                min={-5}
                max={12}
                step={0.25}
              />
              <NumberField
                label="Illustrative Horizon (years)"
                value={horizonYears}
                onChange={(v) => setHorizonYears(Math.max(1, Math.min(15, v)))}
                min={1}
                step={1}
              />
              <SelectField
                label="Resident Story Strength"
                value={storyStrength}
                onChange={(v) => setStoryStrength(v)}
                options={[
                  { label: '1 — Basic', value: 1 },
                  { label: '2 — Ok', value: 2 },
                  { label: '3 — Good', value: 3 },
                  { label: '4 — Strong', value: 4 },
                  { label: '5 — Exceptional', value: 5 },
                ]}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Monthly dividends (total)">
                {fmtCurrency(monthlyDivOutflow)} / mo
              </Stat>
              <Stat label="Suggested occupancy fee (floor)">
                {fmtCurrency(suggestedFeeFloor)} / mo
              </Stat>
              <Stat label="Simple annualized return (illustrative)">
                {isFinite(simpleAnnualYieldPct) ? `${simpleAnnualYieldPct.toFixed(1)}%` : '—'}
              </Stat>
            </div>

            <p className="text-xs text-ink-500 mt-3">
              These figures are simplified illustrations: dividends ≈ raise × monthly %, exit value ≈ equity% × future value.
              Actual terms are dictated by your listing documents and buy-back mechanics.
            </p>
          </Card>
        </div>

        {/* RIGHT: Guidance */}
        <aside className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-ink-900">Investor segments (fit)</h3>
            <div className="mt-3 space-y-3">
              {segments.map((s) => (
                <SegmentRow key={s.key} seg={s} />
              ))}
            </div>

            {redFlags.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-2">
                {redFlags.map((r, i) => (
                  <div key={i}>• {r}</div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-ink-900">Suggestions</h3>
            <ul className="mt-2 text-sm text-ink-800 space-y-2">
              {monthlyDivPct < 0.5 && (
                <li>
                  • Dividend is quite low. Consider nudging it up to appeal to balanced/yield investors—or double down on your story and comps.
                </li>
              )}
              {monthlyDivPct >= 0.5 && monthlyDivPct <= 1.0 && (
                <li>
                  • Solid middle ground. Keep your narrative tight and show realistic comps to convert more balanced investors.
                </li>
              )}
              {monthlyDivPct > 1.0 && (
                <li>
                  • Dividend is high. Make sure your occupancy fee comfortably covers dividends + reserves; be ready to defend sustainability.
                </li>
              )}
              {expAppreciation < 2 && (
                <li>
                  • Low appreciation assumption. Emphasize dividends and renovation scope to attract value-focused investors.
                </li>
              )}
              {expAppreciation >= 2 && expAppreciation <= 5 && (
                <li>• Reasonable growth. Support with comps and a simple improvement plan.</li>
              )}
              {expAppreciation > 5 && (
                <li>
                  • Aggressive growth. Include concrete catalysts (renovations, rezoning, comps) to maintain credibility.
                </li>
              )}
              {storyStrength <= 2 && <li>• Story is light. Add photos, milestones, and community ties to boost appeal.</li>}
              {storyStrength >= 4 && <li>• Strong story—great for impact investors. Use updates and visuals liberally.</li>}
              {equityMismatch && (
                <li>
                  • Align equity % with the raise or valuation to avoid confusing investors.
                </li>
              )}
            </ul>

            <div className="mt-5 flex gap-3">
              <Link href="/resident/create">
                <Button>Apply these ideas to my pitch</Button>
              </Link>
              <Link href="/invest">
                <Button>Preview investor view</Button>
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </Section>
  );
}

/* ----------------- helpers & small components ----------------- */

type Segment = {
  key: string;
  title: string;
  desc: string;
  score: number; // 0–100
  tipsLow: string;
  tipsHigh: string;
};

function SegmentRow({ seg }: { seg: Segment }) {
  const level = seg.score >= 66 ? 'Strong' : seg.score >= 40 ? 'Moderate' : 'Limited';
  const bar = Math.round(seg.score);

  return (
    <div className="rounded-xl border border-ink-200 p-3 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-ink-900">{seg.title}</div>
          <div className="text-xs text-ink-600">{seg.desc}</div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            seg.score >= 66
              ? 'bg-green-100 text-green-800'
              : seg.score >= 40
              ? 'bg-amber-100 text-amber-800'
              : 'bg-ink-100 text-ink-800'
          }`}
        >
          {level}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full bg-brand-500" style={{ width: `${bar}%` }} />
      </div>
      <div className="mt-2 text-xs text-ink-700">
        {seg.score >= 66 ? seg.tipsHigh : seg.tipsLow}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-ink-700">{label}</span>
      <input
        type="number"
        className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </label>
  );
}

function PercentField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-ink-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="w-full"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
        <input
          type="number"
          className="w-24 rounded-2xl border border-ink-200 bg-white px-2 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
        <span className="text-sm text-ink-800">%</span>
      </div>
      {help && <span className="text-xs text-ink-500">{help}</span>}
    </label>
  );
}

function SelectField<T extends number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-ink-700">{label}</span>
      <select
        className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
        value={value as number}
        onChange={(e) => onChange(Number(e.currentTarget.value) as T)}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 p-3 bg-white">
      <div className="text-ink-600 text-sm">{label}</div>
      <div className="text-ink-900 font-medium">{children}</div>
    </div>
  );
}

function fmtCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      Math.round(n)
    );
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const clamped = Math.max(inMin, Math.min(inMax, v));
  const t = (clamped - inMin) / Math.max(1e-9, inMax - inMin);
  return outMin + t * (outMax - outMin);
}
function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}
function safePct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
function weighted(...pairs: [number, number][]) {
  const wsum = pairs.reduce((s, [, w]) => s + w, 0) || 1;
  return pairs.reduce((s, [v, w]) => s + v * (w / wsum), 0);
}
