import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return NextResponse.json({ error: 'A signed-in session is required.' }, { status: 401 });
  }

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Account deletion is not configured.' }, { status: 503 });
  }

  const { data, error: userError } = await supabase.auth.getUser(token);
  if (userError || !data.user) {
    return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
  }

  const userId = data.user.id;

  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
