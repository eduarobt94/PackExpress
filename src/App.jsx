import { lazy, Suspense, useState, useEffect, useCallback, startTransition } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useLenis } from './hooks/useLenis'
import { useIdleMount } from './hooks/useInViewMount'
import LazySection from './components/LazySection'
import { track } from './lib/analytics'
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
const ConsentBanner = lazy(() => import('./components/ConsentBanner'))

export default function App() {
  useLenis()
  const chatReady = useIdleMount()

  // Entrar directo por #tarifas abre el cotizador: se resuelve en el estado
  // inicial, no con un setState dentro del efecto (que provocaba un render
  // extra en cascada solo para abrirlo).
  const [cotizarOpen, setCotizarOpen] = useState(() => window.location.hash === '#tarifas')
  const [legalType,   setLegalType]   = useState(null)

  useEffect(() => {
    const open = () => startTransition(() => setCotizarOpen(true))
    window.addEventListener('openCotizar', open)

    // El estado inicial de arriba solo cubre ENTRAR con #tarifas ya en la URL.
    // Estando ya en la home (siempre, es una SPA de una sola página) el hash
    // puede cambiar sin remontar React — p. ej. el link "Tarifas" del Footer
    // (href="#tarifas"): la URL cambiaba pero el cotizador no se abría nunca.
    const onHashChange = () => {
      if (window.location.hash === '#tarifas') open()
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('openCotizar', open)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  // Una vez por transición cerrado→abierto (también cubre entrar con #tarifas).
  useEffect(() => {
    if (cotizarOpen) track('quote_open')
  }, [cotizarOpen])

  useEffect(() => {
    const open = (e) => {
      setLegalType(e.detail)
      track('legal_open', { doc: e.detail })
    }
    window.addEventListener('openLegal', open)
    return () => window.removeEventListener('openLegal', open)
  }, [])

  useEffect(() => {
    // Precargar Cotizacion durante idle para que el chunk ya esté listo al hacer
    // click. timeout: en una pestaña ocupada (mobile con CPU throttled, otras
    // tareas compitiendo) el navegador puede tardar en considerarla "idle" de
    // verdad — sin timeout, requestIdleCallback puede no disparar nunca antes
    // de que el usuario ya haya tocado un botón de "Cotizar" (hay 8 en el
    // sitio; casi ninguno tiene su propio prefetch — ver Hero.jsx). El timeout
    // fuerza la descarga igual, aunque el hilo siga "ocupado".
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => import('./components/Cotizacion'), { timeout: 2000 })
    } else {
      import('./components/Cotizacion')
    }
  }, [])

  // Cierra el cotizador y limpia el hash si quedó en #tarifas: sin esto, tras
  // cerrarlo la URL seguía siendo /#tarifas y un segundo click en el link
  // "Tarifas" del Footer no disparaba `hashchange` (el hash no cambiaba), así
  // que el cotizador ya no volvía a abrirse.
  const closeCotizar = useCallback(() => {
    setCotizarOpen(false)
    if (window.location.hash === '#tarifas') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  useEffect(() => {
    if (!cotizarOpen) return
    const handler = (e) => { if (e.key === 'Escape') closeCotizar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cotizarOpen, closeCotizar])

  // Renderizar 404 fuera del ThemeProvider para mantenerlo liviano
  if (is404) return <NotFound />

  return (
    <ThemeProvider>
    <MotionConfig reducedMotion="user">
    <>
      {/* <SEO /> NO se renderiza acá, y por el mismo motivo por el que tampoco
          se le pasan `schemas`: todo el <head> de la home (title, description,
          canonical, OG, Twitter, geo) ya va ESTÁTICO en index.html, y el
          JSON-LD lo inyecta el build (scripts/inject-jsonld.mjs).
          Con React 19, react-helmet-async usa el hoisting nativo de React, que
          no deduplica contra los tags ya presentes en el HTML servido: montar
          <SEO /> agregaba un SEGUNDO <meta description>, <link canonical>,
          <meta og:title>, etc. La versión estática además es la única que ven
          los crawlers que no ejecutan JavaScript.
          Si en el futuro se agregan rutas con meta distintos, reintroducir
          <SEO /> SOLO en esas rutas y quitar de index.html los tags que pasen
          a ser dinámicos. Ver docs/QA_BUGS.md (BUG-APP-001). */}

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
          {/* Cada sección monta recién al acercarse al viewport — evita que
              las ~7 secciones below-the-fold compitan todas por CPU/red
              apenas resuelve el chunk lazy (el driver principal del TBT/LCP
              alto en mobile: ver reporte Lighthouse mobile). */}
          <LazySection as="div">
            <Suspense fallback={null}><Metrics /></Suspense>
          </LazySection>
          <LazySection as="div">
            <Suspense fallback={null}><Services /></Suspense>
          </LazySection>
          <LazySection as="div">
            <Suspense fallback={null}><Process /></Suspense>
          </LazySection>
          {/* Sin gating: Navbar y Hero linkean a #rastreo (href="#rastreo",
              lenis.scrollTo) apenas carga la página — si Tracking todavía no
              montó, el target no existe y el scroll/tracking no hace nada. */}
          <Suspense fallback={null}><Tracking /></Suspense>
          <LazySection as="div">
            <Suspense fallback={null}><Coverage /></Suspense>
          </LazySection>
          <LazySection as="div">
            <Suspense fallback={null}><Docs /></Suspense>
          </LazySection>
          <LazySection as="div">
            <Suspense fallback={null}><Testimonials /></Suspense>
          </LazySection>
        </main>

        <LazySection as="footer" role="contentinfo" rootMargin="800px 0px">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </LazySection>

        {/* ChatAgent es un widget fijo (no ligado a scroll): se monta recién
            en idle para no competir con el hilo principal durante la carga
            inicial en mobile. */}
        {chatReady && (
          <Suspense fallback={null}>
            <ChatAgent />
          </Suspense>
        )}
        {chatReady && (
          <Suspense fallback={null}>
            <ConsentBanner />
          </Suspense>
        )}
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
            />
            {/* El click-para-cerrar vive acá, no en el backdrop: este contenedor
                cubre el viewport completo por encima del backdrop (z-91 > z-90),
                así que era él —y no el backdrop— quien recibía los clicks en la
                zona vacía. El panel del modal hace stopPropagation, de modo que
                solo cierra al clickear fuera de él. */}
            <div
              className="fixed inset-0 z-[91] overflow-y-auto"
              data-lenis-prevent
              onClick={closeCotizar}
            >
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
                    <Cotizacion onClose={closeCotizar} />
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
