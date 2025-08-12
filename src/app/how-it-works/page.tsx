import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HowItWorksPage() {
  return (
    <>
      {/* HERO */}
      <Section className="max-w-5xl mx-auto py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900">
            Skip the bank. Build equity together.
          </h1>
        </div>
        <p className="mt-4 text-center text-ink-700 max-w-3xl mx-auto">
          HomeDAQ lets homebuyers and investors co-own a property through a dedicated LLC.
          The resident pays an <span className="font-semibold">occupancy fee</span> (instead of interest),
          and investors receive <span className="font-semibold">monthly dividends</span> plus a share of appreciation
          at buy-out or sale. It’s built to stay attractive if interest rates fall, and to be cheaper
          than a mortgage for many residents.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/resident/create"><Button>Start a Pitch</Button></Link>
          <Link href="/invest"><Button>Browse Listings</Button></Link>
        </div>
      </Section>

      {/* 1. The structure */}
      <Section className="max-w-5xl mx-auto py-6" id="structure">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">1) Each home sits in its own LLC</h2>
          <p className="mt-2 text-ink-700">
            For every listing, a <strong>Property LLC</strong> is formed. The LLC holds title to the home and
            issues Units to <strong>Investors</strong> (passive) and the <strong>Resident</strong> (active occupant).
            <strong> HomeDAQ</strong> serves as the Administrative Manager—handling formation, escrow, cap table,
            notices, and step-in actions—so investors can stay passive.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Point title="Resident">
              Lives in and maintains the home. Pays an occupancy fee and can buy back Investor Units over time.
            </Point>
            <Point title="Investors">
              Hold LLC Units, receive monthly dividends, and participate in appreciation upon sale or buy-out.
            </Point>
            <Point title="HomeDAQ (Admin)">
              Forms the LLC, runs closing, tracks covenants, mediates disputes, and coordinates exits.
            </Point>
          </div>
        </Card>
      </Section>

      {/* 2. Pricing variables */}
      <Section className="max-w-5xl mx-auto py-6" id="pricing">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">2) What drives price & returns</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-3">
            <ChipCard title="Occupancy fee %">
              The resident’s monthly fee to the LLC. Tuned so it’s <strong>lower than typical mortgage cost</strong>
              for the same home, yet high enough to deliver steady investor dividends.
            </ChipCard>
            <ChipCard title="Expected appreciation">
              Local comps + house condition + time horizon. Higher appreciation potential can allow a <strong>lower</strong> fee
              while still meeting investor return targets (investors share upside at exit).
            </ChipCard>
            <ChipCard title="Resident story">
              Stability, plan, and community ties. Strong narratives and transparent plans can <strong>improve terms</strong>
              by reducing perceived risk and boosting investor demand.
            </ChipCard>
          </div>

          <div className="mt-4 rounded-2xl border border-ink-200 p-4 bg-ink-50 text-sm text-ink-800">
            <strong>Why it still works if rates drop:</strong> fees aren’t pegged to bank rates. Dividends (fee yield)
            and appreciation share flex together to hit investor targets. When appreciation potential is strong,
            the fee can be lighter; when it’s modest, the fee carries more of the return—keeping resident costs
            competitive in both environments.
          </div>
        </Card>
      </Section>

      {/* 3. Why residents prefer it */}
      <Section className="max-w-5xl mx-auto py-6" id="residents">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">3) Why it’s better than a mortgage (for many)</h2>
          <div className="grid gap-4 sm:grid-cols-2 mt-3">
            <Benefit title="Lower monthly cost">
              No amortizing interest + flexible fee design. Many residents see <strong>lower monthly outlay</strong>
              than a comparable mortgage.
            </Benefit>
            <Benefit title="Faster path to ownership">
              Buy back Investor Units on your schedule. Improvements and sweat equity can lift value and reduce the
              overall cost of capital.
            </Benefit>
            <Benefit title="Less gatekeeping">
              Credit quirks or self-employed? Investors fund a plan—not a FICO box. HomeDAQ keeps underwriting transparent.
            </Benefit>
            <Benefit title="Aligned incentives">
              Everyone wins when the home is well-kept and appreciated. That alignment is baked into the LLC.
            </Benefit>
          </div>
        </Card>
      </Section>

      {/* 4. Why investors like it */}
      <Section className="max-w-5xl mx-auto py-6" id="investors">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">4) Why investors like it</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-3">
            <Benefit title="Monthly dividends">
              Occupancy fees flow through as dividends. Clear reporting and reserves policy managed by HomeDAQ.
            </Benefit>
            <Benefit title="Upside participation">
              At resident buy-out or sale, investors share in appreciation per the cap table and agreements.
            </Benefit>
            <Benefit title="Truly passive">
              HomeDAQ handles administration, notices, mediation, and step-in—<strong>no investor herding</strong> needed.
            </Benefit>
          </div>
        </Card>
      </Section>

      {/* 5. Defensibility & trust */}
      <Section className="max-w-5xl mx-auto py-6" id="moat">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">5) Why HomeDAQ is defensible</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-3">
            <Moat title="Patent-pending engine">
              Utility-patent filing planned around our automated fee/dividend and LLC-formation workflow.
            </Moat>
            <Moat title="Brand & design">
              “HomeDAQ” name, logo and distinct UI—protected by trademark and copyright.
            </Moat>
            <Moat title="Data + process secrets">
              Pricing, underwriting and investor-matching logic are kept as trade secrets; contracts prohibit reverse-engineering.
            </Moat>
          </div>
          <p className="mt-4 text-sm text-ink-700">
            Over time, executed deals, on-time buy-backs, and performance data create a <strong>trust & data moat</strong>
            that’s hard to copy.
          </p>
        </Card>
      </Section>

      {/* CTA */}
      <Section className="max-w-5xl mx-auto py-10 text-center">
        <div className="inline-flex flex-wrap gap-3">
          <Link href="/resident/create"><Button>Start a Pitch</Button></Link>
          <Link href="/invest"><Button>Invest in a Listing</Button></Link>
          <Link href="/legal"><Button>Legal & Structure</Button></Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Not investment, tax, or legal advice. Terms vary by listing; see actual offering documents.
        </p>
      </Section>
    </>
  );
}

/* tiny helpers */
function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 bg-white">
      <div className="font-semibold text-ink-900">{title}</div>
      <div className="mt-1 text-ink-800 text-sm">{children}</div>
    </div>
  );
}
function Benefit({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 bg-white">
      <div className="font-semibold text-ink-900">{title}</div>
      <div className="mt-1 text-ink-800 text-sm">{children}</div>
    </div>
  );
}
function ChipCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 bg-white">
      <span className="inline-flex items-center rounded-full bg-ink-100 text-ink-800 text-xs px-2 py-1">{title}</span>
      <div className="mt-2 text-ink-800 text-sm">{children}</div>
    </div>
  );
}
function Moat({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 bg-white">
      <div className="font-semibold text-ink-900">{title}</div>
      <div className="mt-1 text-ink-800 text-sm">{children}</div>
    </div>
  );
}
