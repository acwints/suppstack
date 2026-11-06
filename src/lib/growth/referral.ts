const STORAGE_KEY = 'suppstack_ref';
const SHORT_CODE = /^[a-z0-9]{6,12}$/i;
const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REFERRAL_ORIGIN = 'https://www.suppstack.app';

export function isReferralCode(value: string): boolean {
  return SHORT_CODE.test(value) || USER_ID.test(value);
}

export function referralUrl(code: string): string {
  return `${REFERRAL_ORIGIN}/?ref=${encodeURIComponent(code)}`;
}

/** Button label and fallback when the clipboard is denied or missing. */
export function copyLinkResult(ok: boolean): { button: 'Copied' | 'Copy link'; note: string | null } {
  if (ok) return { button: 'Copied', note: null };
  return { button: 'Copy link', note: 'Couldn’t copy. Select the link above.' };
}

/** A `?ref=` value worth storing. Short codes stay accepted; issued links are user ids. */
export function refFromSearch(search: string): string | null {
  const ref = new URLSearchParams(search).get('ref');
  if (!ref || !isReferralCode(ref)) return null;
  return ref.trim().toLowerCase();
}

/**
 * OAuth returns to this exact URL. The wildcard allow list already permits
 * `/login`, and keeping `ref` on it covers a round trip that drops storage.
 */
export function loginRedirectWithRef(origin: string, ref: string | null): string {
  const url = new URL('/login', origin);
  const stored = ref ? refFromSearch(`?ref=${encodeURIComponent(ref)}`) : null;
  if (stored) url.searchParams.set('ref', stored);
  return url.toString();
}

/** Remember a valid `?ref=` before sign-in. localStorage survives the OAuth round trip. */
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return;
  const ref = refFromSearch(window.location.search);
  if (!ref) return;
  window.localStorage.setItem(STORAGE_KEY, ref);
}

/** Read a stored code without removing it. Clear only after a completed claim. */
export function peekRef(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value || !isReferralCode(value)) return null;
  return value.toLowerCase();
}

export function clearRef(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
