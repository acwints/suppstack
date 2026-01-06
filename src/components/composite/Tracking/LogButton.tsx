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

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  if (isLogged) {
    return (
      <button
        onClick={handleClick}
        disabled={buttonLoading}
        className={`
          flex items-center gap-2 rounded-full
          bg-green-100 text-green-700 hover:bg-green-200
          transition-all duration-200
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
        {showLabel && <span className="text-sm font-medium pr-1">Taken</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={buttonLoading}
      className={`
        flex items-center gap-2 rounded-full
        bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600
        transition-all duration-200
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
      {showLabel && <span className="text-sm font-medium pr-1">Log</span>}
    </button>
  );
}

export default LogButton;
