import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Globe2 } from 'lucide-react'

/* ── Dot corner accent (same pattern as Services) ───────────────── */
function DotCorner({ size = 88, spacing = 11 }) {
  const dots = []
  const cols = Math.ceil(size / spacing)
  const rows = Math.ceil(size / spacing)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = size - c * spacing - spacing / 2
      const y = r * spacing + spacing / 2
      if (x < 0 || y > size) continue
      const dist    = Math.sqrt((size - x) ** 2 + y ** 2)
      const opacity = Math.max(0, (1 - dist / (size * 0.88)) * 0.22)
      if (opacity > 0.005)
        dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r="0.9" fill="white" opacity={+opacity.toFixed(3)} />)
    }
  }
  return (
    <div className="absolute top-0 right-0 pointer-events-none overflow-hidden rounded-tr-2xl"
         style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{dots}</svg>
    </div>
  )
}

/* ── Data ───────────────────────────────────────────────────────── */
const DEPARTMENTS = [
  'Montevideo', 'Canelones', 'Maldonado',
  'Colonia',    'San José',  'Soriano',
  'Flores',     'Florida',   'Lavalleja',
  'Durazno',    'Treinta y Tres', 'Cerro Largo',
  'Rivera',     'Tacuarembó','Salto',
  'Artigas',    'Paysandú',  'Río Negro',
  'Rocha',
]

const NAT_STATS = [
  { value: '24 h', label: 'Montevideo y AMM'  },
  { value: '48 h', label: 'Interior del país' },
  { value: '19',   label: 'Departamentos'     },
]

const NAT_FEATURES = [
  'Recolección a domicilio incluida',
  'Confirmación de entrega digital',
  'Seguimiento en tiempo real',
]

const INTL_REGIONS = [
  { label: 'Américas',        count: 12, cities: ['Nueva York','Miami','Los Ángeles','Buenos Aires','São Paulo','Santiago','Lima','Bogotá'] },
  { label: 'Europa',          count: 8,  cities: ['Madrid','Lisboa','París','Roma','Berlín','Ámsterdam'] },
  { label: 'Asia & Oriente',  count: 18, cities: ['Dubai','Tokio','Shanghái','Seúl','Singapur','Hong Kong'] },
  { label: 'Oceanía',         count: 3,  cities: ['Sídney','Melbourne','Auckland'] },
]

/* ── Component ──────────────────────────────────────────────────── */
export default function Coverage() {
  const ref        = useRef(null)
  const headerRef  = useRef(null)
  const inView       = useInView(ref,       { once: true, margin: '-80px' })
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section id="cobertura" className="relative py-20 lg:py-32 bg-[var(--bg-alt)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,107,0,0.03) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Header ── */}
        <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 lg:mb-14">
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
              className="font-display font-bold text-[var(--fg-1)] leading-[1.05] text-[clamp(2rem,5vw,3.25rem)]"
            >
              Nacional e internacional.
              <br />
              <span className="text-[var(--fg-3)]">Siempre llegamos.</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-3 lg:items-end"
          >
            <p className="text-[var(--fg-3)] text-sm leading-relaxed max-w-xs lg:text-right">
              Distribución en todo Uruguay y red activa en más de 50 países, con acuerdos directos con aerolíneas y agentes aduanales.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openCotizar'))}
              className="inline-flex items-center gap-1.5 text-[#FF6B00] text-sm font-semibold
                         hover:text-[#FF8C3A] transition-colors duration-200 group"
            >
              Cotizar envío
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>

        {/* ── National featured card ── */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[var(--bg-card)] rounded-2xl overflow-hidden p-6 sm:p-8 lg:p-10 mb-4"
          style={{ border: '1px solid rgba(255,107,0,0.18)' }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, rgba(255,107,0,0.7), rgba(255,107,0,0.15), transparent 60%)' }}
          />
          <DotCorner size={120} spacing={13} />

          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-14">

            {/* Left: headline + stats + features */}
            <div className="lg:w-[38%] shrink-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6
                             bg-[#FF6B00]/10 border border-[#FF6B00]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                <span className="text-[#FF6B00] text-[10px] font-bold tracking-[0.18em] uppercase">
                  Cobertura Nacional
                </span>
              </div>

              <h3 className="font-display font-bold text-[var(--fg-1)] leading-[1.1] mb-4"
                  style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)' }}>
                Los 19 departamentos
                <br />
                <span className="text-[var(--fg-2)]">de Uruguay.</span>
              </h3>

              <p className="text-[var(--fg-3)] text-[13px] leading-relaxed mb-8">
                Llegamos a cada rincón del territorio nacional. Recolección puerta a puerta,
                consolidación en Montevideo y entrega confirmada.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-start gap-4 sm:gap-5 mb-8">
                {NAT_STATS.map((s, i) => (
                  <div key={s.label} className="flex items-start gap-5">
                    {i > 0 && <div className="w-px h-9 mt-0.5" style={{ background: 'var(--bd-2)' }} />}
                    <div>
                      <div className="font-display font-bold text-[var(--fg-1)] text-[1.35rem] leading-none mb-1">
                        {s.value}
                      </div>
                      <div className="text-[var(--fg-3)] text-[12px] leading-tight">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature list — verde = feature confirmada/disponible */}
              <div className="space-y-2.5">
                {NAT_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/25
                                    flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    </div>
                    <span className="text-[var(--fg-2)] text-[13px]">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: department grid */}
            <div className="flex-1">
              <p className="text-[11px] text-[var(--fg-4)] tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
                <span className="w-3 h-px bg-slate-700 inline-block" />
                Cobertura completa — todos los departamentos
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5">
                {DEPARTMENTS.map((dep, i) => (
                  <motion.div
                    key={dep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.35 + i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: dep === 'Montevideo' ? '#FF6B00' : 'rgba(255,107,0,0.3)' }}
                    />
                    <span
                      className="text-[13px] leading-none"
                      style={{ color: dep === 'Montevideo' ? 'var(--fg-1)' : 'var(--fg-3)' }}
                    >
                      {dep === 'Montevideo' ? <strong>{dep}</strong> : dep}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Thin divider + international teaser */}
              <div className="mt-8 pt-6 border-t border-[var(--bd-1)] flex items-center gap-3">
                <Globe2 size={13} className="text-[var(--fg-4)] shrink-0" />
                <span className="text-[var(--fg-4)] text-[12px]">
                  Y conectado con más de{' '}
                  <span className="text-[var(--fg-2)] font-semibold">50 países</span>{' '}
                  a través de nuestra red internacional.
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── International region cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {INTL_REGIONS.map((region, i) => (
            <motion.div
              key={region.label}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.6 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="relative flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--bd-1)]
                         rounded-2xl p-5 overflow-hidden min-h-[120px] sm:min-h-[140px]
                         hover:border-[var(--bd-2)] hover:shadow-[0_0_24px_rgba(255,107,0,0.06)]
                         transition-[border-color,box-shadow] duration-300 cursor-default"
            >
              {/* Ghost number */}
              <span
                aria-hidden="true"
                className="absolute right-6 top-1/2 -translate-y-1/2 font-display font-black leading-none select-none pointer-events-none"
                style={{ fontSize: '5.5rem', color: 'rgba(255,107,0,0.055)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Top: continent name */}
              <p className="relative text-[var(--fg-1)] font-semibold text-[15px] leading-snug">
                {region.label}
              </p>

              {/* Bottom: country count */}
              <div className="relative pt-4 border-t border-[var(--bd-1)] mt-6">
                <span className="font-display font-bold text-[#FF6B00] text-base leading-none">
                  {region.count}
                </span>
                <span className="text-[12px] text-[var(--fg-4)] ml-1.5">países</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
