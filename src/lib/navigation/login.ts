/**
 * The sign-in URL that returns the user to `nextPath` afterwards
 * (`/login?next=<encoded path>`). Pass the current pathname to come back
 * to the page that asked for sign-in.
 */
export function loginHref(nextPath?: string | null): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('/login')) return '/login';
  return `/login?next=${encodeURIComponent(nextPath)}`;
}
