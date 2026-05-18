import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, AlertTriangle, Phone, Mail, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react'

const DOCS = [
  {
    Icon:   Download,
    title:  'Declaración Jurada',
    desc:   'Formulario oficial requerido para todos los envíos internacionales',
    href:   '/declaracion-jurada.xlsx',
    action: 'Descargar',
    color:  '#FF6B00',
  },
  {
    Icon:   FileText,
    title:  'Resolución N° 148/2023',
    desc:   'Normativa oficial de servicios postales en Uruguay — URSEC',
    href:   '/Gaceta Oficial.pdf',
    action: 'Ver documento',
    color:  '#3B82F6',
  },
  {
    Icon:   AlertTriangle,
    title:  'Artículos Prohibidos',
    desc:   'Lista completa de objetos restringidos para envíos internacionales',
    href:   '#restringidos',
    action: 'Consultar',
    color:  '#EAB308',
  },
]

const SUBJECTS = [
  'Consulta general',
  'Cotización de envío',
  'Distribución nacional (Uruguay)',
  'Envío internacional',
  'Rastreo de paquete',
  'Gestión aduanera',
  'Documentación',
  'Reclamo / incidencia',
  'Otro',
]

export default function Docs() {
  const [form, setForm]       = useState({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' })
  const [errors, setErrors]   = useState({})
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)

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
    `w-full bg-[#060810] border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
     outline-none transition-colors duration-200 focus:border-[#FF6B00]/60
     ${errors[field] ? 'border-red-500/60' : 'border-white/[0.07]'}`

  return (
    <section id="contacto" className="py-24 lg:py-32 bg-[#07080F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-14 items-start">

          {/* Left — documents */}
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.2em] uppercase mb-4"
            >
              Documentación
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-white text-[clamp(2rem,4.5vw,3rem)]
                         leading-[1.05] mb-8"
            >
              Todo lo que necesitás
              <br />
              <span className="text-slate-500">para enviar sin complicaciones.</span>
            </motion.h2>

            <div className="space-y-3 mb-12">
              {DOCS.map(({ Icon, title, desc, href, action, color }, i) => (
                <motion.a
                  key={title}
                  href={href}
                  download={action === 'Descargar' ? true : undefined}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-center gap-4 p-4 rounded-xl
                             bg-[#0C1018] hover:bg-[#111828]
                             border border-white/[0.05] hover:border-white/10
                             transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}22` }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-0.5">{title}</p>
                    <p className="text-[12px] text-slate-500 truncate">{desc}</p>
                  </div>
                  <span className="text-[12px] text-slate-600 group-hover:text-slate-300
                                   transition-colors shrink-0 whitespace-nowrap">
                    {action} →
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="bg-[#0C1018] border border-white/[0.05] rounded-2xl p-6"
            >
              <h3 className="font-display font-bold text-lg text-white mb-1">Escribinos un mensaje</h3>
              <p className="text-[13px] text-slate-500 mb-6">Respondemos en menos de 24 horas hábiles.</p>

              {sent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle size={40} className="text-[#22C55E]" />
                  <p className="text-white font-semibold">¡Mensaje enviado!</p>
                  <p className="text-slate-400 text-sm">Nos pondremos en contacto pronto.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' }) }}
                    className="mt-2 text-[12px] text-[#FF6B00] hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        value={form.nombre}
                        onChange={e => handleChange('nombre', e.target.value)}
                        placeholder="Nombre completo *"
                        className={inputCls('nombre')}
                      />
                      {errors.nombre && <p className="text-red-400 text-[11px] mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="Email *"
                        className={inputCls('email')}
                      />
                      {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        value={form.telefono}
                        onChange={e => handleChange('telefono', e.target.value)}
                        placeholder="Teléfono *"
                        className={inputCls('telefono')}
                      />
                      {errors.telefono && <p className="text-red-400 text-[11px] mt-1">{errors.telefono}</p>}
                    </div>
                    <div>
                      <select
                        value={form.asunto}
                        onChange={e => handleChange('asunto', e.target.value)}
                        className={`${inputCls('asunto')} appearance-none`}
                      >
                        <option value="">Asunto *</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.asunto && <p className="text-red-400 text-[11px] mt-1">{errors.asunto}</p>}
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={4}
                      value={form.mensaje}
                      onChange={e => handleChange('mensaje', e.target.value)}
                      placeholder="Tu mensaje *"
                      className={`${inputCls('mensaje')} resize-none`}
                    />
                    {errors.mensaje && <p className="text-red-400 text-[11px] mt-1">{errors.mensaje}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                               bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-sm font-semibold
                               transition-colors duration-200 disabled:opacity-60"
                  >
                    {sending ? 'Enviando…' : <><Send size={14} /> Enviar mensaje</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Right — contact card */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative bg-gradient-to-br from-[#FF6B00]/10 to-[#FF6B00]/[0.04]
                         border border-[#FF6B00]/20 rounded-2xl p-7 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48
                              bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-[#FF6B00] rounded-xl flex items-center justify-center mb-5">
                  <Phone size={19} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">¿Necesitás asesoramiento?</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
                  Nuestro equipo está disponible para guiarte en cada paso de tu envío, nacional o internacional.
                </p>
                <div className="space-y-4 mb-7">
                  <div className="flex items-start gap-2.5">
                    <Phone size={13} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium text-sm">(+598) 2902 7227</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Lunes a viernes · 9:00 – 18:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail size={13} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium text-sm">packexpress2021@gmail.com</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Respuesta en menos de 24 h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={13} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium text-sm">Carlos Quijano 1258</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Montevideo, Uruguay</p>
                    </div>
                  </div>
                </div>
                <a
                  href="https://wa.me/59829027227"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3
                             bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-sm font-semibold
                             rounded-xl transition-colors duration-200"
                >
                  <MessageCircle size={15} />
                  Contactar por WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Hours card */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-[#0C1018] border border-white/[0.05] rounded-2xl p-5"
            >
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.15em] mb-4">
                Horario de atención
              </p>
              {[
                { days: 'Lunes – Viernes', hours: '9:00 – 18:00' },
                { days: 'Sábados',         hours: '9:00 – 13:00' },
                { days: 'Domingos',        hours: 'Cerrado' },
              ].map(({ days, hours }) => (
                <div key={days} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-[13px] text-slate-400">{days}</span>
                  <span className={`text-[13px] font-medium ${hours === 'Cerrado' ? 'text-slate-600' : 'text-white'}`}>
                    {hours}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
