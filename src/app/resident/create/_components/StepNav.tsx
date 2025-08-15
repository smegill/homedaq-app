'use client';

import * as React from 'react';
import Link from 'next/link';

export default function StepNav({
  steps,
  activeHref,
}: {
  steps: { href: string; label: string }[];
  activeHref: string;
}) {
  return (
    <nav className="rounded-2xl border border-ink-200 bg-white p-1 flex flex-wrap gap-1" aria-label="Steps">
      {steps.map((s, i) => {
        const active = activeHref.startsWith(s.href);
        const done = steps.findIndex((x) => activeHref.startsWith(x.href)) > i;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`relative px-3 py-1.5 rounded-xl text-sm transition ${
              active ? 'bg-ink-900 text-white' : 'text-ink-800 hover:bg-ink-50'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {done && !active ? <span className="mr-1">✓</span> : null}
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
