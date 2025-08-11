'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/ui/Section';      // default export
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitch, updatePitch } from '@/lib/storage';
import type { PitchInput } from '@/types/pitch';

export default function EditPitchPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [form, setForm] = React.useState<PitchInput | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const p = getPitch(id);
    if (!p) {
      setForm(null);
    } else {
      const { id: _id, createdAt: _c, updatedAt: _u, ...input } = p as any;
      setForm(input as PitchInput);
    }
  }, [id]);

  if (form === null) {
    return (
      <Section className="max-w-3xl mx-auto py-10">
        <Card className="p-8">
          <h1 className="text-xl font-semibold text-ink-900 mb-3">Pitch not found</h1>
          <p className="text-ink-600 mb-6">We couldn’t find that pitch. It may have been deleted.</p>
          <Link href="/resident/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </Section>
    );
  }

  const onChange =
    (key: keyof PitchInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.currentTarget.type === 'number'
          ? Number(e.currentTarget.value)
          : e.currentTarget.value;
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form) return;
    const cleaned: PitchInput = {
      ...form,
      amountSeeking: Number(form.amountSeeking) || 0,
      valuation: Number(form.valuation) || 0,
      minInvestment: Number(form.minInvestment) || 0,
    };
    updatePitch(id, cleaned);
    router.push('/resident/dashboard');
  };

  return (
    <Section className="max-w-3xl mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Edit Pitch</h1>
        <p className="text-ink-600 mt-1">Update details and save to return to your dashboard.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-ink-700">Title</span>
              <input
                className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                value={form.title}
                onChange={onChange('title')}
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-ink-700">Summary</span>
              <textarea
                className="min-h-[96px] w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                value={form.summary}
                onChange={onChange('summary')}
                required
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Address 1</span>
                <input
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.address1}
                  onChange={onChange('address1')}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Address 2</span>
                <input
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.address2 ?? ''}
                  onChange={onChange('address2')}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">City</span>
                <input
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.city}
                  onChange={onChange('city')}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">State</span>
                <input
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.state}
                  onChange={onChange('state')}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Postal Code</span>
                <input
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.postalCode}
                  onChange={onChange('postalCode')}
                  required
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Amount Seeking (USD)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.amountSeeking}
                  onChange={onChange('amountSeeking')}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Valuation (USD)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.valuation}
                  onChange={onChange('valuation')}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Min Investment (USD)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.minInvestment}
                  onChange={onChange('minInvestment')}
                  required
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Resident Name</span>
                <input
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.residentName}
                  onChange={onChange('residentName')}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-ink-700">Resident Email</span>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.residentEmail}
                  onChange={onChange('residentEmail')}
                  required
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Save Changes</Button>
            <Link href="/resident/dashboard">
              <Button type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </Section>
  );
}
