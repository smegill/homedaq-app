'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { savePitch } from '@/lib/storage';
import type { PitchInput } from '@/types/pitch';

const inputClass =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-sm text-ink-700';
const helpClass = 'text-xs text-ink-500';

export default function CreatePitchPage() {
  const router = useRouter();

  // Core schema (maps cleanly to PitchInput)
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');

  const [address1, setAddress1] = React.useState('');
  const [address2, setAddress2] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');

  const [valuation, setValuation] = React.useState<number | ''>('');
  const [equityPct, setEquityPct] = React.useState<number | ''>(''); // optional helper
  const [amountSeeking, setAmountSeeking] = React.useState<number | ''>('');
  const [minInvestment, setMinInvestment] = React.useState<number | ''>('');

  // Optional/extended fields
  const [zillowUrl, setZillowUrl] = React.useState('');
  const [mlsUrl, setMlsUrl] = React.useState('');

  const [pitchWhy, setPitchWhy] = React.useState('');
  const [story, setStory] = React.useState('');
  const [aboutYou, setAboutYou] = React.useState('');
  const [household, setHousehold] = React.useState('');

  const [photoUrl, setPhotoUrl] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);

  const [residentName, setResidentName] = React.useState('');
  const [residentEmail, setResidentEmail] = React.useState('');

  // Derive seeking from valuation * equity% if both provided (user can still override)
  React.useEffect(() => {
    if (valuation !== '' && equityPct !== '') {
      const calc = Math.max(0, Math.round((Number(valuation) * Number(equityPct)) / 100));
      setAmountSeeking((prev) => (prev === '' ? calc : prev)); // don’t clobber once user edits
    }
  }, [valuation, equityPct]);

  function onAddPhoto() {
    if (!photoUrl.trim()) return;
    setPhotos((arr) => [photoUrl.trim(), ...arr]);
    setPhotoUrl('');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clean: PitchInput = {
      title: title.trim() || (address1 ? `Pitch: ${address1}` : 'My HomeDAQ Pitch'),
      summary: summary.trim() || pitchWhy.trim() || story.trim() || 'Home investment opportunity',
      address1: address1.trim(),
      address2: address2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      amountSeeking: Number(amountSeeking) || 0,
      valuation: Number(valuation) || 0,
      minInvestment: Number(minInvestment) || 0,
      heroImageUrl: photos[0] || undefined,
      residentName: residentName.trim(),
      residentEmail: residentEmail.trim(),
      status: 'submitted',
      // NOTE: zillowUrl, mlsUrl, aboutYou, household, photos[] are currently
      // auxiliary—keep in state/UI; you can persist later if/when the schema extends.
    };

    savePitch(clean);
    router.push('/resident/dashboard');
  }

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-semibold text-ink-900 text-center mb-8">Create Your Pitch</h1>

      <form onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Basics</h2>
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Listing Title</span>
                  <input
                    className={inputClass}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sunny Bungalow on Maple"
                  />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Short Summary</span>
                  <textarea
                    className={`${inputClass} min-h-[96px]`}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="2-bed starter home near city park. Light renovation, strong rental comps."
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Property</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className={labelClass}>Address</span>
                  <input
                    className={inputClass}
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="123 Main St"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Address 2</span>
                  <input
                    className={inputClass}
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Apt, Unit, Suite (optional)"
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>City</span>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Austin"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>State</span>
                  <input
                    className={inputClass}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="TX"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Postal Code</span>
                  <input
                    className={inputClass}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="73301"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Estimated Value (USD)</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    className={inputClass}
                    value={valuation}
                    onChange={(e) => setValuation(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="400000"
                  />
                  <span className={helpClass}>Use your best estimate or a recent appraisal.</span>
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Equity Offered (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    className={inputClass}
                    value={equityPct}
                    onChange={(e) => setEquityPct(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="15"
                  />
                  <span className={helpClass}>Optional — auto-fills “Amount Seeking” below.</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Zillow Link (optional)</span>
                  <input
                    className={inputClass}
                    value={zillowUrl}
                    onChange={(e) => setZillowUrl(e.target.value)}
                    placeholder="https://www.zillow.com/..."
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>MLS Link (optional)</span>
                  <input
                    className={inputClass}
                    value={mlsUrl}
                    onChange={(e) => setMlsUrl(e.target.value)}
                    placeholder="https://www.mls.com/listing/..."
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Raise Details</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className={labelClass}>Amount Seeking (USD)</span>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={amountSeeking}
                    onChange={(e) => setAmountSeeking(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="45000"
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Valuation (USD)</span>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={valuation}
                    onChange={(e) => setValuation(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="400000"
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Min Investment (USD)</span>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="500"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Your Pitch & Goals</h2>
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Tell investors why this home</span>
                  <textarea
                    className={`${inputClass} min-h-[120px]`}
                    value={pitchWhy}
                    onChange={(e) => setPitchWhy(e.target.value)}
                    placeholder="Why this home, what you'll improve, and what success looks like."
                  />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Your Story / Improvements Plan</span>
                  <textarea
                    className={`${inputClass} min-h-[120px]`}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Background, work, interests, improvement plan..."
                  />
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="grid gap-2">
                    <span className={labelClass}>About You</span>
                    <textarea
                      className={`${inputClass} min-h-[96px]`}
                      value={aboutYou}
                      onChange={(e) => setAboutYou(e.target.value)}
                      placeholder="Short bio"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className={labelClass}>Family / Household</span>
                    <textarea
                      className={`${inputClass} min-h-[96px]`}
                      value={household}
                      onChange={(e) => setHousehold(e.target.value)}
                      placeholder="Who will live here? Any special needs?"
                    />
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Photos</h2>
              <div className="flex gap-3">
                <input
                  className={`${inputClass} flex-1`}
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL and click Add"
                />
                <Button type="button" onClick={onAddPhoto}>Add</Button>
              </div>

              {photos.length > 0 && (
                <ul className="mt-4 grid sm:grid-cols-3 gap-3">
                  {photos.map((url, i) => (
                    <li key={i} className="rounded-2xl overflow-hidden border border-ink-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-600">Address:</dt>
                  <dd className="text-ink-900">{address1 || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">City:</dt>
                  <dd className="text-ink-900">{city || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Est. Value:</dt>
                  <dd className="text-ink-900">
                    {valuation !== '' ? `$${Number(valuation).toLocaleString()}` : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Equity Offered:</dt>
                  <dd className="text-ink-900">
                    {equityPct !== '' ? `${equityPct}%` : '—%'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Photos:</dt>
                  <dd className="text-ink-900">{photos.length}</dd>
                </div>
              </dl>

              <div className="mt-6 flex gap-3">
                <Button type="submit">Submit Pitch</Button>
                <Link href="/resident/dashboard">
                  <Button type="button">Cancel</Button>
                </Link>
              </div>

              <p className="text-ink-500 text-xs mt-4">
                By submitting, you agree your information may be reviewed by potential investors.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Contact</h2>
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Resident Name</span>
                  <input
                    className={inputClass}
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                    placeholder="Alex Johnson"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Resident Email</span>
                  <input
                    type="email"
                    className={inputClass}
                    value={residentEmail}
                    onChange={(e) => setResidentEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                  />
                </label>
              </div>
            </Card>
          </aside>
        </div>
      </form>
    </Section>
  );
}
