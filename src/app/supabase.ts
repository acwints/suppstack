import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE keeps the OAuth exchange in the client that started it, which the
    // native iOS shell requires: sign-in opens in SFSafariViewController and
    // returns via deep link, so the session must be established from the
    // returned ?code= rather than a URL fragment owned by another context.
    flowType: 'pkce',
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, { ...options, cache: 'no-store' })
    }
  }
})
