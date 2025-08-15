import Section from '@/components/ui/Section';

export default function InvestorsInfo() {
  return (
    <main className="space-y-12">
      <Section className="max-w-4xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-semibold text-ink-900">For Investors</h1>
        <p className="mt-3 text-zinc-700">
          HomeDAQ lists pitches that use Shared-Appreciation Agreements. You provide funds now; at exit you receive your
          principal plus a contracted share of appreciation above a reference valuation.
        </p>
      </Section>

      <Section className="max-w-5xl mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <Card h="Growth" d="Higher AppShare %, longer horizons, value-add potential." />
          <Card h="Balanced" d="Moderate share with resident buyback allowed for aligned outcomes." />
          <Card h="Impact" d="Lower share / capped upside; back people and places you care about." />
        </div>
      </Section>

      <Section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold text-ink-900">What to look for</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 space-y-1">
          <li>Reference valuation quality (appraisal vs AVM)</li>
          <li>Funding goal vs RV (raise cushion)</li>
          <li>Horizon alignment with local market trend</li>
          <li>Clarity of plan: improvements, budget, exit strategy</li>
          <li>Buyback policy (if resident intends to own over time)</li>
        </ul>
      </Section>
    </main>
  );
}

function Card({ h, d }: { h: string; d: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-medium text-ink-900">{h}</div>
      <div className="mt-1 text-zinc-700">{d}</div>
    </div>
  );
}
