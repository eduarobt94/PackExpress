import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

const REVIEWS = [
  {
    quote:    'Segura y muy confiable, la recomiendo. El personal es muy atento y sobre todo brindan ofertas variadas y útiles para toda la comunidad cubana en Uruguay.',
    name:     'Luis Alberto Claro Medina',
    initials: 'LC',
    blue:     false,
  },
  {
    quote:    'Excelente atención, muy amables y claros en las respuestas. Muy buena disposición de los chicos que atienden. Lo recomiendo sin dudas.',
    name:     'Anabella Tarrio',
    initials: 'AT',
    blue:     false,
  },
  {
    quote:    'Los mejores, el trato impecable, siempre con soluciones. Un servicio que si hubiera 10 estrellas para darles, se lo daba. MUY recomendados!!',
    name:     'Mayi Peña',
    initials: 'MP',
    blue:     true,
  },
  {
    quote:    'Excelente atención y trato. Es un sitio seguro, confiable y eficaz para enviar paquetes a Cuba y otras partes del mundo.',
    name:     'Yissel García',
    initials: 'YG',
    blue:     false,
  },
  {
    quote:    'Buena atención al cliente, siempre atienden con mucha amabilidad y lo más importante es que llegan seguro los paquetes.',
    name:     'Misladys Blanco Delgado',
    initials: 'MB',
    blue:     true,
  },
  {
    quote:    'Maravillosa atención, y muy buena seguridad en los envíos.',
    name:     'Rosa Rodon Rodon',
    initials: 'RR',
    blue:     false,
  },
]

// Duplicar para loop infinito continuo
const LOOP = [...REVIEWS, ...REVIEWS]

function ReviewCard({ review }) {
  const accent = review.blue
    ? { hex: '#527ED8', tint: 'rgba(59,126,248,0.08)', ring: 'rgba(59,126,248,0.18)', glow: 'rgba(59,126,248,0.35)' }
    : { hex: '#F07232', tint: 'rgba(255,107,0,0.08)',  ring: 'rgba(255,107,0,0.18)',  glow: 'rgba(255,107,0,0.35)' }

  return (
    <div
      className="relative bg-[var(--bg-card)] border border-[var(--bd-1)]
                 rounded-2xl p-6 flex flex-col shrink-0 h-full
                 transition-[border-color,box-shadow] duration-300
                 hover:border-[var(--bd-2)] hover:shadow-[0_8px_48px_rgba(0,0,0,0.35)]"
      style={{ width: '300px', height: '100%', minHeight: '240px' }}
    >
      {/* Top accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.glow}, transparent)` }}
      />

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} size={12} style={{ fill: accent.hex, color: accent.hex, opacity: 0.9 }} />
        ))}
      </div>

      {/* Quote */}
      <p className="flex-1 text-[13px] text-[var(--fg-2)] leading-[1.75] mb-5">
        "{review.quote}"
      </p>

      {/* Separator */}
      <div className="h-px bg-[var(--bd-1)] mb-4" />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: accent.tint, border: `1px solid ${accent.ring}` }}
        >
          <span className="text-[10px] font-bold font-display" style={{ color: `${accent.hex}cc` }}>
            {review.initials}
          </span>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[var(--fg-1)] leading-none mb-0.5">{review.name}</p>
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] text-[var(--fg-5)]">Google</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const headerRef = useRef(null)
  const statsRef  = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })
  const statsInView  = useInView(statsRef,  { once: true, margin: '-60px' })

  return (
    <section className="relative py-20 lg:py-32 bg-[var(--bg-base)] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 45% at 50% 100%, rgba(255,107,0,0.03) 0%, transparent 65%)',
        }}
      />

      {/* Header */}
      <div ref={headerRef} className="text-center mb-14 px-6">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[#F07232] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
        >
          Testimonios
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[var(--fg-1)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
        >
          La confianza de miles de clientes,
          <br />envío a envío.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[var(--fg-3)] text-[13px] leading-relaxed mt-4 max-w-md mx-auto"
        >
          Courier nacional, envíos internacionales y casillero:
          clientes de todo Uruguay eligen Pack Express.
        </motion.p>
      </div>

      {/* ── Mobile + Tablet: swipeable scroll ── */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide px-5 pb-2"
           style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
        <div style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '300px',
          gridTemplateRows: '1fr',
          gap: '1rem',
        }}>
          {REVIEWS.map((review, i) => (
            <div key={i} style={{ scrollSnapAlign: 'start' }}>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop: auto-scroll carousel ── */}
      <div className="hidden lg:block relative overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
             style={{ background: 'linear-gradient(to right, var(--bg-base), transparent)' }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
             style={{ background: 'linear-gradient(to left, var(--bg-base), transparent)' }} />

        <div className="flex gap-5 w-max items-stretch carousel-track" style={{ paddingInline: '2rem' }}>
          {LOOP.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 16 }}
        animate={statsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6
                   pt-8 border-t border-[var(--bd-1)] mx-6 md:mx-10 lg:mx-8 max-w-7xl xl:mx-auto"
      >
        {[
          { val: '50,000+', label: 'Envíos completados',  blue: false },
          { val: '98%',     label: 'Clientes satisfechos', blue: false },
          { val: '50+',     label: 'Países destino',       blue: true  },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`flex items-center gap-3 ${i > 0 ? 'sm:pl-6 sm:border-l sm:border-[var(--bd-1)]' : ''}`}
          >
            <span
              className="font-display font-bold text-xl"
              style={{ color: stat.blue ? '#527ED8' : 'var(--fg-1)' }}
            >
              {stat.val}
            </span>
            <span className="text-[12px] text-[var(--fg-4)]">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
