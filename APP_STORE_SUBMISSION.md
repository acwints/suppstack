# iOS App Store Submission Guide

The repo contains partial iOS shell artifacts (`ios/`) intended to wrap the
production web app. Before App Store submission, the full Capacitor project
must be restored or regenerated as noted below. This guide covers both the
owner-side account steps and the intended archive/upload flow once the native
project is complete.

## How the app is built

- `ios/App/App/capacitor.config.json` points the native WKWebView at the
  production site (`https://www.suppstack.app`). The web app is SSR + API
  routes, so it is served remotely rather than bundled. Shipping web updates
  does not require an App Store release.
- Native integrations are bridged into the remote page by Capacitor:
  - Sign in with Apple uses Apple's native Authentication Services sheet and
    exchanges the resulting ID token directly with Supabase. It does not rely
    on an in-app browser or deep-link callback.
  - Merchant checkout and Google sign-in open in SFSafariViewController
    (in-app browser), so users never leave the app.
  - Google OAuth returns via the `app.suppstack://auth-callback` deep link
    (registered in `ios/App/App/Info.plist`) and completes with a PKCE code
    exchange in `src/app/context/AuthContext.tsx`.
  - Splash screen and status bar are configured in the Capacitor config when
    the full native project is restored.
- `ios/App/App/public/index.html` is only an offline fallback page.

## One-time setup (your side)

1. Apple Developer Program - enroll at
   [developer.apple.com](https://developer.apple.com/programs/enroll/) ($99/yr).
2. App Store Connect - create the app record:
   - Bundle ID: `app.suppstack` (register it under Certificates,
     Identifiers & Profiles first)
   - Name: SuppStack AI (reserve early; names are unique per storefront)
   - Primary category: Shopping. Secondary: Health & Fitness.
3. Supabase redirect allowlist - in Supabase Dashboard > Authentication >
   URL Configuration, keep these Redirect URLs available:
   `https://www.suppstack.app/**`, `https://suppstack.vercel.app/**`,
   `http://localhost:3000/**`, and `app.suppstack://auth-callback`.
4. Supabase Apple provider - because the onboarding screen offers Google
   sign-in, keep Sign in with Apple enabled for App Review. The live Apple
   provider must accept both the web Services ID and the native bundle ID:
   - Team ID: `VRTT45LLND`
   - Native App ID / bundle ID: `app.suppstack`
   - Services ID / Supabase Apple client ID: `app.suppstack.web`
   - Supabase Client IDs field: `app.suppstack.web,app.suppstack` (Services ID
     first so web OAuth continues to use it; the native App ID must also be
     present so `signInWithIdToken` accepts the iOS token audience)
   - Supabase callback registered in Apple Developer:
     `https://ftjnxqyvqhpawsipfkay.supabase.co/auth/v1/callback`
   - Apple private key ID: `FX8R3SY6HF`
5. Apple Developer identifier - enable **Sign in with Apple** for
   `app.suppstack`. The Xcode target and `App.entitlements` already declare
   the capability; automatic signing will generate a matching profile.

## Resubmitting version 1.1 after Guideline 2.1(a)

Apple rejected build 55 on August 13, 2026 because Sign in with Apple left the
login screen loading indefinitely on an iPad Air 11-inch (M3). The review fix
does three things:

- presents Apple's system-native authorization sheet on iOS and iPadOS;
- exchanges Apple's ID token with a cryptographic nonce directly through
  Supabase, removing the Apple browser/deep-link return dependency; and
- clears every pending UI state on success, cancellation, timeout, or error.

Before resubmitting:

1. Confirm the Apple Developer capability and the two Supabase Client IDs
   described above.
2. Deploy the web changes to `https://www.suppstack.app`; the native shell
   loads that production app, so the updated token exchange and loading-state
   recovery must be live before review.
3. Produce an Xcode Cloud build newer than 55. The CI pre-build script stamps
   `CURRENT_PROJECT_VERSION` from `CI_BUILD_NUMBER`.
4. On a physical iPad or iPad simulator signed into an Apple Account, delete
   the previous app, install the release/TestFlight build, and verify:
   - successful first-time Apple sign-in;
   - returning Apple sign-in;
   - Hide My Email;
   - cancellation returns to enabled buttons with no permanent spinner;
   - network failure returns an actionable error and permits retry.
5. Attach the new build to version 1.1 and resubmit with this Resolution Center
   reply:

> We resolved the Sign in with Apple issue reported under Guideline 2.1(a).
> The app now uses Apple's native Authentication Services flow on iOS and
> iPadOS and exchanges the Apple identity token directly with our authentication
> service. We also added bounded session-exchange handling and ensured the login
> controls always recover after cancellation or an error. We tested a clean
> install of version 1.1 on iPad, including successful sign-in, cancellation,
> and retry. Please review the newly submitted build.

## Current repo status

The native Capacitor project has been restored and configured for
`app.suppstack` / SuppStack AI. The App Store Connect record for this bundle is
Apple ID `6788166423` with SKU `suppstack-ai-ios`. Version 1.1 build 55 was
reviewed on August 13, 2026 and rejected under Guideline 2.1(a) for the Apple
login hang addressed above. The original version 1.0 build 1 delivery UUID was
`599455c8-3fad-4ebe-9e15-659e12a9badc`.

The old App Store Connect record (`6788125138`) is parked as
`SuppStack AI Legacy` because it is locked to the prior
`com.acwints.suppstack` bundle ID.

The intended build flow once the Capacitor project is restored is:

```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

If the `ios:*` scripts and Capacitor dependencies from the iOS shell work are
restored, the equivalent helper commands are:

```bash
git clone <repo> && cd <repo>
npm install
npm run ios:sync     # sync plugins + config into ios/
npm run ios:open     # opens ios/App/App.xcworkspace in Xcode
```

In Xcode:

1. Select the `App` target > Signing & Capabilities > choose your team.
   Signing is automatic; the bundle ID is already `app.suppstack`.
2. Keep Version at `1.1` and use a build number newer than `55`.
3. Product > Archive, then Distribute App > App Store Connect > Upload.
4. In App Store Connect, attach the build to version 1.1, fill in the
   listing, and submit for review. Use TestFlight first to smoke-test on a
   real device (checkout flow, Google sign-in, deep-link return).

## Listing checklist

| Item | Value |
| --- | --- |
| Privacy policy URL | `https://www.suppstack.app/privacy` (page ships in this repo) |
| Support URL | `https://www.suppstack.app` |
| App Privacy (data collection) | Contact info (email, name), user content (supplement routines), and optional health/fitness data (sleep, weight, body fat, activity summaries), linked to identity, not used for tracking or advertising |
| Age rating | 17+ is not needed; answer the questionnaire honestly (no objectionable content) - expect 4+ |
| Export compliance | `ITSAppUsesNonExemptEncryption=false` is already set in Info.plist |
| Screenshots | 6.9" (iPhone 16 Pro Max) and 6.5" (iPhone 11 Pro Max) sizes; current asset set covers Shop by Goal, catalog search, brand pages, product detail, peptides reference, and account entry |

Generated screenshot assets live in `assets/app-store/`. Run
`npm run app-store:assets` with the local web app running to refresh the
6.9-inch, 6.5-inch, source capture, icon, and contact sheet files.

## Review risk: Guideline 4.2 (Minimum Functionality)

Apple rejects apps that are plain website wrappers. Mitigations already in
place: native HealthKit integration, native in-app browser checkout, native
Apple authentication, Google OAuth deep-link return, splash and status-bar
integration, and an offline fallback. If the reviewer still flags 4.2, the
strongest next additions are push notifications for restock reminders (the
web app already computes restock dates) and iOS widgets. Plan for one
resubmission cycle; respond in Resolution Center describing the native
features rather than resubmitting silently.

Other guidelines worth knowing:

- 3.1.1 In-App Purchase does not apply - the app sells physical goods
  (supplements), which must use methods other than IAP (guideline 3.1.3(e)).
  Checkout happens on the merchant's site, which is compliant.
- 5.1.1 Account deletion - apps with account creation must offer account
  deletion. SuppStack AI includes in-app self-service deletion from
  Profile Settings -> Account -> Delete account, backed by
  `/api/account/delete`.
- 5.1.3 Health and health research - Apple Health data must be used only for
  health, fitness, and wellness management. Do not use HealthKit data for
  advertising, merchant targeting, or unrelated analytics. Keep the privacy
  policy and App Privacy answers aligned with the Health Intelligence feature.
- 2.5.2 Remote content - loading your own web content in WKWebView is
  allowed; no hidden features or code injection.

## Updating the app after release

Web changes deploy through Vercel as usual and appear in the installed app
immediately. A new App Store build is only needed when the native shell
changes: plugin additions, icon/splash updates, config changes, or OS
compatibility updates. Bump the Build number for every upload.
