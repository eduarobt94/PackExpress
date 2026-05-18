import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:    'Enviamos productos de nuestra empresa a España y Europa con Pack Express. La documentación aduanera es impecable y el seguimiento en tiempo real nos da total tranquilidad.',
    name:     'María González',
    role:     'Emprendedora exportadora',
    initials: 'MG',
    gradient: 'from-[#FF6B00]/20 to-[#FF8C3A]/10',
  },
  {
    quote:    'Para mis traslados frecuentes al exterior, confío en Pack Express para mover mi equipaje. Precios competitivos, atención ágil y siempre puntual. Muy recomendable.',
    name:     'Carlos Rodríguez',
    role:     'Viajero frecuente',
    initials: 'CR',
    gradient: 'from-[#A78BFA]/20 to-[#7C3AED]/10',
  },
  {
    quote:    'La gestión aduanera y la distribución dentro de Uruguay son excepcionales. Documentación en orden, tiempos cumplidos. Una empresa seria y de primer nivel.',
    name:     'Ana Martínez',
    role:     'Importadora comercial',
    initials: 'AM',
    gradient: 'from-[#22C55E]/20 to-[#16A34A]/10',
  },
]

const AVATAR_RINGS = [
  'from-[#FF6B00]/60 to-[#FF8C3A]/40',
  'from-[#A78BFA]/60 to-[#7C3AED]/40',
  'from-[#22C55E]/60 to-[#16A34A]/40',
]
const AVATAR_BG = [
  'bg-[#FF6B00]/10',
  'bg-[#A78BFA]/10',
  'bg-[#22C55E]/10',
]
const AVATAR_TEXT = [
  'text-[#FF8C3A]',
  'text-[#A78BFA]',
  'text-[#22C55E]',
]

export default function Testimonials() {
  const ref    = useRef(null)
  const headerRef = useRef(null)
  const inView = useInView(ref,       { once: true, margin: '-80px' })
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section className="relative py-24 lg:py-32 bg-[#060810]">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,107,0,0.04) 0%, transparent 60%)',
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
            className="font-display font-bold text-white text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          >
            Más de 50,000 envíos respaldan
            <br />nuestra reputación.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-sm leading-relaxed mt-4 max-w-md mx-auto"
          >
            Clientes de todo Uruguay y el mundo confían en Pack Express para sus envíos nacionales e internacionales.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative bg-[#0C1018] border border-white/[0.06]
                         hover:border-white/[0.10] rounded-2xl p-7
                         transition-[border-color,box-shadow] duration-300
                         hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] cursor-default"
            >
              {/* Subtle top gradient accent */}
              <div
                className={`absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r ${t.gradient}
                             opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={13} className="fill-[#FF6B00] text-[#FF6B00]" />
                ))}
              </div>

              {/* Decorative quote mark */}
              <div
                className="font-display font-bold text-[80px] leading-none text-[#FF6B00]/[0.08]
                           -mt-4 mb-1 select-none pointer-events-none"
                aria-hidden="true"
              >
                "
              </div>

              {/* Quote text */}
              <p className="text-[13.5px] text-slate-400 leading-relaxed italic mb-7 -mt-5">
                "{t.quote}"
              </p>

              {/* Separator */}
              <div className="h-px bg-white/[0.05] mb-5" />

              {/* Author row */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`relative w-10 h-10 rounded-full ${AVATAR_BG[i]}
                              flex items-center justify-center shrink-0`}
                >
                  {/* Gradient ring */}
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${AVATAR_RINGS[i]}
                                p-[1.5px]`}
                  >
                    <div className={`w-full h-full rounded-full ${AVATAR_BG[i]}`} />
                  </div>
                  <span
                    className={`relative z-10 text-[11px] font-bold font-display ${AVATAR_TEXT[i]}`}
                  >
                    {t.initials}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white leading-none mb-1">{t.name}</p>
                  <p className="text-[11px] text-slate-600">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6
                     pt-8 border-t border-white/[0.05]"
        >
          {[
            { val: '50,000+', label: 'Envíos completados' },
            { val: '98%',     label: 'Clientes satisfechos' },
            { val: '50+',     label: 'Países destino' },
          ].map((item, i) => (
            <div key={item.label} className={`flex items-center gap-3 ${i > 0 ? 'sm:pl-6 sm:border-l sm:border-white/[0.06]' : ''}`}>
              <span className="font-display font-bold text-xl text-white">{item.val}</span>
              <span className="text-[12px] text-slate-600">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
