'use client';

import { useEffect, useState, type JSX } from 'react';
import { cn } from '@/lib/design-system';
import type { Toast as ToastType, ToastType as ToastVariant } from './ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-500',
    border: 'border-success-200',
  },
  error: {
    bg: 'bg-error-50',
    icon: 'text-error-500',
    border: 'border-error-200',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-500',
    border: 'border-warning-200',
  },
  info: {
    bg: 'bg-info-50',
    icon: 'text-info-500',
    border: 'border-info-200',
  },
};

const icons: Record<ToastVariant, JSX.Element> = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const styles = variantStyles[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border shadow-md',
        'transition-[opacity,transform] duration-200 ease-out',
        styles.bg,
        styles.border,
        isVisible && !isLeaving
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-4'
      )}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('shrink-0', styles.icon)}>
            {icons[toast.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-[color,background-color,transform] duration-150 hover:bg-white/50 hover:text-gray-700 active:scale-[0.96]"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
