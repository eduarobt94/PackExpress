# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always use **pnpm** (never npm or yarn):

```bash
pnpm dev          # Dev server with HMR
pnpm build        # Production build → dist/
pnpm preview      # Preview the production build locally
pnpm lint         # ESLint (react-hooks + react-refresh rules)
```

There are no tests in this project.

## Architecture Overview

Single-page React 19 app deployed on **Apache shared hosting (Hostinger)**. There is no backend — all form submissions are UI mocks. The SPA coexists on the same domain as a legacy PHP system (`/pack-sistema/`, `/tienda/`, `/pages/`).

### Entry Points

- `index.html` — Static SEO fallback (full OG/Twitter meta + canonical) for crawlers without JS
- `src/main.jsx` → `src/App.jsx` — React entry; wraps everything in `<HelmetProvider>` + `<ThemeProvider>`

### Component Loading Strategy

`App.jsx` splits the page into two groups:

- **Eager (above-fold):** `Navbar`, `Hero`, `LegalModal`, `NotFound`
- **Lazy (below-fold):** All other sections wrapped in `<Suspense fallback={null}>`

`Three.js` (507 KB) is loaded **dynamically inside Hero.jsx** via `import('three')` — it does not appear in the Rollup entry and has `exclude: ['three']` in `optimizeDeps`.

### Modal System (Event Bus)

Modals are triggered via `window.dispatchEvent` because components are deep in the tree with no shared state:

```js
// Open quote modal from anywhere:
window.dispatchEvent(new Event('openCotizar'))

// Open a legal doc modal (courier | equipaje | terms | privacy | prohibited):
window.dispatchEvent(new CustomEvent('openLegal', { detail: 'courier' }))
```

`App.jsx` listens for these events and sets state. `LegalModal` uses `e.detail` as a key into a `CONTENT` object — valid keys are the 5 strings above.

### Theming

- `ThemeContext` (`src/context/ThemeContext.jsx`) stores `'dark' | 'light'` in `localStorage` under key `pe-theme`
- Theme is applied via `document.documentElement.setAttribute('data-theme', theme)`
- All color tokens are CSS custom properties defined in `src/index.css` under `@theme {}` (Tailwind v4 syntax) and `[data-theme="light"]` blocks
- Brand orange (`--color-brand: #F07232`) = national/domestic; brand blue (`--color-blue: #527ED8`) = international

### SEO Dual Layer

1. **Static** — hardcoded meta tags in `index.html` for crawlers that don't execute JS
2. **Dynamic** — `src/components/SEO.jsx` uses `react-helmet-async` to inject `<title>`, meta tags, and JSON-LD schemas at runtime
3. **Schemas** — `src/seo/schemas.js` exports `organizationSchema`, `localBusinessSchema`, `websiteSchema`, `faqSchema`; passed as an array to `<SEO schemas={[...]} />`

> ⚠️ `schemas.js` has a placeholder: `telephone: '+598-2XXX-XXXX'` — replace before production.

### Smooth Scroll

`useLenis` (`src/hooks/useLenis.js`) initializes Lenis on mount in `App.jsx`. To prevent Lenis from intercepting scroll inside a container, add `data-lenis-prevent` to that element.

## Tailwind v4

This project uses Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`). Design tokens are defined with `@theme {}` inside `src/index.css`. Use `var(--token-name)` for CSS vars and `bg-[var(--bg-card)]` pattern in class strings.

## Build Configuration (vite.config.js)

Key intentional settings — do not change without understanding why:

| Setting | Reason |
|---|---|
| `assetsDir: '_pe'` | Avoids collision with the existing `assets/` folder in Apache `public_html` |
| `sourcemap: false` | Never expose source maps in production |
| `modulePreload: { polyfill: false }` | Prevents Vite from injecting an inline script, which would require `unsafe-inline` in the CSP |
| Manual chunks for `three`, `framer-motion`, `lenis`, `react` | Prevents oversized bundles; each vendor stays below the 600 KB warning |

## Security Headers

All HTTP security headers are set in **`public/.htaccess`** via Apache `mod_headers`. They are **not** in HTML meta tags. The CSP is strict:

- `script-src 'self'` — no `unsafe-inline`, no `unsafe-eval`
- `connect-src 'self' https://maps.googleapis.com` — only Google Maps API
- `frame-src https://maps.google.com https://www.google.com` — Google Maps iframes only

The Three.js world map texture (`/textures/worldMap.png`) is self-hosted to avoid needing an external CDN in `connect-src`.

## Deployment

`dist/` is uploaded directly to `public_html/` on Hostinger. The `public/.htaccess` file handles:
1. Passthrough rules for legacy PHP paths (`/pack-sistema/`, `/pages/`, `/tienda/`, `/assets/`)
2. Physical files and directories pass through unchanged
3. **No catch-all rewrite** — unknown routes let Apache generate a natural 404; `ErrorDocument 404 /index.html` serves the SPA while preserving the real HTTP 404 status
4. All security headers, compression (Brotli/gzip), and cache headers

## 404 Handling

Two-layer approach for correct SEO behaviour:

1. **HTTP layer** (`public/.htaccess`): `ErrorDocument 404 /index.html` — Apache returns HTTP 404 status for any path without a matching physical file. Google receives 404 and will not index these pages.
2. **React layer** (`App.jsx`): `VALID_PATHS` set (`'/'`, `'/index.html'`) — client-side detection renders `<NotFound />` for any unrecognised pathname. Known system paths (`/pack-sistema`, `/pages`, `/tienda`, `/assets`, `/_pe`) are excluded.

`<NotFound />` is rendered outside `ThemeProvider` (intentional — keeps the error path lightweight). It injects `noindex,nofollow` and `prerender-status-code: 404` meta tags via DOM for JS-capable crawlers.
