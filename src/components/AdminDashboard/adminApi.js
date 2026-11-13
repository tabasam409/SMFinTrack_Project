/* -------------------------------------------------------------------------
 * SMFinTrack — Admin API configuration
 * -----------------------------------------------------------------------
 * Single source of truth for every endpoint the admin dashboard talks to.
 * Backend engineer (Husnain) owns the FastAPI routes — keep this file in
 * sync with `Project_Document.pdf` → "Admin API" contract.
 *
 * USE_MOCK_DATA: flip to false once the real endpoints are live.
 * ---------------------------------------------------------------------- */

export const API_BASE_URL = "https://unthematic-ta-soaringly.ngrok-free.dev";

export const USE_MOCK_DATA = true;

export const ENDPOINTS = {
  dashboardStats: `${API_BASE_URL}/api/admin/dashboard-stats`,
  users: `${API_BASE_URL}/api/admin/users`,
  userById: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
  categories: `${API_BASE_URL}/api/admin/categories`,
  categoryById: (id) => `${API_BASE_URL}/api/admin/categories/${id}`,
  categoryReorder: `${API_BASE_URL}/api/admin/categories/reorder`,
};

/* -------------------------------------------------------------------------
 * Lightweight GET response cache (perf fix — T15)
 * -----------------------------------------------------------------------
 * Admin pages (Dashboard / Users / Categories) are re-visited a lot while
 * navigating the sidebar, and each visit was re-fetching identical data.
 * We cache successful GET responses in memory for a short TTL so repeat
 * navigations are instant, while writes (POST/PATCH/DELETE) always bypass
 * the cache and clear any cached GET for the same resource.
 * ---------------------------------------------------------------------- */

const GET_CACHE = new Map(); // url -> { data, expiresAt }
const CACHE_TTL_MS = 30_000; // 30s — fresh enough for admin stats, avoids refetch storms

function getCached(url) {
  const entry = GET_CACHE.get(url);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    GET_CACHE.delete(url);
    return undefined;
  }
  return entry.data;
}

function setCached(url, data) {
  GET_CACHE.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Call after a mutation so stale list/detail data isn't served from cache. */
export function invalidateAdminCache(matchPrefix) {
  if (!matchPrefix) {
    GET_CACHE.clear();
    return;
  }
  for (const key of GET_CACHE.keys()) {
    if (key.startsWith(matchPrefix)) GET_CACHE.delete(key);
  }
}

/* -------------------------------------------------------------------------
 * Shared request helper — attaches the Accept header and (when available)
 * an Authorization token from localStorage. Backend auth endpoints should
 * store the token key "smfintrack_token".
 * ---------------------------------------------------------------------- */

export async function apiRequest(url, { method = "GET", body = null, signal, skipCache = false } = {}) {
  const isGet = method === "GET";

  if (isGet && !skipCache) {
    const cached = getCached(url);
    if (cached !== undefined) return cached;
  }

  const headers = { Accept: "application/json" };
  const token = localStorage.getItem("smfintrack_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Request failed with status ${res.status}${detail ? ` — ${detail}` : ""}`);
  }

  const data = await res.json();

  if (isGet) {
    setCached(url, data);
  } else {
    // Any write invalidates cached GETs so the next read is fresh.
    invalidateAdminCache();
  }

  return data;
}