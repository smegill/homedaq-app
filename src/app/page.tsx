import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FeaturedPitches from '@/components/FeaturedPitches';
import BackgroundFX from '@/components/BackgroundFX';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden">
        <BackgroundFX />
        <Section className="relative z-10 max-w-6xl mx-auto py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs mb-4 border border-brand-100">
                New • Community-powered home equity
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-ink-900">
                Skip the banks. <span className="text-brand-600">Build equity together.</span>
              </h1>
              <p className="mt-4 text-ink-700 max-w-xl">
                Raise flexible capital from aligned investors, share in the upside, and keep your path
                to ownership clear and simple.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/resident/create">
                  <Button>Start a Pitch</Button>
                </Link>
                <Link href="/invest">
                  <Button>Browse Listings</Button>
                </Link>
                <Link href="/legal">
                  <Button>Learn More</Button>
                </Link>
              </div>

              {/* little trust strip */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg text-center">
                <div className="rounded-2xl bg-white shadow-sm border border-ink-100 p-3">
                  <div className="text-xl font-semibold text-ink-900">7–30d</div>
                  <div className="text-xs text-ink-600">typical raise window*</div>
                </div>
                <div className="rounded-2xl bg-white shadow-sm border border-ink-100 p-3">
                  <div className="text-xl font-semibold text-ink-900">$500</div>
                  <div className="text-xs text-ink-600">min. investment</div>
                </div>
                <div className="rounded-2xl bg-white shadow-sm border border-ink-100 p-3">
                  <div className="text-xl font-semibold text-ink-900">1 LLC</div>
                  <div className="text-xs text-ink-600">per property</div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-ink-500">*Varies by market conditions and demand.</p>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-ink-100">
                <Image
                  src="/hero/homedaq-hero.jpg"
                  alt="Neighbors investing together"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden sm:block">
                <div className="rounded-2xl bg-white/80 backdrop-blur border border-ink-100 shadow p-3">
                  <div className="text-xs text-ink-700">Real people, real homes</div>
                  <div className="text-[11px] text-ink-500">A shared path to ownership.</div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* VALUE PROPS */}
      <Section className="max-w-6xl mx-auto py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardBody className="p-6">
              <div className="text-sm font-medium text-brand-700 mb-1">Flexible path</div>
              <h3 className="text-lg font-semibold text-ink-900">Own with flexibility</h3>
              <p className="mt-2 text-ink-700">
                Bring in aligned investors now and buy them out over time on your terms.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="text-sm font-medium text-brand-700 mb-1">Clarity</div>
              <h3 className="text-lg font-semibold text-ink-900">Simple raise, clear terms</h3>
              <p className="mt-2 text-ink-700">
                Property-specific LLCs, transparent fees, and tokenized equity—no hidden surprises.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="text-sm font-medium text-brand-700 mb-1">Alignment</div>
              <h3 className="text-lg font-semibold text-ink-900">Investor-aligned</h3>
              <p className="mt-2 text-ink-700">
                Improve the home, grow value together, and share in the upside fairly.
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="max-w-6xl mx-auto py-6">
        <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-ink-900">How HomeDAQ works</h2>
            <Link href="/resident/create">
              <Button>Create your pitch</Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Step
              number="1"
              title="Create a compelling pitch"
              text="Share your home, plan, and what success looks like. Add photos and your target raise."
            />
            <Step
              number="2"
              title="Invite investors"
              text="Share your listing. Investors can participate with low minimums and clear terms."
            />
            <Step
              number="3"
              title="Build and buy back"
              text="Use funds to improve the property, then buy back investor shares over time."
            />
          </div>
        </div>
      </Section>

      {/* FEATURED LISTINGS */}
      <FeaturedPitches />

      {/* EQUITY EXPLAINER */}
      <Section className="max-w-6xl mx-auto py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">What does “shared equity” mean here?</h2>
            <p className="mt-3 text-ink-700">
              Each property sits inside its own LLC. Investors receive tokenized equity in that LLC, and
              you keep operational control. As the home improves, everyone benefits. When you’re ready,
              buy back investor shares at an agreed schedule or price formula.
            </p>
            <ul className="mt-4 space-y-2 text-ink-800">
              <li>• Clear ownership via a property-specific LLC</li>
              <li>• Lower minimums expand your supporter base</li>
              <li>• Buy-back optionality keeps you in the driver’s seat</li>
            </ul>
          </div>

          {/* simple visual */}
          <div className="rounded-3xl border border-ink-100 p-6 bg-white shadow-sm">
            <div className="text-sm text-ink-700 mb-3">Example allocation</div>
            <div className="h-8 w-full rounded-full bg-ink-100 overflow-hidden">
              <div className="h-full bg-brand-500/80" style={{ width: '20%' }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-600">
              <span>Investors (20%)</span>
              <span>You (80%)</span>
            </div>
            <p className="mt-4 text-xs text-ink-500">
              The actual split is set by your pitch. You can repurchase investor shares later.
            </p>
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="max-w-6xl mx-auto py-8">
        <h2 className="text-2xl font-semibold text-ink-900 text-center">What people are saying</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <QuoteCard
            name="Alex J."
            quote="HomeDAQ let us fix up our starter home without a second mortgage. The process was clear and fast."
          />
          <QuoteCard
            name="Priya S."
            quote="I invested a small amount in a neighbor’s renovation and loved the updates as the project progressed."
          />
          <QuoteCard
            name="Devon R."
            quote="The buy-back option made it feel collaborative, not extractive. We’re on track to own more, sooner."
          />
        </div>
      </Section>

      {/* FAQ */}
      <Section className="max-w-6xl mx-auto py-6">
        <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-ink-900">Quick questions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Faq q="Is this a loan?" a="No. Investors receive equity in a property-specific LLC, not a debt instrument." />
            <Faq q="How do investors exit?" a="Through your buy-back schedule in the pitch, or via a secondary sale if enabled." />
            <Faq q="Minimum investment?" a="Typically $500, but you set the minimum in your pitch." />
            <Faq q="Who manages the property?" a="You do. Investors are passive and rely on your updates and buy-back plan." />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="max-w-6xl mx-auto py-12">
        <div className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 text-white p-8 sm:p-10 shadow-md">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to get started?</h3>
              <p className="mt-2 text-white/90">
                Create a pitch in minutes. Add photos, set your targets, and invite supporters.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
              <Link href="/resident/create">
                <Button>Start a Pitch</Button>
              </Link>
              <Link href="/invest">
                <Button>Browse Listings</Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* --- small presentational bits (kept inline to keep page self-contained) --- */

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-sm font-semibold">
        {number}
      </div>
      <h3 className="mt-3 text-ink-900 font-semibold">{title}</h3>
      <p className="mt-2 text-ink-700 text-sm">{text}</p>
    </div>
  );
}

function QuoteCard({ name, quote }: { name: string; quote: string }) {
  return (
    <Card>
      <CardBody className="p-6">
        <p className="text-ink-800">“{quote}”</p>
        <div className="mt-4 text-sm font-medium text-ink-700">— {name}</div>
      </CardBody>
    </Card>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-2xl border border-ink-100 bg-white p-4">
      <summary className="cursor-pointer list-none select-none">
        <span className="font-semibold text-ink-900">{q}</span>
      </summary>
      <p className="mt-2 text-sm text-ink-700">{a}</p>
    </details>
  );
}
