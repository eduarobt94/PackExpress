import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Inbox, ScanLine, Truck, FileCheck2, CheckCircle2,
  Globe, ShoppingCart,
} from 'lucide-react'

// â”€â”€ Timing constants (ms) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RING_MS = 1600
const LINE_MS = 480
const GAP_MS  = 280

// â”€â”€ Flow data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// accent: { hex, ring, tint, glow } "” naranja para nacional, azul para internacional
const ACCENTS = {
  orange: {
    hex:  '#F07232',
    ring: 'rgba(255,107,0,0.22)',
    tint: 'rgba(255,107,0,0.10)',
    glow: 'rgba(255,107,0,0.35)',
    pill: '#F07232',
    pillGlow: '0 0 20px rgba(255,107,0,0.35)',
  },
  blue: {
    hex:  '#527ED8',
    ring: 'rgba(59,126,248,0.22)',
    tint: 'rgba(59,126,248,0.10)',
    glow: 'rgba(59,126,248,0.35)',
    pill: '#527ED8',
    pillGlow: '0 0 20px rgba(59,126,248,0.35)',
  },
}

const FLOWS = [
  {
    id:     'envio',
    accent: 'orange',
    tab:    'Enviás desde Uruguay',
    h2:     ['Enviá en 5 pasos,', 'sin burocracia.'],
    sub:    'Courier o distribución nacional "” cada envío sigue el mismo proceso riguroso de principio a fin.',
    steps: [
      { Icon: Inbox,        title: 'Recolectamos',  desc: 'Pasamos a buscar en tu domicilio o recibimos en nuestra sede de Carlos Quijano 1258, Montevideo.' },
      { Icon: ScanLine,     title: 'Clasificamos',  desc: 'Pesamos, catalogamos y preparamos cada envío según el destino y la normativa vigente.' },
      { Icon: Truck,        title: 'Transportamos', desc: 'Coordinamos el transporte con operadores logísticos de primera línea.' },
      { Icon: FileCheck2,   title: 'Despachamos',   desc: 'Gestionamos toda la documentación en origen y destino. Vos no hacés nada.' },
      { Icon: CheckCircle2, title: 'Entregamos',    desc: 'Confirmación de entrega con seguimiento en tiempo real desde cualquier dispositivo.' },
    ],
  },
  {
    id:     'casillero',
    accent: 'blue',
    tab:    'Recibís del exterior',
    h2:     ['Comprá afuera.', 'Recibí en Uruguay.'],
    sub:    'En cuatro pasos, tenés tus compras internacionales en la puerta de tu casa.',
    steps: [
      { Icon: Globe,        title: 'Tu dirección en el exterior', desc: 'Activá tu casillero y obtenés una dirección personal internacional para usar en cualquier tienda.' },
      { Icon: ShoppingCart, title: 'Comprás donde querás',        desc: 'Realizás tus compras usando tu casillero como dirección de entrega.' },
      { Icon: ScanLine,     title: 'Recibimos y procesamos',      desc: 'Recibimos tus paquetes, los registramos y te notificamos cuando están listos.' },
      { Icon: Truck,        title: 'Lo enviamos a Uruguay',       desc: 'Consolidamos tus compras y las despachamos. Retirás en sede o las recibís en tu domicilio.' },
    ],
  },
]

// â”€â”€ StepsDisplay "” keyed por flow.id, se re-monta al cambiar flujo â”€
function StepsDisplay({ flow, inView }) {
  const { steps } = flow
  const ac = ACCENTS[flow.accent]   // accent color set
  const N = steps.length

  const [active,   setActive]   = useState(0)
  const [filling,  setFilling]  = useState(-1)
  const [visited,  setVisited]  = useState(new Set([0]))
  const [ringKeys, setRingKeys] = useState(steps.map((_, i) => i === 0 ? 1 : 0))
  const [paused,   setPaused]   = useState(false)

  const activeRef = useRef(0)
  const pausedRef = useRef(false)
  useEffect(() => { pausedRef.current = paused }, [paused])

  useEffect(() => {
    if (!inView) return
    let pending

    const doStep = () => {
      if (pausedRef.current) { pending = setTimeout(doStep, 120); return }

      pending = setTimeout(() => {
        if (pausedRef.current) { pending = setTimeout(doStep, 120); return }
        const cur = activeRef.current
        if (cur < steps.length - 1) setFilling(cur)

        pending = setTimeout(() => {
          setFilling(-1)
          const next = (cur + 1) % steps.length
          activeRef.current = next
          setActive(next)
          setVisited(v => { const s = new Set(v); s.add(next); return s })
          setRingKeys(k => k.map((n, i) => i === next ? n + 1 : n))
          doStep()
        }, LINE_MS + GAP_MS)
      }, RING_MS)
    }

    doStep()
    return () => clearTimeout(pending)
  }, [inView])

  const activateStep = (i) => {
    setPaused(true)
    setActive(i)
    setFilling(-1)
    setVisited(v => { const s = new Set(v); s.add(i); return s })
    setRingKeys(k => k.map((n, j) => j === i ? n + 1 : n))
    activeRef.current = i
  }

  // Connector track width: spans from center of step 1 to center of step N
  const gapPx          = (N - 1) * 24
  const trackRightStyle = `calc((100% - ${gapPx}px) / ${N} - 38px)`
  const gridClass       = N === 5 ? 'md:grid-cols-6 lg:grid-cols-5' : 'md:grid-cols-4 lg:grid-cols-4'
  const centerClass     = N < 5   ? 'max-w-4xl mx-auto'  : ''

  return (
    <div className={`relative ${centerClass}`}>
      {/* Connector track "” desktop */}
      <div
        className="hidden lg:block absolute top-[38px] left-[38px] h-px"
        style={{ right: trackRightStyle, background: 'var(--bd-1)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 origin-left"
          style={{ background: `linear-gradient(90deg, ${ac.hex}b3, ${ac.hex}40)` }}
          animate={{
            width: active === 0 && filling === -1
              ? '0%'
              : `${((filling >= 0 ? filling : active) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: LINE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridClass} gap-10 sm:gap-8 lg:gap-6`}>
        {steps.map(({ Icon, title, desc }, i) => {
          const isActive  = active === i
          const isVisited = visited.has(i) && !isActive
          const isFinal   = i === steps.length - 1

          const tabletSpan = N === 5
            ? i < 3    ? 'md:col-span-2 lg:col-span-1'
            : i === 3  ? 'md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto'
            :            'md:col-span-2 md:col-start-4 lg:col-span-1 lg:col-start-auto'
            : ''

          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col items-center lg:items-start text-center lg:text-left cursor-default ${tabletSpan}`}
              onMouseEnter={() => activateStep(i)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Circle */}
              <div className="relative mb-5 sm:mb-6 shrink-0 w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] lg:w-[76px] lg:h-[76px]">
                <svg
                  width="100%" height="100%" viewBox="0 0 76 76"
                  className="absolute inset-0"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <filter id={`glow-${flow.id}-${i}`} x="-80%" y="-80%" width="260%" height="260%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Opaque base "” covers connector line */}
                  <circle cx="38" cy="38" r="34" style={{ fill: 'var(--bg-base)' }} stroke="none" />

                  {/* Color tint */}
                  <motion.circle
                    cx="38" cy="38" r="34"
                    fill={isFinal ? 'rgba(34,197,94,1)' : `${ac.hex}ff`}
                    stroke="none"
                    animate={{ opacity: isActive ? 0.10 : 0 }}
                    transition={{ duration: RING_MS / 1000, ease: 'linear' }}
                  />

                  {/* Base border */}
                  <circle cx="38" cy="38" r="34" fill="none" style={{ stroke: 'var(--bd-2)' }} strokeWidth="1.5" />

                  {/* Visited ring */}
                  {isVisited && (
                    <motion.circle
                      cx="38" cy="38" r="34"
                      fill="none"
                      stroke={isFinal ? 'rgba(34,197,94,0.35)' : ac.ring}
                      strokeWidth="1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}

                  {/* Active animated ring */}
                  {isActive && (
                    <motion.circle
                      key={ringKeys[i]}
                      cx="38" cy="38" r="34"
                      transform="rotate(-90 38 38)"
                      fill="none"
                      stroke={isFinal ? '#22C55E' : ac.hex}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      filter={`url(#glow-${flow.id}-${i})`}
                      initial={{ pathLength: 0, opacity: 0.7 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: RING_MS / 1000, ease: [0.4, 0, 0.2, 1] },
                        opacity:    { duration: 0.2 },
                      }}
                    />
                  )}
                </svg>

                {/* Pulsing dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full ring-4 ring-[var(--bg-base)] z-20"
                  style={{ backgroundColor: isFinal ? '#22C55E' : ac.hex }}
                  animate={isActive
                    ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }
                    : { scale: 1, opacity: 1 }}
                  transition={isActive
                    ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }}
                />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      color: isActive
                        ? (isFinal ? '#22C55E' : ac.hex)
                        : isVisited
                          ? (isFinal ? 'rgba(34,197,94,0.55)' : ac.ring)
                          : 'rgb(100 116 139)',
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={22} />
                  </motion.div>
                </div>
              </div>

              {/* Step number */}
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  animate={{ color: isActive ? ac.hex : `${ac.hex}80` }}
                  transition={{ duration: 0.4 }}
                  className="font-display font-bold text-[11px] tracking-[0.15em]"
                >
                  {String(i + 1).padStart(2, '0')}
                </motion.span>
                <div className="w-4 h-px opacity-40" style={{ backgroundColor: ac.hex }} />
              </div>

              <motion.h3
                animate={{ color: isActive ? 'var(--fg-1)' : 'var(--fg-2)' }}
                transition={{ duration: 0.5 }}
                className="font-display font-semibold text-[15px] mb-2 leading-snug"
              >
                {title}
              </motion.h3>
              <motion.p
                animate={{ color: isActive ? 'var(--fg-2)' : 'var(--fg-4)' }}
                transition={{ duration: 0.5 }}
                className="text-[12.5px] leading-relaxed"
              >
                {desc}
              </motion.p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Process() {
  const headerRef  = useRef(null)
  const stepsRef   = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })
  const stepsInView  = useInView(stepsRef,  { once: true, margin: '-80px' })

  const [activeFlow, setActiveFlow] = useState(0)
  const flow = FLOWS[activeFlow]

  return (
    <section id="nosotros" className="relative py-20 lg:py-32 bg-[var(--bg-base)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,0,0.04) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-8">

        {/* â”€â”€ Header â”€â”€ */}
        <div ref={headerRef} className="text-center mb-12 lg:mb-20">

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#F07232] text-[11px] font-semibold tracking-[0.22em] uppercase mb-6"
          >
            Cómo funciona
          </motion.p>

          {/* â”€â”€ Tab toggle "” pill premium â”€â”€ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-full p-1 mb-10"
            role="tablist"
            aria-label="Seleccionar flujo"
          >
            {FLOWS.map((f, i) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={activeFlow === i}
                onClick={() => setActiveFlow(i)}
                className={`relative px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-[12px] font-semibold
                            tracking-wide transition-colors duration-300 whitespace-nowrap
                            ${activeFlow === i ? 'text-white' : 'text-[var(--fg-4)] hover:text-[var(--fg-2)]'}`}
              >
                {activeFlow === i && (
                  <motion.span
                    layoutId="flow-pill"
                    className="absolute inset-0 rounded-full"
                    animate={{
                      backgroundColor: ACCENTS[f.accent].pill,
                      boxShadow:       ACCENTS[f.accent].pillGlow,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                  />
                )}
                <span className="relative z-10">{f.tab}</span>
              </button>
            ))}
          </motion.div>

          {/* â”€â”€ Dynamic H2 + subtitle "” animates on flow change â”€â”€ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={flow.id + '-header'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display font-bold text-[var(--fg-1)]
                             text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] mb-4">
                {flow.h2[0]}
                <br />
                <span className="text-[var(--fg-3)]">{flow.h2[1]}</span>
              </h2>
              <p className="text-[var(--fg-3)] text-sm leading-relaxed max-w-md mx-auto">
                {flow.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* â”€â”€ Steps "” re-monta al cambiar flujo â”€â”€ */}
        <div ref={stepsRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={flow.id + '-steps'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <StepsDisplay key={flow.id} flow={flow} inView={stepsInView} />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}

