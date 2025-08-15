'use client';

import type { Pitch } from '@/types/pitch';
import PitchWizard from './PitchWizard';

export default function ResidentPitchForm(props: { initial?: Pitch | null; pitchId?: string; onSaved?: (p: Pitch) => void }) {
  return <PitchWizard {...props} />;
}
