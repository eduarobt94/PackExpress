import type { Page, Locator } from '@playwright/test';

/**
 * Espera y hace scroll a una sección below-the-fold de la home.
 *
 * Dos problemas que este helper resuelve (BUG-TEST-011, ver docs/QA_BUGS.md):
 *
 * 1. **Las secciones son lazy.** `LazySection` + `useInViewMount` hacen que
 *    `#contacto`, el `<form>` de contacto y el `<footer>` NO existan en el DOM
 *    hasta que su placeholder se acerca al viewport. Llamar directamente a
 *    `locator.scrollIntoViewIfNeeded()` mete DOS esperas (que el elemento
 *    aparezca + que el scroll se complete) dentro del mismo `actionTimeout` de
 *    10 s, compitiendo contra la red de seguridad de 8 s de `useInViewMount`.
 *    Margen real: ~2 s ⇒ fallos intermitentes que parecían "flakiness de CPU".
 *    Acá se esperan por separado, con un timeout holgado para el montaje.
 *
 * 2. **Lenis intercepta el scroll nativo.** `window.scrollTo()` desde
 *    `page.evaluate` no mueve la página (verificado: `scrollY` queda en 0).
 *    Se usa `window.lenis.scrollTo()`, la misma API que usa la app
 *    (ver `Hero.jsx`), con `immediate` para no depender del easing en tests.
 */
export async function scrollToLazySection(page: Page, locator: Locator): Promise<void> {
  await page.evaluate(async () => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: number, o?: object) => void } }).lenis;
    const target = document.body.scrollHeight;
    if (lenis?.scrollTo) lenis.scrollTo(target, { immediate: true });
    else window.scrollTo(0, target);
    await new Promise((r) => setTimeout(r, 150));
  });

  // Timeout holgado a propósito: cubre con margen el fallback de 8 s de
  // useInViewMount, para que el montaje nunca compita con el actionTimeout.
  await locator.waitFor({ state: 'visible', timeout: 20_000 });
  await locator.scrollIntoViewIfNeeded();
}
