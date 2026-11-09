const KEY = 'suppstack_post_intent_invite';

type InvitePromptStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

/** The card stays off-screen while any dialog is open, including stack checkout. */
export function postIntentInviteRenderable(wanted: boolean, dialogOpen: boolean): boolean {
  return wanted && !dialogOpen;
}

/** First high-intent moment wins. Later saves and checkouts do not show it again. */
export function claimPostIntentInvite(storage: InvitePromptStorage): boolean {
  const current = storage.getItem(KEY);
  if (current === 'shown' || current === 'done') return false;
  storage.setItem(KEY, 'shown');
  return true;
}

export function finishPostIntentInvite(storage: InvitePromptStorage): void {
  storage.setItem(KEY, 'done');
}

export function requestPostIntentInvite(): void {
  if (typeof window === 'undefined') return;
  if (!claimPostIntentInvite(window.localStorage)) return;
  window.dispatchEvent(new Event('suppstack:post-intent-invite'));
}
