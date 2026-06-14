'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Spinner, Stack } from '@/components/ui';

export default function Login() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error logging in with Google:', error);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <Card padding="lg" className="w-full max-w-md border-gray-200">
        <Stack gap={6} align="center">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-serif text-gray-900">
              SuppStack
            </h1>
            <p className="text-gray-600 mt-2">
              Build gym stacks, compare restock cost, and save protein, creatine, and recovery picks.
            </p>
          </div>

          {/* Login Section */}
          <Stack gap={4} fullWidth>
            <h2 className="text-xl font-semibold text-gray-900 text-center">Welcome back</h2>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              fullWidth
              leftIcon={<FcGoogle size={20} />}
              className="py-3"
            >
              Continue with Google
            </Button>
          </Stack>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-gray-900 underline underline-offset-4">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-gray-900 underline underline-offset-4">
              Privacy Policy
            </a>
          </p>
        </Stack>
      </Card>
    </div>
  );
}
