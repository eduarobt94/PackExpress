import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Package, Clock, Truck,
  CheckCircle, Calculator, MapPin, Weight, Ruler,
  ChevronDown, X, Search,
} from 'lucide-react'

const REGIONS = {
  'América del Sur': {
    multiplier: 1.0,
    countries: [
      'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
      'Ecuador', 'Guyana', 'Paraguay', 'Perú', 'Surinam', 'Venezuela',
    ],
  },
  'América Central y Caribe': {
    multiplier: 1.25,
    countries: [
      'Costa Rica', 'Cuba', 'El Salvador', 'Guatemala', 'Haití',
      'Honduras', 'Jamaica', 'Nicaragua', 'Panamá', 'Puerto Rico',
      'República Dominicana', 'Trinidad y Tobago',
    ],
  },
  'América del Norte': {
    multiplier: 1.3,
    countries: ['Canadá', 'Estados Unidos', 'México'],
  },
  'Europa': {
    multiplier: 1.4,
    countries: [
      'Alemania', 'Austria', 'Bélgica', 'Croacia', 'Dinamarca',
      'España', 'Finlandia', 'Francia', 'Grecia', 'Hungría',
      'Irlanda', 'Italia', 'Noruega', 'Países Bajos', 'Polonia',
      'Portugal', 'Reino Unido', 'República Checa', 'Rumanía',
      'Suecia', 'Suiza', 'Ucrania',
    ],
  },
  'Asia': {
    multiplier: 1.6,
    countries: [
      'Arabia Saudita', 'China', 'Corea del Sur', 'Emiratos Árabes Unidos',
      'Filipinas', 'India', 'Indonesia', 'Israel', 'Japón',
      'Malasia', 'Qatar', 'Singapur', 'Tailandia', 'Taiwán',
      'Turquía', 'Vietnam',
    ],
  },
  'Oceanía': {
    multiplier: 1.6,
    countries: ['Australia', 'Nueva Zelanda'],
  },
  'África': {
    multiplier: 1.5,
    countries: ['Egipto', 'Ghana', 'Kenia', 'Marruecos', 'Nigeria', 'Sudáfrica', 'Tanzania'],
  },
}

const COUNTRY_TO_REGION = Object.entries(REGIONS).reduce((acc, [region, { countries }]) => {
  countries.forEach(c => (acc[c] = region))
  return acc
}, {})

const SERVICES = [
  { id: 'economico', label: 'Económico', days: '12–18 días', ratePerKg: 6,  icon: Clock,    description: 'Tarifa más baja' },
  { id: 'estandar',  label: 'Estándar',  days: '7–10 días',  ratePerKg: 10, icon: Package,  description: 'Precio y plazo' },
  { id: 'expres',    label: 'Exprés',    days: '3–5 días',   ratePerKg: 16, icon: Zap,      description: 'Entrega prioritaria' },
  { id: 'carga',     label: 'Carga',     days: '15–25 días', ratePerKg: 4,  icon: Truck,    description: 'Grandes volúmenes' },
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

  const multiplier      = REGIONS[region].multiplier
  const dimWeight       = (l * a * h) / 5000
  const effectiveWeight = Math.max(w, dimWeight)
  const base            = Math.max(effectiveWeight * service.ratePerKg * multiplier, MIN_CHARGE)
  const total           = base + base * FUEL_SURCHARGE

  return {
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

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--fg-2)] mb-2.5">
        <Icon size={13} className="text-[#FF6B00]" />
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = `
  w-full rounded-xl px-4 py-3 text-[var(--fg-1)] placeholder-[var(--fg-4)] text-sm outline-none
  bg-[var(--bg-input)] border border-[var(--bd-2)]
  focus:border-[#FF6B00]/50 focus:shadow-[0_0_0_3px_rgba(255,107,0,0.10)]
  transition-all duration-200
`

// ─── Custom country selector ───────────────────────────────────────────────────
function CountrySelect({ value, onChange }) {
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef                = useRef(null)
  const searchRef             = useRef(null)

  useEffect(() => {
    const handler = e => { if (btnRef.current && !btnRef.current.closest('[data-country-select]').contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      const rect = btnRef.current?.getBoundingClientRect()
      if (rect) {
        const dropH   = 340
        const spaceBelow = window.innerHeight - rect.bottom - 8
        const top = spaceBelow >= dropH ? rect.bottom + 6 : rect.top - dropH - 6
        setDropPos({ top, left: rect.left, width: rect.width })
      }
      setTimeout(() => searchRef.current?.focus(), 50)
    } else {
      setSearch('')
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return REGIONS
    return Object.fromEntries(
      Object.entries(REGIONS)
        .map(([region, data]) => [region, { ...data, countries: data.countries.filter(c => c.toLowerCase().includes(q)) }])
        .filter(([, data]) => data.countries.length > 0)
    )
  }, [search])

  return (
    <div data-country-select>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`${inputCls} flex items-center justify-between cursor-pointer`}
        style={{ color: value ? 'var(--fg-1)' : 'var(--fg-4)' }}
      >
        <span>{value || 'Seleccioná un país'}</span>
        <ChevronDown
          size={14}
          className={`text-[var(--fg-4)] transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top:      dropPos.top,
              left:     dropPos.left,
              width:    dropPos.width,
              zIndex:   9999,
            }}
            className="rounded-xl overflow-hidden border border-[var(--bd-2)] bg-[var(--bg-elevated)]
                       shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
          >
            {/* Search bar */}
            <div className="p-2 border-b border-[var(--bd-1)]">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)] pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar país..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setOpen(false)}
                  className="w-full pl-8 pr-3 py-2 text-[13px] bg-[var(--bg-input)] border border-[var(--bd-1)]
                             rounded-lg outline-none text-[var(--fg-1)] placeholder-[var(--fg-4)]
                             focus:border-[#FF6B00]/40 transition-colors duration-150"
                />
              </div>
            </div>

            {/* Countries list */}
            <div className="max-h-[272px] overflow-y-auto py-1">
              {Object.entries(filtered).map(([region, { countries }]) => (
                <div key={region}>
                  <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold tracking-[0.20em] uppercase text-[#FF6B00]">
                    {region}
                  </div>
                  {countries.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { onChange(c); setOpen(false) }}
                      className={`w-full text-left px-5 py-2 text-[13px] transition-colors duration-100 ${
                        c === value
                          ? 'text-[#FF6B00] bg-[rgba(255,107,0,0.08)]'
                          : 'text-[var(--fg-2)] hover:text-[var(--fg-1)] hover:bg-[var(--bd-1)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ))}
              {Object.keys(filtered).length === 0 && (
                <p className="text-center text-[13px] text-[var(--fg-4)] py-8">Sin resultados</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Cotizacion({ onClose }) {
  const [weight,    setWeight]    = useState('')
  const [largo,     setLargo]     = useState('')
  const [ancho,     setAncho]     = useState('')
  const [alto,      setAlto]      = useState('')
  const [country,   setCountry]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  const serviceId = 'estandar'

  const pricing = useMemo(
    () => calculatePrice({ weight, largo, ancho, alto, country, serviceId }),
    [weight, largo, ancho, alto, country]
  )

  const isValid = Boolean(
    weight && parseFloat(weight) > 0 && parseFloat(weight) <= 500 &&
    largo  && parseFloat(largo)  > 0 &&
    ancho  && parseFloat(ancho)  > 0 &&
    alto   && parseFloat(alto)   > 0 &&
    country
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
  }

  return (
    <div className="bg-[var(--bg-alt)] border border-[var(--bd-1)] rounded-2xl
                    shadow-[var(--shadow-modal)]">

      {/* Header */}
      <div className="relative flex items-center justify-between px-8 py-6 border-b border-[var(--bd-1)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 60% 100% at 0% 50%, rgba(255,107,0,0.06) 0%, transparent 70%)' }} />
        <div className="relative">
          <p className="text-[#FF6B00] text-[10px] font-semibold tracking-[0.22em] uppercase mb-1.5">
            Cotizador
          </p>
          <h2 className="font-display font-bold text-[var(--fg-1)] text-xl leading-tight">
            Calculá tu envío <span className="text-[#FF6B00]">en segundos.</span>
          </h2>
          <p className="text-[var(--fg-3)] text-[12px] mt-1">
            Tarifas transparentes · precio al instante · sin compromisos
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="relative w-9 h-9 rounded-xl border border-[var(--bd-2)] flex items-center justify-center
                       text-[var(--fg-3)] hover:text-[var(--fg-1)] hover:border-[var(--bd-3)]
                       transition-all duration-200 shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT: Form */}
          <div className="bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl p-7 lg:p-8">
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
                  <h3 className="font-display font-bold text-xl text-[var(--fg-1)] mb-3">
                    ¡Solicitud recibida!
                  </h3>
                  <p className="text-[var(--fg-3)] text-sm mb-8 max-w-xs leading-relaxed">
                    Nuestro equipo se pondrá en contacto en menos de 24 horas con la cotización definitiva.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl text-sm font-semibold
                               border border-[var(--bd-2)] text-[var(--fg-3)]
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
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--fg-5)]">
                            cm
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[var(--fg-5)] mt-2">Largo × Ancho × Alto</p>
                  </Field>

                  {/* País de destino */}
                  <Field label="País de destino" icon={MapPin}>
                    <CountrySelect value={country} onChange={setCountry} />
                  </Field>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Price panel */}
          <div className="lg:sticky lg:top-6">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background:  'linear-gradient(135deg, rgba(255,107,0,0.07) 0%, transparent 60%), var(--bg-card)',
                borderColor: 'rgba(255,107,0,0.18)',
              }}
            >
              {/* Panel header */}
              <div className="px-7 py-5 border-b border-[var(--bd-1)]">
                <h3 className="font-display font-bold text-base text-[var(--fg-1)] leading-none">
                  Detalle de cotización
                </h3>
                <p className="text-[var(--fg-4)] text-xs mt-1.5">Estimación en USD · sin compromisos</p>
              </div>

              <div className="px-7 py-6 space-y-5">
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
                      {[
                        { label: 'Peso real',       value: `${parseFloat(weight).toFixed(2)} kg` },
                        { label: 'Peso dimensional', value: `${pricing.dimWeight} kg` },
                        { label: 'Peso efectivo',    value: `${pricing.effectiveWeight} kg`, bold: true },
                        { label: 'Región',           value: pricing.region },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between text-[12px]">
                          <span className="text-[var(--fg-4)]">{row.label}</span>
                          <span className={row.bold ? 'text-[var(--fg-1)] font-medium' : 'text-[var(--fg-3)]'}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="h-px" style={{ background: 'var(--bd-1)' }} />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-base text-[var(--fg-1)]">Total estimado</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={pricing?.total ?? 'empty-total'}
                      variants={priceVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="font-display font-bold text-3xl"
                      style={{ color: pricing ? '#FF6B00' : 'var(--fg-5)' }}
                    >
                      {pricing ? `$${pricing.total}` : '—'}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {!pricing && (
                  <p className="text-[11px] text-[var(--fg-5)] text-center -mt-1">
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
                      <span className="text-sm font-semibold text-[#22C55E]">¡Cotización enviada!</span>
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
                        color:           isValid ? 'white'   : 'var(--fg-5)',
                        cursor:          isValid ? 'pointer' : 'not-allowed',
                        boxShadow:       isValid ? '0 0 28px rgba(255,107,0,0.35)' : 'none',
                      }}
                    >
                      {isValid ? 'Solicitar cotización' : 'Completá el formulario'}
                    </motion.button>
                  )}
                </AnimatePresence>

                <p className="text-[11px] text-[var(--fg-5)] text-center">
                  * Estimación referencial. El precio final se confirma al gestionar el envío.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
