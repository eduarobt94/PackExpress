import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Inbox, ScanLine, PlaneTakeoff, FileCheck2, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    Icon:  Inbox,
    num:   '01',
    title: 'Recolección',
    desc:  'Retiramos en tu domicilio o recibimos en nuestra sede de Carlos Quijano 1258, Montevideo.',
  },
  {
    Icon:  ScanLine,
    num:   '02',
    title: 'Clasificación',
    desc:  'Cada envío es catalogado, pesado y preparado conforme al destino y la normativa vigente.',
  },
  {
    Icon:  PlaneTakeoff,
    num:   '03',
    title: 'Transporte',
    desc:  'Coordinamos transporte aéreo o terrestre con aerolíneas y operadores logísticos de primera línea.',
  },
  {
    Icon:  FileCheck2,
    num:   '04',
    title: 'Aduana',
    desc:  'Gestionamos todos los trámites aduaneros en origen y destino. Sin burocracia de tu parte.',
  },
  {
    Icon:  CheckCircle2,
    num:   '05',
    title: 'Entrega',
    desc:  'Confirmación de entrega con seguimiento en tiempo real desde cualquier dispositivo.',
  },
]

const INTERVAL   = 3000  // ms each step stays lit
const FADE_OUT   = 500   // ms to fade out (transition duration)
const GAP        = 550   // ms to wait before lighting next (> FADE_OUT)

export default function Process() {
  const ref        = useRef(null)
  const headerRef  = useRef(null)
  const inView     = useInView(ref,       { once: true, margin: '-80px' })
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const activeRef           = useRef(0)

  useEffect(() => {
    if (!inView || paused) return
    let timeoutId
    const id = setInterval(() => {
      setActive(-1)                          // apaga el actual
      timeoutId = setTimeout(() => {
        activeRef.current = (activeRef.current + 1) % STEPS.length
        setActive(activeRef.current)         // enciende el siguiente
      }, GAP)
    }, INTERVAL)
    return () => { clearInterval(id); clearTimeout(timeoutId) }
  }, [inView, paused])

  return (
    <section id="nosotros" className="relative py-24 lg:py-32 bg-[#060810]">
      {/* Radial accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,107,0,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 lg:mb-24">
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
            className="font-display font-bold text-white text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          >
            Simple. Rápido. Confiable.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-sm leading-relaxed mt-4 max-w-md mx-auto"
          >
            Desde que coordinamos la recolección hasta que el paquete llega, cada paso está controlado y trazado.
          </motion.p>
        </div>

        {/* Steps */}
        <div ref={ref} className="relative">

          {/* Animated progress line — desktop */}
          <div className="hidden lg:block absolute top-[38px] left-[38px] right-[calc((100%-96px)/5-38px)] h-px bg-white/[0.05]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.5 }}
              className="h-full bg-gradient-to-r from-[#FF6B00]/70 via-[#FF6B00]/30 to-transparent origin-left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-6">
            {STEPS.map(({ Icon, num, title, desc }, i) => {
              const isActive = active === i
              return (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left cursor-default"
                  onMouseEnter={() => { setPaused(true); setActive(i) }}
                  onMouseLeave={() => setPaused(false)}
                >
                  {/* Circle with ghost number behind */}
                  <div className="relative mb-6 shrink-0">
                    {/* Big ghost number */}
                    <span
                      className="absolute font-display font-bold text-[5rem] leading-none
                                 text-white/[0.04] select-none pointer-events-none
                                 -top-6 -left-3 lg:-left-5"
                      aria-hidden="true"
                    >
                      {num}
                    </span>

                    {/* Orange dot indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF6B00]
                                    ring-4 ring-[#060810] z-20" />

                    {/* Main circle */}
                    <motion.div
                      animate={{
                        borderColor: isActive ? 'rgba(255,107,0,0.35)' : 'rgba(255,255,255,0.08)',
                        backgroundColor: isActive ? 'rgba(255,107,0,0.07)' : 'rgba(12,16,24,1)',
                      }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="relative w-[76px] h-[76px] rounded-full border
                                 flex items-center justify-center z-10"
                    >
                      <motion.div
                        animate={{ color: isActive ? '#FF6B00' : 'rgb(100 116 139)' }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      >
                        <Icon size={22} />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Step number label */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-display font-bold text-[11px] text-[#FF6B00] tracking-[0.15em]">
                      {num}
                    </span>
                    <div className="w-4 h-px bg-[#FF6B00]/40" />
                  </div>

                  <motion.h3
                    animate={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="font-display font-semibold text-[15px] mb-2 leading-snug"
                  >
                    {title}
                  </motion.h3>
                  <motion.p
                    animate={{ color: isActive ? 'rgb(148 163 184)' : 'rgb(71 85 105)' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
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
