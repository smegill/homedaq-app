'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import type { Pitch } from '@/types/pitch';

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `$${Math.round(v).toLocaleString()}`;
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
  const img =
    p.heroImageUrl ||
    `https://placehold.co/800x500/png?text=${encodeURIComponent(p.title)}`;

  let unoptimized = false;
  try {
    const host = new URL(img).hostname;
    unoptimized = !ALLOWED_IMAGE_HOSTS.has(host);
  } catch {
    unoptimized = true;
  }

  const location = [p.city, p.state].filter(Boolean).join(', ');
  const { valuation, equityPct, minInvestment } = p;

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
        {p.summary ? (
          <p className="text-sm text-ink-700 line-clamp-2">{p.summary}</p>
        ) : null}

        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-ink-50 p-2 text-center">
            <dt className="text-ink-600">Valuation</dt>
            <dd className="font-medium text-ink-900">{usd(valuation)}</dd>
          </div>
          <div className="rounded-xl bg-ink-50 p-2 text-center">
            <dt className="text-ink-600">Min</dt>
            <dd className="font-medium text-ink-900">
              {minInvestment != null ? `$${minInvestment.toLocaleString()}` : '—'}
            </dd>
          </div>
          <div className="rounded-xl bg-ink-50 p-2 text-center">
            <dt className="text-ink-600">Equity</dt>
            <dd className="font-medium text-ink-900">
              {equityPct != null ? `${equityPct}%` : '—'}
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-2">
          {onView ? (
            <Button variant="secondary" onClick={() => onView(p)}>
              View
            </Button>
          ) : null}

          {p.offeringUrl ? (
            <Button
              onClick={() => {
                try {
                  window.open(p.offeringUrl, '_blank', 'noopener,noreferrer');
                } catch {
                  /* no-op */
                }
              }}
            >
              <span className="inline-flex items-center gap-2">
                Invest / Learn More <ExternalLink className="size-4" />
              </span>
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Coming soon
            </Button>
          )}
        </div>

        <div className="text-xs text-ink-600">
          {location} {p.postalCode ? ` ${p.postalCode}` : ''}
        </div>
      </CardBody>
    </Card>
  );
}
