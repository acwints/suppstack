import { isNativeApp } from './capacitor';

export interface NativeAppleCredential {
  identityToken: string;
  authorizationCode?: string;
  userIdentifier?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
}

interface NativeAppleAuthorizationOptions {
  /** SHA-256 digest of the raw nonce passed to Supabase after authorization. */
  nonce: string;
}

interface SuppStackAppleSignInPlugin {
  authorize: (
    options: NativeAppleAuthorizationOptions
  ) => Promise<NativeAppleCredential>;
}

export interface NativeAppleAuthorization {
  credential: NativeAppleCredential;
  rawNonce: string;
}

function getAppleSignInPlugin(): SuppStackAppleSignInPlugin | null {
  if (typeof window === 'undefined') return null;

  return ((window.Capacitor?.Plugins as Record<string, unknown> | undefined)
    ?.SuppStackAppleSignIn ?? null) as SuppStackAppleSignInPlugin | null;
}

function createRawNonce(): string {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export function hasNativeAppleSignInBridge(): boolean {
  return isNativeApp() && Boolean(getAppleSignInPlugin());
}

/**
 * Presents Apple's system authorization sheet and returns the ID token plus
 * the raw nonce Supabase needs to validate that token.
 */
export async function authorizeWithNativeApple(): Promise<NativeAppleAuthorization> {
  const plugin = getAppleSignInPlugin();
  if (!isNativeApp() || !plugin) {
    throw new Error('Native Sign in with Apple is unavailable in this app build.');
  }

  const rawNonce = createRawNonce();
  const credential = await plugin.authorize({ nonce: await sha256(rawNonce) });
  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token. Please try again.');
  }

  return { credential, rawNonce };
}

export function isNativeAppleSignInCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const value = error as { code?: unknown; message?: unknown };
  return (
    value.code === 'APPLE_SIGN_IN_CANCELLED' ||
    (typeof value.message === 'string' &&
      value.message.toLowerCase().includes('sign in was cancelled'))
  );
}
