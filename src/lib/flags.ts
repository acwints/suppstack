import { isNativeApp } from '@/lib/native/capacitor';

/**
 * Growth flags. Unset means off. Both must stay off in production while the
 * iOS binary in review loads this site. Turning one on requires a rebuild,
 * because Next inlines NEXT_PUBLIC_* at build time.
 */
const on = (value: string | undefined) => value === '1' || value === 'true';

export const flags = {
  signupCounter: on(process.env.NEXT_PUBLIC_FLAG_SIGNUP_COUNTER),
  referrals: on(process.env.NEXT_PUBLIC_FLAG_REFERRALS),
};

/**
 * Growth surfaces never render in the Capacitor shell, even when the flag is
 * on. The shell check is client-only: on the server `window` is missing, so
 * callers that paint UI must start from a hidden state and enable in an effect.
 */
export function growthEnabled(flag: keyof typeof flags): boolean {
  if (!flags[flag]) return false;
  if (typeof window !== 'undefined' && isNativeApp()) return false;
  return true;
}
