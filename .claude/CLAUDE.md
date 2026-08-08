# SuppStack - Claude Code Project Memory

## Tech Stack
- **Framework**: Next.js 14.2.35 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 3.4 with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## Key Commands
```bash
npm run dev        # Development server (port 3000)
npm run build      # Production build
npm run lint       # ESLint with Next.js config
npm run verify:shopify-catalog # Verify Shopify catalog variants
```

## Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (setup, seeding)
│   ├── context/           # AuthContext provider
│   ├── components/        # Page-specific components
│   └── supabase.ts        # Supabase client initialization
├── components/
│   ├── ui/                # Atomic UI components (Button, Card, Input, etc.)
│   │   └── layout/        # Layout primitives (Container, Grid, Stack)
│   └── composite/         # Business logic components
│       ├── Supplement/    # Supplement display components
│       ├── Stack/         # Stack cards and views
│       └── Tracking/      # Daily logging, wellness tracking
├── hooks/                 # Custom React hooks
│   ├── useSupplements.ts        # Supplement fetching
│   ├── useRegimen.ts            # The user's current stack
│   ├── useSupplementLogs.ts     # Daily tracking logs
│   └── useSupplementSettings.ts # User supplement settings
├── lib/
│   ├── design-system/     # cn() class-merging utility
│   └── utils/             # Formatting/price/rating helpers (single source)
├── types/
│   └── index.ts           # Core domain types (60+ interfaces)
└── scripts/               # Data seeding scripts
```

## Coding Conventions

### Components
- **UI components**: Atomic, reusable, in `components/ui/`
- **Composite components**: Business logic, in `components/composite/`
- **Client components**: Must have `'use client'` directive at top
- **Server components**: Default in App Router

### Hooks Pattern
All data hooks follow this pattern:
```typescript
export function useExample() {
  const [data, setData] = useState<Type | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Supabase query using src/app/supabase.ts client
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### Design System
Design tokens are defined once in `tailwind.config.ts` (colors, typography,
radii, shadows, animations) and consumed as Tailwind classes. Compose classes
with `cn()` from `@/lib/design-system`. Formatting helpers (prices, dates,
compact numbers, initials) live in `@/lib/utils` — never reimplement them
inline.

### Type Definitions
All domain types are in `src/types/index.ts`:
- `Supplement`, `Product`, `Brand`, `Stack`
- `UserProfile`, `Review`, `SupplementLog`
- API wrapper: `ApiResponse<T>` for consistent error handling

### Supabase Client
Import from: `import { supabase } from '@/app/supabase'`
- Configured with `cache: 'no-store'`
- Uses Supabase Auth for Google OAuth

## Database Schema (Key Tables)
- `supplements` - Supplement catalog
- `products` - Individual products linked to supplements
- `stacks` - User-created supplement combinations
- `supplement_logs` - Daily intake tracking
- `user_supplement_settings` - Personalized dosage settings
- `reviews` - Product reviews
- `profiles` - User profiles

## Product Principles (owner-set, do not regress)
1. **Mobile app first.** The iOS app (Capacitor shell loading the production
   web app) is the priority surface; the website matters second, but the two
   share code and must both work perfectly.
2. **No footer in the app.** The website footer never renders in the native
   app or on mobile-width viewports — the tab bar is the chrome there. Legal
   links live on the Profile screen and desktop footer.
3. **No red/green "traffic light" color coding.** Avoid the generic
   red-to-green semantic gradients seen in every AI-generated app. State is
   communicated in monochrome ink (filled / outlined / empty) plus the single
   warm accent, used sparingly for progress and celebration moments.
   Semantic colors (success/error/warning/info) are reserved for transient
   feedback only: toasts, form errors, destructive confirmation.
4. **Monetize the mobile app.** Premium subscriptions on iOS go through
   Apple IAP via `@revenuecat/purchases-capacitor` with the same `premium`
   entitlement as web billing (see PREMIUM_BILLING.md); physical goods keep
   external merchant checkout per App Store guideline 3.1.3(e).

## Critical Rules
1. Never hardcode colors/spacing - use the Tailwind theme (tailwind.config.ts)
2. Always handle loading/error states in data components
3. Use existing hooks when available (check src/hooks/ first)
4. Follow the ApiResponse<T> pattern for API returns
5. Use ToastContext for user notifications
