# ADR 0006 — Put product search and results before mobile filters

Date November 7, 2026. Status accepted.

## Context

At phone widths, the product directory repeated its page title and stacked five large goal cards above search and four selects. No product cards were visible in the initial viewport. The catalog also used a single column below 640px.

Mobbin references reviewed for this change:

- [lululemon product listing](https://mobbin.com/screens/49cbdb1d-b9a5-4b68-a3ff-fc10d297d896) puts search and compact filtering above a two-column product grid.
- [Best Buy filters](https://mobbin.com/screens/45c41c17-378b-43b4-9eec-237215939de6) puts detailed filters in a sheet with reset and a results action.

## Decision

Below the desktop breakpoint, show full-width search first, then a Filters button and sort control. Put goal, category and brand in a bottom sheet. The sheet has a bounded scroll region, a persistent results action, safe-area padding and native select controls. Keep the existing desktop controls and the product's typography, colors and card components.

Use two product columns on phones. Keep only the existing navigation title visible on mobile; retain the page heading for assistive technology.

Sheet changes are drafts. Preview their result count, but commit facets and the URL together only when the buyer presses Show products. Closing, Escape or tapping the backdrop cancels the draft. Return focus to Filters on dismissal. Reset clears draft facets while preserving the current search and sort. Applied filters remain removable; Clear all restores the original directory.

Keep query, goal, category, brand and sort in the URL so reloads and shared links reproduce the selection. Preserve existing matching, inventory, pricing and checkout behavior.

Server-rendered search and select controls stay disabled until hydration attaches their handlers. A WebKit evaluation caught input accepted before hydration that never updated the results. This gate prevents silent input loss without replacing the rendered catalog.

## Acceptance evidence

Baseline source: `e5ca03e` (the native checkout merge). Before/after comparison uses `/products?goal=body-composition` at 390 × 844 with the same catalog.

| Scenario | Required behavior |
| --- | --- |
| DIR-01 | Search spans the phone width; two cards share a row; the first row fits above navigation at 320, 390 and 430px; no horizontal overflow |
| DIR-02 | Draft changes leave the URL untouched; Escape restores applied products and focus; background controls cannot receive focus while the sheet is open |
| DIR-03 | Search, three facets and sort combine; preview matches applied count; reload preserves selection; removing a facet preserves the query |
| DIR-04 | Reset clears draft facets; applying preserves search; Clear all restores the directory |
| DIR-05 | Long unmatched queries stay within the viewport and offer a working reset |
| DIR-06 | Desktop filters remain directly available |
| DIR-07 | Delayed JavaScript cannot accept and silently discard search text |

Run `npm run eval:ui` for the complete Chromium suite and `npm run eval:ui -- evals/directory.spec.ts --browser=webkit` for the seven directory scenarios in WebKit. Both commands are CI gates. Browser evidence does not verify the physical iPhone keyboard, VoiceOver or native picker presentation; those remain device QA.

Local evidence on November 7: 16/16 Chromium cases, 7/7 WebKit cases, 11/11 offline commerce cases, 3/3 native registration checks, changed-file ESLint and the production build passed. The production build initially included downloaded native SDK test sources; excluding the already-ignored `build/` output from TypeScript fixed that failure while preserving all application checks. The iOS simulator build also succeeded and relaunched on the user's existing iPhone 18 Pro Max. Implementation is tracked in [PR #47](https://github.com/acwints/suppstack/pull/47).

The first Linux WebKit CI run stalled at frame-based pointer stability checks, matching [Playwright's reported headless WPE issue](https://github.com/microsoft/playwright/issues/33057). CI runs the same scenarios headed under Xvfb, preserving normal click checks and all assertions. Local macOS WebKit runs headless. CI keeps each browser's report and trace output separately so the second invocation cannot erase the first suite's evidence.
