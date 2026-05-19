import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:    'Enviamos productos de nuestra empresa a España y Europa con Pack Express. La documentación aduanera es impecable y el seguimiento en tiempo real nos da total tranquilidad.',
    name:     'María González',
    role:     'Emprendedora exportadora',
    initials: 'MG',
  },
  {
    quote:    'Para mis traslados frecuentes al exterior, confío en Pack Express para mover mi equipaje. Precios competitivos, atención ágil y siempre puntual. Muy recomendable.',
    name:     'Carlos Rodríguez',
    role:     'Viajero frecuente',
    initials: 'CR',
  },
  {
    quote:    'El despacho de envíos y la distribución dentro de Uruguay son excepcionales. Documentación en orden, tiempos cumplidos. Una empresa seria y de primer nivel.',
    name:     'Ana Martínez',
    role:     'Importadora comercial',
    initials: 'AM',
  },
]

export default function Testimonials() {
  const ref       = useRef(null)
  const headerRef = useRef(null)
  const inView       = useInView(ref,       { once: true, margin: '-80px' })
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section className="relative py-20 lg:py-32 bg-[var(--bg-base)]">
      {/* Very subtle radial warmth at base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 45% at 50% 100%, rgba(255,107,0,0.03) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
          >
            Testimonios
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-[var(--fg-1)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          >
            Más de 50,000 envíos respaldan
            <br />nuestra reputación.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--fg-3)] text-[13px] leading-relaxed mt-4 max-w-md mx-auto"
          >
            Clientes de todo Uruguay y el mundo confían en Pack Express
            para sus envíos nacionales e internacionales.
          </motion.p>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative bg-[var(--bg-card)] border border-[var(--bd-1)]
                         hover:border-[var(--bd-2)] rounded-2xl p-5 sm:p-7 flex flex-col
                         transition-[border-color,box-shadow] duration-300
                         hover:shadow-[0_8px_48px_rgba(0,0,0,0.35)] cursor-default"
            >
              {/* Top accent line — all same brand orange */}
              <div
                className="absolute inset-x-0 top-0 h-px rounded-t-2xl
                           opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.35), transparent)' }}
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={12} className="fill-[#FF6B00] text-[#FF6B00] opacity-90" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-[13.5px] text-[var(--fg-2)] leading-[1.75] mb-7">
                "{t.quote}"
              </p>

              {/* Separator */}
              <div className="h-px bg-[var(--bd-1)] mb-5" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-[#FF6B00]/[0.08]
                                border border-[#FF6B00]/[0.18] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold font-display text-[#FF6B00]/80">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--fg-1)] leading-none mb-1">{t.name}</p>
                  <p className="text-[11px] text-[var(--fg-4)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6
                     pt-8 border-t border-[var(--bd-1)]"
        >
          {[
            { val: '50,000+', label: 'Envíos completados' },
            { val: '98%',     label: 'Clientes satisfechos' },
            { val: '50+',     label: 'Países destino' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex items-center gap-3 ${i > 0 ? 'sm:pl-6 sm:border-l sm:border-[var(--bd-1)]' : ''}`}
            >
              <span className="font-display font-bold text-xl text-[var(--fg-1)]">{stat.val}</span>
              <span className="text-[12px] text-[var(--fg-4)]">{stat.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
