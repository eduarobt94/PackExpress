import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { end: 50000, suffix: '+',  label: 'Envíos completados',        prefix: '' },
  { end: 50,    suffix: '+',  label: 'Destinos internacionales',  prefix: '' },
  { end: 3,     suffix: '',   label: 'Años operando',             prefix: '' },
  { end: 98,    suffix: '%',  label: 'Índice de satisfacción',    prefix: '' },
]

function Counter({ end, suffix, prefix, active }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!active) return
    const duration = 2000
    const t0 = Date.now()
    let raf
    const tick = () => {
      const elapsed  = Date.now() - t0
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 4)
      setVal(Math.floor(eased * end))
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setVal(end)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, end])

  return (
    <span className="tabular-nums">
      {prefix}{val.toLocaleString('es-UY')}{suffix}
    </span>
  )
}

export default function Metrics() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative bg-[#060810] border-y border-white/[0.04]">
      {/* Top subtle gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6B00]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28" ref={ref}>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col items-center text-center px-6 py-10
                ${i < 2 ? 'border-b border-white/[0.05] lg:border-b-0' : ''}
                ${i % 2 === 0 ? 'border-r border-white/[0.05]' : ''}
                lg:border-r lg:border-white/[0.05] last:border-r-0
              `}
            >
              {/* Orange separator line above number */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-8 h-0.5 bg-[#FF6B00] rounded-full mb-5 origin-left"
              />

              <div className="font-display font-bold text-white mb-3
                              text-[clamp(2.6rem,5vw,4rem)] leading-none tracking-tight">
                <Counter {...s} active={inView} />
              </div>

              <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom subtle gradient accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </section>
  )
}
