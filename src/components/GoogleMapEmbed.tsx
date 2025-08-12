'use client';

import * as React from 'react';

type Props = {
  query: string;          // e.g. "123 Main St, Austin, TX 73301"
  zoom?: number;          // 1-20
  height?: number;        // px
  className?: string;
};

export default function GoogleMapEmbed({
  query,
  zoom = 14,
  height = 200,
  className = '',
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const src = `https://www.google.com/maps?q=${encodeURIComponent(
    query
  )}&z=${zoom}&output=embed`;

  return (
    <div
      ref={ref}
      className={`rounded-2xl overflow-hidden border border-ink-200 bg-ink-50 ${className}`}
      style={{ height }}
    >
      {visible ? (
        <iframe
          title="Google map"
          src={src}
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-ink-100" />
      )}
    </div>
  );
}
