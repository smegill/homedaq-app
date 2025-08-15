'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/lib/draft';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';

const input =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

const STATUS = ['draft', 'review', 'live', 'funded', 'closed'] as const;

export default function BasicsStep() {
  const { draft, setField } = useDraft();
  const router = useRouter();

  const address = React.useMemo(
    () =>
      [draft.address1, draft.address2, draft.city, draft.state, draft.postalCode]
        .filter(Boolean)
        .join(', '),
    [draft.address1, draft.address2, draft.city, draft.state, draft.postalCode]
  );
  const deferredAddress = React.useDeferredValue(address);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push('/resident/create/economics');
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Title</span>
          <input
            className={input}
            value={draft.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Sunny duplex near parks"
            autoComplete="off"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Status</span>
          <select
            className={input}
            value={draft.status}
            onChange={(e) => setField('status', e.target.value as typeof STATUS[number])}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Address 1</span>
          <input
            className={input}
            value={draft.address1}
            onChange={(e) => setField('address1', e.target.value)}
            placeholder="123 Oak St"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">Address 2</span>
          <input
            className={input}
            value={draft.address2}
            onChange={(e) => setField('address2', e.target.value)}
            placeholder="Unit / Apt"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">City</span>
          <input className={input} value={draft.city} onChange={(e) => setField('city', e.target.value)} />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">State</span>
          <input className={input} value={draft.state} onChange={(e) => setField('state', e.target.value)} placeholder="PA" />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-ink-600">ZIP</span>
          <input
            className={input}
            inputMode="numeric"
            maxLength={5}
            value={draft.postalCode}
            onChange={(e) => setField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="19103"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm text-ink-600">One-paragraph summary</span>
          <textarea
            className={input}
            rows={3}
            value={draft.summary}
            onChange={(e) => setField('summary', e.target.value)}
            placeholder="What is the opportunity in a nutshell?"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-ink-200 overflow-hidden">
        <div className="p-3 text-sm text-ink-700">Location preview</div>
        <div className="aspect-[4/3]">
          <GoogleMapEmbed address={deferredAddress} zoom={14} />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-xl bg-ink-900 text-white px-4 py-2">Continue</button>
      </div>
    </form>
  );
}
