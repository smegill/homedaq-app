import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function InvestorsPage() {
  return (
    <>
      {/* HERO */}
      <Section className="max-w-5xl mx-auto py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900">Invest in homes without being a landlord</h1>
          <p className="mt-3 text-ink-700">
            With HomeDAQ, you own Units in a property-specific LLC. You receive monthly dividends (from occupancy fees)
            and share in appreciation when the resident buys you out or the home is sold. HomeDAQ handles administration
            and disputes so you can remain passive.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/invest"><Button>Browse Listings</Button></Link>
            <Link href="/how-it-works"><Button>How it Works</Button></Link>
          </div>
        </div>
      </Section>

      {/* RETURN PROFILE */}
      <Section className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">What you earn</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-3">
            <Item title="Dividends">
              Paid monthly from the property’s occupancy fee (after reserves/expenses per the waterfall).
            </Item>
            <Item title="Appreciation share">
              When the resident buys back Units or the home sells, you participate in upside via the cap table.
            </Item>
            <Item title="Aligned incentives">
              Residents benefit from a lower monthly cost and future buy-backs; investors benefit from steady yield and upside.
            </Item>
          </div>
        </Card>
      </Section>

      {/* RISK & PROTECTIONS */}
      <Section className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">Risks & protections</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-3">
            <Item title="Admin & step-in (HomeDAQ)">
              HomeDAQ issues notices, mediates issues, appoints property managers if needed, and coordinates refi/sale.
            </Item>
            <Item title="Reserves & reporting">
              Clear reserve policy, quarterly updates, and annual tax packages (Property-LLC K-1s).
            </Item>
            <Item title="Protective votes">
              Extraordinary actions (e.g., forced sale) require defined investor thresholds—organized by HomeDAQ.
            </Item>
          </div>
          <p className="mt-4 text-sm text-ink-700">
            As with any real estate investment, values can go down, timelines can slip, and liquidity is limited.
            Review each listing’s documents for exact terms.
          </p>
        </Card>
      </Section>

      {/* BUILT TO WORK IN ANY RATE ENVIRONMENT */}
      <Section className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">Works even when rates fall</h2>
          <p className="mt-2 text-ink-700">
            Returns are not simply “bank rate + spread.” The occupancy fee and appreciation share flex together to target
            an attractive outcome. In strong appreciation markets, fee yields can be lighter; in flat markets, fee yields
            carry more weight. Either way, the resident’s cost aims to remain competitive with a mortgage.
          </p>
        </Card>
      </Section>

      {/* DEFENSIBILITY */}
      <Section className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">Why HomeDAQ is defensible</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-3">
            <Item title="Patent-pending fee engine" />
            <Item title="Trade-secret underwriting & matching" />
            <Item title="Brand & data moat from executed deals" />
          </div>
        </Card>
      </Section>

      <Section className="max-w-5xl mx-auto py-10 text-center">
        <Link href="/invest"><Button>See Active Listings</Button></Link>
        <p className="mt-4 text-xs text-ink-500">
          Not investment, tax, or legal advice. Terms vary by listing; see offering documents.
        </p>
      </Section>
    </>
  );
}

function Item({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 bg-white">
      <div className="font-semibold text-ink-900">{title}</div>
      {children && <div className="mt-1 text-ink-800 text-sm">{children}</div>}
    </div>
  );
}
