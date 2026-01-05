'use client';

import { createContext, useContext } from 'react';
import type { CardVariant, CardHover } from '@/types';

interface CardContextValue {
  variant: CardVariant;
}

const CardContext = createContext<CardContextValue>({ variant: 'default' });

export interface CardProps {
  variant?: CardVariant;
  hover?: CardHover;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  modern: 'modern-card',
  feature: 'feature-highlight',
};

const hoverClasses: Record<CardHover, string> = {
  none: '',
  lift: 'hover:scale-105 transition-all duration-300',
  airbnb: 'airbnb-hover',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  hover = 'none',
  padding = 'none',
  className = '',
  children,
  onClick,
  style,
}: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div
        className={`
          ${variantClasses[variant]}
          ${hoverClasses[hover]}
          ${paddingClasses[padding]}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={onClick}
        style={style}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className = '', children }: CardHeaderProps) {
  return (
    <div className={`card-header p-6 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function CardBody({ className = '', children }: CardBodyProps) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className = '', children }: CardFooterProps) {
  return (
    <div className={`card-footer p-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

// Compound component pattern
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
