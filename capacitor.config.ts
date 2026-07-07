import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native shell configuration for the iOS App Store build.
 *
 * The app is a hybrid "remote URL" Capacitor app: the native shell loads the
 * production web app (Next.js SSR + API routes cannot be statically
 * exported), while native plugins (status bar, splash, in-app browser for
 * merchant checkout) are bridged into the remote page by the WKWebView.
 *
 * `webDir` holds only a minimal offline fallback page; it is not the app.
 */
const config: CapacitorConfig = {
  appId: 'app.suppstack',
  appName: 'SuppStack AI',
  webDir: 'native/shell',
  server: {
    url: 'https://www.suppstack.app',
    // Keep first-party navigation inside the webview. External hosts
    // (merchant checkout, shop.app, Google OAuth) are opened via the Browser
    // plugin (SFSafariViewController) instead — Google blocks OAuth inside
    // webviews, so accounts.google.com must NOT be allowed here.
    allowNavigation: ['www.suppstack.app', 'suppstack.app', 'suppstack.vercel.app', '*.supabase.co'],
    // Local page shown when the remote app cannot be loaded (offline).
    errorPath: 'index.html',
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#171717',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
    },
  },
};

export default config;
