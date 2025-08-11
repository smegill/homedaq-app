import { NextRequest, NextResponse } from 'next/server';

// Placeholder: wire to FHFA state HPI in a follow-up.
// For now, return a stable shape so the UI can opt-in later.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = (searchParams.get('state') || '').trim().toUpperCase();
  if (!state) return NextResponse.json({ ok: false, error: 'Missing ?state=XX' }, { status: 400 });
  return NextResponse.json({ ok: false, state, message: 'FHFA HPI wiring TBD' }, { status: 200 });
}
