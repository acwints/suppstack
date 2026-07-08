'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { Spinner, useToast } from '@/components/ui';

/**
 * Single-decision auth screen (Etsy iOS onboarding pattern): brand mark,
 * one short headline, provider buttons, a guest escape hatch, and one line
 * of legal microcopy. No paragraphs, no marketing cards.
 */
export default function Login() {
  const { user, loading, loginWithApple, loginWithGoogle } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [nextPath, setNextPath] = useState('/profile');
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
      toast.error('Sign-in didn’t complete. Please try again.');
      setPendingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--app-header-height)-env(safe-area-inset-top))] items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-height)-env(safe-area-inset-top))] flex-col bg-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
        {/* Brand */}
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 font-serif text-2xl text-white">
            S
          </span>
          <h1 className="mt-6 font-serif text-3xl leading-tight text-gray-900">
            A smarter supplement stack
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Save products, log your routine, see what works.
          </p>
        </div>

        {/* Providers */}
        <div className="mt-10 space-y-3">
          <button
            type="button"
            onClick={() => handleLogin('apple')}
            disabled={pendingProvider !== null}
            className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded bg-gray-900 px-4 text-base font-medium text-white transition-colors duration-150 hover:bg-gray-800 active:bg-gray-950 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {pendingProvider === 'apple' ? (
              <Spinner size="sm" color="white" />
            ) : (
              <FaApple size={20} aria-hidden="true" />
            )}
            Continue with Apple
          </button>
          <button
            type="button"
            onClick={() => handleLogin('google')}
            disabled={pendingProvider !== null}
            className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded border border-gray-300 bg-white px-4 text-base font-medium text-gray-900 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {pendingProvider === 'google' ? (
              <Spinner size="sm" color="secondary" />
            ) : (
              <FcGoogle size={20} aria-hidden="true" />
            )}
            Continue with Google
          </button>
        </div>

        {/* Guest escape hatch */}
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center justify-center self-center rounded px-4 text-sm font-medium text-gray-600 underline underline-offset-4 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Continue as guest
        </Link>
      </div>

      {/* Legal */}
      <p className="mx-auto w-full max-w-sm px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs leading-5 text-gray-500">
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
