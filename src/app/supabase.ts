import { createClient } from '@supabase/supabase-js'

// trim(): the deployed env vars can carry trailing newlines, which browsers
// strip from URLs but iOS URL(string:) rejects — breaking native OAuth.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

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
