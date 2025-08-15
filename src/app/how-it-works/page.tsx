import Section from '@/components/ui/Section';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HowItWorks() {
  return (
    <main className="space-y-12">
      <Section className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-semibold text-ink-900">How HomeDAQ Works</h1>
        <p className="mt-3 text-zinc-700">
          HomeDAQ matches resident pitches with investors using a <strong>Shared-Appreciation Agreement</strong> (SEA).
          Investors provide funds today. At exit (sale, refinance, or buyback), they receive their principal plus an
          agreed <strong>share of appreciation</strong> above an independent reference valuation.
        </p>
      </Section>

      <Section className="max-w-5xl mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <Card t="1) Create a pitch" d="Residents describe the property, plan, and funding need. Our builder computes simple scenarios." />
          <Card t="2) Go live" d="Listings show AppShare %, horizon, buyback option, and transparent match signals." />
          <Card t="3) Exit" d="At sale/refi/buyback, investors receive principal + SEA % of appreciation above the reference valuation." />
        </div>
      </Section>

      <Section className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-ink-900">Why no monthly payments?</h2>
        <p className="mt-2 text-zinc-700">
          SEA is equity, not debt. That means residents aren’t required to make monthly payments. Investors are aligned
          with long-term value—like equity in a startup—rather than collecting interest like a lender.
        </p>
      </Section>

      <Section className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-ink-900">Investor motivations</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 space-y-1">
          <li><strong>Growth exposure</strong>: directional bet on local appreciation and value-add plans.</li>
          <li><strong>Diversification</strong>: small tickets across ZIPs/projects; low correlation vs. public equities.</li>
          <li><strong>Impact</strong>: back residents directly; enable repairs, buybacks, and community stability.</li>
          <li><strong>Optional income</strong>: in select rental/flip deals, distributions may exist (advanced only).</li>
          <li><strong>Future liquidity</strong> (roadmap): potential secondary transfers of positions.</li>
        </ul>
      </Section>

      <Section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="flex gap-3">
          <Link href="/resident/create">
            <Button>Start a Pitch</Button>
          </Link>
          <Link href="/invest">
            <Button variant="secondary">Browse Pitches</Button>
          </Link>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          HomeDAQ does not custody funds. Final investment documents and funding are completed off-platform via a linked provider.
        </p>
      </Section>
    </main>
  );
}

function Card({ t, d }: { t: string; d: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-medium text-ink-900">{t}</div>
      <div className="mt-1 text-zinc-700">{d}</div>
    </div>
  );
}
