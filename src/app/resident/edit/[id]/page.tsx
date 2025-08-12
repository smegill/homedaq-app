'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPitch, updatePitch } from '@/lib/storage';
import type { Pitch, PitchInput } from '@/types/pitch';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';
import MarketSnapshot from '@/components/MarketSnapshot';

const inputClass =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-sm text-ink-700';
const helpClass = 'text-xs text-ink-500';

const MAX_PHOTOS = 6;
const MAX_DIM = 1600;
const JPEG_QUALITY = 0.85;

export default function EditPitchPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : '';

  const [loaded, setLoaded] = React.useState(false);
  const [pitch, setPitch] = React.useState<Pitch | null>(null);

  // Local form state (mirrors Create page)
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');

  const [address1, setAddress1] = React.useState('');
  const [address2, setAddress2] = React.useState<string | undefined>(undefined);
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');

  const [valuation, setValuation] = React.useState<number | ''>('');
  const [offeredEquityPct, setOfferedEquityPct] = React.useState<number | ''>('');
  const [amountSeeking, setAmountSeeking] = React.useState<number | ''>('');
  const [minInvestment, setMinInvestment] = React.useState<number | ''>('');

  const [zillowUrl, setZillowUrl] = React.useState('');
  const [mlsUrl, setMlsUrl] = React.useState('');

  const [photos, setPhotos] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [residentName, setResidentName] = React.useState('');
  const [residentEmail, setResidentEmail] = React.useState('');

  // Offer knobs
  const [monthlyDividendPct, setMonthlyDividendPct] = React.useState<number>(0.8);
  const [expectedAppreciationPct, setExpectedAppreciationPct] = React.useState<number>(3.5);
  const [horizonYears, setHorizonYears] = React.useState<number>(5);
  const [storyStrength, setStoryStrength] = React.useState<number>(4);

  React.useEffect(() => {
    const p = getPitch(id);
    setPitch(p ?? null);
    if (p) {
      setTitle(p.title ?? '');
      setSummary(p.summary ?? '');
      setAddress1(p.address1 ?? '');
      setAddress2(p.address2);
      setCity(p.city ?? '');
      setState(p.state ?? '');
      setPostalCode(p.postalCode ?? '');
      setValuation(p.valuation ?? '');
      setOfferedEquityPct(p.offeredEquityPct ?? '');
      setAmountSeeking(p.amountSeeking ?? '');
      setMinInvestment(p.minInvestment ?? '');

      setZillowUrl(p.zillowUrl ?? '');
      setMlsUrl(p.mlsUrl ?? '');

      setPhotos(p.photos ?? []);
      setResidentName(p.residentName ?? '');
      setResidentEmail(p.residentEmail ?? '');
      setMonthlyDividendPct(p.monthlyDividendPct ?? 0.8);
      setExpectedAppreciationPct(p.expectedAppreciationPct ?? 3.5);
      setHorizonYears(p.horizonYears ?? 5);
      setStoryStrength(p.storyStrength ?? 4);
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Keep Amount Seeking in sync if user adjusts equity% with valuation present
  React.useEffect(() => {
    if (valuation !== '' && offeredEquityPct !== '') {
      const calc = Math.max(0, Math.round((Number(valuation) * Number(offeredEquityPct)) / 100));
      setAmountSeeking((prev) => (prev === '' ? calc : prev));
    }
  }, [valuation, offeredEquityPct]);

  if (!loaded) {
    return (
      <Section className="max-w-6xl mx-auto py-10">
        <Card className="p-6">Loading…</Card>
      </Section>
    );
  }

  if (!pitch) {
    return (
      <Section className="max-w-6xl mx-auto py-10">
        <Card className="p-6 text-center">
          <h1 className="text-lg font-semibold text-ink-900">Pitch not found</h1>
          <p className="text-ink-700 mt-2">The pitch you’re trying to edit doesn’t exist.</p>
          <div className="mt-4">
            <Link href="/resident/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      const toAdd: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await downscaleToDataURL(file, MAX_DIM, JPEG_QUALITY);
        toAdd.push(dataUrl);
        if (photos.length + toAdd.length >= MAX_PHOTOS) break;
      }
      if (toAdd.length === 0) return;
      setPhotos((prev) => [...toAdd, ...prev].slice(0, MAX_PHOTOS));
    } catch {
      setUploadError('Unable to process one or more images. Try smaller files.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patch: Partial<PitchInput> = {
      title: title.trim(),
      summary: summary.trim(),
      address1: address1.trim(),
      address2: address2?.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),

      valuation: Number(valuation) || 0,
      amountSeeking: Number(amountSeeking) || 0,
      minInvestment: Number(minInvestment) || 0,

      zillowUrl: zillowUrl.trim() || undefined,
      mlsUrl: mlsUrl.trim() || undefined,

      photos: photos.length ? photos : undefined,
      heroImageUrl: photos[0] || undefined,

      residentName: residentName.trim(),
      residentEmail: residentEmail.trim(),

      offeredEquityPct: offeredEquityPct === '' ? undefined : Number(offeredEquityPct),
      monthlyDividendPct: Number(monthlyDividendPct),
      expectedAppreciationPct: Number(expectedAppreciationPct),
      storyStrength: Number(storyStrength),
      horizonYears: Number(horizonYears),
    };
    updatePitch(id, patch);
    router.push('/resident/dashboard');
  }

  const addressQuery = [address1, city, state, postalCode].filter(Boolean).join(', ');

  // Guidance (same as Create, optional)
  const valN = Number(valuation) || 0;
  const seekN = Number(amountSeeking) || 0;
  const equityN = Number(offeredEquityPct) || 0;
  const impliedEquityPct = safePct((seekN / Math.max(1, valN)) * 100);
  const equityMismatch =
    valuation !== '' && amountSeeking !== '' && offeredEquityPct !== '' &&
    Math.abs(equityN - impliedEquityPct) > 5;

  const monthlyDivOutflow = seekN * ((Number(monthlyDividendPct) || 0) / 100);
  const suggestedFeeFloor = monthlyDivOutflow * 1.15;

  return (
    <Section className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-semibold text-ink-900 text-center mb-8">Edit Pitch</h1>

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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    placeholder="Sunny Bungalow on Maple"
                  />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Short Summary</span>
                  <textarea
                    className={`${inputClass} min-h-[96px]`}
                    value={summary}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSummary(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress1(e.target.value)}
                    placeholder="123 Main St"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Address 2</span>
                  <input
                    className={inputClass}
                    value={address2 ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress2(e.target.value)}
                    placeholder="Apt, Unit, Suite (optional)"
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>City</span>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                    placeholder="Austin"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>State</span>
                  <input
                    className={inputClass}
                    value={state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
                    placeholder="TX"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Postal Code</span>
                  <input
                    className={inputClass}
                    value={postalCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setValuation(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="400000"
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Equity Offered (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    className={inputClass}
                    value={offeredEquityPct}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOfferedEquityPct(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="15"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Zillow Link (optional)</span>
                  <input
                    className={inputClass}
                    value={zillowUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZillowUrl(e.target.value)}
                    placeholder="https://www.zillow.com/..."
                  />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>MLS Link (optional)</span>
                  <input
                    className={inputClass}
                    value={mlsUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMlsUrl(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAmountSeeking(e.target.value === '' ? '' : Number(e.target.value))
                    }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setValuation(e.target.value === '' ? '' : Number(e.target.value))
                    }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMinInvestment(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="500"
                  />
                </label>
              </div>

              {/* Offer knobs */}
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <label className="grid gap-1">
                  <span className={labelClass}>Monthly Dividend %</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      className="w-full"
                      value={monthlyDividendPct}
                      min={0}
                      max={2.0}
                      step={0.05}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMonthlyDividendPct(Number(e.currentTarget.value))
                      }
                    />
                    <input
                      type="number"
                      className="w-24 rounded-2xl border border-ink-200 bg-white px-2 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                      value={monthlyDividendPct}
                      min={0}
                      max={2.0}
                      step={0.05}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMonthlyDividendPct(Number(e.currentTarget.value))
                      }
                    />
                    <span className="text-sm text-ink-800">%</span>
                  </div>
                  <span className={helpClass}>e.g., 0.8%/mo ≈ 9.6% annual</span>
                </label>

                <label className="grid gap-1">
                  <span className={labelClass}>Expected Appreciation (%/yr)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      className="w-full"
                      value={expectedAppreciationPct}
                      min={-5}
                      max={12}
                      step={0.25}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setExpectedAppreciationPct(Number(e.currentTarget.value))
                      }
                    />
                    <input
                      type="number"
                      className="w-24 rounded-2xl border border-ink-200 bg-white px-2 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-brand-500"
                      value={expectedAppreciationPct}
                      min={-5}
                      max={12}
                      step={0.25}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setExpectedAppreciationPct(Number(e.currentTarget.value))
                      }
                    />
                    <span className="text-sm text-ink-800">%</span>
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Horizon (years)</span>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={horizonYears}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setHorizonYears(Math.max(1, Number(e.currentTarget.value)))
                    }
                    placeholder="5"
                  />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Story Strength</span>
                  <select
                    className={inputClass}
                    value={storyStrength}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setStoryStrength(Number(e.currentTarget.value))
                    }
                  >
                    <option value={1}>1 — Basic</option>
                    <option value={2}>2 — Ok</option>
                    <option value={3}>3 — Good</option>
                    <option value={4}>4 — Strong</option>
                    <option value={5}>5 — Exceptional</option>
                  </select>
                </label>
              </div>

              {/* Guidance */}
              <div className="grid gap-3 sm:grid-cols-3 mt-4">
                <Stat label="Monthly dividends (total)">{fmtCurrency(monthlyDivOutflow)} / mo</Stat>
                <Stat label="Suggested occupancy fee (floor)">{fmtCurrency(suggestedFeeFloor)} / mo</Stat>
                {equityMismatch && (
                  <div className="text-xs rounded-xl border border-amber-200 bg-amber-50 text-amber-900 p-3">
                    Heads up: raising {fmtCurrency(seekN)} on a {fmtCurrency(valN)} valuation implies ~
                    {impliedEquityPct.toFixed(1)}% sold vs your {equityN}% entry.
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Photos</h2>
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFiles(e.currentTarget.files)
                    }
                    className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-xl file:border-0 file:bg-ink-100 file:px-4 file:py-2 file:text-ink-900 hover:file:bg-ink-200"
                  />
                  <span className={helpClass}>
                    Up to {MAX_PHOTOS} images. We’ll resize/compress in the browser.
                  </span>
                </div>
                {uploading && <p className={helpClass}>Processing images…</p>}
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
              </div>

              {photos.length > 0 && (
                <ul className="mt-4 grid sm:grid-cols-3 gap-3">
                  {photos.map((url, i) => (
                    <li key={i} className="group relative rounded-2xl overflow-hidden border border-ink-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xs text-ink-800 shadow hover:bg-white"
                        title="Remove"
                      >
                        Remove
                      </button>
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
                  <dd className="text-ink-900">{valuation !== '' ? `$${Number(valuation).toLocaleString()}` : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Equity Offered:</dt>
                  <dd className="text-ink-900">{offeredEquityPct !== '' ? `${offeredEquityPct}%` : '—%'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Photos:</dt>
                  <dd className="text-ink-900">{photos.length}</dd>
                </div>
              </dl>

              <div className="mt-4">
                <GoogleMapEmbed query={addressQuery} height={180} zoom={14} />
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="submit">Save Changes</Button>
                <Link href="/resident/dashboard">
                  <Button type="button" variant="secondary">Cancel</Button>
                </Link>
              </div>
            </Card>

            <MarketSnapshot zip={postalCode} />
          </aside>
        </div>
      </form>
    </Section>
  );
}

/* ------------ utils ------------ */

function fmtCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      Math.round(n)
    );
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function safePct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function downscaleToDataURL(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(blobUrl);
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = blobUrl;
  });
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 p-3 bg-white">
      <div className="text-ink-600 text-sm">{label}</div>
      <div className="text-ink-900 font-medium">{children}</div>
    </div>
  );
}
