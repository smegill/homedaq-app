'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { savePitch } from '@/lib/storage';
import type { PitchInput } from '@/types/pitch';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';

const inputClass =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-sm text-ink-700';
const helpClass = 'text-xs text-ink-500';

const MAX_PHOTOS = 6;           // keep localStorage size reasonable
const MAX_DIM = 1600;           // resize longest edge
const JPEG_QUALITY = 0.85;      // compress a bit

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

  const [photos, setPhotos] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [residentName, setResidentName] = React.useState('');
  const [residentEmail, setResidentEmail] = React.useState('');

  // Derive seeking from valuation * equity% if both provided (user can still override)
  React.useEffect(() => {
    if (valuation !== '' && equityPct !== '') {
      const calc = Math.max(0, Math.round((Number(valuation) * Number(equityPct)) / 100));
      setAmountSeeking((prev) => (prev === '' ? calc : prev)); // don’t clobber once user edits
    }
  }, [valuation, equityPct]);

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
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
    } catch (e) {
      setUploadError('Unable to process one or more images. Try smaller files.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      photos: photos.length ? photos : undefined,
      heroImageUrl: photos[0] || undefined,
      residentName: residentName.trim(),
      residentEmail: residentEmail.trim(),
      status: 'submitted',
    };

    savePitch(clean);
    router.push('/resident/dashboard');
  }

  const addressQuery = [address1, city, state, postalCode].filter(Boolean).join(', ');

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
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Photos</h2>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.currentTarget.files)}
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

              {/* Live map preview */}
              <div className="mt-4">
                <GoogleMapEmbed query={addressQuery} height={180} zoom={14} />
              </div>

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

/**
 * Resize and compress an image File into a JPEG data URL.
 * Keeps aspect ratio; longest edge limited to `maxDim`.
 */
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
