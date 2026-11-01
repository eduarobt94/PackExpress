import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { ENV } from './tests/config/env';

const testDir = defineBddConfig({
  paths: ['tests/features/**/*.feature'],
  require: ['tests/fixtures/**/*.ts', 'tests/step-definitions/**/*.ts', 'tests/hooks/**/*.ts'],
  outputDir: 'tests/.features-gen',
});

export default defineConfig({
  testDir,

  timeout: 45_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  forbidOnly: ENV.CI,
  retries: ENV.CI ? 1 : 0,
  // DIAGNÓSTICO (Fase 34, ver docs/QA_BUGS.md BUG-TEST-002): esta landing
  // corre 3 rAF-loops permanentes (Three.js dot-map del Hero, Lenis smooth
  // scroll, animaciones whileInView de Framer Motion). Con el default de
  // Playwright (workers = CPUs/2) en una máquina de 4 cores compartida con
  // el resto de esta sesión, 2+ contextos de browser en paralelo saturaron
  // la CPU y produjeron timeouts reales en scrollIntoViewIfNeeded/click que
  // NO reproducen en ejecución aislada (ver scripts/qa-probe.mjs). Se limita
  // a 2 workers de forma fija — en un runner de CI dedicado puede subirse.
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    cucumberReporter('html', { outputFile: 'reports/cucumber-report.html' }),
  ],

  use: {
    baseURL: ENV.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    // Generoso a propósito: en `pnpm dev` (Vite sin build previo) la primera
    // carga transforma three.js/gsap/framer-motion on-demand y puede superar
    // los 15s en máquinas cargadas. En CI/producción se recomienda apuntar
    // BASE_URL a un `vite preview` sobre build ya compilado (mucho más rápido
    // y representativo — ver docs/QA_FINAL_REPORT.md).
    navigationTimeout: 30_000,
  },

  outputDir: 'test-results',

  projects: [
    // ── Smoke: feedback rápido, Chromium únicamente ──
    {
      name: 'smoke-chromium',
      testDir,
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Regression: cross-browser completo ──
    {
      name: 'regression-chromium',
      testDir,
      grep: /@regression/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'regression-firefox',
      testDir,
      grep: /@regression/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'regression-webkit',
      testDir,
      grep: /@regression/,
      use: { ...devices['Desktop Safari'] },
    },

    // ── Mobile viewport (menú móvil, drawer) ──
    {
      name: 'mobile-chromium',
      testDir,
      grep: /@mobile/,
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    // Se sirve el build de producción (vite preview), no `vite dev`: el
    // dev-server compila on-demand y bajo 2 workers en paralelo la primera
    // carga de three.js/gsap/framer-motion superó incluso 30s de timeout
    // en esta máquina — no representativo y generaba falsos rojos.
    // Requiere `pnpm build` antes de correr los tests (ver docs/QA_FINAL_REPORT.md).
    command: 'npx vite preview --port 5173 --strictPort',
    url: ENV.BASE_URL,
    reuseExistingServer: !ENV.CI,
    timeout: 60_000,
  },
});
