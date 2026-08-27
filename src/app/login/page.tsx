'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { Spinner, useToast } from '@/components/ui';
import { isNativeApp } from '@/lib/native/capacitor';
import { isNativeAppleSignInCancellation } from '@/lib/native/apple-sign-in';

/**
 * Full-bleed, single-decision auth screen (Etsy iOS onboarding pattern).
 * The app chrome (header/footer/tab bar) is hidden on this route; the brand
 * mark is typeset live — SUPP / double rule / STACK — with more generous
 * line spacing than the app-icon asset.
 */

/** The SUPP/STACK mark, spaced out and crisp at any size. */
function BrandMark() {
  return (
    <div
      aria-label="SuppStack"
      className="flex h-24 w-24 flex-col items-center justify-center rounded-[22px] bg-gray-900 shadow-sm"
    >
      <span className="font-sans text-[15px] font-extrabold leading-none tracking-[0.18em] text-white">
        SUPP
      </span>
      {/* Rules step outward — just wider than SUPP, just narrower than STACK
          — so the lockup funnels: SUPP → rule → rule → STACK. */}
      <span className="my-2 flex flex-col items-center gap-[3.5px]" aria-hidden="true">
        <span className="h-[2.5px] w-[49px] rounded-full bg-white" />
        <span className="h-[2.5px] w-[53px] rounded-full bg-white" />
      </span>
      <span className="font-sans text-[15px] font-extrabold leading-none tracking-[0.14em] text-white">
        STACK
      </span>
    </div>
  );
}

export default function Login() {
  const {
    user,
    loading,
    authError,
    clearAuthError,
    loginWithApple,
    loginWithGoogle,
  } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [nextPath, setNextPath] = useState('/log');
  const [pendingProvider, setPendingProvider] = useState<'apple' | 'google' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPath = params.get('next');
    if (requestedPath?.startsWith('/')) {
      setNextPath(requestedPath);
    }
  }, []);

  useEffect(() => {
    if (user && !loading) {
      router.replace(nextPath);
    }
  }, [nextPath, user, loading, router]);

  useEffect(() => {
    if (!authError) return;
    toast.error(authError);
    clearAuthError();
  }, [authError, clearAuthError, toast]);

  const handleLogin = async (provider: 'apple' | 'google') => {
    setPendingProvider(provider);
    try {
      if (provider === 'apple') {
        await loginWithApple(nextPath);
      } else {
        await loginWithGoogle(nextPath);
      }
    } catch (error) {
      console.error(`Error logging in with ${provider}:`, error);
      if (!isNativeAppleSignInCancellation(error)) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message
            : 'Sign-in didn’t complete. Please try again.';
        toast.error(message);
      }
    } finally {
      setPendingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <Spinner size="lg" color="secondary" />
      </div>
    );
  }

  if (user) return null;

  const ENTER = 'animate-fade-in motion-reduce:animate-none';
  const delay = (ms: number) => ({
    animationDelay: `${ms}ms`,
    animationFillMode: 'backwards' as const,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-white pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className={ENTER} style={delay(0)}>
            <BrandMark />
          </div>
          <p
            className={`mt-9 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 ${ENTER}`}
            style={delay(90)}
          >
            The supplement marketplace
          </p>
          <h1
            className={`mt-3 max-w-sm text-balance font-serif text-4xl leading-[1.15] tracking-[-0.015em] text-gray-900 ${ENTER}`}
            style={delay(150)}
          >
            Know what you take.
            <br />
            Know what works.
          </h1>
        </div>

        {/* Providers */}
        <div className={`mt-12 space-y-3 ${ENTER}`} style={delay(240)}>
          <button
            type="button"
            onClick={() => handleLogin('apple')}
            disabled={pendingProvider !== null}
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-lg bg-gray-900 px-4 text-base font-medium text-white transition-colors duration-150 hover:bg-gray-800 active:bg-gray-950 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {pendingProvider === 'apple' ? (
              <Spinner size="sm" color="white" />
            ) : (
              <FaApple size={21} className="-mt-0.5" aria-hidden="true" />
            )}
            Continue with Apple
          </button>
          <button
            type="button"
            onClick={() => handleLogin('google')}
            disabled={pendingProvider !== null}
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-4 text-base font-medium text-gray-900 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {pendingProvider === 'google' ? (
              <Spinner size="sm" color="secondary" />
            ) : (
              <FcGoogle size={20} aria-hidden="true" />
            )}
            Continue with Google
          </button>
        </div>

        {/* Guest escape hatch — web only; the native app is auth-first */}
        {!isNativeApp() && (
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center self-center rounded px-4 text-sm font-medium text-gray-600 underline underline-offset-4 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            Continue as guest
          </Link>
        )}
      </div>

      {/* Legal */}
      <p className="mx-auto w-full max-w-sm px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] text-center text-xs leading-5 text-gray-500">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="font-medium underline underline-offset-2 hover:text-gray-700">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-medium underline underline-offset-2 hover:text-gray-700">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
