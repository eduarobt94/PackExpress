import { lazy, Suspense, useState, useEffect, startTransition } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useLenis } from './hooks/useLenis'
import SEO from './components/SEO'
// El JSON-LD ya no se importa acá: vive en seo/schemas.js y lo escribe
// estático en el HTML scripts/inject-jsonld.mjs durante el build.

// Above-fold — eager
import Navbar     from './components/Navbar'
import PromoBanner from './components/PromoBanner'
import Hero       from './components/Hero'
import LegalModal from './components/LegalModal'
import NotFound   from './components/NotFound'

// Rutas válidas del SPA — cualquier otra devuelve 404
const VALID_PATHS = new Set(['/', '/index.html'])
const pathname    = window.location.pathname
// Permite pack-sistema y otras rutas PHP existentes pasar sin 404
const isKnownSystem = ['/pack-sistema', '/pages', '/tienda', '/assets', '/_pe']
  .some(p => pathname.startsWith(p))
const is404 = !VALID_PATHS.has(pathname) && !isKnownSystem && pathname !== '/'

// Below-fold — lazy loaded
const Metrics      = lazy(() => import('./components/Metrics'))
const Services     = lazy(() => import('./components/Services'))
const Process      = lazy(() => import('./components/Process'))
const Tracking     = lazy(() => import('./components/Tracking'))
const Cotizacion   = lazy(() => import('./components/Cotizacion'))
const Coverage     = lazy(() => import('./components/Coverage'))
const Docs         = lazy(() => import('./components/Docs'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Footer       = lazy(() => import('./components/Footer'))
const ChatAgent    = lazy(() => import('./components/ChatAgent/ChatAgent'))

export default function App() {
  useLenis()

  // Entrar directo por #tarifas abre el cotizador: se resuelve en el estado
  // inicial, no con un setState dentro del efecto (que provocaba un render
  // extra en cascada solo para abrirlo).
  const [cotizarOpen, setCotizarOpen] = useState(() => window.location.hash === '#tarifas')
  const [legalType,   setLegalType]   = useState(null)

  useEffect(() => {
    const open = () => startTransition(() => setCotizarOpen(true))
    window.addEventListener('openCotizar', open)
    return () => window.removeEventListener('openCotizar', open)
  }, [])

  useEffect(() => {
    const open = (e) => setLegalType(e.detail)
    window.addEventListener('openLegal', open)
    return () => window.removeEventListener('openLegal', open)
  }, [])

  useEffect(() => {
    // Precargar Cotizacion durante idle para que el chunk ya esté listo al hacer click
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => import('./components/Cotizacion'))
    }
  }, [])

  useEffect(() => {
    if (!cotizarOpen) return
    const handler = (e) => { if (e.key === 'Escape') setCotizarOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cotizarOpen])

  // Renderizar 404 fuera del ThemeProvider para mantenerlo liviano
  if (is404) return <NotFound />

  return (
    <ThemeProvider>
    <MotionConfig reducedMotion="user">
    <>
      {/* Sin `schemas`: el JSON-LD ya va ESTÁTICO en el HTML del build
          (scripts/inject-jsonld.mjs). Inyectarlo también acá lo duplicaría en
          el DOM, y la versión estática es la única que ven los crawlers que no
          ejecutan JavaScript. */}
      <SEO />

      <div className="min-h-screen bg-[var(--bg-base)]">
        {/* ── Skip to content (accesibilidad) ── */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                     focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#FF6B00] focus:text-white
                     focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Ir al contenido principal
        </a>

        <PromoBanner />

        <header role="banner">
          <Navbar />
        </header>

        <div id="tarifas" />

        <main id="main-content" role="main">
          <Hero />
          <Suspense fallback={null}>
            <Metrics />
            <Services />
            <Process />
            <Tracking />
            <Coverage />
            <Docs />
            <Testimonials />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <footer role="contentinfo">
            <Footer />
          </footer>
        </Suspense>

        <Suspense fallback={null}>
          <ChatAgent />
        </Suspense>
      </div>

      {/* ── Legal Modal ── */}
      <LegalModal type={legalType} onClose={() => setLegalType(null)} />

      {/* ── Cotizacion Modal ── */}
      <AnimatePresence>
        {cotizarOpen && (
          <>
            <motion.div
              key="cot-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[90] bg-[var(--bg-base)]/55 backdrop-blur-2xl"
              onClick={() => setCotizarOpen(false)}
            />
            <div className="fixed inset-0 z-[91] overflow-y-auto" data-lenis-prevent>
              <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 py-16">
                <motion.div
                  key="cot-modal"
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-5xl"
                  onClick={e => e.stopPropagation()}
                >
                  <Suspense fallback={null}>
                    <Cotizacion onClose={() => setCotizarOpen(false)} />
                  </Suspense>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
    </MotionConfig>
    </ThemeProvider>
  )
}
