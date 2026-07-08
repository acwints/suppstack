import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE so the native shell can complete OAuth via deep link: the auth
    // code returns on app.suppstack://auth-callback and is exchanged in the
    // webview, where the code verifier lives.
    flowType: 'pkce',
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, { ...options, cache: 'no-store' })
    }
  }
})
