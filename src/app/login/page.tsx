'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiCheckCircle, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner } from '@/components/ui';

export default function Login() {
  const { user, loading, loginWithApple, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/profile');
  const onboardingBenefits = [
    {
      icon: <FiCheckCircle />,
      title: 'Save products',
      text: 'Keep your shortlist and routine in one place.',
    },
    {
      icon: <FiTrendingUp />,
      title: 'Track outcomes',
      text: 'Log consistency, mood, energy, and cost.',
    },
    {
      icon: <FiShield />,
      title: 'Stay in control',
      text: 'Private by default, with clear account settings.',
    },
  ];

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

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(nextPath);
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple(nextPath);
    } catch (error) {
      console.error('Error logging in with Apple:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-[calc(100dvh-var(--app-header-height)-env(safe-area-inset-top))] bg-white">
      <div className="mx-auto flex min-h-[inherit] max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <section className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Account required
              </p>
              <h1 className="max-w-xl font-serif text-3xl leading-tight tracking-normal text-gray-900 sm:text-5xl">
                Build a smarter supplement stack from day one.
              </h1>
              <p className="max-w-xl text-base leading-7 text-gray-600">
                Create your account to save products, track routines, and keep checkout and
                recommendations tied to your actual stack.
              </p>
            </div>
          </section>

          <section className="rounded border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="space-y-5">
              <div>
                <h2 className="font-sans text-xl font-semibold tracking-normal text-gray-900">
                  Create your account
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Use a secure sign-in method to start your personal supplement profile.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAppleLogin}
                  variant="primary"
                  fullWidth
                  leftIcon={<FaApple size={20} />}
                  className="h-12 justify-center text-base"
                >
                  Continue with Apple
                </Button>
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  fullWidth
                  leftIcon={<FcGoogle size={20} />}
                  className="h-12 justify-center text-base"
                >
                  Continue with Google
                </Button>
              </div>

              <p className="text-center text-xs leading-5 text-gray-500">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="font-medium underline underline-offset-4">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
            {onboardingBenefits.map((item) => (
              <div key={item.title} className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 text-gray-900 [&_svg]:h-5 [&_svg]:w-5">{item.icon}</div>
                <h2 className="font-sans text-sm font-semibold tracking-normal text-gray-900">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm leading-5 text-gray-600">{item.text}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
