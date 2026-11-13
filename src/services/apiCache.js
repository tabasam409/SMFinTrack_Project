/* =========================================================================
   T15 — Cross-Browser & Performance Testing
   Lightweight client-side cache for GET API responses.

   Problem: every page (Budgets, Tracking, Forecast, Health Score,
   Subscriptions, Reports, Settings) re-fetches its data from scratch each
   time the user navigates to it, because App.jsx unmounts the previous
   page on every nav (no router / no shared query cache). On a slow
   connection that means paying the full network round-trip again for
   data that hasn't changed in the last few seconds.

   Fix: cache successful JSON responses in sessionStorage for a short TTL
   (default 60s) keyed by URL. On a cache hit within the TTL we resolve
   instantly (no network wait) and kick off a background refetch to keep
   the cache warm for the *next* visit — a simple stale-while-revalidate
   pattern. Falls back to a normal network fetch whenever sessionStorage
   is unavailable (private browsing, Safari ITP edge cases, etc.) so it
   never breaks the page, only speeds it up when it can.
   ========================================================================= */

const DEFAULT_TTL_MS = 60 * 1000;
const PREFIX = "smfintrack:cache:";

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data, ttlMs) {
  try {
    sessionStorage.setItem(
      PREFIX + key,
      JSON.stringify({ data, expiresAt: Date.now() + ttlMs })
    );
  } catch {
    // Storage full / disabled — caching is a bonus, not a requirement.
  }
}

/**
 * Fetch JSON with a short-lived cache in front of it.
 * @param {string} url
 * @param {{ ttlMs?: number, fetchOptions?: RequestInit }} [opts]
 * @returns {Promise<any>} parsed JSON body
 */
export async function cachedFetchJSON(url, opts = {}) {
  const { ttlMs = DEFAULT_TTL_MS, fetchOptions } = opts;
  const cached = readCache(url);

  if (cached !== null) {
    // Stale-while-revalidate: refresh in the background, don't block the UI.
    fetch(url, fetchOptions)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && writeCache(url, data, ttlMs))
      .catch(() => {});
    return cached;
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error("Bad response");
  const data = await res.json();
  writeCache(url, data, ttlMs);
  return data;
}

/** Clear one cached URL (e.g. after a save/mutation) or the whole cache. */
export function invalidateCache(url) {
  try {
    if (url) sessionStorage.removeItem(PREFIX + url);
    else {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => sessionStorage.removeItem(k));
    }
  } catch {
    // no-op
  }
}
