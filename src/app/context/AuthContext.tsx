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
  loginWithGoogle: () => Promise<void>;
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
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getOrCreateUserProfile(session.user).catch((error) => {
          console.error('Failed to prepare user profile:', error);
        });
      }
      setLoading(false);
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
        router.push('/profile');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loginWithGoogle = async () => {
    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/profile`
        : 'https://www.suppstack.app/profile';

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
