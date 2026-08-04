# SuppStack Impeccable Audit

Date: July 30, 2026  
Scope: Production web interface at `https://www.suppstack.app`, the Next.js source in `src/`, and its Capacitor iOS presentation boundary.

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|---|---:|---|
| 1 | Accessibility | 3/4 | Strong baseline, but several selects and one stack toggle lack accessible names; one supplement label fails contrast |
| 2 | Performance | 2/4 | Mobile LCP is 5.0 s and the home screen downloads oversized remote product imagery |
| 3 | Responsive Design | 3/4 | No horizontal overflow at phone or tablet widths; several touch targets remain below 44 px/pt |
| 4 | Theming | 2/4 | The visual system is coherent, but semantic CSS variables are unused and there is no dark appearance |
| 5 | Implementation Integrity | 3/4 | Product-specific and coherent, with limited systemic drift |
| **Total** |  | **13/20** | **Acceptable — significant targeted work remains** |

## Implementation Integrity Verdict

**Pass.** SuppStack expresses a coherent, product-specific system rather than an interchangeable storefront. The health-goal taxonomy, supplement-family navigation, verified merchant language, stack actions, price-per-serving information, and explicit separation of reference-only peptides are consistent across the app.

The Impeccable source detector returned zero deterministic source findings. Its live detector repeated the same image-hover advisory for rendered product instances, but source verification reduces that to two shared component patterns rather than 103 independent defects:

- `src/components/composite/Supplement/SupplementCard.tsx`
- `src/components/composite/Product/ProductTile.tsx`

The live detector's negative right-edge measurements are false positives caused by intentional horizontal carousels. The genuine mobile edge finding is the shared 12 px page gutter.

## Executive Summary

- Audit Health Score: **13/20 (Acceptable)**
- Issues: **0 P0, 3 P1, 5 P2, 1 P3**
- Production build: **passes**
- ESLint: **passes**
- Production dependency audit: **0 vulnerabilities**
- Lighthouse:
  - Mobile: **82 performance / 94 accessibility / 100 best practices / 100 SEO**
  - Desktop: **86 performance / 94 accessibility / 100 best practices / 100 SEO**
  - Product detail accessibility: **100**
  - Supplement detail accessibility: **90**

## Detailed Findings

### [P1] Form controls and a stack toggle lack accessible names

**Locations**

- `src/components/composite/Filter/CategoryFilter.tsx:49`
- `src/components/composite/Filter/SortFilter.tsx:18`
- `src/components/composite/Filter/ProductFilterPanel.tsx:126`
- `src/components/composite/Stack/BuyStackPanel.tsx:227`
- `src/components/composite/Stack/BuyStackPanel.tsx:264`

**Category:** Accessibility  
**Impact:** Screen-reader users encounter unnamed category, sort, and product controls. The unchecked stack-item toggle is a 20 × 20 px icon-only button with no accessible name, so its purpose and state are unavailable.  
**WCAG:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value  
**Evidence:** Lighthouse fails `select-name` for both home filters and the supplement-detail sort control.  
**Recommendation:** Pass explicit `label` or `aria-label` values to every `Select`; associate native selects with visible or screen-reader-only labels; give the stack toggle an action-specific label and `aria-pressed` state.  
**Suggested command:** `/impeccable harden`

### [P1] Supplement form count fails WCAG contrast

**Location:** `src/app/supplement/[id]/page.tsx:256`  
**Category:** Accessibility  
**Impact:** The inactive family-form count is difficult to read, particularly for users with low vision.  
**WCAG:** 1.4.3 Contrast (Minimum)  
**Evidence:** Lighthouse measured **2.41:1** for the 12 px `text-gray-400` count on `bg-gray-50`; the required ratio is 4.5:1.  
**Recommendation:** Raise the inactive count to at least `text-gray-600`, then verify both active and inactive states.  
**Suggested command:** `/impeccable harden`

### [P1] The home route is image-heavy and misses mobile LCP targets

**Locations**

- `src/components/composite/Supplement/SupplementGrid.tsx:12`
- `src/components/composite/Supplement/SupplementCard.tsx:40`
- `src/components/composite/Supplement/HealthGoalDirectory.tsx:59`
- `src/components/composite/Product/ProductTile.tsx:37`

**Category:** Performance  
**Impact:** On a throttled mobile connection, primary content takes too long to become visually complete and the interface remains busy longer than necessary. This is especially costly inside the iOS web view.

**Evidence**

- Mobile Lighthouse: **82**, LCP **5.0 s**, TTI **6.0 s**, main-thread work **2.5 s**
- Mobile image-delivery opportunity: **1,388 KiB**
- Desktop Lighthouse: **86**, LCP **2.5 s**, total payload **2,943 KiB**
- Desktop image-delivery opportunity: **2,218 KiB**
- Unused JavaScript opportunity: approximately **147 KiB**
- The home route renders all 103 supplement browse groups into a page approximately 16,400 px tall

**Recommendation:** Serve CDN-sized WebP/AVIF thumbnails, avoid `unoptimized` when an optimization path is available, request image dimensions that match their rendered slots, paginate or progressively reveal the home catalog, and split route code that is not needed for initial browsing.  
**Suggested command:** `/impeccable optimize`

### [P2] Landmark and heading hierarchy drift across route pages

**Locations**

- `src/app/components/Layout.tsx:10`
- `src/app/product/[id]/page.tsx:146`
- `src/app/supplement/[id]/page.tsx:197`
- `src/components/composite/Product/ProductTile.tsx:69`

**Category:** Accessibility / Implementation Integrity  
**Impact:** Many routes render a `<main>` inside the shell's existing `<main>`, creating two visible main landmarks. On supplement pages, the sequence jumps from the page's `h1` to product-card `h3` headings with no intervening `h2`, which makes screen-reader navigation less predictable.  
**WCAG:** 1.3.1 Info and Relationships; 2.4.6 Headings and Labels  
**Evidence:** Runtime inspection found two visible main landmarks on product and supplement pages. Lighthouse fails `heading-order` on supplement detail.  
**Recommendation:** Let the shell own the single `<main>` landmark and use `<div>`/`section` at route roots, or remove the shell landmark and make every route responsible for it. Introduce a product-results `h2` or adjust card heading levels by context.  
**Suggested command:** `/impeccable harden`

### [P2] Repeated touch targets fall below the 44 pt iOS floor

**Locations**

- `src/components/composite/Product/ProductActions.tsx:103`
- `src/components/composite/Product/ProductActions.tsx:165`
- `src/app/components/Header.tsx:321`
- `src/app/components/Header.tsx:332`
- `src/components/composite/Stack/BuyStackPanel.tsx:227`

**Category:** Responsive Design / Accessibility  
**Impact:** Controls are harder to hit on iPhone and iPad, especially for users with motor impairments.

**Runtime evidence**

- Compact add-to-stack controls: **40 × 40 px**
- Product-detail `Add to Stack` and `Buy Now`: **26 px tall** on mobile because `flex-1` participates in a column flex layout and shrinks the nominal `h-12`
- iPad-width header navigation links: **20 px tall**
- Stack item toggle: **20 × 20 px**

The fixed mobile product purchase bar is correctly sized at 48 px, so the undersized in-content actions have a workaround.

**Recommendation:** Enforce `min-h-11 min-w-11` on every touch control; use `sm:flex-1` or `flex-none sm:flex-1` for the in-content product actions; expand iPad header link hit areas with padding rather than enlarging text.  
**Suggested command:** `/impeccable adapt`

### [P2] Search combobox does not announce the active suggestion

**Location:** `src/components/composite/Search/EnhancedSearchBar.tsx:212`  
**Category:** Accessibility  
**Impact:** Arrow-key navigation changes visual highlighting, but assistive technology cannot reliably track which option is active.  
**WCAG:** 4.1.2 Name, Role, Value  
**Recommendation:** Give every option a stable ID and update `aria-activedescendant` on the combobox. Preserve selection announcements when suggestions are grouped by goals, supplements, brands, and products. Increase the recent-search clear action's hit area at the same time.  
**Suggested command:** `/impeccable harden`

### [P2] Reduced-motion handling is incomplete

**Locations**

- `src/app/globals.css:24`
- `src/components/ui/Button.tsx:71`
- `src/components/composite/Supplement/SupplementCard.tsx:32`
- `src/components/composite/Product/ProductTile.tsx:41`

**Category:** Accessibility  
**Impact:** Users who request reduced motion still receive smooth scrolling, button compression, card compression, and image movement.  
**WCAG:** 2.3.3 Animation from Interactions (AAA); platform accessibility expectation  
**Evidence:** Only the login entrance animation uses `motion-reduce`; no global reduced-motion alternative exists.  
**Recommendation:** Add an intentional reduced-motion layer that disables scroll animation and nonessential transforms while preserving visible state changes and loading feedback.  
**Suggested command:** `/impeccable animate`

### [P2] The theme layer is split and has no dark appearance

**Locations**

- `src/app/globals.css:5`
- `tailwind.config.ts:11`

**Category:** Theming  
**Impact:** The app is visually coherent today, but theme changes require editing many presentation utilities and the iOS appearance stays bright in dark environments.  
**Evidence:** Semantic `--color-*` variables are defined but unused in `src/`; the source contains approximately 1,183 gray utility references and no `dark:` variants.  
**Recommendation:** Choose one token authority, map component roles to semantic tokens, document whether dark appearance is supported, and add a complete dark palette if it is.  
**Suggested command:** `/impeccable document`

### [P3] Mobile gutters and repeated image hover treatment need a craft pass

**Locations**

- `src/app/globals.css:80`
- `src/components/composite/Supplement/SupplementCard.tsx:45`
- `src/components/composite/Product/ProductTile.tsx:41`

**Category:** Responsive Design / Implementation Integrity  
**Impact:** Long body text sits 12 px from the viewport edge, below Impeccable's 16 px floor. The same image-scale hover treatment repeated across the full catalog makes interaction styling feel more generic than the otherwise editorial system.  
**Evidence:** Impeccable reports the genuine 12 px edge condition on mobile and repeats the image-hover advisory for rendered catalog instances.  
**Recommendation:** Move prose-bearing mobile containers to at least 16 px gutters and keep image movement only where it communicates a useful state.  
**Suggested command:** `/impeccable polish`

## Patterns and Systemic Issues

- Accessibility names are applied carefully to icon actions in many places, but select wrappers allow unlabeled usage and do not enforce a name contract.
- The shell handles safe areas well, but touch-target sizing becomes inconsistent where desktop and mobile layouts share the same compact control.
- Remote catalog images bypass Next.js transformation, so correct `sizes` attributes do not prevent oversized source files from being downloaded.
- The route shell and individual pages both claim landmark ownership.
- Semantic color variables and Tailwind role colors coexist without a single source of truth.

## Positive Findings

- No horizontal overflow was observed at 390 px or 1024 px.
- Safe-area handling is comprehensive: viewport-fit cover, top inset, side insets, tab-bar inset, purchase-bar inset, and dynamic viewport height are all present.
- The bottom tab bar provides large targets, clear accessible labels, and `aria-current`.
- Product images generally have useful alt text; decorative health-goal thumbnails correctly use empty alt text.
- Product action buttons expose descriptive labels and loading/disabled states.
- The login flow has 52 px provider controls, a 44 px guest path, strong contrast, and reduced-motion handling for its entrance sequence.
- The product page scored 100 for Lighthouse accessibility.
- Layout stability is excellent: CLS measured 0 on mobile and 0.001 on desktop.
- The code passes ESLint, TypeScript, and a clean production build.
- Production dependencies have no known npm audit vulnerabilities.

## Recommended Actions

1. **[P1] `/impeccable harden`**: Name every form control and stack toggle, fix the 2.41:1 family count, repair landmark/heading structure, and complete combobox announcements.
2. **[P1] `/impeccable optimize`**: Resize and modernize remote thumbnails, progressively reveal the home catalog, and split unused initial JavaScript.
3. **[P2] `/impeccable adapt`**: Enforce 44 pt touch areas and verify iPad header navigation plus phone product actions.
4. **[P2] `/impeccable animate`**: Add a coherent reduced-motion path for scrolling and interactive transforms.
5. **[P2] `/impeccable document`**: Establish one semantic token authority and a deliberate dark-appearance policy.
6. **[P3] `/impeccable polish`**: Resolve the mobile gutter and repeated hover-treatment craft issues after functional fixes.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `/impeccable audit` after fixes to see the score improve.
