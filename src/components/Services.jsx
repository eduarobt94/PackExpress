import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Package, Briefcase, FileText, Globe2, ShoppingBag } from 'lucide-react'

const SERVICES = [
  {
    id:    'courier',
    Icon:  Package,
    title: 'Paquetería Courier',
    desc:  'Enviamos a cualquier punto de Uruguay y a más de 50 países. Seguimiento en tiempo real y entrega puntual garantizada.',
    tag:   'Nacional & Internacional',
    featured: true,
    stats: [
      { value: '50+',  label: 'países destino' },
      { value: '24 h', label: 'entrega express' },
    ],
  },
  {
    id:    'casillero',
    Icon:  ShoppingBag,
    title: 'Casillero Internacional',
    desc:  'Comprás en tiendas de EE.UU. "” nosotros recibimos, consolidamos y te lo enviamos a Uruguay con aduanas incluidas.',
    tag:   'Compras en el exterior',
    blue:  true,
  },
  {
    id:    'equipaje',
    Icon:  Briefcase,
    title: 'Equipaje No Acompañado',
    desc:  'Transporte seguro de equipaje personal dentro de Uruguay y hacia el exterior, con trámites aduaneros gestionados.',
    tag:   'Aéreo & Terrestre',
  },
  {
    id:    'documentos',
    Icon:  FileText,
    title: 'Envío de Documentos',
    desc:  'Gestión segura de documentación oficial, contratos y correspondencia con cadena de custodia certificada.',
    tag:   'Custodia certificada',
  },
  {
    id:    'distribucion',
    Icon:  Globe2,
    title: 'Distribución Nacional',
    desc:  'Cobertura en todo el territorio uruguayo con logística local eficiente, recolección a domicilio y confirmación de entrega.',
    tag:   'Todo Uruguay',
  },
]

function DotCorner({ size = 88, spacing = 11 }) {
  const dots = []
  const cols = Math.ceil(size / spacing)
  const rows = Math.ceil(size / spacing)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = size - c * spacing - spacing / 2
      const y = r * spacing + spacing / 2
      if (x < 0 || y > size) continue
      const dist = Math.sqrt((size - x) ** 2 + y ** 2)
      const opacity = Math.max(0, (1 - dist / (size * 0.88)) * 0.22)
      if (opacity > 0.005)
        dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r="0.9" fill="white" opacity={+opacity.toFixed(3)} />)
    }
  }
  return (
    <div className="absolute top-0 right-0 pointer-events-none overflow-hidden rounded-tr-2xl"
         style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dots}
      </svg>
    </div>
  )
}

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

function FeaturedCard({ service, inView }) {
  const { Icon, title, desc, tag, stats } = service
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      className="md:col-span-2 lg:col-span-2 group relative bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl
                 p-6 sm:p-8 lg:p-10 overflow-hidden cursor-default
                 hover:border-[var(--bd-2)] hover:shadow-[0_0_50px_rgba(255,107,0,0.07)]
                 transition-[border-color,box-shadow] duration-300"
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100
                      transition-opacity duration-500"
           style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.5), transparent)' }} />

      <DotCorner size={110} spacing={12} />

      <div className="relative flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#F07232]/[0.10] border border-[#F07232]/20
                        flex items-center justify-center
                        group-hover:bg-[#F07232]/[0.15] transition-colors duration-300">
          <Icon size={24} color="#F07232" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Tag */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-[#F07232]/40" />
            <span className="text-[var(--fg-3)] text-[11px] tracking-[0.12em] uppercase">{tag}</span>
          </div>

          <h3 className="font-display font-bold text-[var(--fg-1)] text-[1.5rem] leading-snug mb-3">
            {title}
          </h3>
          <p className="text-[var(--fg-2)] text-sm leading-relaxed max-w-md mb-8">
            {desc}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                {i > 0 && <div className="w-px h-8 bg-[var(--bd-2)]" />}
                <div>
                  <div className="font-display font-bold text-[var(--fg-1)] text-2xl leading-none mb-1">
                    {s.value}
                  </div>
                  <div className="text-[var(--fg-3)] text-[11px] tracking-wide">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ServiceCard({ service }) {
  const { Icon, title, desc, tag, blue } = service

  const accent = blue
    ? { bg: 'bg-[#527ED8]/[0.08]', border: 'border-[#527ED8]/[0.15]', hoverBg: 'group-hover:bg-[#527ED8]/[0.12]', color: '#527ED8', dot: 'bg-[#527ED8]/50', line: 'rgba(59,126,248,0.4)', hoverCard: '0_0_30px_rgba(59,126,248,0.08)', hoverBorder: 'hover:border-[#527ED8]/20' }
    : { bg: 'bg-[#F07232]/[0.08]', border: 'border-[#F07232]/[0.15]', hoverBg: 'group-hover:bg-[#F07232]/[0.12]', color: '#F07232', dot: 'bg-[#F07232]/50', line: 'rgba(255,107,0,0.4)', hoverCard: '0_0_30px_rgba(255,107,0,0.06)', hoverBorder: 'hover:border-[var(--bd-2)]' }

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      className={`group relative bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl p-5 sm:p-7
                 overflow-hidden cursor-default ${accent.hoverBorder}
                 transition-[border-color,box-shadow] duration-300`}
      style={{ '--hover-shadow': accent.hoverCard }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100
                      transition-opacity duration-500"
           style={{ background: `linear-gradient(90deg, transparent, ${accent.line}, transparent)` }} />

      <DotCorner />

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${accent.bg} border ${accent.border}
                      flex items-center justify-center mb-5
                      ${accent.hoverBg} transition-colors duration-300`}>
        <Icon size={19} color={accent.color} />
      </div>

      <h3 className="font-display font-semibold text-[var(--fg-1)] text-[15px] leading-snug mb-2.5">
        {title}
      </h3>
      <p className="text-[var(--fg-3)] text-[13px] leading-relaxed mb-6">
        {desc}
      </p>

      {/* Bottom tag */}
      <div className="flex items-center gap-2">
        <div className={`w-1 h-1 rounded-full ${accent.dot}`} />
        <span className="text-[var(--fg-4)] text-[11px] tracking-wide">{tag}</span>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-70px' })

  const [featured, ...rest] = SERVICES

  return (
    <section id="servicios" className="relative py-20 lg:py-32 bg-[var(--bg-alt)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,107,0,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-8">

        {/* Header */}
        <div className="mb-12 lg:mb-20" ref={ref}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#F07232] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
          >
            Soluciones
          </motion.p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-[var(--fg-1)] leading-[1.05]
                         text-[clamp(2rem,5vw,3.25rem)] max-w-xl"
            >
              Todo lo que necesitás,
              <br />
              <span className="text-[var(--fg-3)]">en un solo lugar.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[var(--fg-3)] text-sm leading-relaxed max-w-xs"
            >
              Desde enviar un paquete al exterior hasta recibir tus compras.
              Operamos en ambas direcciones.
            </motion.p>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <FeaturedCard service={featured} inView={inView} />
          {rest.map(s => <ServiceCard key={s.id} service={s} />)}
        </motion.div>

      </div>
    </section>
  )
}

