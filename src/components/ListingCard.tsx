'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import type { Pitch } from '@/types/pitch';
import { useRouter } from 'next/navigation';

const ALLOWED_IMAGE_HOSTS = new Set([
  'dongardner.com',
  'images.unsplash.com',
  'placehold.co',
  'cdn.redfin.com',
  'cdn.pixabay.com',
]);

function usd(v?: number): string {
  if (v == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  } catch {
    return `$${Math.round(v).toLocaleString()}`;
  }
}

function isDemoOffering(url?: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://local');
    return u.hostname.toLowerCase() === 'example.com';
  } catch {
    return true;
  }
}

export default function ListingCard({
  p,
  onView,
  matchScore,
}: {
  p: Pitch;
  onView?: (pitch: Pitch) => void;
  matchScore?: number; // 0..100
}) {
  const router = useRouter();

  const img = p.heroImageUrl || `https://placehold.co/800x500/png?text=${encodeURIComponent(p.title)}`;
  let unoptimized = false;
  try {
    const host = new URL(img).hostname;
    unoptimized = !ALLOWED_IMAGE_HOSTS.has(host);
  } catch {
    unoptimized = true;
  }

  const location = [p.city, p.state].filter(Boolean).join(', ');

  const committed = p.fundingCommitted ?? 0;
  const goal = p.fundingGoal ?? 0;
  const percent = goal > 0 ? Math.min(100, Math.max(0, Math.floor((committed / goal) * 100))) : 0;
  const fullyFunded = goal > 0 && committed >= goal;

  function handleInvestClick() {
    const demo = isDemoOffering(p.offeringUrl);
    if (demo) {
      router.push('/investors?demo=1');
      return;
    }
    try {
      window.open(p.offeringUrl as string, '_blank', 'noopener,noreferrer');
    } catch {
      /* no-op */
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-soft transition">
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={img}
          alt={p.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized={unoptimized}
          priority={false}
        />
        {p.riskProfile ? (
          <span className="absolute top-3 left-3 text-xs rounded-full bg-black/60 text-white px-2 py-1">
            {p.riskProfile}
          </span>
        ) : null}
        {typeof matchScore === 'number' ? (
          <span className="absolute top-3 right-3 text-xs rounded-full bg-white/90 text-ink-900 px-2 py-1">
            Match {matchScore}%
          </span>
        ) : null}
      </div>

      <CardBody className="space-y-3">
        <h3 className="text-base font-semibold line-clamp-2 text-ink-900">{p.title}</h3>
        {p.summary ? <p className="text-sm text-ink-700 line-clamp-2">{p.summary}</p> : null}

        {/* Prominent funding progress */}
        <div>
          <div className="rounded-2xl bg-ink-100 h-3 overflow-hidden" aria-label="Funding progress">
            <div
              className={`h-3 ${fullyFunded ? 'bg-green-600' : 'bg-ink-900'} transition-all`}
              style={{ width: `${percent}%` }}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-ink-700">
            <span>{percent}% funded</span>
            <span>
              {goal > 0 ? (
                <>
                  {usd(committed)} / {usd(goal)}
                </>
              ) : (
                'Goal not set'
              )}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-ink-50 p-2 text-center">
            <dt className="text-ink-600">Valuation</dt>
            <dd className="font-medium text-ink-900">{usd(p.valuation)}</dd>
          </div>
          <div className="rounded-xl bg-ink-50 p-2 text-center">
            <dt className="text-ink-600">Min</dt>
            <dd className="font-medium text-ink-900">
              {p.minInvestment != null ? `$${p.minInvestment.toLocaleString()}` : '—'}
            </dd>
          </div>
          <div className="rounded-xl bg-ink-50 p-2 text-center">
            <dt className="text-ink-600">Equity</dt>
            <dd className="font-medium text-ink-900">{p.equityPct != null ? `${p.equityPct}%` : '—'}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2">
          {onView ? (
            <Button variant="secondary" onClick={() => onView(p)}>
              View
            </Button>
          ) : null}

          <Button onClick={handleInvestClick} disabled={fullyFunded}>
            <span className="inline-flex items-center gap-2">
              {fullyFunded ? 'Fully Funded' : isDemoOffering(p.offeringUrl) ? 'Demo — Learn How' : 'Invest / Learn More'}
              <ExternalLink className="size-4" />
            </span>
          </Button>
        </div>

        <div className="text-xs text-ink-600">{location} {p.postalCode ? ` ${p.postalCode}` : ''}</div>
      </CardBody>
    </Card>
  );
}
