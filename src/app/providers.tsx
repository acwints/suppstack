'use client';

import { AuthProvider } from './context/AuthContext';
import { PremiumProvider } from './context/PremiumContext';
import { SavedProductsProvider } from './context/SavedProductsContext';
import { StackIngredientsProvider } from './context/StackIngredientsContext';
import { ToastProvider, ToastContainer } from '@/components/ui';
import { PaywallHost } from '@/components/composite/Billing';
import { ReferralCapture } from '@/components/composite/Growth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StackIngredientsProvider>
        <SavedProductsProvider>
          <ToastProvider>
            <PremiumProvider>
              <ReferralCapture />
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