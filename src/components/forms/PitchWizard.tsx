'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';

import type { Pitch, PitchInput, PitchStatus } from '@/types/pitch';
import { savePitch } from '@/lib/storage';
import { computeInvestorFit } from '@/lib/match';

import { Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

type StepKey = 'basics' | 'economics' | 'narrative' | 'media' | 'review';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'basics', label: 'Basics' },
  { key: 'economics', label: 'Offer Designer' },
  { key: 'narrative', label: 'Narrative' },
  { key: 'media', label: 'Media & Links' },
  { key: 'review', label: 'Review & Save' },
];

const STATUS_CHOICES: PitchStatus[] = ['draft', 'review', 'live', 'funded', 'closed'];

const input =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const pct = (committed?: number, goal?: number) =>
  !goal || goal <= 0 ? 0 : clamp(Math.floor(((committed ?? 0) / goal) * 100), 0, 100);

function moneyFmt(v?: number) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      v ?? 0,
    );
  } catch {
    return `$${Math.round(v ?? 0).toLocaleString()}`;
  }
}
const isValidZip = (z?: string) => !!z && /^\d{5}$/.test(z ?? '');
const isLikelyUrl = (u?: string) => {
  if (!u) return false;
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
};
const allowedImageHost = (url?: string): boolean => {
  if (!url) return true;
  try {
    const host = new URL(url).hostname;
    return ['dongardner.com', 'images.unsplash.com', 'placehold.co', 'cdn.redfin.com', 'cdn.pixabay.com'].includes(host);
  } catch {
    return false;
  }
};

// ---------- Wizard state ----------
type WizardState = {
  // Basics
  title: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  status: PitchStatus;

  // Economics
  valuationStr: string;
  equityPctStr: string;
  minInvestmentStr: string;
  fundingGoalStr: string;
  fundingCommittedStr: string;
  targetYieldPctStr: string;
  expectedAppreciationPctStr: string;

  // Narrative
  summary: string;
  problem: string;
  solution: string;
  plan: string;
  useOfFunds: string;
  exitStrategy: string;
  improvements: string;
  timeline: string;
  residentStory: string;
  strategyTags: string;

  // Media
  heroImageUrl: string;
  offeringUrl: string;
  gallery: string[];
};

const parseNum = (s?: string): number | undefined => {
  if (s == null || s.trim() === '') return undefined;
  const n = Number(s.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

function toState(p?: Partial<Pitch>): WizardState {
  const loose = (p ?? {}) as Record<string, unknown>;
  const str = (k: string) => (typeof loose[k] === 'string' ? (loose[k] as string) : '');
  const num = (k: string) => (typeof loose[k] === 'number' ? (loose[k] as number) : undefined);

  const postalCode = (loose['postalCode'] as string) ?? (loose['zip'] as string) ?? '';

  const equityPct = num('equityPct') ?? (loose['equityOfferedPct'] as number | undefined);
  const minInvestment = num('minInvestment') ?? (loose['minimumInvestment'] as number | undefined);

  return {
    title: (loose['title'] as string) ?? '',
    address1: str('address1'),
    address2: str('address2'),
    city: (loose['city'] as string) ?? '',
    state: (loose['state'] as string) ?? '',
    postalCode,
    status: ((loose['status'] as PitchStatus) ?? 'review') as PitchStatus,

    valuationStr: num('valuation') != null ? String(num('valuation')) : '',
    equityPctStr: equityPct != null ? String(equityPct) : '',
    minInvestmentStr: minInvestment != null ? String(minInvestment) : '',
    fundingGoalStr: num('fundingGoal') != null ? String(num('fundingGoal')) : '',
    fundingCommittedStr: num('fundingCommitted') != null ? String(num('fundingCommitted')) : '',
    targetYieldPctStr: num('targetYieldPct') != null ? String(num('targetYieldPct')) : '',
    expectedAppreciationPctStr:
      num('expectedAppreciationPct') != null ? String(num('expectedAppreciationPct')) : '',

    summary: str('summary'),
    problem: str('problem'),
    solution: str('solution'),
    plan: str('plan'),
    useOfFunds: str('useOfFunds'),
    exitStrategy: str('exitStrategy'),
    improvements: str('improvements'),
    timeline: str('timeline'),
    residentStory: str('residentStory'),
    strategyTags: Array.isArray(loose['strategyTags'])
      ? (loose['strategyTags'] as string[]).join(', ')
      : str('strategyTags'),

    heroImageUrl: (loose['heroImageUrl'] as string) ?? '',
    offeringUrl: (loose['offeringUrl'] as string) ?? '',
    gallery: (loose['gallery'] as string[]) ?? [],
  };
}

export default function PitchWizard({
  initial,
  pitchId,
  onSaved,
}: {
  initial?: Pitch | null;
  pitchId?: string;
  onSaved?: (p: Pitch) => void;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState<StepKey>('basics');
  const [st, setSt] = React.useState<WizardState>(toState(initial ?? undefined));
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Apply initial once
  const initApplied = React.useRef(false);
  React.useEffect(() => {
    if (!initApplied.current && initial) {
      initApplied.current = true;
      setSt(toState(initial));
    }
  }, [initial]);

  // Stabilize layout between steps
  React.useEffect(() => {
    const style = document.body.style;
    const prevOverflow = style.overflowY;
    const prevGutter = (style as unknown as { scrollbarGutter?: string }).scrollbarGutter;

    style.overflowY = 'scroll';
    (style as unknown as { scrollbarGutter?: string }).scrollbarGutter = 'stable';

    return () => {
      style.overflowY = prevOverflow;
      (style as unknown as { scrollbarGutter?: string }).scrollbarGutter = prevGutter;
    };
  }, []);

  // ------- Derived numerics -------
  const valuation = React.useMemo(() => parseNum(st.valuationStr), [st.valuationStr]);
  const equityPct = React.useMemo(() => clamp(parseNum(st.equityPctStr) ?? 0, 0, 100), [st.equityPctStr]);
  const minInvestment = React.useMemo(() => parseNum(st.minInvestmentStr), [st.minInvestmentStr]);
  const fundingGoal = React.useMemo(() => parseNum(st.fundingGoalStr), [st.fundingGoalStr]);
  const fundingCommitted = React.useMemo(() => parseNum(st.fundingCommittedStr), [st.fundingCommittedStr]);
  const targetYieldPct = React.useMemo(() => parseNum(st.targetYieldPctStr), [st.targetYieldPctStr]);
  const expectedAppreciationPct = React.useMemo(
    () => parseNum(st.expectedAppreciationPctStr),
    [st.expectedAppreciationPctStr],
  );

  const fundingPercent = React.useMemo(() => pct(fundingCommitted, fundingGoal), [fundingCommitted, fundingGoal]);
  const impliedRaise = React.useMemo(() => {
    if (valuation == null) return undefined;
    return Math.round((equityPct / 100) * valuation);
  }, [valuation, equityPct]);

  const draftForFit: Pitch = React.useMemo(() => {
    const base: Partial<Pitch> & Record<string, unknown> = {
      id: initial?.id ?? 'tmp',
      title: st.title,
      city: st.city || undefined,
      state: st.state || undefined,
      postalCode: st.postalCode || undefined,
      status: st.status,
      minInvestment,
      equityPct,
      valuation,
      fundingGoal,
      fundingCommitted,
      targetYieldPct,
      expectedAppreciationPct,
      createdAt: initial?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    return base as unknown as Pitch;
  }, [
    initial?.id,
    initial?.createdAt,
    st.title,
    st.city,
    st.state,
    st.postalCode,
    st.status,
    minInvestment,
    equityPct,
    valuation,
    fundingGoal,
    fundingCommitted,
    targetYieldPct,
    expectedAppreciationPct,
  ]);

  const liveFit = React.useMemo(() => computeInvestorFit(draftForFit), [draftForFit]);

  // ------- Wizard mechanics -------
  const order: StepKey[] = ['basics', 'economics', 'narrative', 'media', 'review'];
  const idx = order.indexOf(step);
  const canBack = idx > 0;
  const canNext = idx < order.length - 1;
  const goNext = () => canNext && setStep(order[idx + 1]);
  const goPrev = () => canBack && setStep(order[idx - 1]);

  function validateCurrent(): boolean {
    const e: Record<string, string> = {};
    if (step === 'basics') {
      if (!st.title.trim()) e.title = 'Required';
      if (st.postalCode && !isValidZip(st.postalCode)) e.postalCode = 'ZIP should be 5 digits';
    }
    if (step === 'economics') {
      const val = valuation ?? 0;
      const min = minInvestment ?? 0;
      const goal = fundingGoal ?? 0;
      const com = fundingCommitted ?? 0;
      if (st.valuationStr !== '' && val <= 0) e.valuation = 'Must be > 0';
      if (st.minInvestmentStr !== '' && min <= 0) e.minInvestment = 'Must be > 0';
      if (st.fundingGoalStr !== '' && goal <= 0) e.fundingGoal = 'Must be > 0';
      if (st.fundingCommittedStr !== '' && com < 0) e.fundingCommitted = 'Cannot be negative';
      if (st.equityPctStr !== '' && (equityPct < 0 || equityPct > 100)) e.equityPct = '0–100%';
    }
    if (step === 'media') {
      if (st.offeringUrl && !isLikelyUrl(st.offeringUrl)) e.offeringUrl = 'Enter a valid http(s) URL';
      const bad = st.gallery.find((g) => !!g && !isLikelyUrl(g));
      if (bad) e.gallery = 'Gallery items must be valid URLs';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(targetStatus?: PitchStatus) {
    setBusy(true);

    let status: PitchStatus = targetStatus ?? st.status;
    if ((fundingGoal ?? 0) > 0 && (fundingCommitted ?? 0) >= (fundingGoal ?? 0)) status = 'funded';

    const payload: PitchInput = {
      id: pitchId ?? initial?.id,
      title: st.title,
      city: st.city || undefined,
      state: st.state || undefined,
      postalCode: st.postalCode || undefined,
      status,
      minInvestment,
      equityPct,
      summary: st.summary || undefined,
      problem: st.problem || undefined,
      solution: st.solution || undefined,
      plan: st.plan || undefined,
      useOfFunds: st.useOfFunds || undefined,
      exitStrategy: st.exitStrategy || undefined,
      improvements: st.improvements || undefined,
      timeline: st.timeline || undefined,
      residentStory: st.residentStory || undefined,
      strategyTags: st.strategyTags ? st.strategyTags.split(',').map((x) => x.trim()).filter(Boolean) : [],
      heroImageUrl: st.heroImageUrl || undefined,
      offeringUrl: st.offeringUrl || undefined,
      gallery: st.gallery,
      createdAt: initial?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    const saved = await savePitch(payload);
    setBusy(false);
    onSaved?.(saved);
    if (!onSaved) router.push('/resident/dashboard');
  }

  function TabsHeader() {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-1">
        <nav className="flex flex-wrap gap-1" aria-label="Wizard steps">
          {STEPS.map((s, i) => {
            const active = s.key === step;
            const done = i < idx;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(s.key)}
                className={`relative px-3 py-1.5 rounded-xl text-sm transition ${
                  active ? 'bg-ink-900 text-white' : 'text-ink-800 hover:bg-ink-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="inline-flex items-center gap-2">
                  {done && !active ? <Check className="size-4" /> : <span className="w-4" />}
                  {s.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  function Basics() {
    // Only recompute address when address fields change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const address = React.useMemo(
      () => [st.address1, st.address2, st.city, st.state, st.postalCode].filter(Boolean).join(', '),
      [st.address1, st.address2, st.city, st.state, st.postalCode]
    );
    const deferredAddress = React.useDeferredValue(address);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm text-ink-600">Title</span>
            <input
              type="text"
              className={`${input} ${errors.title ? 'border-red-400' : ''}`}
              value={st.title}
              onChange={(e) => setSt((s) => ({ ...s, title: e.target.value }))}
              placeholder="Sunny duplex near parks"
              autoComplete="off"
            />
            {errors.title ? <div className="text-xs text-red-600">{errors.title}</div> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Status</span>
            <select
              className={input}
              value={st.status}
              onChange={(e) => setSt((s) => ({ ...s, status: e.target.value as PitchStatus }))}
            >
              {STATUS_CHOICES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Address 1</span>
            <input
              type="text"
              className={input}
              value={st.address1}
              onChange={(e) => setSt((s) => ({ ...s, address1: e.target.value }))}
              placeholder="123 Oak St"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Address 2</span>
            <input
              type="text"
              className={input}
              value={st.address2}
              onChange={(e) => setSt((s) => ({ ...s, address2: e.target.value }))}
              placeholder="Unit / Apt"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">City</span>
            <input
              type="text"
              className={input}
              value={st.city}
              onChange={(e) => setSt((s) => ({ ...s, city: e.target.value }))}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">State</span>
            <input
              type="text"
              className={input}
              value={st.state}
              onChange={(e) => setSt((s) => ({ ...s, state: e.target.value }))}
              placeholder="PA"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">ZIP</span>
            <input
              type="text"
              className={`${input} ${errors.postalCode ? 'border-red-400' : ''}`}
              inputMode="numeric"
              maxLength={5}
              value={st.postalCode}
              onChange={(e) => setSt((s) => ({ ...s, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
              placeholder="19103"
            />
            {errors.postalCode ? <div className="text-xs text-red-600">{errors.postalCode}</div> : null}
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">One-paragraph summary</span>
            <textarea
              className={input}
              rows={3}
              value={st.summary}
              onChange={(e) => setSt((s) => ({ ...s, summary: e.target.value }))}
              placeholder="What is the opportunity in a nutshell?"
            />
          </label>
        </div>

        {/* Live Map (address updates are deferred and iframe never remounts) */}
        <div className="rounded-2xl border border-ink-200 overflow-hidden">
          <div className="p-3 text-sm text-ink-700">Location preview</div>
          <div className="aspect-[4/3]">
            <GoogleMapEmbed address={deferredAddress} zoom={14} />
          </div>
        </div>
      </div>
    );
  }

  function Economics() {
    const percent = fundingPercent;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Designer */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-ink-600">Valuation</span>
              <input
                type="text"
                className={`${input} ${errors.valuation ? 'border-red-400' : ''}`}
                inputMode="numeric"
                value={st.valuationStr}
                onChange={(e) => setSt((s) => ({ ...s, valuationStr: e.target.value.replace(/[^\d]/g, '') }))}
                placeholder="350000"
              />
              {valuation != null ? (
                <div className="text-xs text-ink-600">
                  Implied raise: <b>{moneyFmt(impliedRaise)}</b>
                </div>
              ) : null}
            </label>

            <label className="space-y-1">
              <span className="text-sm text-ink-600">Equity offered (%)</span>
              <input
                type="text"
                className={`${input} ${errors.equityPct ? 'border-red-400' : ''}`}
                inputMode="numeric"
                value={st.equityPctStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, '');
                  const next = raw === '' ? '' : String(clamp(Number(raw), 0, 100));
                  setSt((s) => ({ ...s, equityPctStr: next }));
                }}
                placeholder="10"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={equityPct}
                onChange={(e) => setSt((s) => ({ ...s, equityPctStr: (e.target as HTMLInputElement).value }))}
                onInput={(e) => setSt((s) => ({ ...s, equityPctStr: (e.target as HTMLInputElement).value }))}
                className="w-full"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-ink-600">Minimum investment</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className={`${input} ${errors.minInvestment ? 'border-red-400' : ''}`}
                  inputMode="numeric"
                  value={st.minInvestmentStr}
                  onChange={(e) => setSt((s) => ({ ...s, minInvestmentStr: e.target.value.replace(/[^\d]/g, '') }))}
                  placeholder="5000"
                />
                <div className="flex gap-1">
                  {[2500, 5000, 10000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="text-xs rounded-full border px-2 py-1"
                      onClick={() => setSt((s) => ({ ...s, minInvestmentStr: String(v) }))}
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-ink-600">Target dividend yield (%)</span>
              <input
                type="text"
                className={input}
                inputMode="numeric"
                value={st.targetYieldPctStr}
                onChange={(e) => setSt((s) => ({ ...s, targetYieldPctStr: e.target.value.replace(/[^\d.]/g, '') }))}
                placeholder="5"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-ink-600">Expected appreciation (%)</span>
              <input
                type="text"
                className={input}
                inputMode="numeric"
                value={st.expectedAppreciationPctStr}
                onChange={(e) =>
                  setSt((s) => ({ ...s, expectedAppreciationPctStr: e.target.value.replace(/[^\d.]/g, '') }))
                }
                placeholder="3"
              />
            </label>

            <div className="space-y-2 md:col-span-2">
              <div className="text-sm text-ink-600">Funding goal & progress</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className={`${input} ${errors.fundingGoal ? 'border-red-400' : ''}`}
                  inputMode="numeric"
                  value={st.fundingGoalStr}
                  onChange={(e) => setSt((s) => ({ ...s, fundingGoalStr: e.target.value.replace(/[^\d]/g, '') }))}
                  placeholder="Goal (e.g., 250000)"
                />
                <input
                  type="text"
                  className={`${input} ${errors.fundingCommitted ? 'border-red-400' : ''}`}
                  inputMode="numeric"
                  value={st.fundingCommittedStr}
                  onChange={(e) =>
                    setSt((s) => ({ ...s, fundingCommittedStr: e.target.value.replace(/[^\d]/g, '') }))
                  }
                  placeholder="Committed (e.g., 75000)"
                />
              </div>

              <div className="rounded-2xl bg-ink-100 h-3 overflow-hidden">
                <div
                  className={`h-3 ${percent >= 100 ? 'bg-green-600' : 'bg-ink-900'} transition-all`}
                  style={{ width: `${percent}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                />
              </div>
              <div className="text-sm text-ink-700">
                {fundingGoal != null ? (
                  <>
                    {percent}% funded • {moneyFmt(fundingCommitted ?? 0)} / {moneyFmt(fundingGoal)}
                  </>
                ) : (
                  'Set a goal to show progress.'
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (impliedRaise != null) setSt((s) => ({ ...s, fundingGoalStr: String(impliedRaise) }));
                  }}
                >
                  Use equity × valuation as goal
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!fundingGoal || !minInvestment) return;
                    const slots = Math.max(1, Math.floor(fundingGoal / (minInvestment || 1)));
                    alert(
                      `At a $${(minInvestment ?? 0).toLocaleString()} minimum, you need about ${slots.toLocaleString()} investors to reach the goal.`,
                    );
                  }}
                >
                  Estimate investor count
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live investor fit / preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-200 p-3">
            <div className="text-sm font-medium text-ink-900">Investor fit (live)</div>
            {liveFit ? (
              <div className="mt-2 space-y-2">
                <span className="text-xs rounded-full bg-ink-900 text-white px-2 py-1">{liveFit.label}</span>
                {liveFit.reason ? <div className="text-xs text-ink-700 leading-relaxed">{liveFit.reason}</div> : null}
              </div>
            ) : (
              <div className="text-sm text-ink-600 mt-2">Start filling in economics to see the match.</div>
            )}
          </div>

          <div className="rounded-2xl border border-ink-200 p-3">
            <div className="text-sm font-medium text-ink-900">At-a-glance</div>
            <ul className="mt-2 text-sm text-ink-800 space-y-1">
              <li>Valuation: {valuation != null ? moneyFmt(valuation) : '—'}</li>
              <li>Equity: {st.equityPctStr !== '' ? `${equityPct}%` : '—'}</li>
              <li>Min investment: {minInvestment != null ? `$${minInvestment.toLocaleString()}` : '—'}</li>
              <li>
                Funding:{' '}
                {fundingGoal != null
                  ? `${pct(fundingCommitted, fundingGoal)}% • ${moneyFmt(fundingCommitted)} / ${moneyFmt(
                      fundingGoal,
                    )}`
                  : '—'}
              </li>
              <li>Dividend yield (authoring): {st.targetYieldPctStr || '—'}%</li>
              <li>Appreciation (authoring): {st.expectedAppreciationPctStr || '—'}%</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  function Narrative() {
    return (
      <div className="grid grid-cols-1 gap-4">
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Problem / Opportunity</span>
          <textarea className={input} rows={3} value={st.problem} onChange={(e) => setSt((s) => ({ ...s, problem: e.target.value }))} />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Solution / Why this property</span>
          <textarea className={input} rows={3} value={st.solution} onChange={(e) => setSt((s) => ({ ...s, solution: e.target.value }))} />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Execution plan</span>
          <textarea className={input} rows={3} value={st.plan} onChange={(e) => setSt((s) => ({ ...s, plan: e.target.value }))} placeholder="Renovations, rent mix, STR/LTR, milestones." />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Use of funds</span>
          <textarea className={input} rows={3} value={st.useOfFunds} onChange={(e) => setSt((s) => ({ ...s, useOfFunds: e.target.value }))} />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm text-ink-600">Timeline</span>
            <textarea className={input} rows={2} value={st.timeline} onChange={(e) => setSt((s) => ({ ...s, timeline: e.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-ink-600">Exit strategy</span>
            <textarea className={input} rows={2} value={st.exitStrategy} onChange={(e) => setSt((s) => ({ ...s, exitStrategy: e.target.value }))} />
          </label>
        </div>
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Resident story</span>
          <textarea className={input} rows={3} value={st.residentStory} onChange={(e) => setSt((s) => ({ ...s, residentStory: e.target.value }))} placeholder="Who are you and why can you deliver?" />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-ink-600">Strategy tags (comma separated)</span>
          <input className={input} value={st.strategyTags} onChange={(e) => setSt((s) => ({ ...s, strategyTags: e.target.value }))} placeholder="Quick Flip, Growth Upside, ADU, Buy-Back, STR" />
        </label>
      </div>
    );
  }

  function Media() {
    const hero =
      st.heroImageUrl || `https://placehold.co/1200x675/png?text=${encodeURIComponent(st.title || 'Pitch')}`;
    const heroUnopt = !allowedImageHost(st.heroImageUrl);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Hero image URL</span>
            <input className={input} value={st.heroImageUrl} onChange={(e) => setSt((s) => ({ ...s, heroImageUrl: e.target.value }))} placeholder="https://images.unsplash.com/photo-..." />
            {!allowedImageHost(st.heroImageUrl) ? (
              <div className="text-xs text-ink-600 mt-1">Note: this host isn’t whitelisted; preview renders unoptimized.</div>
            ) : null}
            <div className="mt-3 relative w-full aspect-video rounded-xl overflow-hidden border border-ink-100">
              <Image src={hero} alt="Hero preview" fill className="object-cover" unoptimized={heroUnopt} />
            </div>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Offering URL (external)</span>
            <input className={input} value={st.offeringUrl} onChange={(e) => setSt((s) => ({ ...s, offeringUrl: e.target.value }))} placeholder="https://example.com/your-raise" />
            {st.offeringUrl && !isLikelyUrl(st.offeringUrl) ? <div className="text-xs text-red-600">Enter a valid http(s) URL</div> : null}
          </label>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-ink-600">Gallery (optional)</div>
          <div className="flex flex-col gap-2">
            {st.gallery.map((g, i) => {
              const ok = isLikelyUrl(g);
              const unopt = !allowedImageHost(g);
              return (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={`${input} ${!ok ? 'border-red-400' : ''}`}
                    value={g}
                    onChange={(e) => {
                      const nv = e.target.value;
                      setSt((s) => {
                        const arr = [...s.gallery];
                        arr[i] = nv;
                        return { ...s, gallery: arr };
                      });
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <button
                    type="button"
                    className="rounded-full border px-2 py-2"
                    onClick={() =>
                      setSt((s) => {
                        const arr = [...s.gallery];
                        arr.splice(i, 1);
                        return { ...s, gallery: arr };
                      })
                    }
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
            <button type="button" className="inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 w-fit" onClick={() => setSt((s) => ({ ...s, gallery: [...s.gallery, ''] }))}>
              <Plus className="size-4" /> Add image
            </button>
          </div>
        </div>
      </div>
    );
  }

  function Review() {
    const tags = st.strategyTags.split(',').map((t) => t.trim()).filter(Boolean);
    const fit = computeInvestorFit(draftForFit);

    return (
      <div className="space-y-6">
        {fit ? (
          <div className="rounded-2xl border border-ink-100 p-3">
            <div className="text-xs text-ink-600 mb-1">Investor Fit (auto)</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs rounded-full bg-ink-900 text-white px-2 py-1">{fit.label}</span>
            </div>
            {fit.reason ? <div className="text-xs text-ink-700 mt-1">{fit.reason}</div> : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryItem label="Title" value={st.title || '—'} />
          <SummaryItem label="Status" value={st.status} />
          <SummaryItem label="Location" value={[st.city, st.state, st.postalCode].filter(Boolean).join(', ') || '—'} />
          <SummaryItem label="Valuation" value={valuation != null ? moneyFmt(valuation) : '—'} />
          <SummaryItem label="Equity" value={st.equityPctStr !== '' ? `${equityPct}%` : '—'} />
          <SummaryItem label="Min Investment" value={minInvestment != null ? `$${minInvestment.toLocaleString()}` : '—'} />
          <SummaryItem
            label="Funding"
            value={
              fundingGoal != null
                ? `${pct(fundingCommitted, fundingGoal)}% • ${moneyFmt(fundingCommitted)} / ${moneyFmt(fundingGoal)}`
                : '—'
            }
          />
          <SummaryItem label="Dividend yield (authoring)" value={st.targetYieldPctStr ? `${st.targetYieldPctStr}%` : '—'} />
          <SummaryItem label="Appreciation (authoring)" value={st.expectedAppreciationPctStr ? `${st.expectedAppreciationPctStr}%` : '—'} />
          <SummaryItem label="Offering URL" value={st.offeringUrl || '—'} />
          <SummaryItem label="Tags" value={tags.length ? tags.join(', ') : '—'} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => handleSave('draft')} disabled={busy}>{busy ? 'Saving…' : 'Save as Draft'}</Button>
          <Button type="button" variant="secondary" onClick={() => setStep('basics')}>Edit Basics</Button>
          <Button type="button" variant="secondary" onClick={() => setStep('economics')}>Edit Offer Designer</Button>
          <Button type="button" variant="secondary" onClick={() => setStep('media')}>Edit Media</Button>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => handleSave('review')} disabled={busy}>Submit for Review</Button>
          <Button type="button" onClick={() => handleSave('live')} disabled={busy}>Go Live</Button>
        </div>
      </div>
    );
  }

  function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-xl border border-ink-100 p-3">
        <div className="text-xs text-ink-600">{label}</div>
        <div className="text-sm text-ink-900 font-medium">{value}</div>
      </div>
    );
  }

  return (
    <Section className="max-w-5xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">{pitchId ? 'Edit Pitch' : 'Start a Pitch'}</h1>
      </div>

      <TabsHeader />

      <Card>
        <CardBody className="space-y-6">
          {step === 'basics' && <Basics />}
          {step === 'economics' && <Economics />}
          {step === 'narrative' && <Narrative />}
          {step === 'media' && <Media />}
          {step === 'review' && <Review />}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="secondary" onClick={goPrev} disabled={!canBack}>
              <ChevronLeft className="size-4" /> Back
            </Button>
            {step !== 'review' ? (
              <Button type="button" onClick={() => { if (validateCurrent()) goNext(); }}>
                Continue <ChevronRight className="size-4" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </CardBody>
      </Card>
    </Section>
  );
}
