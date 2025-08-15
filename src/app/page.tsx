import Link from 'next/link';
import FeaturedPitches from '@/components/FeaturedPitches';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="space-y-16">
      <Section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-ink-900">
              Shared-Appreciation Marketplace for Real Estate
            </h1>
            <p className="text-lg text-zinc-700">
              HomeDAQ lets residents <strong>pitch</strong> small real-estate opportunities and investors take a
              <strong> share of future appreciation</strong>—with no required monthly payments.
              Think <em>Shark Tank</em> for homes and local projects.
            </p>

            <div className="flex gap-3">
              <Link href="/resident/create">
                <Button>Start a Pitch</Button>
              </Link>
              <Link href="/invest">
                <Button variant="secondary">Browse Pitches</Button>
              </Link>
            </div>

            <p className="text-xs text-zinc-600">
              HomeDAQ is a marketplace. We don’t custody funds. Final investment docs and funding are completed
              off-platform.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <FeaturedPitches />
          </div>
        </div>
      </Section>

      <Section className="max-w-6xl mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: 'No bank interest', d: 'Deals are structured as shared-appreciation equity, not debt. No required monthly payments for residents.' },
            { t: 'Aligned incentives', d: 'Investors win when the property appreciates or value is created via improvements.' },
            { t: 'Transparent matches', d: 'We explain why a pitch fits—AppShare %, horizon, local market context, and story.' },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-medium text-ink-900">{x.t}</div>
              <div className="mt-1 text-zinc-700">{x.d}</div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
