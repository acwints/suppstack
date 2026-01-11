'use client';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider, ToastContainer } from '@/components/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <ToastContainer position="bottom-right" />
      </ToastProvider>
    </AuthProvider>
  );
}