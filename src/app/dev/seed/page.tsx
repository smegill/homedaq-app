'use client';

import * as React from 'react';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { PitchInput, RiskProfile, PitchStatus } from '@/types/pitch';
import { savePitch, getPitches } from '@/lib/storage';

type Demo = Omit<PitchInput, 'createdAt' | 'updatedAt'> & {
  createdAgoDays?: number;
  riskProfile?: RiskProfile;
  status: PitchStatus;
};

const DEMOS: Demo[] = [
  {
    title: '19103 Duplex — Light Reno & House Hack',
    summary: 'Sunny bi-level duplex near Rittenhouse; add W/D + cosmetic upgrades to lift rents ~12–15%.',
    address1: '2100 Walnut St',
    city: 'Philadelphia',
    state: 'PA',
    postalCode: '19103',
    valuation: 520_000,
    minInvestment: 5_000,
    equityPct: 12,
    fundingGoal: 250_000,
    fundingCommitted: 180_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1560184318-eb2dcd94f19b?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/philadelphia-duplex',
    status: 'live',
    problem: 'High demand for renovated 1BRs near parks; current finishes suppress rent.',
    solution: 'Targeted interior refresh + laundry; maintain long-term leases.',
    plan: '3-week cosmetic reno; adjust rents on turnover; conservative 7% vacancy.',
    useOfFunds: 'CapEx $18k, contingency $5k, closing/fees $3k.',
    exitStrategy: 'Refi at 12 months after stabilized NOI.',
    improvements: 'Paint, LVP, fixtures, in-unit W/D, curb appeal.',
    timeline: 'Close in 30 days; reno 3 weeks; refi @ 12 mo.',
    residentStory: 'Local resident with two prior house-hacks; licensed GC on call.',
    strategyTags: ['House Hack', 'Light Reno', 'LTR'],
    riskProfile: 'Balanced',
    createdAgoDays: 12,
  },
  {
    title: '78704 Bungalow — ADU + STR Mix',
    summary: 'South Austin lot supports a 1BR ADU to unlock STR income alongside LTR main.',
    address1: '1601 S 3rd St',
    city: 'Austin',
    state: 'TX',
    postalCode: '78704',
    valuation: 860_000,
    minInvestment: 10_000,
    equityPct: 16,
    fundingGoal: 400_000,
    fundingCommitted: 220_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/austin-adu',
    status: 'review',
    problem: 'LTR yields are thin in 78704; hybrid STR improves cash-on-cash.',
    solution: 'Build permitted 1BR ADU; STR the ADU, LTR the main.',
    plan: 'Design/permit 3 mo; build 5 mo; furnish ADU.',
    useOfFunds: 'ADU build $175k, FF&E $12k, reserves $10k.',
    exitStrategy: 'Refi post-ADU appraisal; hold 5–7 yrs.',
    improvements: 'ADU, landscaping, privacy fencing.',
    timeline: '8 months to stabilized income.',
    residentStory: 'Austin-based designer/PM with two prior ADUs delivered.',
    strategyTags: ['ADU', 'STR', 'Hybrid'],
    riskProfile: 'Growth',
    createdAgoDays: 6,
  },
  {
    title: '94110 TIC Flat — Value-Add Condo Map',
    summary: 'Mission District TIC with path to condo map; targeted kitchen/bath uplift.',
    address1: '24th St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94110',
    valuation: 1_050_000,
    minInvestment: 25_000,
    equityPct: 18,
    fundingGoal: 500_000,
    fundingCommitted: 500_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1475855581698-7e28d5a1e53b?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/sf-tic',
    status: 'live',
    problem: 'Underutilized TIC pricing vs. mapped condo comps.',
    solution: 'Cosmetic uplift + legal process to condo map increases exit value.',
    plan: 'Hire land-use counsel; parallel reno of kitchen/bath.',
    useOfFunds: 'Legal $30k, CapEx $45k, contingency $15k.',
    exitStrategy: 'Sell unit post-mapping (12–18 mo) or refi.',
    improvements: 'Kitchen, bath, flooring, paint.',
    timeline: '12–18 months.',
    residentStory: 'Longtime Mission resident with prior condo map experience.',
    strategyTags: ['Value-Add', 'Condo Map'],
    riskProfile: 'Growth',
    createdAgoDays: 20,
  },
  {
    title: '30306 Quad — Stabilize & Refi',
    summary: 'Virginia-Highland quadplex with two down units; stabilize to market rents.',
    address1: 'Highland Ave',
    city: 'Atlanta',
    state: 'GA',
    postalCode: '30306',
    valuation: 780_000,
    minInvestment: 7_500,
    equityPct: 14,
    fundingGoal: 300_000,
    fundingCommitted: 145_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1560448075-bb4caa6c8e1b?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/atl-quad',
    status: 'live',
    problem: 'Operational underperformance; deferred maintenance keeps units dark.',
    solution: 'Turn two units, add laundry, standardize finishes.',
    plan: '60 days to stabilize; professional PM in place.',
    useOfFunds: 'Turns $28k, capex $22k, reserves $10k.',
    exitStrategy: 'Refi at DSCR > 1.3x; hold.',
    improvements: 'Appliances, baths, LVP, exterior clean-up.',
    timeline: '2–3 months.',
    residentStory: 'ATL-based operator with 11 units under management.',
    strategyTags: ['Yield', 'Stabilization', 'LTR'],
    riskProfile: 'Yield',
    createdAgoDays: 3,
  },
  {
    title: '80205 Townhome — BRRRR Lite',
    summary: 'Cole neighborhood townhome; cosmetic reno to comps, refinance at 9–12 months.',
    address1: 'Williams St',
    city: 'Denver',
    state: 'CO',
    postalCode: '80205',
    valuation: 565_000,
    minInvestment: 5_000,
    equityPct: 10,
    fundingGoal: 220_000,
    fundingCommitted: 60_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/denver-brrrr',
    status: 'review',
    problem: 'Outdated finishes keep ARV suppressed vs. nearby comps.',
    solution: 'Light reno to reach ARV; conservative rent assumptions.',
    plan: '4-week turn, refi in 9–12 months.',
    useOfFunds: 'CapEx $22k, reserves $6k.',
    exitStrategy: 'Refi & hold 3–5 yrs.',
    improvements: 'Paint, fixtures, flooring, curb appeal.',
    timeline: '~1 month reno.',
    residentStory: 'Local owner-operator with strong trades bench.',
    strategyTags: ['BRRRR', 'Light Reno', 'LTR'],
    riskProfile: 'Balanced',
    createdAgoDays: 9,
  },
  {
    title: '33139 Condo — STR-Ready Refresh',
    summary: 'South Beach 1BR; HOA allows 30-day rentals; furnishings + paint to elevate ADR.',
    address1: 'Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    postalCode: '33139',
    valuation: 490_000,
    minInvestment: 5_000,
    equityPct: 12,
    fundingGoal: 120_000,
    fundingCommitted: 90_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1599427303058-f04f0f5c3115?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/miami-adr',
    status: 'live',
    problem: 'Units in building under-furnished; ADR below comps.',
    solution: 'Design-forward FF&E + pro photography to boost ADR/occupancy.',
    plan: '2-week refresh; data-driven pricing via PMS.',
    useOfFunds: 'FF&E $8k, reserves $5k.',
    exitStrategy: 'Hold; evaluate sale in 3 yrs.',
    improvements: 'Paint, lighting, soft goods, art.',
    timeline: '2 weeks.',
    residentStory: 'Hospitality pro moving from LTR to STR.',
    strategyTags: ['STR', 'Design'],
    riskProfile: 'Yield',
    createdAgoDays: 1,
  },
  {
    title: '48202 Single-Family — Keep the Family Home (Buy-Back)',
    summary: 'Detroit brick colonial needs roof + mechanicals. Resident wants aligned capital to complete repairs and avoid a forced sale.',
    address1: 'Chicago Blvd',
    city: 'Detroit',
    state: 'MI',
    postalCode: '48202',
    valuation: 185_000,
    minInvestment: 2_500,
    equityPct: 15,
    fundingGoal: 60_000,
    fundingCommitted: 25_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/detroit-keep-home',
    status: 'live',
    problem: 'Storm damage and a surprise furnace failure created an unaffordable repair bill.',
    solution: 'Repair roof/HVAC now; stabilize; resident to buy back investor shares over time.',
    plan: 'Licensed roofer + HVAC in month 1; minor interior in month 2.',
    useOfFunds: 'Roof $12k, HVAC $6k, contingency $3k.',
    exitStrategy: 'Resident Share Buy-Back: quarterly repurchases at appraised value band until 100% owned.',
    improvements: 'Roof, HVAC, patch/paint, safety items.',
    timeline: '6–8 weeks.',
    residentStory: 'Single parent, steady healthcare job; medical bills after a family emergency forced triage. Determined to keep the home where kids attend school.',
    strategyTags: ['Buy-Back', 'Stabilization'],
    riskProfile: 'Balanced',
    createdAgoDays: 2,
  },
  {
    title: '07032 Cape — Widow’s Rehab & Buy-Back Path',
    summary: 'Kearny NJ cape-cod with deferred maintenance after spouse’s passing; light rehab to preserve equity and remain in community.',
    address1: 'Midland Ave',
    city: 'Kearny',
    state: 'NJ',
    postalCode: '07032',
    valuation: 395_000,
    minInvestment: 3_500,
    equityPct: 12,
    fundingGoal: 80_000,
    fundingCommitted: 64_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/kearny-buyback',
    status: 'review',
    problem: 'Loss of primary earner paused upkeep; leaking windows + tired kitchen reduce value.',
    solution: 'Repair envelope, refresh kitchen; set aside reserve. Resident intends to repurchase investor shares steadily.',
    plan: 'Windows week 1; kitchen paint/fixtures week 2–3; reserve funded.',
    useOfFunds: 'Windows $9k, kitchen $6k, reserve $5k.',
    exitStrategy: 'Resident Share Buy-Back within 24–36 months contingent on appraisal and DTI.',
    improvements: 'Windows, sealing, paint, fixtures.',
    timeline: '3–4 weeks.',
    residentStory: 'Recently widowed; wants to stay near church and support network.',
    strategyTags: ['Buy-Back', 'Light Reno'],
    riskProfile: 'Yield',
    createdAgoDays: 5,
  },
  {
    title: '85008 Ranch — 90-Day Cosmetic Flip',
    summary: 'Phoenix brick ranch w/ great bones; kitchens/baths + landscaping for quick resale.',
    address1: 'E Oak St',
    city: 'Phoenix',
    state: 'AZ',
    postalCode: '85008',
    valuation: 415_000,
    minInvestment: 7_500,
    equityPct: 20,
    fundingGoal: 150_000,
    fundingCommitted: 75_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/phx-flip',
    status: 'live',
    problem: 'Dated surfaces and barren curb appeal keep DOM elevated.',
    solution: 'Cosmetic flip: cabinets, counters, fixtures, turf/rock.',
    plan: '6 weeks work; list immediately after.',
    useOfFunds: 'CapEx $28k, staging $4k, carry $6k.',
    exitStrategy: 'Sell upon completion (target day 75–90).',
    improvements: 'Kitchen, both baths, landscaping, paint.',
    timeline: '6–8 weeks.',
    residentStory: 'Local carpenter with three prior flips, looking to scale responsibly.',
    strategyTags: ['Flip', 'Cosmetic'],
    riskProfile: 'Growth',
    createdAgoDays: 7,
  },
  {
    title: '60639 Bungalow — Value-Add Flip',
    summary: 'Chicago brick bungalow; open up main floor + finish attic for extra bedroom; resale play.',
    address1: 'N Central Park Ave',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60639',
    valuation: 365_000,
    minInvestment: 10_000,
    equityPct: 22,
    fundingGoal: 220_000,
    fundingCommitted: 40_000,
    heroImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop',
    offeringUrl: 'https://example.com/raise/chicago-flip',
    status: 'review',
    problem: 'Choppy floorplan and outdated systems hide ARV potential.',
    solution: 'Reframe living/kitchen, update electrical, finish attic as 3rd BR.',
    plan: 'Permit 3–4 weeks; 10–12 weeks build; list.',
    useOfFunds: 'CapEx $75k, contingency $10k, carry $8k.',
    exitStrategy: 'Sell at ARV; investor return on sale.',
    improvements: 'Layout rework, electrical, kitchen/bath, attic finish.',
    timeline: '14–16 weeks total.',
    residentStory: 'Resident GC, ex-union electrician, strong subs.',
    strategyTags: ['Flip', 'Value-Add'],
    riskProfile: 'Growth',
    createdAgoDays: 11,
  },
];

function daysAgo(n: number): number {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.getTime();
}

export default function SeedPage() {
  const [count, setCount] = React.useState<number>(0);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [done, setDone] = React.useState<boolean>(false);

  React.useEffect(() => {
    setCount(getPitches().length);
  }, []);

  async function seed() {
    setBusy(true);
    for (const demo of DEMOS) {
      const { createdAgoDays, ...rest } = demo;
      const base: PitchInput = {
        ...rest,
        createdAt: createdAgoDays != null ? daysAgo(createdAgoDays) : Date.now(),
        updatedAt: Date.now(),
      };
      // eslint-disable-next-line no-await-in-loop
      await savePitch(base);
    }
    const total = getPitches().length;
    setCount(total);
    setBusy(false);
    setDone(true);
  }

  function clearAll() {
    try {
      window.localStorage.removeItem('homedaq:pitches:v1');
    } catch {}
    window.location.reload();
  }

  return (
    <Section className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Seed Demo Listings (Dev)</h1>
      <Card>
        <CardBody className="space-y-4">
          <p className="text-sm text-ink-700">
            Adds curated demo pitches (with funding progress) to <span className="font-medium">local browser storage</span>.
          </p>

          <div className="flex items-center gap-3">
            <Button onClick={seed} disabled={busy}>
              {busy ? 'Seeding…' : `Seed ${DEMOS.length} Demo Listings`}
            </Button>
            <Button variant="secondary" onClick={clearAll} disabled={busy}>
              Clear All Listings
            </Button>
          </div>

          <div className="text-sm text-ink-700">
            Current listings in your browser: <span className="font-medium">{count}</span>
            {done ? <span className="ml-2 text-green-700">✓ Seed complete</span> : null}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a href="/invest" className="underline text-ink-900">Go to Investor Browse</a>
            <a href="/resident/dashboard" className="underline text-ink-900">Go to Resident Dashboard</a>
          </div>
        </CardBody>
      </Card>
      <p className="text-xs text-ink-500">Tip: click “Clear All Listings” before reseeding to avoid duplicates.</p>
      <p className="text-xs text-ink-500">Remember to remove this route before production.</p>
    </Section>
  );
}
