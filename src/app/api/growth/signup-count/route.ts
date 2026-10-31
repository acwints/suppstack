import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { getSupabaseAnonServerClient } from '@/lib/server/supabase';

export const revalidate = 300;

function finiteCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export async function GET() {
  if (!flags.signupCounter) {
    return NextResponse.json({ count: null }, { status: 404 });
  }

  const supabase = getSupabaseAnonServerClient();
  if (!supabase) {
    return NextResponse.json({ count: null }, { status: 503 });
  }

  const { data, error } = await supabase.rpc('signup_count');
  const count = finiteCount(data);
  if (error || count == null) {
    return NextResponse.json({ count: null }, { status: 503 });
  }

  return NextResponse.json({ count });
}
