'use client';

import { useState } from 'react';
import { FiCheck, FiPlus, FiLoader } from 'react-icons/fi';
import { Button } from '@/components/ui';
import type { TimeOfDay } from '@/types';

export interface LogButtonProps {
  productId: string;
  productName: string;
  isLogged: boolean;
  isLoading?: boolean;
  onLog: (productId: string, timeOfDay?: TimeOfDay) => Promise<void>;
  onUnlog?: (productId: string) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function LogButton({
  productId,
  productName,
  isLogged,
  isLoading = false,
  onLog,
  onUnlog,
  size = 'md',
  showLabel = true,
  className = '',
}: LogButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (isProcessing || isLoading) return;

    setIsProcessing(true);
    try {
      if (isLogged && onUnlog) {
        await onUnlog(productId);
      } else if (!isLogged) {
        await onLog(productId);
      }
    } catch (error) {
      console.error('Error toggling log:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonLoading = isLoading || isProcessing;

  // Larger touch targets on mobile - minimum 44px recommended
  const sizeClasses = {
    sm: 'p-2 min-w-[36px] min-h-[36px] sm:p-1.5 sm:min-w-0 sm:min-h-0',
    md: 'p-2.5 min-w-[40px] min-h-[40px] sm:p-2 sm:min-w-0 sm:min-h-0',
    lg: 'p-3 min-w-[48px] min-h-[48px] sm:p-3 sm:min-w-0 sm:min-h-0',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  if (isLogged) {
    return (
      <button
        onClick={handleClick}
        disabled={buttonLoading}
        className={`
          flex items-center justify-center gap-2 rounded-full
          bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300
          transition-all duration-200 touch-manipulation active:scale-95
          ${sizeClasses[size]}
          ${buttonLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={`${productName} - Logged`}
      >
        {buttonLoading ? (
          <FiLoader className="animate-spin" size={iconSizes[size]} />
        ) : (
          <FiCheck size={iconSizes[size]} />
        )}
        {showLabel && <span className="text-sm font-medium pr-1 hidden xs:inline">Taken</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={buttonLoading}
      className={`
        flex items-center justify-center gap-2 rounded-full
        bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 active:bg-orange-200
        transition-all duration-200 touch-manipulation active:scale-95
        ${sizeClasses[size]}
        ${buttonLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={`Log ${productName}`}
    >
      {buttonLoading ? (
        <FiLoader className="animate-spin" size={iconSizes[size]} />
      ) : (
        <FiPlus size={iconSizes[size]} />
      )}
      {showLabel && <span className="text-sm font-medium pr-1 hidden xs:inline">Log</span>}
    </button>
  );
}

export default LogButton;
