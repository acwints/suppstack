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

/** Remember a valid `?ref=` before sign-in. localStorage survives the OAuth round trip. */
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return;
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (!ref || !isReferralCode(ref)) return;
  window.localStorage.setItem(STORAGE_KEY, ref.toLowerCase());
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
