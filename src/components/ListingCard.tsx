'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Pitch } from '@/types/pitch';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card'; // <-- named export

export default function ListingCard({ p }: { p: Pitch }) {
  const goal = p.fundingGoal ?? 0;
  const committed = p.fundingCommitted ?? 0;
  const progress = goal > 0 ? Math.min(100, Math.round((committed / goal) * 100)) : 0;

  const chips: string[] = [];
  if (p.appreciationSharePct != null) chips.push(`${p.appreciationSharePct}% AppShare`);
  if (p.horizonYears != null) chips.push(`${p.horizonYears}y horizon`);
  chips.push(p.buybackAllowed ? 'Buyback allowed' : 'Hold until exit');

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/9] bg-zinc-100">
        {p.heroImageUrl ? (
          <Image
            src={p.heroImageUrl}
            alt={p.title}
            fill
            className="object-cover"
            unoptimized
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-400">
            Listing Preview
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
              {c}
            </span>
          ))}
        </div>

        <div className="text-lg font-semibold text-ink-900">{p.title}</div>
        <div className="text-xs text-zinc-600">
          {p.city && p.state ? `${p.city}, ${p.state}` : p.zip ? p.zip : ''}
        </div>

        {goal > 0 && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-zinc-600">
              <span>{progress}% funded</span>
              <span>Goal {formatCurrency(goal)}</span>
            </div>
            <div className="mt-1 h-2 w-full rounded bg-zinc-200">
              <div
                className="h-2 rounded bg-ink-900 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          {p.offeringUrl ? (
            <Link href={p.offeringUrl} target="_blank" rel="noreferrer">
              <Button>Demo — Learn How</Button>
            </Link>
          ) : (
            <Button disabled>Demo — Learn How</Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}
