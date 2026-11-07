'use client';

import Link from 'next/link';
import { forwardRef, type ComponentProps } from 'react';
import { buttonClassName, type ButtonProps } from './Button';

export type ButtonLinkProps = ComponentProps<typeof Link> & Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'leftIcon' | 'rightIcon'>;

/** Navigation actions share Button styling while retaining link semantics. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ variant, size, fullWidth, leftIcon, rightIcon, className, children, ...props }, ref) => (
    <Link {...props} ref={ref} className={buttonClassName({ variant, size, fullWidth, className })}>
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Link>
  )
);
ButtonLink.displayName = 'ButtonLink';
