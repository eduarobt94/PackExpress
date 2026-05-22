import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, AlertTriangle, Phone, Mail, MapPin, MessageCircle, Send, CheckCircle, ArrowUpRight, UserRound, Plane, Briefcase, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const MAP_EMBED = 'https://maps.google.com/maps?q=-34.907382,-56.188793&z=15&output=embed'
const MAP_FULL  = 'https://maps.google.com/maps?q=-34.907382,-56.188793&z=16&output=embed'

const DOCS = [
  {
    Icon:   Download,
    label:  '01',
    title:  'Declaración Jurada',
    desc:   'Formulario oficial requerido para todos los envíos internacionales',
    href:   '/declaracion-jurada.xlsx',
    action: 'Descargar',
  },
  {
    Icon:   FileText,
    label:  '02',
    title:  'Resolución N° 148/2023',
    desc:   'Normativa oficial de servicios postales en Uruguay — URSEC',
    href:   '/Gaceta Oficial.pdf',
    action: 'Ver documento',
  },
  {
    Icon:   Plane,
    label:  '03',
    title:  'Requisitos Courier',
    desc:   'Políticas, documentación requerida y tiempos de entrega',
    modal:  'courier',
    action: 'Ver requisitos',
  },
  {
    Icon:   Briefcase,
    label:  '04',
    title:  'Equipaje No Acompañado',
    desc:   'Tarifas, condiciones y peso máximo permitido',
    modal:  'equipaje',
    action: 'Ver tarifas',
  },
  {
    Icon:   AlertTriangle,
    label:  '05',
    title:  'Artículos Prohibidos',
    desc:   'Lista completa de objetos restringidos para envíos internacionales',
    modal:  'prohibidos',
    action: 'Consultar',
    alert:  true,
  },
]

const SUBJECTS = [
  'Consulta general',
  'Cotización de envío',
  'Casillero Internacional',
  'Distribución nacional (Uruguay)',
  'Envío internacional',
  'Rastreo de paquete',
  'Despacho de envíos',
  'Documentación',
  'Reclamo / incidencia',
  'Otro',
]

const HOURS = [
  { days: 'Lunes – Viernes', hours: '10:00 – 18:00', open: true },
  { days: 'Sábados',        hours: '10:00 – 14:00', open: true },
  { days: 'Domingos',        hours: 'Cerrado',       open: false },
]

function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-[var(--fg-3)] uppercase tracking-[0.12em] mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
    </div>
  )
}

function DocRow({ doc, delay = 0 }) {
  const { label, title, desc, action, href, modal, alert } = doc

  const sharedCls = `group flex items-center gap-4 px-5 py-4 w-full
    bg-[var(--bg-card)] border rounded-xl cursor-pointer transition-all duration-200
    ${alert
      ? 'border-[var(--bd-1)] hover:border-[#E53535]/40 hover:bg-[#E53535]/[0.04]'
      : 'border-[var(--bd-1)] hover:border-[#F07232]/40'
    }`

  const motionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  }

  const inner = (
    <>
      <span className={`text-[11px] font-bold tracking-[0.12em] shrink-0 w-6 text-center
                        transition-colors duration-200
                        ${alert ? 'text-[var(--fg-5)] group-hover:text-[#E53535]' : 'text-[var(--fg-5)]'}`}>
        {label}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className={`text-[13px] font-semibold truncate transition-colors duration-200
                       ${alert ? 'text-[var(--fg-1)] group-hover:text-[#E53535]/80' : 'text-[var(--fg-1)]'}`}>{title}</p>
        <p className="text-[11px] text-[var(--fg-4)] truncate mt-0.5">{desc}</p>
      </div>
      <span className={`text-[11px] font-semibold shrink-0 flex items-center gap-1
                        transition-colors duration-200
                        ${alert ? 'text-[var(--fg-3)] group-hover:text-[#E53535]' : 'text-[var(--fg-3)] group-hover:text-[#F07232]'}`}>
        {action}
        <ArrowUpRight size={11} />
      </span>
    </>
  )

  if (href) {
    return (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={sharedCls} {...motionProps}>
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('openLegal', { detail: modal }))}
      className={sharedCls}
      {...motionProps}
    >
      {inner}
    </motion.button>
  )
}

export default function Docs() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [form, setForm]       = useState({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' })
  const [errors, setErrors]   = useState({})
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'Requerido'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.telefono.trim()) e.telefono = 'Requerido'
    if (!form.asunto)          e.asunto   = 'Seleccioná un asunto'
    if (!form.mensaje.trim() || form.mensaje.length < 10) e.mensaje = 'Mínimo 10 caracteres'
    return e
  }

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }))
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1200)
  }

  const inputCls = (field) =>
    `w-full bg-[var(--bg-input)] border rounded-xl px-4 py-3 text-sm text-[var(--fg-1)] placeholder-[var(--fg-4)]
     outline-none transition-all duration-200
     focus:border-[#F07232]/50 focus:shadow-[0_0_0_3px_rgba(255,107,0,0.07)]
     ${errors[field] ? 'border-red-500/50' : 'border-[var(--bd-1)]'}`

  return (
    <section id="contacto" className="py-24 lg:py-32 bg-[var(--bg-base)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-8">

        {/* â”€â”€ Section header â”€â”€ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#F07232] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
            >
              Contacto
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-[var(--fg-1)] text-[clamp(2.2rem,4.5vw,3.2rem)] leading-[1.05]"
            >
              Hablemos.
              <br />
              <span className="text-[var(--fg-3)]">Estamos para ayudarte.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-[13px] text-[var(--fg-3)] leading-relaxed max-w-xs lg:text-right"
          >
            Respondemos en menos de 24 horas hábiles.
            <br />Consultas, cotizaciones o reclamos.
          </motion.p>
        </div>

        {/* â”€â”€ Docs label â”€â”€ */}
        <p className="text-[11px] font-semibold text-[var(--fg-4)] uppercase tracking-[0.15em] mb-4">
          Documentación
        </p>

        {/* â”€â”€ Main 2-column grid: left = docs + form, right = contact card â”€â”€ */}
        <div className="grid grid-cols-1 lg:grid-cols-[8fr_3fr] gap-8 items-stretch">

          {/* Left column: docs + form */}
          <div className="space-y-3">

            {/* Doc rows: 1-col on mobile, 2-col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DOCS.slice(0, 4).map((doc, i) => <DocRow key={doc.title} doc={doc} delay={i * 0.06} />)}
              <div className="sm:col-span-2">
                <DocRow doc={DOCS[4]} delay={0.24} />
              </div>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl p-7 mt-2"
            >
            <div className="flex items-center justify-between mb-7">
              <h3 className="font-display font-bold text-[17px] text-[var(--fg-1)]">Escribinos un mensaje</h3>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F07232]/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--bd-2)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--bd-2)]" />
              </div>
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20
                                flex items-center justify-center mb-2">
                  <CheckCircle size={26} className="text-[#22C55E]" />
                </div>
                <p className="text-[var(--fg-1)] font-semibold text-lg">Â¡Mensaje enviado!</p>
                <p className="text-[var(--fg-3)] text-[13px]">Nos pondremos en contacto en menos de 24 h.</p>
                <button
                  onClick={() => { setSent(false); setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' }) }}
                  className="mt-3 text-[12px] text-[#F07232] hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Nombre completo" error={errors.nombre} htmlFor="nombre">
                    <input id="nombre" value={form.nombre} onChange={e => handleChange('nombre', e.target.value)} placeholder="Juan Pérez" className={inputCls('nombre')} />
                  </Field>
                  <Field label="Email" error={errors.email} htmlFor="email">
                    <input id="email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="juan@empresa.com" className={inputCls('email')} />
                  </Field>
                  <Field label="Teléfono" error={errors.telefono} htmlFor="telefono">
                    <input id="telefono" value={form.telefono} onChange={e => handleChange('telefono', e.target.value)} placeholder="+598 9x xxx xxx" className={inputCls('telefono')} />
                  </Field>
                  <Field label="Asunto" error={errors.asunto} htmlFor="asunto">
                    <select id="asunto" value={form.asunto} onChange={e => handleChange('asunto', e.target.value)} className={`${inputCls('asunto')} appearance-none`}>
                      <option value="">Seleccioná</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Mensaje" error={errors.mensaje} htmlFor="mensaje">
                  <textarea id="mensaje" rows={7} value={form.mensaje} onChange={e => handleChange('mensaje', e.target.value)} placeholder="Contanos en qué podemos ayudarte…" className={`${inputCls('mensaje')} resize-none`} />
                </Field>
                <button type="submit" disabled={sending}
                  className="flex items-center justify-center gap-2 rounded-xl mx-auto
                             bg-[#527ED8] hover:bg-[#6B90DC] text-white text-[14px] font-semibold
                             transition-all duration-200 disabled:opacity-60 tracking-wide
                             hover:shadow-[0_0_24px_rgba(59,126,248,0.30)]"
                  style={{ width: 280, height: 49 }}>
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Enviando…
                    </span>
                  ) : <><Send size={13} /> Enviar mensaje</>}
                </button>
              </form>
            )}
          </motion.div>
          </div>{/* end left column */}

          {/* Contact card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl overflow-hidden h-full flex flex-col"
          >
            <div className="relative px-7 pt-7 pb-8 overflow-hidden border-b border-[var(--bd-1)]"
                 style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)' }}>
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
                   style={{ backgroundColor: isDark ? 'rgba(59,126,248,0.10)' : 'rgba(59,126,248,0.05)' }} />
              <div className="absolute top-6 right-6 w-20 h-20 rounded-full"
                   style={{ backgroundColor: isDark ? 'rgba(59,126,248,0.07)' : 'rgba(59,126,248,0.03)' }} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl border border-[#527ED8]/50 hover:border-[#527ED8]
                                flex items-center justify-center mb-5 transition-colors duration-200"
                     style={{ backgroundColor: 'rgba(59,126,248,0.07)' }}>
                  <UserRound size={18} className="text-[#527ED8]" />
                </div>
                <h3 className="font-display font-bold text-xl text-[var(--fg-1)] leading-tight mb-1.5">
                  ¿Necesitás asesoramiento?
                </h3>
                <p className="text-[12px] text-[var(--fg-2)] leading-relaxed">
                  Courier, casillero o distribución "” te guiamos en cada paso.
                </p>
              </div>
            </div>
            <div className="px-7 py-6 space-y-5 flex-1">
              {[
                { Icon: Phone,  value: '(+598) 93 594 297',         sub: 'Lunes a viernes · 10:00 – 18:00' },
                { Icon: Mail,   value: 'packexpress2021@gmail.com', sub: 'Respuesta en menos de 24 h' },
                { Icon: MapPin, value: 'Carlos Quijano 1258',       sub: 'Montevideo, Uruguay' },
              ].map(({ Icon, value, sub }) => (
                <div key={value} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg border border-[#527ED8]/[0.30] flex items-center justify-center shrink-0 mt-0.5"
                       style={{ backgroundColor: 'rgba(59,126,248,0.07)' }}>
                    <Icon size={13} className="text-[#527ED8]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[var(--fg-1)]">{value}</p>
                    <p className="text-[11px] text-[var(--fg-4)] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}

              {/* Map thumbnail */}
              <button
                onClick={() => setMapOpen(true)}
                className="w-full rounded-xl overflow-hidden border border-[var(--bd-1)]
                           hover:border-[#F07232]/40 transition-colors duration-200 relative group"
                style={{ height: 140 }}
                aria-label="Ver ubicación en mapa"
              >
                <iframe
                  src={MAP_EMBED}
                  className="w-full h-full pointer-events-none"
                  title="Ubicación Pack Express"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200
                                flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                   bg-black/60 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg">
                    Ver mapa completo
                  </span>
                </div>
              </button>
            </div>
            <div className="px-7 pb-6">
              <div className="border-t border-[var(--bd-1)] pt-5">
                <p className="text-[10px] font-semibold text-[var(--fg-4)] uppercase tracking-[0.15em] mb-3.5">
                  Horario de atención
                </p>
                {HOURS.map(({ days, hours, open }) => (
                  <div key={days} className="flex justify-between items-center py-2 border-b border-[var(--bd-1)] last:border-0">
                    <span className="text-[12px] text-[var(--fg-3)]">{days}</span>
                    <span className={`text-[12px] font-medium ${open ? 'text-[var(--fg-1)]' : 'text-[var(--fg-5)]'}`}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5">
              <a href="https://wa.me/59893594297" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5
                           border border-[#527ED8]/40 hover:border-[#527ED8]/70
                           text-[#527ED8] hover:text-[#6B90DC] text-[13px] font-semibold
                           rounded-xl transition-all duration-200 tracking-wide
                           hover:bg-[#527ED8]/[0.07] hover:shadow-[0_0_20px_rgba(59,126,248,0.15)]">
                <MessageCircle size={14} />
                Contactar por WhatsApp
              </a>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Map modal */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            key="map-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          >
            <div className="absolute inset-0 bg-[var(--bg-base)]/70 backdrop-blur-xl" onClick={() => setMapOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-[var(--bg-alt)] border border-[var(--bd-1)]
                         rounded-2xl overflow-hidden shadow-[var(--shadow-modal)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bd-1)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-[#F07232]/50 flex items-center justify-center">
                    <MapPin size={14} className="text-[#F07232]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#F07232] font-semibold tracking-[0.15em] uppercase">Ubicación</p>
                    <p className="text-[13px] font-semibold text-[var(--fg-1)]">Carlos Quijano 1258, Montevideo</p>
                  </div>
                </div>
                <button
                  onClick={() => setMapOpen(false)}
                  className="w-8 h-8 rounded-lg border border-[var(--bd-2)] flex items-center justify-center
                             text-[var(--fg-4)] hover:text-[var(--fg-1)] hover:border-[var(--bd-3)]
                             transition-all duration-200"
                  aria-label="Cerrar mapa"
                >
                  <X size={14} />
                </button>
              </div>
              {/* Map */}
              <div style={{ height: 420 }}>
                <iframe
                  src={MAP_FULL}
                  className="w-full h-full"
                  title="Mapa Pack Express Uruguay"
                  loading="lazy"
                />
              </div>
              {/* Footer */}
              <div className="px-6 py-3 border-t border-[var(--bd-1)] flex items-center justify-between gap-3">
                <p className="text-[11px] text-[var(--fg-5)]">Pack Express Uruguay S.A.S.</p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://maps.google.com/maps?daddr=-34.907382,-56.188793"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-white bg-[#F07232] hover:bg-[#E8823C]
                               px-3 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Cómo llegar â†—
                  </a>
                  <a
                    href="https://maps.google.com/maps?q=-34.907382,-56.188793"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#F07232] hover:text-[#E8823C] transition-colors duration-200 whitespace-nowrap"
                  >
                    Abrir en Google Maps â†—
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

