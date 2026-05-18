import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Package, Briefcase, FileText, Box, Globe2, Shield } from 'lucide-react'

const SERVICES = [
  {
    Icon:  Package,
    title: 'Paquetería Courier',
    desc:  'Enviamos a cualquier punto de Uruguay y a más de 50 países. Seguimiento en tiempo real y entrega puntual garantizada.',
    badge: 'Nacional & Internacional',
    color: 'rgba(255,107,0,0.12)',
    borderColor: 'rgba(255,107,0,0.2)',
    iconColor: '#FF6B00',
  },
  {
    Icon:  Briefcase,
    title: 'Equipaje No Acompañado',
    desc:  'Transporte seguro de equipaje personal sin límites de peso, tanto dentro de Uruguay como hacia el exterior.',
    badge: 'Sin límites',
    color: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(139,92,246,0.2)',
    iconColor: '#A78BFA',
  },
  {
    Icon:  FileText,
    title: 'Envío de Documentos',
    desc:  'Gestión segura de documentación oficial, contratos y correspondencia con cadena de custodia certificada.',
    badge: 'Certificado',
    color: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.2)',
    iconColor: '#22C55E',
  },
  {
    Icon:  Box,
    title: 'Embalaje Profesional',
    desc:  'Empaque especializado con materiales de primera calidad para proteger tu envío en cualquier trayecto.',
    badge: 'Premium',
    color: 'rgba(251,191,36,0.12)',
    borderColor: 'rgba(251,191,36,0.2)',
    iconColor: '#FBBF24',
  },
  {
    Icon:  Globe2,
    title: 'Distribución Nacional',
    desc:  'Cobertura en todo el territorio uruguayo con logística local eficiente, recolección a domicilio y confirmación de entrega.',
    badge: 'Todo Uruguay',
    color: 'rgba(56,189,248,0.12)',
    borderColor: 'rgba(56,189,248,0.2)',
    iconColor: '#38BDF8',
  },
  {
    Icon:  Shield,
    title: 'Gestión Aduanera',
    desc:  'Trámites aduaneros completos y documentación oficial conforme a la Resolución N°148/2023 de URSEC. Sin burocracia de tu parte.',
    badge: 'Oficial',
    color: 'rgba(255,107,0,0.12)',
    borderColor: 'rgba(255,107,0,0.2)',
    iconColor: '#FF6B00',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function Services() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-70px' })

  return (
    <section id="servicios" className="relative py-24 lg:py-32 bg-[#07080F]">
      {/* Radial gradient background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,107,0,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 lg:mb-20" ref={ref}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
          >
            Soluciones
          </motion.p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-white leading-[1.05]
                         text-[clamp(2rem,5vw,3.25rem)] max-w-xl"
            >
              Todo lo que necesitás,
              <br />
              <span className="text-slate-500">en un solo lugar.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 text-sm leading-relaxed max-w-xs"
            >
              Logística nacional dentro de Uruguay e internacional a más de 50 países, con atención personalizada desde Montevideo.
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
          {SERVICES.map(({ Icon, title, desc, badge, color, borderColor, iconColor }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative bg-[#0C1018] border border-white/[0.06] rounded-2xl p-6
                         hover:border-white/[0.10] cursor-default
                         transition-[border-color,box-shadow] duration-300
                         hover:shadow-[0_0_30px_rgba(255,107,0,0.08)]"
            >
              {/* Top micro-line hover accent */}
              <div
                className="absolute top-0 inset-x-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100
                           transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${iconColor}40, transparent)`,
                }}
              />

              {/* Icon box */}
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                           transition-all duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: color,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <Icon size={20} style={{ color: iconColor }} />
              </div>

              {/* Badge */}
              <div
                className="inline-flex items-center px-2.5 py-0.5 rounded-md mb-3
                           text-[10px] font-semibold tracking-wide"
                style={{
                  backgroundColor: `${iconColor}15`,
                  border: `1px solid ${iconColor}30`,
                  color: iconColor,
                }}
              >
                {badge}
              </div>

              <h3 className="font-display font-semibold text-[15px] text-white mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
