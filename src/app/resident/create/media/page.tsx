'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/lib/draft';
import Image from 'next/image';
import { X, Plus } from 'lucide-react';

const input =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

const allowedHost = (url?: string) => {
  if (!url) return true;
  try {
    const h = new URL(url).hostname;
    return ['dongardner.com', 'images.unsplash.com', 'placehold.co', 'cdn.redfin.com', 'cdn.pixabay.com'].includes(h);
  } catch {
    return false;
  }
};
const isUrl = (u?: string) => {
  if (!u) return false;
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function MediaStep() {
  const { draft, setField } = useDraft();
  const router = useRouter();

  const hero = draft.heroImageUrl || `https://placehold.co/1200x675/png?text=${encodeURIComponent(draft.title || 'Pitch')}`;
  const heroUnopt = !allowedHost(draft.heroImageUrl);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push('/resident/create/review');
      }}
    >
      <label className="space-y-1">
        <span className="text-sm text-ink-600">Hero image URL</span>
        <input
          className={input}
          value={draft.heroImageUrl}
          onChange={(e) => setField('heroImageUrl', e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />
        {!allowedHost(draft.heroImageUrl) ? (
          <div className="text-xs text-ink-600 mt-1">Note: this host isn’t whitelisted; preview renders unoptimized.</div>
        ) : null}
        <div className="mt-3 relative w-full aspect-video rounded-xl overflow-hidden border border-ink-100">
          <Image src={hero} alt="Hero preview" fill className="object-cover" unoptimized={heroUnopt} />
        </div>
      </label>

      <label className="space-y-1">
        <span className="text-sm text-ink-600">Offering URL (external)</span>
        <input
          className={input}
          value={draft.offeringUrl}
          onChange={(e) => setField('offeringUrl', e.target.value)}
          placeholder="https://example.com/your-raise"
        />
        {draft.offeringUrl && !isUrl(draft.offeringUrl) ? (
          <div className="text-xs text-red-600">Enter a valid http(s) URL</div>
        ) : null}
      </label>

      <div className="space-y-3">
        <div className="text-sm text-ink-600">Gallery (optional)</div>
        <div className="flex flex-col gap-2">
          {draft.gallery.map((g, i) => {
            const ok = isUrl(g);
            const unopt = !allowedHost(g);
            return (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={`${input} ${!ok ? 'border-red-400' : ''}`}
                  value={g}
                  onChange={(e) => {
                    const arr = [...draft.gallery];
                    arr[i] = e.target.value;
                    setField('gallery', arr);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <button
                  type="button"
                  className="rounded-full border px-2 py-2"
                  onClick={() => {
                    const arr = [...draft.gallery];
                    arr.splice(i, 1);
                    setField('gallery', arr);
                  }}
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </button>
                {ok ? (
                  <div className="relative h-12 w-16 overflow-hidden rounded-md border border-ink-100">
                    <Image src={g} alt="" fill className="object-cover" unoptimized={unopt} />
                  </div>
                ) : null}
              </div>
            );
          })}
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 w-fit"
            onClick={() => setField('gallery', [...draft.gallery, ''])}
          >
            <Plus className="size-4" /> Add image
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" className="rounded-xl border px-4 py-2" onClick={() => history.back()}>
          Back
        </button>
        <button className="rounded-xl bg-ink-900 text-white px-4 py-2">Continue</button>
      </div>
    </form>
  );
}
