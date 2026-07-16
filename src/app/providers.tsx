'use client';

import { AuthProvider } from './context/AuthContext';
import { SavedProductsProvider } from './context/SavedProductsContext';
import { StackIngredientsProvider } from './context/StackIngredientsContext';
import { ToastProvider, ToastContainer } from '@/components/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StackIngredientsProvider>
        <SavedProductsProvider>
          <ToastProvider>
            {children}
            <ToastContainer position="bottom-right" />
          </ToastProvider>
        </SavedProductsProvider>
      </StackIngredientsProvider>
    </AuthProvider>
  );
}