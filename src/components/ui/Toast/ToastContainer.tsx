'use client';

import { useToast } from './ToastContext';
import { Toast } from './Toast';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastContainerProps {
  position?: ToastPosition;
}

// Top offsets clear the notch (viewport-fit=cover); bottom offsets clear the
// home indicator and the mobile tab bar.
const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-[max(1rem,env(safe-area-inset-top))] right-4',
  'top-left': 'top-[max(1rem,env(safe-area-inset-top))] left-4',
  'bottom-right': 'bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-4 right-4',
  'bottom-left': 'bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-4 left-4',
  'top-center': 'top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ position = 'bottom-right' }: ToastContainerProps) {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 ${positionStyles[position]}`}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
