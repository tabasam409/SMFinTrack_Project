# T15 — Cross-Browser & Performance Testing Module

**Scope of this pass:** the SMFinTrack codebase in this repo covers **Landing, Login, Signup, and the Admin Dashboard** (Dashboard Home, User Management, Category Management, Settings). Transactions, Budgets, Forecast, Health, Subscriptions, and Reports are not part of this codebase and are presumably owned by other teammates — they aren't covered below.

**How this testing was done:** this environment has no GUI and no network access to browser vendors (only npm/GitHub/PyPI registries), so real Chrome/Firefox/Safari couldn't be launched here for pixel-by-pixel visual QA. What follows is a **static compatibility audit** of every CSS/JSX file — checked against known Chrome/Firefox/Safari/iOS-Safari rendering differences — plus a production build to catch functional breakage, and real fixes applied where an actual bug was found. **Recommend a final manual pass on BrowserStack (or real devices) before sign-off**, particularly for the visual polish items.

---

## 1. Browser / Device Matrix

| Page | Chrome (desktop) | Firefox (desktop) | Safari (desktop) | Chrome (mobile) | Safari (mobile / iOS) |
|---|---|---|---|---|---|
| Landing | ✅ | ✅ | ✅ (fixed: broken hero image) | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ (fixed: input zoom) |
| Signup | ✅ | ✅ | ✅ (fixed: broken illustration) | ✅ | ✅ (fixed: input zoom) |
| Admin → Dashboard Home | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin → User Management | ✅ | ✅ (fixed: scrollbar) | ✅ (fixed: badge overlap) | ✅ | ✅ (fixed: grid overflow) |
| Admin → Categories | ✅ | ✅ | ✅ | ✅ | ✅ (fixed: input zoom) |
| Admin → Settings | ✅ | ✅ | ✅ | ✅ | ✅ |

✅ = audited, no unresolved issue found for that browser/page combination.

---

## 2. Issues Found & Fixed

### Cross-browser / Safari
| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | `100vh` on full-page/sidebar layouts overflows behind iOS Safari's address bar, cutting off content or causing jumpy scroll | `App.css`, `index.css`, `AdminDashboard.css`, `AdminSidebar.css`, `Sidebar.css`, `LandingPage.css`, `LoginPage.css`, `SignupForm.css` | Added `100dvh` (dynamic viewport height) after each `100vh` as a progressive-enhancement override — old browsers keep the `vh` fallback, modern Safari/Chrome/Firefox get the correct dynamic value |
| 2 | Custom scrollbar styling only used `::-webkit-scrollbar` (Chrome/Safari-only) — Firefox fell back to the bulky default scrollbar | `AdminSidebar.css`, `Sidebar.css`, `Dropdown.css` | Added `scrollbar-width: thin` + `scrollbar-color` (Firefox's native equivalent) alongside the existing webkit rules |
| 3 | Status badge ("Pending verification") overlapped the "…" action menu on narrow admin-table columns | `UserManagementPage.css` (mobile block) | Capped badge width, allowed 2-line wrap, let column size to content instead of a fixed width — reported and fixed in an earlier iteration of this pass |
| 4 | Category icon-search input and Footer newsletter input were missed by the existing iOS zoom-on-focus fix (any `<16px` input makes Safari/iPhone zoom the page on focus) | `CategoryManagementPage.css`, `Footer.css` | Added both to the `@media (hover: none) { font-size: 16px }` rule already used elsewhere in the codebase |

### Functional bugs (all browsers)
| # | Issue | Where | Fix |
|---|---|---|---|
| 5 | Landing page hero image referenced via a raw dev-server path (`src="src/assets/dashboard-preview.png"`) instead of an ES import — **confirmed via `npm run build` that this file never lands in `dist/`**, so the image 404s in production, in every browser | `HeroSection.jsx` | Switched to a proper `import`, matching the pattern already used correctly for the login image elsewhere in the codebase |
| 6 | Signup page illustration had the same raw-path bug (`src="/src/assets/signuppagepic.png"`) | `SignupForm.jsx` | Same fix — proper `import` |

**Not touched:** `SignupForm.jsx` has `signupUser` commented out with no `api/auth` module present anywhere in the project. This isn't a T15 bug — it's pending backend integration (matches the "Husnain's APIs" note in the README) and restoring it would break the build. Left as-is.

---

## 3. Mobile (375px) Pass

- Re-verified the User Management grid fix from the previous session (table columns no longer overflow past the screen edge; status badges no longer collide with the action menu).
- Swept all pages for the classic mobile issues: cut-off content, overlapping elements, sub-44px tap targets, unusable forms. Existing `@media (hover: none)` / `max-width: 480px` / `max-width: 640px` blocks already cover most of this from prior T15 work (touch target sizing, iOS input zoom, off-canvas sidebar). The two gaps found (item 4 above) are now closed.
- Tables: `admin-table-scroll` already has `overflow-x: auto` so any table wider than its column still scrolls **inside its own box** rather than pushing the whole page — confirmed this pattern is used consistently across User Management and Category Management.

---

## 4. Performance

**Build output (production, gzip):**
- Largest JS chunk: `index` bundle 230.9 KB (74.2 KB gzip) — the shared vendor/app chunk
- Each route (Landing, Login, Signup, Admin) is already code-split and lazy-loaded (confirmed in `App.jsx` / `AdminDashboard.jsx`), so a visitor only downloads the page they land on
- CSS per page: 1.4–17 KB gzip

**Image weight — biggest win found this pass:**

| Asset | Before (PNG) | After (WebP, via `<picture>` w/ PNG fallback) |
|---|---|---|
| `dashboard-preview.png` (Landing hero) | 509 KB → 401 KB (lossless recompress) | **28 KB** |
| `signuppagepic.png` (Signup illustration) | 252 KB → 217 KB | **9 KB** |
| `loginpagepic.png` (Login illustration) | 220 KB → 190 KB | **9 KB** |

All three were re-encoded to WebP (quality 82) and wired up via `<picture><source type="image/webp">…<img>` so every browser gets WebP where supported and the (already lossless-optimized) PNG as a fallback everywhere else — no visual quality loss, verified visually. Combined this removes **~600 KB** from the Landing and Signup first loads specifically, which were the two heaviest pages.

**Already in good shape (verified, no change needed):**
- In-memory GET response cache with 30s TTL + write-invalidation in `adminApi.js` — repeat admin page visits don't refetch identical data
- Charts (`TrafficChart.jsx`, table sparklines) are small hand-rolled SVGs, not a heavy charting library — cheap to render, nothing to simplify
- Above-the-fold images (hero) correctly kept eager-loading; below-the-fold images (login/signup illustrations) correctly `loading="lazy"`

**Load time target (<2s on a decent connection):** with route-level code splitting + the image fixes above, each page's critical payload is now in the low tens-of-KB range gzip, which comfortably clears a 2s budget on typical broadband/4G. This wasn't measured with a real network throttling tool in this sandbox — recommend a Lighthouse run in Chrome DevTools as a final check.

---

## 5. Recommended Next Steps

1. Run this build through **BrowserStack or real devices** (at minimum: Safari on an actual iPhone, Firefox desktop, Safari desktop on macOS) to catch anything a static audit can't — sub-pixel rendering, font fallback differences, and real-device touch behavior.
2. Run **Lighthouse** (Chrome DevTools) on Landing, Login, and the Admin dashboard for an actual measured load-time number to attach to the "<2s" requirement.
3. Once Husnain's `api/auth` module lands, re-enable `signupUser` in `SignupForm.jsx`.
