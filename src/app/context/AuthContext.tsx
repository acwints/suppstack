"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/account/profile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  loginWithGoogle: (nextPath?: string) => Promise<void>;
  loginWithApple: (nextPath?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getInitialSession() {
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: Session | null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 5000)
          ),
        ]);
        const session = sessionResult.data.session;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          getOrCreateUserProfile(session.user).catch((error) => {
            console.error('Failed to prepare user profile:', error);
          });
        }
      } catch (error) {
        console.error('Failed to load auth session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Only redirect on actual sign-in, not token refresh or session restore
      if (event === 'SIGNED_IN' && session?.user) {
        getOrCreateUserProfile(session.user).catch((error) => {
          console.error('Failed to prepare user profile:', error);
        });
        const nextPath =
          typeof window !== 'undefined'
            ? window.sessionStorage.getItem('suppstack_post_login_path')
            : null;
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('suppstack_post_login_path');
        }
        router.push(nextPath || '/profile');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const startOAuth = async (provider: 'google' | 'apple', nextPath = '/profile') => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('suppstack_post_login_path', nextPath);
    }

    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : 'https://www.suppstack.app/profile';

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const loginWithGoogle = async (nextPath = '/profile') => {
    await startOAuth('google', nextPath);
  };

  const loginWithApple = async (nextPath = '/profile') => {
    await startOAuth('apple', nextPath);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, loginWithGoogle, loginWithApple, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
