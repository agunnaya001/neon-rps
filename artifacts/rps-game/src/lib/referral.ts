/**
 * Referral tracking — pure client-side, no contract changes.
 *
 * Flow:
 * - Landing URL like `https://neonrps.xyz/?ref=0xabcdef…1234` stamps the address into localStorage.
 * - Persists for 30 days. Cleared if user is the referrer themselves.
 * - Outbound share URLs auto-append `?ref=<my-address>` so every viral loop is attributed.
 */

const STORAGE_KEY = "neonrps:referrer";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type StoredReferrer = { address: string; expiresAt: number };

const isEth = (s: string | null): s is string =>
  !!s && /^0x[a-fA-F0-9]{40}$/.test(s);

/**
 * Reads ?ref=<address> from the current URL and stores it (if valid and not self).
 * Returns the stored referrer (post-write).
 */
export function captureReferralFromUrl(myAddress?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (isEth(ref) && (!myAddress || ref.toLowerCase() !== myAddress.toLowerCase())) {
      const payload: StoredReferrer = {
        address: ref.toLowerCase(),
        expiresAt: Date.now() + TTL_MS,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    return getReferrer();
  } catch {
    return null;
  }
}

export function getReferrer(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReferrer;
    if (!isEth(parsed.address)) return null;
    if (parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.address;
  } catch {
    return null;
  }
}

export function clearReferrer(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Append ?ref=<myAddress> to a share URL, preserving any existing query string.
 */
export function withReferral(url: string, myAddress: string | undefined): string {
  if (!myAddress || !isEth(myAddress)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("ref", myAddress.toLowerCase());
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ref=${myAddress.toLowerCase()}`;
  }
}
