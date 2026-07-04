# SuppStack Coding Standards

These rules apply to all code changes in this project.

## Design System Rules

### Rule 1: Never Use Inline Styles
**ALWAYS** use Tailwind CSS classes instead of inline styles.

Bad:
```tsx
<div style={{ color: 'red', padding: '16px' }}>
```

Good:
```tsx
<div className="text-red-600 p-4">
```

If a user requests inline styles, explain why Tailwind classes are preferred and provide the equivalent Tailwind solution.

### Rule 2: Use Design Token Colors Only
**NEVER** use arbitrary colors. Always use colors from the design system palette.

The palette is professional editorial (grays + warm accent):
- `gray-50` through `gray-900` for most UI
- `accent` colors (orange) for highlights - use sparingly
- Semantic colors: `success` (green), `error` (red), `warning` (amber), `info` (blue)

If a user requests a color outside the palette, explain the design philosophy and suggest the closest alternative from the palette.

### Rule 3: Avoid Heavy Visual Elements
The design is **understated and professional**. Avoid:
- Heavy shadows (`shadow-lg`, `shadow-xl`)
- `rounded-full` for non-circular elements
- Vibrant/saturated colors
- Excessive animations

Prefer:
- No shadow or `shadow-sm`
- `rounded`, `rounded-md`, `rounded-lg`
- Muted, professional colors
- Subtle transitions

## Component Rules

### Rule 4: Follow Component Patterns
All UI components must:
1. Use `forwardRef` for ref forwarding
2. Extend appropriate HTML attributes interface
3. Include `variant` and `size` props where applicable
4. Use the `cn()` utility for class merging
5. Have a displayName set

### Rule 5: Client Components Must Declare
If a component uses hooks, event handlers, or browser APIs, it must have `'use client'` at the top.

### Rule 6: Use Existing Hooks
Before creating custom data fetching logic, check `src/hooks/` for existing hooks:
- `useSupplements` - Supplement data
- `useStacks` - Stack data
- `useSupplementLogs` - Daily tracking
- `useReviews` - Product reviews

## TypeScript Rules

### Rule 7: Types in src/types/
All shared interfaces and types should be in `src/types/index.ts`, not inline in components.

### Rule 8: Explicit Return Types
Functions that are exported should have explicit return types.

## Database Rules

### Rule 9: Supabase Client Import
Always import from `@/app/supabase`:
```tsx
import { supabase } from '@/app/supabase';
```

### Rule 10: Handle Loading and Error States
All data-fetching components must handle:
- Loading state (show skeleton or spinner)
- Error state (show error message)
- Empty state (show empty message)

## What to Do When Rules Conflict with User Requests

1. **Acknowledge** the user's request
2. **Explain** which rule would be violated and why it exists
3. **Propose** a compliant alternative
4. **Ask** if they'd like to proceed with the alternative

Example:
> "You've asked for inline styles, but our project uses Tailwind CSS for consistency. Instead of `style={{ color: 'blue' }}`, we could use `className="text-info-600"` which gives you a blue from our design system. Would you like me to implement it this way?"
