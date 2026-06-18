import { lazy, Suspense, useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useLenis } from './hooks/useLenis'
import SEO from './components/SEO'
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  serviceSchema,
} from './seo/schemas'

const servicesSchemas = [
  serviceSchema(
    'Courier Internacional',
    'Envíos internacionales desde Uruguay a más de 50 países. Gestión aduanera, seguimiento en tiempo real y entrega garantizada.',
    '/#servicios'
  ),
  serviceSchema(
    'Casillero Internacional',
    'Servicio de casillero para comprar en tiendas de EE.UU., Europa y Asia desde Uruguay. Recepción, consolidación y despacho con trámites aduaneros incluidos.',
    '/#servicios'
  ),
  serviceSchema(
    'Distribución Nacional Uruguay',
    'Cobertura logística en los 19 departamentos de Uruguay. Entrega estándar en 48 horas hábiles y express en 24 horas en Montevideo.',
    '/#servicios'
  ),
  serviceSchema(
    'Equipaje No Acompañado',
    'Transporte de maletas y pertenencias personales dentro de Uruguay y hacia el exterior, con gestión aduanera completa.',
    '/#servicios'
  ),
  serviceSchema(
    'Envío de Documentos',
    'Gestión segura de documentación oficial, contratos y correspondencia con cadena de custodia certificada, nacional e internacional.',
    '/#servicios'
  ),
]

// Above-fold — eager
import Navbar    from './components/Navbar'
import Hero      from './components/Hero'
import LegalModal from './components/LegalModal'
import NotFound  from './components/NotFound'

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

export default function App() {
  useLenis()

  const [cotizarOpen, setCotizarOpen] = useState(false)
  const [legalType,   setLegalType]   = useState(null)

  useEffect(() => {
    const open = () => setCotizarOpen(true)
    window.addEventListener('openCotizar', open)
    if (window.location.hash === '#tarifas') setCotizarOpen(true)
    return () => window.removeEventListener('openCotizar', open)
  }, [])

  useEffect(() => {
    const open = (e) => setLegalType(e.detail)
    window.addEventListener('openLegal', open)
    return () => window.removeEventListener('openLegal', open)
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
      <SEO
        schemas={[organizationSchema, localBusinessSchema, websiteSchema, faqSchema, ...servicesSchemas]}
      />

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
