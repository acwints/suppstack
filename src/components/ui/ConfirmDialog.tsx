'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/design-system';
import { Button, type ButtonVariant } from './Button';

export interface ConfirmDialogProps {
  /** Whether dialog is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Confirm handler */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description?: string;
  /** Custom content below description */
  children?: ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: ButtonVariant;
  /** Loading state for async confirm */
  isLoading?: boolean;
  /** Disable confirm button until required confirmation input is complete */
  confirmDisabled?: boolean;
  /** Danger/destructive action styling */
  danger?: boolean;
}

/**
 * ConfirmDialog - Modal dialog for confirming actions
 *
 * @example
 * <ConfirmDialog
 *   isOpen={showDelete}
 *   onClose={() => setShowDelete(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Stack"
 *   description="Are you sure you want to delete this stack? This action cannot be undone."
 *   confirmText="Delete"
 *   danger
 * />
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant,
  isLoading = false,
  confirmDisabled = false,
  danger = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Determine confirm button variant
  const finalConfirmVariant: ButtonVariant = confirmVariant || (danger ? 'danger' : 'primary');

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen) {
      // Focus cancel button by default
      cancelRef.current?.focus();
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const dialog = (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-200'
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        className={cn(
          'w-full max-w-md',
          'bg-white rounded-2xl shadow-xl',
          'animate-in zoom-in-95 duration-200'
        )}
      >
        <div className="p-6">
          {/* Icon */}
          {danger && (
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className={cn(
              'text-lg font-semibold text-gray-900',
              danger ? 'text-center' : ''
            )}
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              className={cn(
                'mt-2 text-sm text-gray-600',
                danger ? 'text-center' : ''
              )}
            >
              {description}
            </p>
          )}

          {/* Custom content */}
          {children && <div className="mt-4">{children}</div>}
        </div>

        {/* Actions */}
        <div
          className={cn(
            'flex gap-3 px-6 py-4',
            'border-t border-gray-200',
            danger ? 'flex-col-reverse sm:flex-row sm:justify-center' : 'justify-end'
          )}
        >
          <Button
            ref={cancelRef}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className={danger ? 'sm:w-auto w-full' : ''}
          >
            {cancelText}
          </Button>
          <Button
            variant={finalConfirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={confirmDisabled}
            className={danger ? 'sm:w-auto w-full' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  // Render in portal
  if (typeof window === 'undefined') return null;
  return createPortal(dialog, document.body);
}

export default ConfirmDialog;
