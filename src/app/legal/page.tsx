import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LegalPage() {
  return (
    <>
      {/* HERO */}
      <Section className="max-w-5xl mx-auto py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900">
            Legal & Structure — with HomeDAQ as Administrative Manager
          </h1>
          <p className="mt-3 text-ink-700">
            HomeDAQ listings are designed so investors can be truly passive. Each property sits in its
            own LLC, and <span className="font-semibold">HomeDAQ serves as the Administrative Manager</span>—the neutral
            administrator and mediator who handles notices, disputes, step-in actions, reporting, and
            closing logistics. Residents run the home; investors hold economic interests; HomeDAQ keeps
            the system fair, documented, and moving.
          </p>
          <p className="mt-2 text-ink-500 text-sm">
            This is an informational overview, not legal, tax, or investment advice. Each listing’s binding
            terms are the actual offering documents.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/invest"><Button>Browse Listings</Button></Link>
            <Link href="/resident/create"><Button>Start a Pitch</Button></Link>
          </div>
        </div>
      </Section>

      {/* QUICK SUMMARY */}
      <Section className="max-w-5xl mx-auto py-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">Quick summary</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-3 list-disc list-inside text-ink-800">
            <li>Each property is held in a dedicated <span className="font-medium">Property LLC</span>.</li>
            <li><span className="font-medium">HomeDAQ</span> is the <span className="font-medium">Administrative Manager</span> of the LLC.</li>
            <li>The <span className="font-medium">Resident</span> manages day-to-day use via a Use/Occupancy Agreement.</li>
            <li><span className="font-medium">Investors</span> are passive Members (economic rights + limited protective votes).</li>
            <li>HomeDAQ handles formation, escrow, cap table, reporting, notices, and dispute mediation.</li>
            <li>On issues (missed buy-backs, delinquent taxes, abandonment), HomeDAQ initiates the remedy ladder.</li>
          </ul>
        </Card>
      </Section>

      {/* TOC */}
      <Section className="max-w-5xl mx-auto py-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">What’s on this page</h2>
          <ol className="mt-3 grid sm:grid-cols-2 gap-2 text-ink-800 list-decimal list-inside">
            <li><a className="text-brand-700 hover:underline" href="#structure">Entity structure</a></li>
            <li><a className="text-brand-700 hover:underline" href="#role">HomeDAQ’s administrative role</a></li>
            <li><a className="text-brand-700 hover:underline" href="#formation">Formation & closing flow</a></li>
            <li><a className="text-brand-700 hover:underline" href="#agreements">Key agreements</a></li>
            <li><a className="text-brand-700 hover:underline" href="#waterfall">Money flows & waterfall</a></li>
            <li><a className="text-brand-700 hover:underline" href="#liquidity">Investor liquidity (passive)</a></li>
            <li><a className="text-brand-700 hover:underline" href="#duties">Resident duties</a></li>
            <li><a className="text-brand-700 hover:underline" href="#defaults">Defaults, abandonment & remedies</a></li>
            <li><a className="text-brand-700 hover:underline" href="#reporting">Reporting & tax</a></li>
            <li><a className="text-brand-700 hover:underline" href="#compliance">Securities & compliance</a></li>
          </ol>
        </Card>
      </Section>

      {/* STRUCTURE */}
      <Section id="structure" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">1) Entity structure</h2>
          <p className="mt-2 text-ink-700">
            Every listing uses a standalone limited liability company (“<span className="font-medium">Property LLC</span>”) that
            owns the home. The LLC issues Units to investors and to the Resident (or a Resident HoldCo).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Classes & roles</h3>
              <ul className="mt-2 space-y-2 text-ink-800">
                <li><strong>Class A — Investor Units:</strong> passive economic interests with limited protective votes.</li>
                <li><strong>Class B — Resident Units:</strong> the Resident’s stake; aligns incentives with upkeep and improvements.</li>
                <li><strong>Administrative Manager — HomeDAQ:</strong> neutral administrator with clearly defined powers to
                    form, close, notice, mediate, step-in, and coordinate exits on behalf of the LLC.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Why investors can stay passive</h3>
              <ul className="mt-2 space-y-2 text-ink-800">
                <li>HomeDAQ handles documentation, escrow, cap table, and compliance.</li>
                <li>HomeDAQ monitors covenants (taxes, insurance, buy-back schedule) and issues notices.</li>
                <li>On problems, HomeDAQ runs the remedy playbook without requiring investor herding.</li>
              </ul>
            </div>
          </div>
        </Card>
      </Section>

      {/* HOMEDAQ ROLE */}
      <Section id="role" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">2) HomeDAQ’s administrative role</h2>
          <p className="mt-2 text-ink-700">
            The Operating Agreement appoints <span className="font-semibold">HomeDAQ as Administrative Manager</span> with a
            limited, enumerated mandate to keep the Property LLC on track. Key authorities include:
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Core administration</h3>
              <ul className="mt-2 space-y-2 text-ink-800">
                <li>LLC formation, EIN, bank/escrow coordination, and closing mechanics.</li>
                <li>Cap table & unit issuances; maintaining Member registers and docs.</li>
                <li>Quarterly update collection; annual tax package coordination.</li>
                <li>Tracking the buy-back schedule and collecting payments.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Notices, mediation, and step-in</h3>
              <ul className="mt-2 space-y-2 text-ink-800">
                <li>Issue formal notices (late buy-back, lapsed insurance, tax delinquency).</li>
                <li>Mediate disputes between Resident and LLC; document cures and amendments.</li>
                <li>On default, appoint property management or vendors to secure/maintain the asset.</li>
                <li>Coordinate refinance or sale when required; run the distribution waterfall.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-ink-700 text-sm">
            Certain extraordinary actions (e.g., a sale outside pre-agreed triggers) still require an
            Investor protective vote. HomeDAQ organizes and records those votes but keeps the process
            friction-light for Members.
          </p>
        </Card>
      </Section>

      {/* FORMATION & CLOSING */}
      <Section id="formation" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">3) Formation & closing flow</h2>
          <ol className="mt-3 space-y-3 text-ink-800 list-decimal list-inside">
            <li><strong>Pitch & diligence.</strong> Resident drafts a pitch; HomeDAQ runs KYB/KYC/AML,
              verifies disclosures, and drafts a Property LLC Operating Agreement.</li>
            <li><strong>LLC creation.</strong> HomeDAQ files the LLC (often DE or property state), gets EIN,
              and opens project banking (escrow + operating).</li>
            <li><strong>Offering package.</strong> Subscription docs, Buy-Back Agreement, and Use/Occupancy Agreement
              are generated for e-signature; HomeDAQ acts as subscription/escrow administrator.</li>
            <li><strong>Raise window.</strong> Investors subscribe; funds are held in escrow until the minimum is met.</li>
            <li><strong>Closing.</strong> HomeDAQ accepts subscriptions, releases funds to the LLC, issues Units,
              and countersigns all ancillary agreements.</li>
            <li><strong>Operations.</strong> Resident manages the home; HomeDAQ tracks covenants and timelines,
              collects updates, and manages buy-back execution.</li>
          </ol>
        </Card>
      </Section>

      {/* KEY AGREEMENTS */}
      <Section id="agreements" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">4) Key agreements</h2>
          <div className="mt-4 space-y-5">
            <Agreement
              title="Operating Agreement (Property LLC)"
              points={[
                'Appoints HomeDAQ as Administrative Manager with defined administrative and step-in powers.',
                'Creates Investor and Resident Unit classes; sets protective vote thresholds.',
                'Defines distributions, reserve policy, reporting cadence, and default/step-in process.',
              ]}
            />
            <Agreement
              title="Subscription Agreement + Risk Disclosure"
              points={[
                'Investors subscribe to purchase Investor Units; funds held in escrow until the minimum.',
                'Includes transfer restrictions, ROFR, and acknowledgments of property and liquidity risk.',
                'HomeDAQ administers acceptance, cap table entries, and unit receipts.',
              ]}
            />
            <Agreement
              title="Buy-Back Agreement (Resident ↔ LLC)"
              points={[
                'Schedules periodic repurchases by the Resident (or via refinance/sale proceeds).',
                'Repurchase price via fixed table, CPI-indexed curve, appraisal formula, or “next financing” reference.',
                'HomeDAQ tracks, invoices, and applies payments; handles deferrals and catch-ups per terms.',
              ]}
            />
            <Agreement
              title="Use & Occupancy Agreement"
              points={[
                'Resident occupies and maintains; Property LLC (through HomeDAQ) retains owner oversight.',
                'Covenants: taxes/insurance current, reasonable maintenance, inspection on notice.',
                'Breach and cure timelines administered by HomeDAQ.',
              ]}
            />
            <Agreement
              title="Administrative Services Terms"
              points={[
                'Defines HomeDAQ’s fee schedule (formation, closing, ongoing admin) and cost pass-throughs.',
                'Clarifies neutrality and duty to the LLC; documents record-keeping and audit rights.',
              ]}
            />
          </div>
        </Card>
      </Section>

      {/* MONEY FLOWS & WATERFALL */}
      <Section id="waterfall" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">5) Money flows & waterfall</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Use of proceeds</h3>
              <ul className="mt-2 space-y-2 text-ink-800">
                <li>Renovations, repairs, or down-payment support per the pitch and budget.</li>
                <li>Reserves for taxes/insurance and contingencies (monitored by HomeDAQ).</li>
                <li>Platform/closing/admin fees disclosed in the listing.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Typical waterfall</h3>
              <ol className="mt-2 space-y-2 text-ink-800 list-decimal list-inside">
                <li>Operating expenses & required reserves.</li>
                <li>Scheduled buy-back payments due this period.</li>
                <li>Preferred return (if any) to Investor Units.</li>
                <li>Remainder per Unit economics or agreed split.</li>
              </ol>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-ink-200 p-4 bg-ink-50">
            <h3 className="font-semibold text-ink-900">Exit coordination (HomeDAQ-led)</h3>
            <ul className="mt-2 space-y-2 text-ink-800">
              <li><strong>Buy-backs:</strong> invoicing, receipt, cap table updates executed by HomeDAQ.</li>
              <li><strong>Refinance:</strong> HomeDAQ organizes payoff letters and distributions at closing.</li>
              <li><strong>Sale:</strong> if triggered/approved, HomeDAQ manages broker engagement and closing, then runs the waterfall.</li>
            </ul>
          </div>
        </Card>
      </Section>

      {/* INVESTOR LIQUIDITY */}
      <Section id="liquidity" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">6) Investor liquidity (passive by design)</h2>
        <ul className="mt-2 space-y-2 text-ink-800">
            <li><strong>Scheduled buy-backs:</strong> primary path; HomeDAQ administers pricing, notices, and settlement.</li>
            <li><strong>Exit events:</strong> refinance or sale coordinated by HomeDAQ; net proceeds flow through the waterfall.</li>
            <li><strong>Secondary transfers:</strong> if enabled, HomeDAQ handles ROFR/consent, KYC/AML, and registry updates.</li>
          </ul>
        </Card>
      </Section>

      {/* RESIDENT DUTIES */}
      <Section id="duties" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">7) Resident duties</h2>
          <ul className="mt-2 space-y-2 text-ink-800">
            <li>Keep taxes/insurance current; name the LLC as additional insured/mortgagee where applicable.</li>
            <li>Maintain the property; complete agreed scope on time and budget (variances require notice/approval).</li>
            <li>Provide quarterly updates; respond to information requests.</li>
            <li>Make scheduled buy-back payments or request permitted deferral per the Buy-Back Agreement.</li>
            <li>Do not transfer or encumber the property/Units except as permitted.</li>
          </ul>
        </Card>
      </Section>

      {/* DEFAULTS & ABANDONMENT */}
      <Section id="defaults" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">8) Defaults, abandonment & remedies (HomeDAQ-managed)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">Typical default triggers</h3>
              <ul className="mt-2 space-y-2 text-ink-800">
                <li>Buy-back payment missed beyond grace period.</li>
                <li>Taxes/insurance delinquent or coverage lapsed.</li>
                <li>Refusal to provide updates/financials after notice.</li>
                <li>Unauthorized transfer or encumbrance.</li>
                <li><strong>Abandonment:</strong> sustained vacancy, utilities cut, no communication.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-ink-200 p-4 bg-white">
              <h3 className="font-semibold text-ink-900">HomeDAQ remedy ladder</h3>
              <ol className="mt-2 space-y-2 text-ink-800 list-decimal list-inside">
                <li><strong>Notice & cure:</strong> HomeDAQ issues formal notice with cure window.</li>
                <li><strong>Mediation:</strong> HomeDAQ facilitates a written, time-bound plan to cure (deferrals, catch-ups, scope trims).</li>
                <li><strong>Step-in management:</strong> HomeDAQ installs property manager/vendors to secure/maintain; costs borne by the LLC and may be charged back as allowed.</li>
                <li><strong>Accelerated buy-back / offsets:</strong> HomeDAQ can accelerate obligations or apply offsets/default interest per agreements.</li>
                <li><strong>Refi/Sale coordination:</strong> If triggers/approvals met, HomeDAQ runs the transaction and distributes proceeds.</li>
                <li><strong>Collateral enforcement:</strong> Where security exists (e.g., on Units or via deed of trust), HomeDAQ initiates lawful enforcement.</li>
              </ol>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-ink-200 p-4 bg-ink-50">
            <h3 className="font-semibold text-ink-900">If the Resident abandons the property</h3>
            <p className="mt-2 text-ink-800">
              Upon verified abandonment, HomeDAQ immediately steps in to secure the asset—rekey, basic
              repairs, insurance/utility continuity, and (if necessary) rent-protect or list for sale.
              All actions are documented and executed under the Operating Agreement’s step-in provisions.
              Net proceeds (if sold) flow through the waterfall. The Resident’s Unit position is handled
              per default clauses (offsets, forfeiture of reserved distributions, accelerated repurchase).
            </p>
          </div>
        </Card>
      </Section>

      {/* REPORTING & TAX */}
      <Section id="reporting" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">9) Reporting & tax</h2>
          <ul className="mt-2 space-y-2 text-ink-800">
            <li>Quarterly updates collected and published by HomeDAQ.</li>
            <li>Annual tax package (e.g., K-1) coordinated by HomeDAQ for the Property LLC.</li>
            <li>HomeDAQ maintains books/records and an audit trail of key actions and notices.</li>
          </ul>
        </Card>
      </Section>

      {/* COMPLIANCE */}
      <Section id="compliance" className="max-w-5xl mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900">10) Securities & compliance</h2>
          <ul className="mt-2 space-y-2 text-ink-800">
            <li>Each offering specifies its exemption or registration path (e.g., Reg D, Reg CF, state exemptions).</li>
            <li>HomeDAQ administers investor onboarding (KYC/AML and any required qualification).</li>
            <li>Transfers (if allowed) are processed by HomeDAQ with ROFR and compliance checks.</li>
            <li>HomeDAQ is a technology platform and administrative agent; it does not provide investment advice unless explicitly stated.</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-ink-200 p-4 bg-ink-50 text-ink-700 text-sm">
            Nothing on this page is legal, tax, or investment advice. If there’s any conflict,
            the listing’s executed documents control.
          </div>
        </Card>

        <div className="mt-6 flex justify-center">
          <Link href="/resident/create"><Button>Start a Pitch</Button></Link>
        </div>
      </Section>
    </>
  );
}

/* ---- small helpers ---- */

function Agreement({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 bg-white">
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <ul className="mt-2 space-y-2 text-ink-800">
        {points.map((p, i) => <li key={i}>• {p}</li>)}
      </ul>
    </div>
  );
}
