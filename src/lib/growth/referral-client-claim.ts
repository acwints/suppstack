import { peekRef, clearRef } from '@/lib/growth/referral';

export type StoredClaimBody = { recorded?: boolean; reason?: string } | null;

const PERMANENT_SKIP = new Set(['invalid', 'self', 'not_fresh', 'duplicate']);

/** Drop the stored ref after a finished claim. Keep it when the request failed. */
export function shouldForgetStoredRef(responseOk: boolean, body: StoredClaimBody): boolean {
  if (!responseOk || !body) return false;
  if (body.recorded === true) return true;
  return PERMANENT_SKIP.has(body.reason ?? '');
}

type ClaimPoster = (
  ref: string,
  accessToken: string
) => Promise<{ ok: boolean; body: StoredClaimBody }>;

/** One in-flight claim. A second call joins the first instead of posting again. */
export function createReferralClaimer(deps: {
  readRef: () => string | null;
  clearRef: () => void;
  post: ClaimPoster;
}) {
  let inflight: Promise<void> | null = null;

  return function claimStoredReferral(accessToken: string | undefined): Promise<void> {
    if (!accessToken) return Promise.resolve();
    const ref = deps.readRef();
    if (!ref) return Promise.resolve();
    if (inflight) return inflight;

    inflight = deps
      .post(ref, accessToken)
      .then((result) => {
        if (shouldForgetStoredRef(result.ok, result.body)) deps.clearRef();
      })
      .catch(() => undefined)
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };
}

export const claimStoredReferral = createReferralClaimer({
  readRef: peekRef,
  clearRef,
  post: async (ref, accessToken) => {
    const response = await fetch('/api/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ref }),
    });
    let body: StoredClaimBody = null;
    try {
      body = (await response.json()) as StoredClaimBody;
    } catch {
      body = null;
    }
    return { ok: response.ok, body };
  },
});
