# SuppStack - Claude Code Project Memory

## Tech Stack
- **Framework**: Next.js 14.2.35 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 3.4 with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **External APIs**: Amazon Product Advertising API, OpenFDA

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
├── hooks/                 # Custom React hooks (14 total)
│   ├── useSupabaseQuery.ts      # Generic Supabase queries
│   ├── useSupplements.ts        # Supplement fetching
│   ├── useSupplementLogs.ts     # Daily tracking logs
│   └── useSupplementSettings.ts # User supplement settings
├── lib/
│   ├── api/               # External API integrations
│   ├── design-system/     # Design tokens and utilities
│   │   ├── tokens.ts      # Colors, spacing, typography
│   │   └── utils.ts       # Design system helpers
│   └── utils/             # Helper functions
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
Always use tokens from `lib/design-system/tokens.ts`:
- Colors: `colors.gray[900]`, `colors.accent.primary`
- Spacing: `spacing[4]`, `spacing[8]`
- Typography: `typography.sizes.lg`, `typography.weights.medium`

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

## iOS App (Capacitor)
- `ios/` is a Capacitor shell that loads the production site via `server.url`
  in `capacitor.config.ts`; web deploys update the app instantly.
- Native bridges live in `src/lib/native/capacitor.ts` (injected
  `window.Capacitor` global — do NOT import `@capacitor/*` in app code).
- Checkout and Google OAuth open in SFSafariViewController in the shell;
  OAuth returns via the `com.suppstack.app://auth-callback` deep link (PKCE).
- Submission steps: see `APP_STORE_SUBMISSION.md`.

## Critical Rules
1. Never hardcode colors/spacing - use design tokens
2. Always handle loading/error states in data components
3. Use existing hooks when available (check src/hooks/ first)
4. Follow the ApiResponse<T> pattern for API returns
5. Use ToastContext for user notifications
