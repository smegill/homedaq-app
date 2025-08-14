'use client';

import * as React from 'react';
import type { Pitch, PitchInput, RiskProfile, PitchStatus } from '@/types/pitch';
import { savePitch } from '@/lib/storage';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const input =
  'w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder-ink-400 outline-none focus:ring-2 focus:ring-brand-500';

const ALL_STATUS: PitchStatus[] = ['draft', 'review', 'live', 'funded', 'closed', 'archived'];
const ALL_RISKS: RiskProfile[] = ['Balanced', 'Yield', 'Growth'];

type FormState = {
  title: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  valuation?: number;
  minInvestment?: number;
  equityPct?: number;
  heroImageUrl?: string;
  offeringUrl?: string;
  status: PitchStatus;
  summary?: string;
  problem?: string;
  solution?: string;
  plan?: string;
  useOfFunds?: string;
  exitStrategy?: string;
  improvements?: string;
  timeline?: string;
  residentStory?: string;
  strategyTags?: string;
  riskProfile?: RiskProfile;
};

function toState(p?: Pitch): FormState {
  return {
    title: p?.title ?? '',
    address1: p?.address1,
    address2: p?.address2,
    city: p?.city,
    state: p?.state,
    postalCode: p?.postalCode,
    valuation: p?.valuation,
    minInvestment: p?.minInvestment,
    equityPct: p?.equityPct,
    heroImageUrl: p?.heroImageUrl,
    offeringUrl: p?.offeringUrl,
    status: p?.status ?? 'review',
    summary: p?.summary,
    problem: p?.problem,
    solution: p?.solution,
    plan: p?.plan,
    useOfFunds: p?.useOfFunds,
    exitStrategy: p?.exitStrategy,
    improvements: p?.improvements,
    timeline: p?.timeline,
    residentStory: p?.residentStory,
    strategyTags: (p?.strategyTags ?? []).join(', '),
    riskProfile: p?.riskProfile,
  };
}

export default function ResidentPitchForm({
  initial,
  pitchId,
  onSaved,
}: {
  initial?: Pitch | null;
  pitchId?: string;
  onSaved?: (p: Pitch) => void;
}) {
  const [st, setSt] = React.useState<FormState>(toState(initial ?? undefined));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (initial) setSt(toState(initial));
  }, [initial]);

  async function submit() {
    setSaving(true);
    const payload: PitchInput = {
      ...st,
      id: pitchId ?? initial?.id, // include id in the payload if editing
      strategyTags: st.strategyTags
        ? st.strategyTags.split(',').map((x) => x.trim()).filter(Boolean)
        : [],
      updatedAt: Date.now(),
      createdAt: initial?.createdAt ?? Date.now(),
    };
    // NOTE: repo's savePitch accepts a single argument
    const saved = await savePitch(payload);
    setSaving(false);
    onSaved?.(saved);
  }

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm text-ink-600">Title</span>
            <input
              className={input}
              value={st.title}
              onChange={(e) => setSt((s) => ({ ...s, title: e.target.value }))}
              placeholder="Sunny duplex near parks"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Status</span>
            <select
              className={input}
              value={st.status}
              onChange={(e) => setSt((s) => ({ ...s, status: e.target.value as PitchStatus }))}
            >
              {ALL_STATUS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Address 1</span>
            <input
              className={input}
              value={st.address1 ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, address1: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Address 2</span>
            <input
              className={input}
              value={st.address2 ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, address2: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">City</span>
            <input
              className={input}
              value={st.city ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, city: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">State</span>
            <input
              className={input}
              value={st.state ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, state: e.target.value || undefined }))}
              placeholder="PA"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">ZIP</span>
            <input
              className={input}
              inputMode="numeric"
              maxLength={5}
              value={st.postalCode ?? ''}
              onChange={(e) =>
                setSt((s) => ({
                  ...s,
                  postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) || undefined,
                }))
              }
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Risk profile</span>
            <select
              className={input}
              value={st.riskProfile ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, riskProfile: (e.target.value || undefined) as RiskProfile }))
              }
            >
              <option value="">Select…</option>
              {ALL_RISKS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Valuation</span>
            <input
              className={input}
              inputMode="numeric"
              value={st.valuation ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, valuation: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="350000"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Minimum investment</span>
            <input
              className={input}
              inputMode="numeric"
              value={st.minInvestment ?? ''}
              onChange={(e) =>
                setSt((s) => ({
                  ...s,
                  minInvestment: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="5000"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-ink-600">Equity offered (%)</span>
            <input
              className={input}
              inputMode="numeric"
              value={st.equityPct ?? ''}
              onChange={(e) =>
                setSt((s) => ({ ...s, equityPct: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="10"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Hero image URL</span>
            <input
              className={input}
              value={st.heroImageUrl ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, heroImageUrl: e.target.value || undefined }))}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Offering URL (optional, external)</span>
            <input
              className={input}
              value={st.offeringUrl ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, offeringUrl: e.target.value || undefined }))}
              placeholder="https://example.com/your-raise"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">One-paragraph summary</span>
            <textarea
              className={input}
              rows={3}
              value={st.summary ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, summary: e.target.value || undefined }))}
              placeholder="What is the opportunity in a nutshell?"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Problem / Opportunity</span>
            <textarea
              className={input}
              rows={3}
              value={st.problem ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, problem: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Solution / Why this property</span>
            <textarea
              className={input}
              rows={3}
              value={st.solution ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, solution: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Execution plan</span>
            <textarea
              className={input}
              rows={3}
              value={st.plan ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, plan: e.target.value || undefined }))}
              placeholder="Renovations, rent mix, STR/LTR, milestones."
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Use of funds</span>
            <textarea
              className={input}
              rows={3}
              value={st.useOfFunds ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, useOfFunds: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Improvements</span>
            <textarea
              className={input}
              rows={3}
              value={st.improvements ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, improvements: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Timeline</span>
            <textarea
              className={input}
              rows={2}
              value={st.timeline ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, timeline: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Exit strategy</span>
            <textarea
              className={input}
              rows={2}
              value={st.exitStrategy ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, exitStrategy: e.target.value || undefined }))}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Resident story</span>
            <textarea
              className={input}
              rows={3}
              value={st.residentStory ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, residentStory: e.target.value || undefined }))}
              placeholder="Who are you and why can you deliver?"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-ink-600">Strategy tags (comma separated)</span>
            <input
              className={input}
              value={st.strategyTags ?? ''}
              onChange={(e) => setSt((s) => ({ ...s, strategyTags: e.target.value }))}
              placeholder="STR, Light Reno, BRRRR"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
