# iOS App Store Submission Guide

The repo contains partial iOS shell artifacts (`ios/`) intended to wrap the
production web app. Before App Store submission, the full Capacitor project
must be restored or regenerated as noted below. This guide covers both the
owner-side account steps and the intended archive/upload flow once the native
project is complete.

## How the app is built

- `ios/App/App/capacitor.config.json` points the native WKWebView at the
  production site (`https://suppstack.vercel.app`). The web app is SSR + API
  routes, so it is served remotely rather than bundled. Shipping web updates
  does not require an App Store release.
- Native integrations are bridged into the remote page by Capacitor:
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
   OAuth provider is configured with:
   - Team ID: `VRTT45LLND`
   - Native App ID / bundle ID: `app.suppstack`
   - Services ID / Supabase Apple client ID: `app.suppstack.web`
   - Supabase callback registered in Apple Developer:
     `https://ftjnxqyvqhpawsipfkay.supabase.co/auth/v1/callback`
   - Apple private key ID: `FX8R3SY6HF`

## Current repo status

The native Capacitor project has been restored and configured for
`app.suppstack` / SuppStack AI. The App Store Connect record for this bundle is
Apple ID `6788166423` with SKU `suppstack-ai-ios`. Build `1` for version
`1.0.0` has been uploaded and processed as `VALID`; delivery UUID
`599455c8-3fad-4ebe-9e15-659e12a9badc`. The build is attached to App Store
version `1.0`, which provides the app icon/logo for the version page.

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
2. Set Version (e.g. `1.0.0`) and Build (`1`) on the General tab.
3. Product > Archive, then Distribute App > App Store Connect > Upload.
4. In App Store Connect, attach the build to the 1.0 version, fill in the
   listing, and submit for review. Use TestFlight first to smoke-test on a
   real device (checkout flow, Google sign-in, deep-link return).

## Listing checklist

| Item | Value |
| --- | --- |
| Privacy policy URL | `https://www.suppstack.app/privacy` (page ships in this repo) |
| Support URL | `https://www.suppstack.app` |
| App Privacy (data collection) | Contact info (email, name) + user content (supplement routines), linked to identity, not used for tracking |
| Age rating | 17+ is not needed; answer the questionnaire honestly (no objectionable content) - expect 4+ |
| Export compliance | `ITSAppUsesNonExemptEncryption=false` is already set in Info.plist |
| Screenshots | 6.9" (iPhone 16 Pro Max) and 6.5" (iPhone 11 Pro Max) sizes; capture home, a supplement page, the checkout sheet, and profile |

## Review risk: Guideline 4.2 (Minimum Functionality)

Apple rejects apps that are plain website wrappers. Mitigations already in
place: native in-app browser checkout, native OAuth deep-link flow, splash and
status-bar integration, offline fallback. If the reviewer still flags 4.2, the
strongest next additions are push notifications for restock reminders (the
web app already computes restock dates) and iOS widgets. Plan for one
resubmission cycle; respond in Resolution Center describing the native
features rather than resubmitting silently.

Other guidelines worth knowing:

- 3.1.1 In-App Purchase does not apply - the app sells physical goods
  (supplements), which must use methods other than IAP (guideline 3.1.3(e)).
  Checkout happens on the merchant's site, which is compliant.
- 5.1.1 Account deletion - apps with account creation must offer account
  deletion. The privacy policy documents email-based deletion; a
  self-service delete button in the profile page is a fast follow if review
  requires it in-app.
- 2.5.2 Remote content - loading your own web content in WKWebView is
  allowed; no hidden features or code injection.

## Updating the app after release

Web changes deploy through Vercel as usual and appear in the installed app
immediately. A new App Store build is only needed when the native shell
changes: plugin additions, icon/splash updates, config changes, or OS
compatibility updates. Bump the Build number for every upload.
