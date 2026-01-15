---
description: Scaffold a new UI component following SuppStack patterns
allowed-tools: Read, Write, Glob
---

# New Component Scaffolding

Create a new UI component named `$ARGUMENTS` following the SuppStack design system and component patterns.

## Instructions

1. **Component Name**: `$ARGUMENTS` (PascalCase)

2. **File Location**: Create at `src/components/ui/$ARGUMENTS.tsx`

3. **Follow This Exact Pattern**:

```tsx
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

// Define variants appropriate for this component type
export type $ARGUMENTSVariant = 'default' | 'primary' | 'secondary';
export type $ARGUMENTSSize = 'sm' | 'md' | 'lg';

export interface $ARGUMENTSProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: $ARGUMENTSVariant;
  /** Size preset */
  size?: $ARGUMENTSSize;
  /** Optional children */
  children?: ReactNode;
}

const variantStyles: Record<$ARGUMENTSVariant, string> = {
  default: cn(
    'bg-white border border-gray-200',
    'text-gray-900'
  ),
  primary: cn(
    'bg-gray-900 text-white',
    'border border-gray-900'
  ),
  secondary: cn(
    'bg-gray-100 text-gray-900',
    'border border-gray-200'
  ),
};

const sizeStyles: Record<$ARGUMENTSSize, string> = {
  sm: 'p-3 text-xs',
  md: 'p-4 text-sm',
  lg: 'p-6 text-base',
};

/**
 * $ARGUMENTS component
 *
 * A [describe component purpose here]
 */
export const $ARGUMENTS = forwardRef<HTMLDivElement, $ARGUMENTSProps>(
  (
    {
      variant = 'default',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded',
          'transition-colors duration-150',
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

$ARGUMENTS.displayName = '$ARGUMENTS';

export default $ARGUMENTS;
```

4. **Customize for Component Type**:
   - **Alert**: Add `info`, `success`, `warning`, `error` variants; add `onDismiss` prop and close button
   - **Badge**: Make inline, add color variants, smaller default size
   - **Tooltip**: Add positioning, trigger logic
   - **Skeleton**: Remove borders, add animation

5. **Design System Rules**:
   - Use colors from tokens: `gray-100`, `gray-200`, `gray-900`, etc.
   - Use `rounded` or `rounded-md` (not `rounded-full` unless circular)
   - Use subtle shadows: `shadow-sm` or none
   - Include proper focus states if interactive
   - Follow semantic colors for variants (success = green-600, error = red-600)

6. **After Creating**:
   - Report the file location
   - Suggest how to import and use the component
   - Ask if any customizations are needed

## Example Usage

```tsx
import { $ARGUMENTS } from '@/components/ui/$ARGUMENTS';

<$ARGUMENTS variant="primary" size="md">
  Content here
</$ARGUMENTS>
```
