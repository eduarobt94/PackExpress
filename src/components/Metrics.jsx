import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/** Piso histórico si la API no responde — el mismo `base` que devuelve el endpoint. */
const ENVIOS_BASE = 50000
const METRICAS_ENDPOINT = '/pack-sistema/api/v1/metricas.php?action=envios'

const STATS = [
  // Sin sufijo '+': el número es exacto (piso histórico + guías reales de la base).
  { id: 'envios', end: ENVIOS_BASE, suffix: '', label: 'Envíos completados', prefix: '', blue: false },
  { end: 50,    suffix: '+',  label: 'Destinos internacionales', prefix: '', blue: true  },
  { end: 5,     suffix: '',   label: 'Años operando',            prefix: '', blue: false },
  { end: 98,    suffix: '%',  label: 'Índice de satisfacción',   prefix: '', blue: false },
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
  const [enviosReales, setEnviosReales] = useState(null)

  // El contador de envíos suma las guías reales de la base al piso histórico.
  // Queda en null hasta resolverse (con éxito o no) para que la animación
  // arranque una sola vez y ya con el número final: si se dejara animar hacia
  // el piso y el dato llegara después, el contador se reiniciaría a la vista.
  // Ante cualquier fallo cae al piso histórico — es un número decorativo y no
  // debe romper la sección ni mostrar un 0.
  useEffect(() => {
    let cancelado = false
    const resolver = (valor) => { if (!cancelado) setEnviosReales(valor) }

    // Red de seguridad: si la API no contesta, no dejar el contador en blanco.
    const timeout = setTimeout(() => resolver(ENVIOS_BASE), 3000)

    fetch(METRICAS_ENDPOINT)
      .then(res => res.json())
      .then(json => {
        const total = Number(json?.data?.total)
        resolver(json?.ok && Number.isFinite(total) && total > 0 ? total : ENVIOS_BASE)
      })
      .catch(() => resolver(ENVIOS_BASE))
      .finally(() => clearTimeout(timeout))

    return () => { cancelado = true; clearTimeout(timeout) }
  }, [])

  return (
    <section className="relative bg-[var(--bg-base)] border-y border-[var(--bd-1)]">
      {/* Top subtle gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F07232]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-8 py-16 lg:py-28" ref={ref}>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col items-center text-center px-4 sm:px-6 py-8 sm:py-10
                ${i < 2 ? 'border-b border-[var(--bd-1)] lg:border-b-0' : ''}
                ${i % 2 === 0 ? 'border-r border-[var(--bd-1)]' : ''}
                lg:border-r lg:border-[var(--bd-1)] last:border-r-0
              `}
            >
              {/* Orange separator line above number */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-8 h-0.5 rounded-full mb-5 origin-left"
                style={{ backgroundColor: s.blue ? '#527ED8' : '#F07232' }}
              />

              <div className="font-display font-bold mb-3
                              text-[clamp(2rem,5vw,4rem)] leading-none tracking-tight"
                   style={{ color: s.blue ? '#527ED8' : 'var(--fg-1)' }}>
                <Counter
                  {...s}
                  end={s.id === 'envios' && enviosReales != null ? enviosReales : s.end}
                  active={inView && (s.id !== 'envios' || enviosReales != null)}
                />
              </div>

              <p className="text-[12px] text-[var(--fg-3)] uppercase tracking-[0.2em] leading-relaxed">
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
