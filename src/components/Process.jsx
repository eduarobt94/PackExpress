import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Inbox, ScanLine, PlaneTakeoff, FileCheck2, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    Icon:  Inbox,
    title: 'Recolección',
    desc:  'Retiramos en tu domicilio o recibimos en nuestra sede de Carlos Quijano 1258, Montevideo.',
  },
  {
    Icon:  ScanLine,
    title: 'Clasificación',
    desc:  'Cada envío es catalogado, pesado y preparado conforme al destino y la normativa vigente.',
  },
  {
    Icon:  PlaneTakeoff,
    title: 'Transporte',
    desc:  'Coordinamos transporte aéreo o terrestre con aerolíneas y operadores logísticos de primera línea.',
  },
  {
    Icon:  FileCheck2,
    title: 'Despacho',
    desc:  'Gestionamos todo el proceso de despacho en origen y destino. Sin burocracia de tu parte.',
  },
  {
    Icon:  CheckCircle2,
    title: 'Entrega',
    desc:  'Confirmación de entrega con seguimiento en tiempo real desde cualquier dispositivo.',
  },
]

// Timing constants (ms)
const RING_MS = 1600   // ring draws
const LINE_MS = 480    // connector fills
const GAP_MS  = 280    // pause before next step

export default function Process() {
  const ref        = useRef(null)
  const headerRef  = useRef(null)
  const inView       = useInView(ref,       { once: true, margin: '-80px' })
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const [active,   setActive]   = useState(0)
  const [filling,  setFilling]  = useState(-1) // which connector line is filling
  const [visited,  setVisited]  = useState(new Set([0]))
  const [ringKeys, setRingKeys] = useState(STEPS.map((_, i) => i === 0 ? 1 : 0))
  const [paused,   setPaused]   = useState(false)

  const activeRef = useRef(0)
  const pausedRef = useRef(false)
  useEffect(() => { pausedRef.current = paused }, [paused])

  useEffect(() => {
    if (!inView) return
    let pending

    const doStep = () => {
      if (pausedRef.current) { pending = setTimeout(doStep, 120); return }

      // After ring draws → fill connector to next step
      pending = setTimeout(() => {
        if (pausedRef.current) { pending = setTimeout(doStep, 120); return }
        const cur = activeRef.current
        if (cur < STEPS.length - 1) setFilling(cur)

        // After connector → advance to next step
        pending = setTimeout(() => {
          setFilling(-1)
          const next = (cur + 1) % STEPS.length
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

  return (
    <section id="nosotros" className="relative py-20 lg:py-32 bg-[var(--bg-base)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,0,0.04) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 lg:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
          >
            Cómo funciona
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-[var(--fg-1)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          >
            Simple. Rápido. Confiable.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--fg-3)] text-sm leading-relaxed mt-4 max-w-md mx-auto"
          >
            Desde que coordinamos la recolección hasta que el paquete llega, cada paso está controlado y trazado.
          </motion.p>
        </div>

        {/* Steps */}
        <div ref={ref} className="relative">

          {/* Connector track — desktop */}
          <div className="hidden lg:block absolute top-[38px] left-[38px] right-[calc((100%-96px)/5-38px)] h-px" style={{ background: 'var(--bd-1)' }}>
            <motion.div
              className="absolute inset-y-0 left-0 origin-left"
              style={{
                background: 'linear-gradient(90deg, rgba(255,107,0,0.7), rgba(255,107,0,0.25))',
              }}
              animate={{
                width: active === 0 && filling === -1
                  ? '0%'
                  : `${((filling >= 0 ? filling : active) / (STEPS.length - 1)) * 100}%`,
              }}
              transition={{ duration: LINE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8 lg:gap-6">
            {STEPS.map(({ Icon, title, desc }, i) => {
              const isActive  = active === i
              const isVisited = visited.has(i) && !isActive
              const isFinal   = i === STEPS.length - 1

              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left cursor-default"
                  onMouseEnter={() => activateStep(i)}
                  onMouseLeave={() => setPaused(false)}
                >
                  {/* Circle */}
                  <div className="relative mb-5 sm:mb-6 shrink-0 w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] lg:w-[76px] lg:h-[76px]">

                    {/* SVG ring layers */}
                    <svg
                      width="100%" height="100%"
                      viewBox="0 0 76 76"
                      className="absolute inset-0"
                      style={{ overflow: 'visible' }}
                    >
                      <defs>
                        {/* Per-circle glow filter — IDs are unique since each SVG is independent */}
                        <filter id={`glow-step-${i}`} x="-80%" y="-80%" width="260%" height="260%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Opaque base fill — always covers the connector line */}
                      <circle cx="38" cy="38" r="34" style={{ fill: 'var(--bg-base)' }} stroke="none" />

                      {/* Color tint overlay — verde en paso final, naranja en el resto */}
                      <motion.circle
                        cx="38" cy="38" r="34"
                        fill={isFinal ? 'rgba(34,197,94,1)' : 'rgba(255,107,0,1)'}
                        stroke="none"
                        animate={{ opacity: isActive ? 0.10 : 0 }}
                        transition={{ duration: RING_MS / 1000, ease: 'linear' }}
                      />

                      {/* Base border ring — always visible */}
                      <circle
                        cx="38" cy="38" r="34"
                        fill="none"
                        style={{ stroke: 'var(--bd-2)' }}
                        strokeWidth="1.5"
                      />

                      {/* Visited ring — verde en paso final (Entrega = éxito), naranja en el resto */}
                      {isVisited && (
                        <motion.circle
                          cx="38" cy="38" r="34"
                          fill="none"
                          stroke={isFinal ? 'rgba(34,197,94,0.35)' : 'rgba(255,107,0,0.22)'}
                          strokeWidth="1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}

                      {/* Active animated ring — verde en paso final */}
                      {isActive && (
                        <motion.circle
                          key={ringKeys[i]}
                          cx="38" cy="38" r="34"
                          transform="rotate(-90 38 38)"
                          fill="none"
                          stroke={isFinal ? '#22C55E' : '#FF6B00'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          filter={`url(#glow-step-${i})`}
                          initial={{ pathLength: 0, opacity: 0.7 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            pathLength: { duration: RING_MS / 1000, ease: [0.4, 0, 0.2, 1] },
                            opacity:    { duration: 0.2 },
                          }}
                        />
                      )}
                    </svg>

                    {/* Pulsing dot indicator — verde en el paso final */}
                    <motion.div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-4 ring-[var(--bg-base)] z-20
                                  ${isFinal ? 'bg-[#22C55E]' : 'bg-[#FF6B00]'}`}
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
                            ? (isFinal ? '#22C55E' : '#FF6B00')
                            : isVisited
                              ? (isFinal ? 'rgba(34,197,94,0.55)' : 'rgba(255,107,0,0.45)')
                              : 'rgb(100 116 139)',
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon size={22} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Step label */}
                  <div className="flex items-center gap-2 mb-2">
                    <motion.span
                      animate={{ color: isActive ? '#FF6B00' : 'rgba(255,107,0,0.5)' }}
                      transition={{ duration: 0.4 }}
                      className="font-display font-bold text-[11px] tracking-[0.15em]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </motion.span>
                    <div className="w-4 h-px bg-[#FF6B00]/40" />
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
      </div>
    </section>
  )
}
