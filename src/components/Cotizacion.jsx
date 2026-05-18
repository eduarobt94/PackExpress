import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Package, Clock, Truck,
  CheckCircle, Calculator, MapPin, Weight, Ruler,
  ChevronDown,
} from 'lucide-react'

const REGIONS = {
  'América del Sur': {
    multiplier: 1.0,
    countries: ['Argentina', 'Brasil', 'Chile', 'Paraguay', 'Bolivia', 'Perú', 'Colombia'],
  },
  'América del Norte': {
    multiplier: 1.3,
    countries: ['Estados Unidos', 'Canadá', 'México'],
  },
  Europa: {
    multiplier: 1.4,
    countries: ['España', 'Francia', 'Italia', 'Alemania', 'Portugal', 'Reino Unido'],
  },
  'Asia/Oceanía': {
    multiplier: 1.6,
    countries: ['China', 'Japón', 'Australia', 'Emiratos Árabes'],
  },
  África: {
    multiplier: 1.5,
    countries: ['Sudáfrica', 'Nigeria'],
  },
}

const COUNTRY_TO_REGION = Object.entries(REGIONS).reduce((acc, [region, { countries }]) => {
  countries.forEach(c => (acc[c] = region))
  return acc
}, {})

const SERVICES = [
  {
    id:          'economico',
    label:       'Económico',
    days:        '12–18 días',
    ratePerKg:   6,
    icon:        Clock,
    description: 'Tarifa más baja',
  },
  {
    id:          'estandar',
    label:       'Estándar',
    days:        '7–10 días',
    ratePerKg:   10,
    icon:        Package,
    description: 'Precio y plazo',
  },
  {
    id:          'expres',
    label:       'Exprés',
    days:        '3–5 días',
    ratePerKg:   16,
    icon:        Zap,
    description: 'Entrega prioritaria',
  },
  {
    id:          'carga',
    label:       'Carga',
    days:        '15–25 días',
    ratePerKg:   4,
    icon:        Truck,
    description: 'Grandes volúmenes',
  },
]

const FUEL_SURCHARGE = 0.08
const MIN_CHARGE     = 15

function calculatePrice({ weight, largo, ancho, alto, country, serviceId }) {
  if (!weight || !largo || !ancho || !alto || !country || !serviceId) return null

  const w = parseFloat(weight)
  const l = parseFloat(largo)
  const a = parseFloat(ancho)
  const h = parseFloat(alto)

  if (isNaN(w) || isNaN(l) || isNaN(a) || isNaN(h)) return null
  if (w <= 0 || l <= 0 || a <= 0 || h <= 0) return null

  const service = SERVICES.find(s => s.id === serviceId)
  if (!service) return null

  const region = COUNTRY_TO_REGION[country]
  if (!region) return null

  const multiplier    = REGIONS[region].multiplier
  const dimWeight     = (l * a * h) / 5000
  const effectiveWeight = Math.max(w, dimWeight)

  const base  = Math.max(effectiveWeight * service.ratePerKg * multiplier, MIN_CHARGE)
  const fuel  = base * FUEL_SURCHARGE
  const total = base + fuel

  return {
    base:            base.toFixed(2),
    fuel:            fuel.toFixed(2),
    total:           total.toFixed(2),
    effectiveWeight: effectiveWeight.toFixed(2),
    dimWeight:       dimWeight.toFixed(2),
    region,
  }
}

const priceVariants = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: 8,  scale: 0.96, transition: { duration: 0.18 } },
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-300 mb-2.5">
        <Icon size={13} className="text-[#FF6B00]" />
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = `
  w-full rounded-xl px-4 py-3 text-white placeholder-slate-700 text-sm outline-none
  bg-[#060810] border border-white/[0.08]
  focus:border-[#FF6B00]/50 focus:shadow-[0_0_0_3px_rgba(255,107,0,0.10)]
  transition-all duration-200
`

export default function Cotizacion() {
  const [weight,    setWeight]    = useState('')
  const [largo,     setLargo]     = useState('')
  const [ancho,     setAncho]     = useState('')
  const [alto,      setAlto]      = useState('')
  const [country,   setCountry]   = useState('')
  const [serviceId, setServiceId] = useState('estandar')
  const [submitted, setSubmitted] = useState(false)

  const pricing = useMemo(
    () => calculatePrice({ weight, largo, ancho, alto, country, serviceId }),
    [weight, largo, ancho, alto, country, serviceId]
  )

  const isValid = Boolean(
    weight && parseFloat(weight) > 0 && parseFloat(weight) <= 500 &&
    largo  && parseFloat(largo)  > 0 &&
    ancho  && parseFloat(ancho)  > 0 &&
    alto   && parseFloat(alto)   > 0 &&
    country && serviceId
  )

  const handleSubmit = e => {
    e?.preventDefault()
    if (!isValid) return
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    setWeight('')
    setLargo('')
    setAncho('')
    setAlto('')
    setCountry('')
    setServiceId('estandar')
  }

  return (
    <section id="tarifas" className="relative py-24 lg:py-32 bg-[#060810] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] bg-[#FF6B00] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] bg-[#FF8C3A] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4">
            Cotizador
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-display font-bold text-white leading-[1.05]
                           text-[clamp(2rem,5vw,3.25rem)]">
              Calculá tu envío
              <br />
              <span className="text-[#FF6B00]">en segundos.</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Tarifas transparentes para envíos nacionales e internacionales. Ingresá los datos y obtené un precio al instante.
            </p>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* LEFT: Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-[#0C1018] border border-white/[0.07] rounded-2xl p-7 lg:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-[#22C55E]/12 border border-[#22C55E]/25
                                 flex items-center justify-center mb-6"
                    >
                      <CheckCircle size={40} className="text-[#22C55E]" />
                    </motion.div>
                    <h3 className="font-display font-bold text-xl text-white mb-3">
                      ¡Solicitud recibida!
                    </h3>
                    <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
                      Nuestro equipo se pondrá en contacto en menos de 24 horas con la cotización definitiva.
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-xl text-sm font-semibold
                                 border border-white/10 text-slate-400
                                 hover:border-[#FF6B00]/40 hover:text-[#FF6B00]
                                 transition-all duration-200"
                    >
                      Nueva cotización
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Peso */}
                    <Field label="Peso (kg)" icon={Weight}>
                      <input
                        type="number"
                        min="0.1"
                        max="500"
                        step="0.1"
                        placeholder="Ej: 2.5"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className={inputCls}
                      />
                    </Field>

                    {/* Dimensiones */}
                    <Field label="Dimensiones (cm)" icon={Ruler}>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: largo, setter: setLargo, placeholder: 'Largo' },
                          { value: ancho, setter: setAncho, placeholder: 'Ancho' },
                          { value: alto,  setter: setAlto,  placeholder: 'Alto'  },
                        ].map(({ value, setter, placeholder }) => (
                          <div key={placeholder} className="relative">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder={placeholder}
                              value={value}
                              onChange={e => setter(e.target.value)}
                              className={inputCls + ' pr-9'}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-700">
                              cm
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-700 mt-2">Largo × Ancho × Alto</p>
                    </Field>

                    {/* País de destino */}
                    <Field label="País de destino" icon={MapPin}>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          className={inputCls + ' appearance-none pr-10 cursor-pointer'}
                          style={{ color: country ? 'white' : 'rgb(71 85 105)' }}
                        >
                          <option value="" disabled style={{ backgroundColor: '#111828' }}>
                            Seleccioná un país
                          </option>
                          {Object.entries(REGIONS).map(([region, { countries }]) => (
                            <optgroup
                              key={region}
                              label={region}
                              style={{ backgroundColor: '#111828', color: '#FF8C3A' }}
                            >
                              {countries.map(c => (
                                <option
                                  key={c}
                                  value={c}
                                  style={{ backgroundColor: '#111828', color: 'white' }}
                                >
                                  {c}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                        />
                      </div>
                    </Field>

                    {/* Tipo de servicio */}
                    <Field label="Tipo de servicio" icon={Calculator}>
                      <div className="grid grid-cols-2 gap-3">
                        {SERVICES.map(service => {
                          const Icon     = service.icon
                          const selected = serviceId === service.id
                          return (
                            <motion.button
                              key={service.id}
                              type="button"
                              onClick={() => setServiceId(service.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="relative rounded-xl p-4 text-left cursor-pointer
                                         transition-all duration-200"
                              style={{
                                backgroundColor: selected ? 'rgba(255,107,0,0.08)' : '#060810',
                                border:          selected ? '1.5px solid rgba(255,107,0,0.45)' : '1.5px solid rgba(255,255,255,0.07)',
                                boxShadow:       selected ? '0 0 20px rgba(255,107,0,0.10)' : 'none',
                              }}
                            >
                              {selected && (
                                <motion.div
                                  layoutId="service-glow"
                                  className="absolute inset-0 rounded-xl pointer-events-none"
                                  style={{ boxShadow: '0 0 24px rgba(255,107,0,0.12)' }}
                                />
                              )}
                              <Icon
                                size={16}
                                className="mb-2"
                                style={{ color: selected ? '#FF6B00' : 'rgb(71 85 105)' }}
                              />
                              <p
                                className="text-[13px] font-semibold leading-none mb-1"
                                style={{ color: selected ? 'white' : 'rgb(100 116 139)' }}
                              >
                                {service.label}
                              </p>
                              <p
                                className="text-[11px]"
                                style={{ color: selected ? 'rgba(255,255,255,0.4)' : 'rgb(51 65 85)' }}
                              >
                                {service.days}
                              </p>
                              <p
                                className="text-[11px] mt-1 font-medium"
                                style={{ color: selected ? '#FF8C3A' : 'rgb(51 65 85)' }}
                              >
                                ${service.ratePerKg}/kg
                              </p>
                            </motion.button>
                          )
                        })}
                      </div>
                    </Field>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT: Price panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-24"
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background:  'linear-gradient(135deg, rgba(255,107,0,0.07) 0%, transparent 60%), #0C1018',
                borderColor: 'rgba(255,107,0,0.18)',
              }}
            >
              {/* Panel header */}
              <div className="px-7 py-5 border-b border-white/[0.06]">
                <h3 className="font-display font-bold text-base text-white leading-none">
                  Detalle de cotización
                </h3>
                <p className="text-slate-600 text-xs mt-1.5">Estimación en USD · sin compromisos</p>
              </div>

              <div className="px-7 py-6 space-y-5">
                {/* Selected service badge */}
                {serviceId && (() => {
                  const s    = SERVICES.find(x => x.id === serviceId)
                  const Icon = s.icon
                  return (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    bg-[#FF6B00]/[0.07] border border-[#FF6B00]/15">
                      <Icon size={15} className="text-[#FF6B00] shrink-0" />
                      <span className="text-[13px] font-medium text-white">{s.label}</span>
                      <span className="text-[11px] text-slate-600 ml-auto">{s.days}</span>
                    </div>
                  )
                })()}

                {/* Weight info */}
                <AnimatePresence mode="wait">
                  {pricing && (
                    <motion.div
                      key="weight-info"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {(country
                        ? [
                            { label: 'Peso real',        value: `${parseFloat(weight).toFixed(2)} kg` },
                            { label: 'Peso dimensional',  value: `${pricing.dimWeight} kg` },
                            { label: 'Peso efectivo',     value: `${pricing.effectiveWeight} kg`, bold: true },
                            { label: 'Región',            value: pricing.region },
                          ]
                        : [
                            { label: 'Peso real',        value: `${parseFloat(weight).toFixed(2)} kg` },
                            { label: 'Peso dimensional',  value: `${pricing.dimWeight} kg` },
                            { label: 'Peso efectivo',     value: `${pricing.effectiveWeight} kg`, bold: true },
                          ]
                      ).map(row => (
                        <div key={row.label} className="flex justify-between text-[12px]">
                          <span className="text-slate-600">{row.label}</span>
                          <span className={row.bold ? 'text-white font-medium' : 'text-slate-500'}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* Price breakdown */}
                <div className="space-y-3">
                  {[
                    { label: 'Tarifa base',              key: pricing?.base,    val: pricing ? `$${pricing.base}`  : '—' },
                    { label: 'Recargo combustible (8%)', key: pricing?.fuel,    val: pricing ? `$${pricing.fuel}`  : '—' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-[13px] text-slate-500">{row.label}</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={row.key ?? 'empty'}
                          variants={priceVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="text-[13px] font-semibold"
                          style={{ color: pricing ? 'white' : 'rgb(51 65 85)' }}
                        >
                          {row.val}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-base text-white">Total estimado</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={pricing?.total ?? 'empty-total'}
                      variants={priceVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="font-display font-bold text-3xl"
                      style={{ color: pricing ? '#FF6B00' : 'rgb(51 65 85)' }}
                    >
                      {pricing ? `$${pricing.total}` : '—'}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {!pricing && (
                  <p className="text-[11px] text-slate-700 text-center -mt-1">
                    Completá el formulario para ver el precio
                  </p>
                )}

                {/* CTA */}
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success-cta"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl
                                 bg-[#22C55E]/10 border border-[#22C55E]/25"
                    >
                      <CheckCircle size={16} className="text-[#22C55E]" />
                      <span className="text-sm font-semibold text-[#22C55E]">
                        ¡Cotización enviada!
                      </span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="cta"
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isValid}
                      whileHover={isValid ? { scale: 1.02 } : {}}
                      whileTap={isValid ? { scale: 0.98 } : {}}
                      className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300"
                      style={{
                        backgroundColor: isValid ? '#FF6B00' : 'rgba(255,255,255,0.04)',
                        color:           isValid ? 'white'   : 'rgb(51 65 85)',
                        cursor:          isValid ? 'pointer' : 'not-allowed',
                        boxShadow:       isValid ? '0 0 28px rgba(255,107,0,0.35)' : 'none',
                      }}
                    >
                      {isValid ? 'Solicitar cotización' : 'Completá el formulario'}
                    </motion.button>
                  )}
                </AnimatePresence>

                <p className="text-[11px] text-slate-700 text-center">
                  * Estimación referencial. El precio final se confirma al gestionar el envío.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
