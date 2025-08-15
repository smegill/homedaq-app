'use client';

import * as React from 'react';

type Props = {
  address?: string;
  zip?: string;
  query?: string;
  zoom?: number;
  className?: string;
};

/**
 * Stable Google Maps iframe that never unmounts.
 * We update the src attribute imperatively to avoid navigation-side focus steals.
 */
function GoogleMapEmbedBase({ address, zip, query, zoom = 13, className }: Props) {
  const q = (address && address.trim()) || (zip && zip.trim()) || (query && query.trim()) || '';
  const src = React.useMemo(
    () =>
      q
        ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed`
        : `https://www.google.com/maps?&z=${zoom}&output=embed`,
    [q, zoom]
  );

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  // Only change the iframe's src when the computed URL actually changes.
  React.useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    if (el.src !== src) {
      el.src = src; // imperative update; element itself remains mounted
    }
  }, [src]);

  return (
    <iframe
      ref={iframeRef}
      className={className ? className : 'h-full w-full'}
      // Initial src keeps SSR/first paint consistent; subsequent changes happen via the effect above.
      src={src}
      loading="lazy"
      tabIndex={-1}
      aria-hidden="true"
      title="Google Map"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export default React.memo(GoogleMapEmbedBase);
