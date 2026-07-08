/**
 * Bridge helpers for running inside the Capacitor iOS shell.
 *
 * The native app loads the production site via `server.url`, and the
 * Capacitor runtime injects a `window.Capacitor` global with plugin bridges
 * into the remote page. We access that injected global (instead of bundling
 * `@capacitor/*` imports) so the same web build serves browsers and the
 * native shell without a separate entry point.
 */

interface PluginListenerHandle {
  remove: () => Promise<void> | void;
}

interface AppUrlOpenEvent {
  url: string;
}

interface CapacitorAppPlugin {
  addListener: (
    eventName: 'appUrlOpen',
    listener: (event: AppUrlOpenEvent) => void
  ) => PluginListenerHandle | Promise<PluginListenerHandle>;
  getLaunchUrl: () => Promise<{ url?: string } | null | undefined>;
}

interface CapacitorBrowserPlugin {
  open: (options: { url: string; presentationStyle?: 'fullscreen' | 'popover' }) => Promise<void>;
  close: () => Promise<void>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    App?: CapacitorAppPlugin;
    Browser?: CapacitorBrowserPlugin;
  };
}

declare global {
  interface Window {
    Capacitor?: CapacitorGlobal;
  }
}

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());
}

/**
 * Opens a URL in the native in-app browser (SFSafariViewController on iOS).
 * Returns false when not running in the native shell so callers can fall
 * back to normal web behavior (window.open).
 */
export async function openInNativeBrowser(url: string): Promise<boolean> {
  if (!isNativeApp()) return false;

  const browser = window.Capacitor?.Plugins?.Browser;
  if (!browser) return false;

  await browser.open({ url, presentationStyle: 'popover' });
  return true;
}

export async function closeNativeBrowser(): Promise<void> {
  if (!isNativeApp()) return;
  await window.Capacitor?.Plugins?.Browser?.close().catch(() => undefined);
}

/**
 * Opens an external URL the platform-appropriate way: SFSafariViewController
 * inside the native shell, `window.open` on the web with a same-tab fallback
 * when the popup is blocked. Returns true when the URL was opened somewhere.
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  if (await openInNativeBrowser(url).catch(() => false)) {
    return true;
  }
  if (typeof window === 'undefined') return false;

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(url);
  }
  return true;
}

/**
 * Subscribes to deep-link opens (custom URL scheme / universal links) and
 * replays the launch URL for cold starts, where the deep link arrives before
 * the remote page has registered its listener.
 * Returns an unsubscribe function; a no-op outside the native shell.
 */
export function onAppUrlOpen(listener: (url: string) => void): () => void {
  if (!isNativeApp()) return () => undefined;

  const appPlugin = window.Capacitor?.Plugins?.App;
  if (!appPlugin) return () => undefined;

  const handle = appPlugin.addListener('appUrlOpen', (event) => listener(event.url));

  appPlugin
    .getLaunchUrl()
    .then((result) => {
      if (result?.url) listener(result.url);
    })
    .catch(() => undefined);

  return () => {
    Promise.resolve(handle)
      .then((resolved) => resolved.remove())
      .catch(() => undefined);
  };
}
