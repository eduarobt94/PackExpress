import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package, ArrowLeft, Search, AlertTriangle,
  Zap, Globe2, FileText, MapPin,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   Animation presets
   ══════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
const contentStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const stepIn = {
  hidden: { opacity: 0, scale: 0.7 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}
const timelineStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.32, delayChildren: 1.1 } },
}


/*
 * Three radar/sonar beacons positioned at the viewport periphery.
 * Each emits 3 concentric expanding rings with staggered timing —
 * identical to maritime radar or GPS signal pulses.
 * Colors: orange (national), red (alert/error), blue (international).
 */
const RADARS = [
  { cx: 195,  cy: 460, color: '#F07232', strokeW: 1.2, maxR: 80, dur: 3.0, delay: 0.4  }, // orange — left
  { cx: 1230, cy: 155, color: '#E53535', strokeW: 1.2, maxR: 75, dur: 2.6, delay: 0.9  }, // red    — top-right
  { cx: 1210, cy: 730, color: '#527ED8', strokeW: 1.1, maxR: 78, dur: 3.2, delay: 1.4  }, // blue   — bottom-right
]

function RouteNetwork() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {RADARS.map((r, ri) => (
        <motion.g
          key={ri}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: r.delay, duration: 1, ease: 'easeOut' }}
        >
          {/* 3 sonar rings — staggered phase so they pulse continuously */}
          {[0, r.dur / 3, (r.dur / 3) * 2].map((phaseDelay, i) => (
            <motion.circle
              key={i}
              cx={r.cx}
              cy={r.cy}
              r={6}
              fill="none"
              stroke={r.color}
              strokeWidth={r.strokeW}
              animate={{ r: [6, r.maxR], opacity: [0.65, 0] }}
              transition={{
                duration:      r.dur,
                repeat:        Infinity,
                delay:         r.delay + phaseDelay,
                ease:          'easeOut',
                repeatDelay:   0,
              }}
            />
          ))}

          {/* Static inner rings — structural presence */}
          <circle cx={r.cx} cy={r.cy} r={14} fill="none" stroke={r.color} strokeWidth={0.6} opacity={0.18} />
          <circle cx={r.cx} cy={r.cy} r={7}  fill={r.color} opacity={0.10} />

          {/* Center beacon dot */}
          <circle cx={r.cx} cy={r.cy} r={3}   fill={r.color} opacity={0.90} />
          <motion.circle
            cx={r.cx} cy={r.cy} r={3}
            fill={r.color}
            animate={{ opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: r.dur * 0.6, repeat: Infinity, ease: 'easeInOut', delay: r.delay }}
          />
        </motion.g>
      ))}
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Tracking error card — signature visual element
   Mirrors the real Pack Express tracking UI with a broken journey
   ══════════════════════════════════════════════════════════════ */
const STEPS = [
  { label: 'Recibido',     labelSm: 'Rec.' },
  { label: 'En tránsito',  labelSm: 'Tránsito' },
  { label: 'Aduana',       labelSm: 'Aduana' },
  { label: 'Distribución', labelSm: 'Distrib.' },
  { label: '— — —',        labelSm: '— — —', error: true },
]

function TrackingErrorCard() {
  return (
    <motion.div
      className="w-full"
      style={{ maxWidth: 580 }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
    >
      <div
        style={{
          background:   'linear-gradient(150deg, rgba(15,21,34,0.97) 0%, rgba(8,11,20,0.99) 100%)',
          border:       '1px solid rgba(255,255,255,0.075)',
          borderRadius: 22,
          overflow:     'hidden',
          boxShadow:
            '0 48px 100px rgba(0,0,0,0.55), ' +
            '0 0 0 1px rgba(255,255,255,0.04), ' +
            'inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* ── Card header ── */}
        <div
          style={{
            padding:      '15px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
            background:   'rgba(255,255,255,0.018)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Package size={13} style={{ color: 'rgba(240,114,50,0.65)' }} />
            <span
              style={{
                fontSize:      10.5,
                fontFamily:    'monospace',
                color:         'rgba(255,255,255,0.35)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Pack Express · Red de Rutas
            </span>
          </div>
          {/* ERROR badge */}
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              padding:      '4px 10px',
              borderRadius: 7,
              background:   'rgba(240,114,50,0.09)',
              border:       '1px solid rgba(240,114,50,0.22)',
            }}
          >
            <motion.span
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#F07232', display: 'block', flexShrink: 0 }}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span
              style={{
                fontSize:      10,
                fontFamily:    'monospace',
                color:         'rgba(240,114,50,0.85)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight:    600,
              }}
            >
              Error
            </span>
          </div>
        </div>

        {/* ── Tracking number ── */}
        <div style={{ padding: '20px 24px 0' }}>
          <div
            style={{
              fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5,
            }}
          >
            Número de seguimiento
          </div>
          <div
            style={{
              fontSize: 20, fontFamily: 'monospace', fontWeight: 700,
              color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em',
            }}
          >
            PX_ERR · NO_ROUTE_ASSIGNED
          </div>
        </div>

        {/* ── Timeline ── */}
        <div style={{ padding: '24px 24px 20px' }}>
          <motion.div
            style={{ position: 'relative' }}
            variants={timelineStagger}
            initial="hidden"
            animate="show"
          >
            {/* Base connector line */}
            <div
              style={{
                position:   'absolute',
                top:        11,
                left:       '5%',
                right:      '5%',
                height:     1,
                background: 'rgba(255,255,255,0.06)',
              }}
            />
            {/* Animated fill line */}
            <motion.div
              style={{
                position:        'absolute',
                top:             11,
                left:            '5%',
                height:          1,
                background:      'linear-gradient(to right, rgba(240,114,50,0.8), rgba(240,114,50,0.35))',
                transformOrigin: 'left center',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 0.9 }}
              transition={{ duration: 1.6, delay: 1.1 + STEPS.length * 0.32, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={stepIn}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}
                >
                  {/* Dot */}
                  <motion.div
                    style={{
                      width:        22,
                      height:       22,
                      borderRadius: '50%',
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent: 'center',
                      border:       `1.5px solid ${step.error ? 'rgba(240,114,50,0.7)' : 'rgba(240,114,50,0.55)'}`,
                      background:   step.error ? 'rgba(240,114,50,0.14)' : 'rgba(240,114,50,0.08)',
                    }}
                    animate={
                      step.error
                        ? { boxShadow: ['0 0 10px rgba(240,114,50,0.25)', '0 0 22px rgba(240,114,50,0.5)', '0 0 10px rgba(240,114,50,0.25)'] }
                        : {}
                    }
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {step.error ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#F07232', lineHeight: 1, fontFamily: 'monospace' }}>✕</span>
                    ) : (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(240,114,50,0.75)', display: 'block' }} />
                    )}
                  </motion.div>

                  {/* Label */}
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize:  9,
                      fontFamily:'monospace',
                      color:     step.error ? 'rgba(240,114,50,0.75)' : 'rgba(255,255,255,0.3)',
                      textAlign: 'center',
                      maxWidth:  72,
                      lineHeight:1.35,
                      fontWeight: step.error ? 700 : 400,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    className="block sm:hidden"
                    style={{
                      fontSize:  8,
                      fontFamily:'monospace',
                      color:     step.error ? 'rgba(240,114,50,0.75)' : 'rgba(255,255,255,0.3)',
                      textAlign: 'center',
                      maxWidth:  50,
                      lineHeight:1.35,
                      fontWeight: step.error ? 700 : 400,
                    }}
                  >
                    {step.labelSm}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Error bar */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 1.1 + STEPS.length * 0.32 + 0.3 }}
            style={{
              marginTop:    22,
              padding:      '11px 16px',
              borderRadius: 11,
              background:   'rgba(240,114,50,0.06)',
              border:       '1px solid rgba(240,114,50,0.16)',
              display:      'flex',
              alignItems:   'flex-start',
              gap:          10,
            }}
          >
            <AlertTriangle
              size={13}
              style={{ color: 'rgba(240,114,50,0.75)', flexShrink: 0, marginTop: 1 }}
            />
            <span
              style={{
                fontSize:      11,
                fontFamily:    'monospace',
                color:         'rgba(240,114,50,0.65)',
                letterSpacing: '0.04em',
                lineHeight:    1.55,
              }}
            >
              RUTA_SIN_ASIGNACIÓN — Este punto de entrega no figura en nuestra red operativa activa.
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Quick navigation links
   ══════════════════════════════════════════════════════════════ */
const QUICK_LINKS = [
  { label: 'Servicios', href: '/#servicios', Icon: Zap,      ev: null          },
  { label: 'Tarifas',   href: '/',           Icon: FileText, ev: 'openCotizar' },
  { label: 'Cobertura', href: '/#cobertura', Icon: Globe2,   ev: null          },
  { label: 'Contacto',  href: '/#contacto',  Icon: MapPin,   ev: null          },
]

/* ══════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════ */
export default function NotFound() {
  useEffect(() => {
    /* noindex + prerender 404 hint */
    const noindex   = Object.assign(document.createElement('meta'), { name: 'robots',                content: 'noindex, nofollow' })
    const prerender = Object.assign(document.createElement('meta'), { name: 'prerender-status-code', content: '404'              })
    document.head.append(noindex, prerender)
    const prev = document.title
    document.title = 'Página no encontrada · Pack Express Uruguay'
    return () => {
      document.head.removeChild(noindex)
      document.head.removeChild(prerender)
      document.title = prev
    }
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: '#060810' }}
    >
      {/* ── Radial glows ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ position:'absolute', top:'-15%', left:'-8%', width:'70%', height:'80%',
          background:'radial-gradient(ellipse at 25% 20%, rgba(240,114,50,0.09) 0%, transparent 60%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-6%', width:'60%', height:'70%',
          background:'radial-gradient(ellipse at 75% 80%, rgba(82,126,216,0.07) 0%, transparent 58%)' }} />
      </div>

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* ── Giant background "404" ── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top:        '50%',
          left:       '50%',
          transform:  'translate(-50%, -56%)',
          fontSize:   'min(54vw, 480px)',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 900,
          lineHeight: 0.85,
          background: 'linear-gradient(180deg, rgba(240,114,50,0.07) 0%, rgba(240,114,50,0.025) 55%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
          whiteSpace:           'nowrap',
          letterSpacing:        '-0.04em',
        }}
        aria-hidden="true"
      >
        404
      </div>

      {/* ── Animated route network ── */}
      <RouteNetwork />

      {/* ── Top/bottom vignettes ── */}
      <div className="absolute inset-x-0 top-0 h-36 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #060810 0%, transparent 100%)' }} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #060810 0%, transparent 100%)' }} aria-hidden="true" />

      {/* ════════════════════════════════════════════════════════
          Content
          ════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-20">
        <motion.div
          className="flex flex-col items-center text-center w-full"
          style={{ maxWidth: 580 }}
          variants={contentStagger}
          initial="hidden"
          animate="show"
        >

          {/* Logo */}
          <motion.a
            href="/"
            variants={fadeUp}
            className="mb-12 transition-opacity duration-300"
            style={{ opacity: 0.6 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            aria-label="Pack Express — inicio"
          >
            <img src="/logoDark.png" alt="Pack Express Uruguay" style={{ height: 52 }} />
          </motion.a>

          {/* ── Tracking error card ── */}
          <motion.div variants={fadeUp} className="w-full mb-10">
            <TrackingErrorCard />
          </motion.div>

          {/* Error badge */}
          <motion.div variants={fadeUp} className="mb-5">
            <span
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           7,
                padding:       '5px 12px',
                borderRadius:  8,
                fontSize:      10.5,
                fontFamily:    'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.13em',
                background:    'rgba(240,114,50,0.07)',
                border:        '1px solid rgba(240,114,50,0.17)',
                color:         'rgba(240,114,50,0.7)',
              }}
            >
              <motion.span
                style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(240,114,50,0.8)', display: 'block', flexShrink: 0 }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              RUTA_SIN_COBERTURA · 404
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-bold tracking-tight"
            style={{
              fontSize:     'clamp(1.9rem, 4.5vw, 2.9rem)',
              lineHeight:   1.1,
              color:        'var(--fg-1, #F8F8F8)',
              marginBottom: 14,
            }}
          >
            Destino fuera de ruta.
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize:     15,
              lineHeight:   1.7,
              color:        'var(--fg-3, #64748B)',
              maxWidth:     380,
              marginBottom: 34,
            }}
          >
            La dirección que buscás no está registrada en nuestra
            red de rutas. Todos nuestros servicios siguen disponibles.
          </motion.p>

          {/* ── CTAs ── */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            style={{ marginBottom: 44 }}
          >
            <a
              href="/"
              className="flex items-center justify-center gap-2 font-semibold rounded-xl whitespace-nowrap
                         transition-all duration-200"
              style={{
                padding:    '12px 26px',
                fontSize:   14,
                color:      '#fff',
                background: 'linear-gradient(135deg, #F07232 0%, #E0662A 100%)',
                boxShadow:  '0 0 30px rgba(240,114,50,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                minWidth:   164,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 44px rgba(240,114,50,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(240,114,50,0.30), inset 0 1px 0 rgba(255,255,255,0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <ArrowLeft size={14} />
              Centro de operaciones
            </a>

            <a
              href="/#rastreo"
              className="flex items-center justify-center gap-2 font-medium rounded-xl whitespace-nowrap
                         transition-all duration-200"
              style={{
                padding:    '12px 26px',
                fontSize:   14,
                color:      'var(--fg-2, #94A3B8)',
                border:     '1px solid var(--bd-2, rgba(255,255,255,0.08))',
                background: 'rgba(255,255,255,0.025)',
                minWidth:   164,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color      = 'var(--fg-1, #F8F8F8)'
                e.currentTarget.style.borderColor= 'rgba(240,114,50,0.28)'
                e.currentTarget.style.background = 'rgba(240,114,50,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color      = 'var(--fg-2, #94A3B8)'
                e.currentTarget.style.borderColor= 'var(--bd-2, rgba(255,255,255,0.08))'
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
              }}
            >
              <Search size={14} />
              Rastrear un envío
            </a>
          </motion.div>

          {/* ── Divider ── */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-4 w-full"
            style={{ maxWidth: 400, marginBottom: 18 }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--bd-1, rgba(255,255,255,0.055))' }} />
            <span
              style={{
                fontSize:      10,
                color:         'var(--fg-4, #64748B)',
                fontWeight:    500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Continuar en
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--bd-1, rgba(255,255,255,0.055))' }} />
          </motion.div>

          {/* ── Quick links ── */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-4 gap-2.5 w-full"
            style={{ maxWidth: 400 }}
          >
            {QUICK_LINKS.map(({ label, href, Icon, ev }) => (
              <a
                key={label}
                href={href}
                onClick={ev ? (e) => { e.preventDefault(); window.dispatchEvent(new Event(ev)) } : undefined}
                className="group flex flex-col items-center gap-2 rounded-xl transition-all duration-200"
                style={{
                  padding:    '14px 8px',
                  border:     '1px solid var(--bd-1, rgba(255,255,255,0.055))',
                  background: 'rgba(12,16,24,0.6)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(240,114,50,0.28)'
                  e.currentTarget.style.background  = 'rgba(240,114,50,0.06)'
                  e.currentTarget.style.transform   = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bd-1, rgba(255,255,255,0.055))'
                  e.currentTarget.style.background  = 'rgba(12,16,24,0.6)'
                  e.currentTarget.style.transform   = 'translateY(0)'
                }}
              >
                <Icon size={15} style={{ color: 'var(--fg-3, #64748B)', transition: 'color 0.2s' }} className="group-hover:!text-[#F07232]" />
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg-3, #64748B)', transition: 'color 0.2s' }} className="group-hover:!text-[var(--fg-2)]">
                  {label}
                </span>
              </a>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* ── Footer ── */}
      <motion.div
        className="relative z-10"
        style={{ borderTop: '1px solid var(--bd-1, rgba(255,255,255,0.055))', padding: '13px 24px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <p
          className="text-center font-mono"
          style={{ fontSize: 10.5, color: 'var(--fg-4, #64748B)', letterSpacing: '0.04em' }}
        >
          © 2025 Pack Express Uruguay S.A.S. · 19 departamentos · +50 países
        </p>
      </motion.div>

    </div>
  )
}
