'use client';

import { useState } from 'react';
import { FiCheck, FiLoader, FiPlus } from 'react-icons/fi';
import { cn } from '@/lib/design-system';

export interface LogButtonProps {
  productName: string;
  isLogged: boolean;
  isLoading?: boolean;
  /** Check the product off for today. */
  onLog: () => Promise<void>;
  /** Undo today's check-off. */
  onUnlog: () => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-10 w-10',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
} as const;

const iconSizes = { sm: 18, md: 20, lg: 22 } as const;

/**
 * Circular check-off toggle for a single supplement. Empty circle invites the
 * tap; a filled ink check confirms it.
 */
export function LogButton({
  productName,
  isLogged,
  isLoading = false,
  onLog,
  onUnlog,
  size = 'md',
}: LogButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (): Promise<void> => {
    if (isProcessing || isLoading) return;

    setIsProcessing(true);
    try {
      if (isLogged) {
        await onUnlog();
      } else {
        await onLog();
      }
    } catch (error) {
      console.error('Error toggling log:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonLoading = isLoading || isProcessing;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={buttonLoading}
      aria-pressed={isLogged}
      aria-label={isLogged ? `Unlog ${productName}` : `Log ${productName}`}
      title={isLogged ? `${productName} — taken today` : `Log ${productName}`}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-2 touch-manipulation',
        'transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.92]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
        sizeStyles[size],
        isLogged
          ? 'border-gray-900 bg-gray-900 text-white hover:border-gray-800 hover:bg-gray-800'
          : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600',
        buttonLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      )}
    >
      {buttonLoading ? (
        <FiLoader className="animate-spin" size={iconSizes[size]} aria-hidden="true" />
      ) : isLogged ? (
        <FiCheck size={iconSizes[size]} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <FiPlus size={iconSizes[size]} aria-hidden="true" />
      )}
    </button>
  );
}
