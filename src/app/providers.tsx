'use client';

import { AuthProvider } from './context/AuthContext';
import { PremiumProvider } from './context/PremiumContext';
import { SavedProductsProvider } from './context/SavedProductsContext';
import { StackIngredientsProvider } from './context/StackIngredientsContext';
import { ToastProvider, ToastContainer } from '@/components/ui';
import { PaywallHost } from '@/components/composite/Billing';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StackIngredientsProvider>
        <SavedProductsProvider>
          <ToastProvider>
            <PremiumProvider>
              {children}
              <PaywallHost />
            </PremiumProvider>
            <ToastContainer position="bottom-right" />
          </ToastProvider>
        </SavedProductsProvider>
      </StackIngredientsProvider>
    </AuthProvider>
  );
}