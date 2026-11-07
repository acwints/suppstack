'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Modal } from '@/components/ui';
import type { MerchantCheckout, MerchantOutcome } from '@/lib/commerce/stack-checkout';
import { isNativeApp, openInNativeBrowser } from '@/lib/native/capacitor';
import { presentNativeCheckout } from '@/lib/native/checkout';

const outcomeText: Record<MerchantOutcome, string> = {
  completed: 'Checkout completed',
  dismissed: 'Closed without completion. You can try again.',
  failed: 'Checkout could not open. Try again when you’re ready.',
  opened: 'Merchant opened. Completion is confirmed by the merchant.',
};

export function StackCheckout({ merchants, isOpen, onClose }: {
  merchants: MerchantCheckout[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [outcomes, setOutcomes] = useState<Record<string, MerchantOutcome>>({});
  const [pending, setPending] = useState<string | null>(null);
  const inFlight = useRef(false);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = content.current?.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    dialog.tabIndex = -1;
    dialog.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !dialog) return;
      const buttons = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      previousFocus?.focus();
    };
  }, [isOpen]);

  async function openMerchant(merchant: MerchantCheckout) {
    if (inFlight.current || outcomes[merchant.id] === 'completed') return;
    inFlight.current = true;
    setPending(merchant.id);
    try {
      let outcome: MerchantOutcome;
      if (isNativeApp()) {
        const result = merchant.nativeCheckout ? await presentNativeCheckout(merchant.url) : null;
        outcome = result?.status ?? (await openInNativeBrowser(merchant.url) ? 'opened' : 'failed');
      } else {
        // Keep the popup inside the buyer gesture. Async preparation loses it.
        const opened = window.open(merchant.url, '_blank');
        if (opened) opened.opener = null;
        outcome = opened ? 'opened' : 'failed';
      }
      setOutcomes(previous => ({ ...previous, [merchant.id]: outcome }));
    } catch {
      setOutcomes(previous => ({ ...previous, [merchant.id]: 'failed' }));
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  const completed = merchants.filter(merchant => outcomes[merchant.id] === 'completed').length;
  if (!isOpen || typeof document === 'undefined') return null;
  return createPortal(
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout your stack"
      description="Each merchant handles its own payment, shipping and returns."
      showCloseButton={!pending} closeOnEscape={!pending} closeOnOverlayClick={!pending}>
      <div ref={content} className="space-y-4">
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          {completed} of {merchants.length} checkouts completed
        </p>
        {merchants.map(merchant => {
          const outcome = outcomes[merchant.id];
          return (
            <section key={merchant.id} aria-label={merchant.name} className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900">{merchant.name}</h3>
              <ul className="mt-1 space-y-1 text-sm text-gray-600">
                {merchant.products.map(product => <li key={product.product_id}>{product.product_name}</li>)}
              </ul>
              <p className="my-3 text-sm text-gray-600" role="status" aria-live="polite">
                {pending === merchant.id ? 'Checkout is open. Finish or close it to continue.'
                  : outcome ? outcomeText[outcome] : 'Ready to check out'}
              </p>
              <Button type="button" fullWidth variant={outcome === 'completed' ? 'secondary' : 'primary'}
                disabled={Boolean(pending) || outcome === 'completed'}
                onClick={() => void openMerchant(merchant)}>
                {outcome === 'completed' ? 'Completed' : outcome === 'failed' || outcome === 'dismissed'
                  ? `Retry ${merchant.name}` : outcome === 'opened' ? `Reopen ${merchant.name}` : `Checkout with ${merchant.name}`}
              </Button>
            </section>
          );
        })}
        <p className="text-xs text-gray-500">Progress stays here while this page is open. Check your merchant receipt before reopening a checkout.</p>
      </div>
    </Modal>, document.body
  );
}
