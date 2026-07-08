'use client';

import { AuthProvider } from './context/AuthContext';
import { SavedProductsProvider } from './context/SavedProductsContext';
import { ToastProvider, ToastContainer } from '@/components/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SavedProductsProvider>
        <ToastProvider>
          {children}
          <ToastContainer position="bottom-right" />
        </ToastProvider>
      </SavedProductsProvider>
    </AuthProvider>
  );
}