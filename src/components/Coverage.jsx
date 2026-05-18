import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Globe2, ArrowRight } from 'lucide-react'

const REGIONS = [
  {
    label:     'América del Norte',
    emoji:     '🌎',
    count:     3,
    cities:    ['Nueva York', 'Miami', 'Los Ángeles', 'Toronto', 'Ciudad de México'],
    color:     'rgba(56,189,248,0.10)',
    border:    'rgba(56,189,248,0.18)',
    dotColor:  '#38BDF8',
  },
  {
    label:     'Europa',
    emoji:     '🌍',
    count:     6,
    cities:    ['Madrid', 'Lisboa', 'París', 'Roma', 'Berlín', 'Ámsterdam'],
    color:     'rgba(139,92,246,0.10)',
    border:    'rgba(139,92,246,0.18)',
    dotColor:  '#A78BFA',
  },
  {
    label:     'Medio Oriente',
    emoji:     '🌍',
    count:     4,
    cities:    ['Dubai', 'Tel Aviv', 'Doha', 'Riad'],
    color:     'rgba(251,191,36,0.10)',
    border:    'rgba(251,191,36,0.18)',
    dotColor:  '#FBBF24',
  },
  {
    label:     'Asia',
    emoji:     '🌏',
    count:     5,
    cities:    ['Shanghái', 'Tokio', 'Seúl', 'Singapur', 'Hong Kong'],
    color:     'rgba(34,197,94,0.10)',
    border:    'rgba(34,197,94,0.18)',
    dotColor:  '#22C55E',
  },
  {
    label:     'América del Sur',
    emoji:     '🌎',
    count:     7,
    cities:    ['Buenos Aires', 'São Paulo', 'Santiago', 'Lima', 'Bogotá'],
    color:     'rgba(255,107,0,0.10)',
    border:    'rgba(255,107,0,0.22)',
    dotColor:  '#FF6B00',
  },
  {
    label:     'Oceanía',
    emoji:     '🌏',
    count:     3,
    cities:    ['Sídney', 'Melbourne', 'Auckland'],
    color:     'rgba(20,184,166,0.10)',
    border:    'rgba(20,184,166,0.18)',
    dotColor:  '#14B8A6',
  },
]

/* Dot positions as % of the map card */
const DOTS = [
  // North America
  { x: '17%', y: '26%', r: 4 },
  { x: '13%', y: '33%', r: 3 },
  { x: '19%', y: '38%', r: 3 },
  // South America + Uruguay (origin highlight)
  { x: '23%', y: '68%', r: 7, highlight: true },
  { x: '21%', y: '60%', r: 3 },
  { x: '25%', y: '74%', r: 3 },
  // Europe
  { x: '46%', y: '22%', r: 4 },
  { x: '49%', y: '25%', r: 3 },
  { x: '43%', y: '24%', r: 3 },
  // Middle East
  { x: '58%', y: '32%', r: 3 },
  { x: '62%', y: '35%', r: 3 },
  // Africa
  { x: '50%', y: '46%', r: 3 },
  { x: '52%', y: '54%', r: 2 },
  // Asia
  { x: '74%', y: '26%', r: 4 },
  { x: '78%', y: '34%', r: 3 },
  { x: '80%', y: '44%', r: 3 },
  { x: '85%', y: '38%', r: 3 },
  // Oceania
  { x: '80%', y: '68%', r: 3 },
]

export default function Coverage() {
  const ref        = useRef(null)
  const headerRef  = useRef(null)
  const inView     = useInView(ref,       { once: true, margin: '-80px' })
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section id="cobertura" className="relative py-24 lg:py-32 bg-[#07080F]">
      {/* Subtle radial accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,107,0,0.04) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
            >
              Cobertura
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-white leading-[1.05]
                         text-[clamp(2rem,5vw,3.25rem)]"
            >
              Nacional e internacional.
              <br />
              <span className="text-slate-500">Siempre llegamos.</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-3 lg:items-end"
          >
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Distribución en todo Uruguay y red activa en más de 50 países, con acuerdos directos con aerolíneas y agentes aduanales.
            </p>
            <a
              href="#tarifas"
              className="inline-flex items-center gap-1.5 text-[#FF6B00] text-sm font-semibold
                         hover:text-[#FF8C3A] transition-colors duration-200 group"
            >
              Cotizar envío
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>
          </motion.div>
        </div>

        {/* Map card */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#0C1018] border border-white/[0.06] rounded-2xl
                     overflow-hidden mb-8"
          style={{ height: '300px' }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '64px 64px',
            }}
          />

          {/* Edge fades */}
          <div className="absolute inset-y-0 left-0  w-24 bg-gradient-to-r from-[#0C1018] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0C1018] to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0C1018] to-transparent z-10" />
          <div className="absolute inset-x-0 top-0    h-12 bg-gradient-to-b from-[#0C1018] to-transparent z-10" />

          {/* Dots */}
          {DOTS.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="absolute"
              style={{
                left:      d.x,
                top:       d.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`rounded-full ${d.highlight ? 'bg-[#FF6B00]' : 'bg-slate-700'}`}
                style={{ width: d.r * 2, height: d.r * 2 }}
              />
              {d.highlight && (
                <>
                  <motion.div
                    className="absolute rounded-full bg-[#FF6B00]/25"
                    style={{ width: d.r * 2, height: d.r * 2, top: 0, left: 0 }}
                    animate={{ scale: [1, 3.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                  {/* UY label */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 -top-6 whitespace-nowrap
                               text-[9px] font-bold text-[#FF6B00] tracking-[0.12em] uppercase"
                  >
                    Montevideo
                  </div>
                </>
              )}
            </motion.div>
          ))}

          {/* Center stat overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-center">
              <div className="font-display font-bold text-white text-[clamp(3rem,6vw,5rem)] leading-none mb-1">
                50+
              </div>
              <div className="text-[11px] text-slate-600 tracking-[0.2em] uppercase flex items-center gap-2 justify-center">
                <Globe2 size={11} />
                Países destino
              </div>
            </div>
          </div>
        </motion.div>

        {/* Region cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {REGIONS.map((region, i) => (
            <motion.div
              key={region.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.7 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group rounded-xl p-4 cursor-default
                         transition-[border-color] duration-300"
              style={{
                backgroundColor: region.color,
                border:          `1px solid ${region.border}`,
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-base leading-none">{region.emoji}</span>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: region.dotColor }}
                />
              </div>

              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2.5 leading-tight"
                style={{ color: region.dotColor }}
              >
                {region.label}
              </p>

              <ul className="space-y-1.5">
                {region.cities.map(city => (
                  <li key={city} className="flex items-center gap-1.5 text-[11px] text-slate-600
                                            group-hover:text-slate-500 transition-colors duration-200">
                    <MapPin size={7} className="shrink-0" style={{ color: region.dotColor, opacity: 0.6 }} />
                    {city}
                  </li>
                ))}
              </ul>

              {/* Country count */}
              <div className="mt-3 pt-3 border-t border-white/[0.05]">
                <span className="text-[10px] text-slate-700">
                  {region.count} {region.count === 1 ? 'país' : 'países'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
