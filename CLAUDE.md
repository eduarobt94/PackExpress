# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package manager
**Siempre usar pnpm** — nunca npm ni yarn.

## Commands

```bash
pnpm dev          # Dev server con HMR
pnpm build        # Build producción → dist/
pnpm preview      # Preview del build localmente
pnpm lint         # ESLint (react-hooks + react-refresh)
```

No hay tests en este proyecto.

## Contexto del proyecto
Landing page pública de Pack Express Uruguay. Vive en la raíz de `public_html/` en Hostinger, coexistiendo con el sistema PHP legacy:
- `/pack-sistema/` — panel de gestión PHP (NO tocar)
- `/tienda/`       — tienda PHP (NO tocar)
- `/pages/`        — páginas PHP (NO tocar)
- `/assets/`       — assets legacy PHP (NO tocar — por eso `assetsDir: '_pe'` en Vite)

## Hero.jsx — Three.js dot-map (cambios recientes)
El componente más complejo. Estado actual tras las últimas correcciones:

**Problema resuelto: drift del punto de origen en resize**
- Cada partícula guarda `normX` / `normY` (valor 0–1 relativo al canvas)
- En resize, `destX/destY` se recalculan: `normX * xVisR * factorR`
- Snap threshold en render loop: `Math.abs(dx) < 0.4 ? p.destX : p.x + dx * p.speed`
  — evita decelerar infinito sin llegar nunca al destino

**Problema resuelto: delay en animación inicial**
- El `setTimeout(1500)` está dentro del callback de carga de textura del DotMap
- No empieza a contar hasta que la textura cargó

**Problema resuelto: re-animación completa en resize**
- Hero-level resize handler: `setMapReady(false)` → espera 1500ms → `setMapReady(true)`
- Esto oculta el overlay, espera que las partículas reposicionen, y relanza la secuencia completa
- Fade out: 0.2–0.25s / Fade in: 0.8–0.9s con stagger entre capas

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

## .htaccess — regla crítica (NO romper)
Las CSP estrictas están envueltas en `<If>` para excluir las rutas PHP legacy:
```apache
<If "! %{REQUEST_URI} =~ m#^/(pack-sistema|pages|tienda|PHPMailer|assets)(/|$)#">
  Header always set Content-Security-Policy "..."
</If>
```
Sin esto, el panel PHP legacy se rompe por bloqueo de inline scripts y CDNs externos.

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
