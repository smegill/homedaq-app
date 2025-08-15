'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function CreateIndexPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace('/resident/create/basics');
  }, [router]);
  return <div className="p-6 text-ink-700">Loading…</div>;
}
