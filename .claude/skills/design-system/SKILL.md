---
name: design-system
description: SuppStack design system tokens, patterns, and UI component conventions. Use when creating UI components, styling elements, or working with colors, spacing, typography. Keywords: component, button, card, input, styling, color, theme, token, ui, tailwind
---

# SuppStack Design System

## Theme: Professional Editorial

The design follows a **professional editorial theme** inspired by NYT and Bloomberg. The aesthetic is:
- **Understated** - Subtle shadows, muted colors
- **Professional** - Clean typography, ample whitespace
- **Minimal** - Warm accent used sparingly
- **Sophisticated** - Gray palette with precise hierarchy

## Color Palette

### Primary Grays (Use These Most)
```
neutral.0:   #ffffff (white backgrounds)
neutral.50:  #fafafa (subtle backgrounds)
neutral.100: #f5f5f5 (secondary backgrounds)
neutral.200: #e5e5e5 (borders, dividers)
neutral.300: #d4d4d4 (disabled states)
neutral.400: #a3a3a3 (placeholder text)
neutral.500: #737373 (secondary text)
neutral.600: #525252 (body text)
neutral.900: #171717 (primary text, headings)
```

### Brand (Professional Black)
```
brand.500: #171717 (primary buttons, emphasis)
brand.600: #0a0a0a (hover states)
```

### Accent (Warm Orange - Use Sparingly)
```
accent.500: #e87a2e (highlights, special CTAs)
accent.600: #d45f1a (hover states)
```
**IMPORTANT**: The accent color should be used very sparingly for maximum impact.

### Semantic Colors
```typescript
// Success (for progress, completion, positive states)
success.500: #22c55e
success.600: #16a34a

// Error (for destructive actions, errors)
error.500: #ef4444
error.600: #dc2626

// Warning (for cautions)
warning.500: #f59e0b

// Info (for informational)
info.500: #0ea5e9
```

## Component Patterns

### File Location
All UI components go in: `src/components/ui/`

### Required Imports
```typescript
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';
```

### Variant/Size Pattern (Follow Button.tsx)
```typescript
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ComponentSize = 'sm' | 'md' | 'lg';

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ComponentVariant;
  size?: ComponentSize;
}

const variantStyles: Record<ComponentVariant, string> = {
  primary: cn('bg-gray-900 text-white'),
  secondary: cn('bg-gray-100 text-gray-900'),
  // ...
};

const sizeStyles: Record<ComponentSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
};
```

### Use forwardRef Pattern
```typescript
export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-styles-here',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';
```

## Spacing Scale
```
spacing[1]:  4px   (0.25rem)
spacing[2]:  8px   (0.5rem)
spacing[3]:  12px  (0.75rem)
spacing[4]:  16px  (1rem)
spacing[6]:  24px  (1.5rem)
spacing[8]:  32px  (2rem)
```

## Border Radius (Subtle)
```
borderRadius.sm:  2px  (very subtle)
borderRadius.md:  4px  (default for buttons, inputs)
borderRadius.lg:  6px  (cards)
borderRadius.xl:  8px  (larger containers)
```
**IMPORTANT**: Avoid `rounded-full` except for avatars/pills. The editorial theme uses subtle, rectangular shapes.

## Shadows (Minimal)
```
shadows.none:  none (default for cards)
shadows.sm:    very subtle (elevated cards)
shadows.md:    slight elevation (hover states)
```
**IMPORTANT**: Shadows are intentionally subtle. Don't use heavy shadows.

## Typography
- **Headings**: font-medium or font-semibold, text-gray-900
- **Body**: font-normal, text-gray-600
- **Secondary**: text-gray-500
- **Captions**: text-xs, text-gray-400

## Focus States
Use the standard focus ring:
```typescript
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2'
```

## Transitions
```
transition-colors duration-150  (color changes)
transition-all duration-200     (multi-property changes)
```

## Example: Progress Bar
```typescript
// Correct implementation following design system
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max, variant = 'default', size = 'md', className, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-gray-100 overflow-hidden',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full transition-all duration-300',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
```

## Anti-Patterns (Avoid These)

**DON'T:**
- Use `rounded-full` for non-circular elements
- Use heavy shadows like `shadow-lg`, `shadow-xl`
- Use vibrant colors outside the defined palette
- Use `bg-green-500` instead of semantic `success` colors
- Create new color values not in tokens

**DO:**
- Use `rounded` or `rounded-md` for subtle radius
- Use `shadow-sm` or no shadow
- Reference semantic colors for states
- Follow the existing component patterns
