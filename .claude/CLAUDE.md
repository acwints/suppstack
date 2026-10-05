# SuppStack - Claude Code Project Memory

## Tech Stack
- **Framework**: Next.js 16 with App Router, React 19
- **Language**: TypeScript 5 (strict mode, no `any`)
- **Styling**: Tailwind CSS 3.4 with custom design system
- **Backend**: Self-hosted Supabase-compatible stack on Railway — GoTrue
  (auth) + PostgREST + Postgres 18 behind a Caddy gateway
  (`infra/railway-api/`). The app talks to it with `@supabase/supabase-js`.
- **Native**: Capacitor iOS shell loading the production site

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
├── app/                   # Next.js App Router pages + API routes (app/api/*)
│   ├── components/        # App chrome: Header, Footer, BottomTabBar, AuthGate, Layout
│   ├── context/           # Providers: Auth, Premium, SavedProducts, StackIngredients
│   ├── providers.tsx      # Provider tree mounted by layout.tsx
│   └── supabase.ts        # Browser Supabase client
├── components/
│   ├── ui/                # Atomic UI (Button, Card, Input, Modal, Toast, …)
│   │   └── layout/        # Layout primitives (VStack, Inline, Grid)
│   └── composite/         # Feature components, one barrel per folder: Billing,
│                          # Brand, Commerce, Filter, Health, Ingredients, Product,
│                          # Rating, Review, Scan, Search, Stack, Supplement, Tracking
├── hooks/                 # Data + shared-state hooks — always import from '@/hooks'
│   ├── useMyStack.ts            # The user's current stack (+ schedule helpers)
│   ├── useSupplementLogs.ts     # Daily check-offs (one per product per day)
│   └── usePremium / useSavedProducts / useStackIngredients  # read app/context providers
├── lib/                   # kebab-case modules, grouped by domain
│   ├── account/  billing/  catalog/  commerce/  native/  navigation/
│   ├── ingredients/       # Pure stack-intake math (barrel: '@/lib/ingredients')
│   ├── server/            # 'server-only' helpers for API routes (auth, http, quotas)
│   ├── design-system/     # cn() class-merging utility
│   └── utils/             # Formatting/price/rating/streak helpers (single source)
├── types/index.ts         # Core domain types
└── scripts/               # Catalog/data maintenance + CI check scripts
```

## Coding Conventions

### Modules
- **Named exports only.** Route files (`page.tsx`, `layout.tsx`, `error.tsx`,
  `route.ts`) are the only default exports.
- Import through folder barrels: `@/hooks`, `@/components/ui`,
  `@/components/composite/<Folder>`, `@/lib/utils`, `@/lib/design-system`,
  `@/lib/ingredients`. Inside a folder, import siblings directly
  (`./ProductTile`), never through the folder's own barrel.
- Shared app state is read through hooks from `@/hooks` (`usePremium`,
  `useSavedProducts`, `useStackIngredients`), which wrap the providers in
  `src/app/context`. (`useAuth` is imported from `@/app/context/AuthContext`.)
  Context modules never import `@/hooks` (cycle).
- File names: components `PascalCase.tsx`, hooks `useX.ts`, lib modules
  `kebab-case.ts`.
- No circular imports (`npx madge --circular --extensions ts,tsx --ts-config tsconfig.json src`).
- No dead code: `npx knip` should report no unused files or functions.

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
inline. Money is always `formatCurrency(x)` ("$12.99"); never hand-build `$`
strings.

### Type Definitions
All domain types are in `src/types/index.ts`:
- `Supplement`, `Product`, `Brand`, `Stack`
- `UserProfile`, `Review`, `SupplementLog`

API routes return errors via `jsonError(error, status, code?)` from
`@/lib/server/http`; pin the code union with `jsonError<MyError['code']>`.

### Supabase Client
Import from: `import { supabase } from '@/app/supabase'`
- Configured with `cache: 'no-store'`
- Uses Supabase Auth for Google OAuth

## Database Schema (Key Tables)
- `supplements`, `products`, `product_ingredients`, `brands` - Catalog (read-only to clients)
- `users_products` - The user's stack (which products they take)
- `user_supplement_settings` - Per-product dose, `schedule_days` (ISO 1=Mon..7=Sun), status
- `supplement_logs` - Check-offs; unique per (user, product, local `log_date`)
- `stacks`, `stack_supplements`, `stack_likes`, `user_follows` - Shared stacks / social
- `product_reviews`, `review_votes`, `product_rating_stats` - Reviews
- `user_profiles` (public identity) + `user_private_profiles` (owner-only details)
- `user_entitlements` - Premium, written only by the RevenueCat webhook
- `commerce_checkout_events` - Server-written checkout analytics

Every user-owned row cascades from `auth.users` so account deletion is
complete. Derived values (streaks, completion) are computed from
`supplement_logs` in the app — don't store copies.

Migrations live in `supabase/migrations/` and are applied by hand on Railway:
`railway ssh -s Postgres -- psql -U postgres -d railway`, then
`NOTIFY pgrst, 'reload schema'`.

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
4. Use ToastContext for user notifications
