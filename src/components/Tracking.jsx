import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Search,
  X,
} from 'lucide-react'

const TRACKING_FORMAT = /^CM\d{7}UY$/i

const DEMO_NUMBER = 'CM1234567UY'

const TIMELINE_STEPS = [
  { id: 1, label: 'Pedido Recibido',          icon: Package    },
  { id: 2, label: 'Documentación Procesada',  icon: Clock      },
  { id: 3, label: 'En Tránsito Internacional',icon: Truck      },
  { id: 4, label: 'Control Aduanero',         icon: AlertCircle},
  { id: 5, label: 'En Distribución',          icon: MapPin     },
  { id: 6, label: 'Entregado',                icon: CheckCircle},
]

const MOCK_RESULT = {
  trackingNumber: DEMO_NUMBER,
  currentStep: 3,
  packageType: 'Paquete Estándar',
  weight: '2.3 kg',
  route: 'Montevideo → Madrid',
  estimatedDelivery: '5–7 días hábiles',
  steps: [
    { id: 1, status: 'completed'   },
    { id: 2, status: 'completed'   },
    { id: 3, status: 'in-progress' },
    { id: 4, status: 'pending'     },
    { id: 5, status: 'pending'     },
    { id: 6, status: 'pending'     },
  ],
}

function getStepColor(status) {
  if (status === 'completed')  return '#22C55E'
  if (status === 'in-progress') return '#FF6B00'
  return '#334155'
}

function StepNode({ step, status, index }) {
  const Icon  = step.icon
  const color = getStepColor(status)

  return (
    <div className="flex flex-col items-center gap-3 flex-1 relative" style={{ zIndex: 1 }}>
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center w-11 h-11 rounded-full border-2"
        style={{
          borderColor: color,
          backgroundColor:
            status === 'completed'   ? 'rgba(34,197,94,0.12)'  :
            status === 'in-progress' ? 'rgba(255,107,0,0.12)'  :
                                       'rgba(30,41,59,0.6)',
          boxShadow:
            status === 'in-progress' ? '0 0 0 4px rgba(255,107,0,0.14)' : 'none',
        }}
      >
        {status === 'in-progress' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid #FF6B00' }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <Icon size={16} style={{ color }} />
      </motion.div>
    </div>
  )
}

function Timeline({ steps }) {
  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start justify-between w-full relative">
        {/* Background track */}
        <div className="absolute top-[21px] left-5 right-5 h-px bg-white/[0.06]" style={{ zIndex: 0 }} />

        {/* Animated progress fill */}
        {(() => {
          const completed = steps.filter(s => s.status === 'completed' || s.status === 'in-progress').length
          const pct = ((completed - 0.5) / (steps.length - 1)) * 100
          return (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, pct)}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[21px] left-5 h-px bg-gradient-to-r from-[#22C55E] to-[#FF6B00]"
              style={{ zIndex: 0 }}
            />
          )
        })()}

        {TIMELINE_STEPS.map((step, index) => {
          const stepData = steps.find(s => s.id === step.id)
          const status   = stepData?.status ?? 'pending'
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1 relative" style={{ zIndex: 1 }}>
              <StepNode step={step} status={status} index={index} />
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 + 0.2 }}
                className="text-[11px] text-center leading-tight max-w-[80px]"
                style={{
                  color:
                    status === 'completed'   ? '#22C55E' :
                    status === 'in-progress' ? '#FF8C3A' :
                                               '#475569',
                  fontWeight: status !== 'pending' ? 600 : 400,
                }}
              >
                {step.label}
              </motion.span>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col gap-0 w-full">
        {TIMELINE_STEPS.map((step, index) => {
          const stepData = steps.find(s => s.id === step.id)
          const status   = stepData?.status ?? 'pending'
          const Icon     = step.icon
          const color    = getStepColor(status)
          const isLast   = index === TIMELINE_STEPS.length - 1

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full border-2 relative flex-shrink-0"
                  style={{
                    borderColor: color,
                    backgroundColor:
                      status === 'completed'   ? 'rgba(34,197,94,0.12)'  :
                      status === 'in-progress' ? 'rgba(255,107,0,0.12)'  :
                                                 'rgba(30,41,59,0.6)',
                  }}
                >
                  {status === 'in-progress' && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid #FF6B00' }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <Icon size={15} style={{ color }} />
                </div>
                {!isLast && (
                  <div
                    className="w-px flex-1 my-1"
                    style={{
                      backgroundColor: status === 'completed' ? '#22C55E33' : 'rgba(255,255,255,0.05)',
                      minHeight: '28px',
                    }}
                  />
                )}
              </div>

              <div className="pt-1.5 pb-5">
                <span
                  className="text-sm leading-tight font-medium"
                  style={{
                    color:
                      status === 'completed'   ? '#22C55E' :
                      status === 'in-progress' ? '#FF8C3A' :
                                                 '#475569',
                  }}
                >
                  {step.label}
                </span>
                {status === 'in-progress' && (
                  <p className="text-[11px] mt-0.5 text-[#FF6B00]/70">En curso</p>
                )}
                {status === 'completed' && (
                  <p className="text-[11px] mt-0.5 text-[#22C55E]/60">Completado</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

function PackageDetails({ result }) {
  const details = [
    { label: 'Tipo de envío', value: result.packageType, icon: Package },
    { label: 'Peso',          value: result.weight,       icon: Package },
    { label: 'Ruta',          value: result.route,        icon: MapPin  },
    { label: 'N° de Guía',    value: result.trackingNumber, icon: Search },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="mt-8 space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {details.map((det, i) => {
          const Icon = det.icon
          return (
            <motion.div
              key={det.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.07 }}
              className="bg-[#060810] border border-white/[0.06] rounded-xl p-4
                         hover:border-white/[0.10] transition-colors duration-200"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600 mb-1.5">
                {det.label}
              </p>
              <p className="text-sm font-semibold text-white break-all leading-snug">
                {det.value}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Estimated delivery — full width */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5 }}
        className="rounded-xl p-4 border flex items-center gap-3"
        style={{
          backgroundColor: 'rgba(255,107,0,0.06)',
          borderColor:     'rgba(255,107,0,0.20)',
        }}
      >
        <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/25
                        flex items-center justify-center shrink-0">
          <Clock size={16} style={{ color: '#FF6B00' }} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#FF6B00]/70 mb-0.5">
            Entrega estimada
          </p>
          <p className="text-sm font-semibold text-white">{result.estimatedDelivery}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Tracking() {
  const [inputValue, setInputValue] = useState('')
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')
  const hasSearched = useRef(false)

  const isValidFormat = TRACKING_FORMAT.test(inputValue.trim())

  function handleInputChange(e) {
    const val = e.target.value.toUpperCase()
    setInputValue(val)
    setError('')
  }

  function handleSearch() {
    const trimmed = inputValue.trim().toUpperCase()
    hasSearched.current = true

    if (!trimmed) {
      setError('Ingresá un número de rastreo.')
      return
    }

    if (!TRACKING_FORMAT.test(trimmed)) {
      setError('Formato inválido. El número debe tener el formato CMXXXXXXXUY.')
      setResult(null)
      return
    }

    setError('')
    setResult({ ...MOCK_RESULT, trackingNumber: trimmed })
  }

  function handleClear() {
    setInputValue('')
    setResult(null)
    setError('')
    hasSearched.current = false
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <section
      id="rastreo"
      className="relative py-24 lg:py-32 bg-[#07080F]"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,107,0,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#FF6B00] text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
        >
          Seguimiento
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-white leading-[1.05] mb-3
                     text-[clamp(2rem,5vw,3.25rem)]"
        >
          Sabé siempre dónde
          <br />está tu envío.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-slate-500 text-sm leading-relaxed mb-10 max-w-lg"
        >
          Rastreo en tiempo real para envíos nacionales e internacionales.
          Ingresá tu número de guía o probá con <span className="font-mono text-slate-400">CM1234567UY</span>.
        </motion.p>

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0C1018] border border-white/[0.07] rounded-2xl p-6 md:p-8
                     backdrop-blur-sm"
        >
          {/* Input row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="CM1234567UY"
                maxLength={12}
                spellCheck={false}
                className="w-full rounded-xl py-3.5 pl-11 pr-10 text-white
                           placeholder:text-slate-700 outline-none font-mono text-sm
                           bg-[#060810] border transition-all duration-200
                           focus:shadow-[0_0_0_3px_rgba(255,107,0,0.12)]"
                style={{
                  borderColor: error
                    ? 'rgba(239,68,68,0.5)'
                    : isValidFormat && inputValue
                    ? 'rgba(255,107,0,0.5)'
                    : 'rgba(255,255,255,0.08)',
                }}
                aria-label="Número de rastreo"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                             text-slate-600 hover:text-slate-400 transition-colors"
                  aria-label="Limpiar"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <motion.button
              onClick={handleSearch}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                         font-semibold text-white text-sm flex-shrink-0
                         bg-[#FF6B00] hover:bg-[#FF8C3A]
                         shadow-[0_0_20px_rgba(255,107,0,0.3)]
                         hover:shadow-[0_0_28px_rgba(255,107,0,0.45)]
                         transition-all duration-200"
            >
              <Search size={15} />
              Rastrear
            </motion.button>
          </div>

          {/* Format hint */}
          <p className="mt-2.5 text-[11px] text-slate-700">
            Formato:{' '}
            <span className="font-mono text-slate-600">CMXXXXXXXUY</span>
          </p>

          {/* Validation error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 border overflow-hidden"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.07)',
                  borderColor:     'rgba(239,68,68,0.2)',
                }}
              >
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                {/* Result header */}
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600 mb-1">
                      Número de guía
                    </p>
                    <p className="font-mono font-bold text-lg text-[#FF8C3A] leading-none">
                      {result.trackingNumber}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0"
                    style={{
                      backgroundColor: 'rgba(255,107,0,0.09)',
                      borderColor:     'rgba(255,107,0,0.25)',
                      color:           '#FF8C3A',
                    }}
                  >
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B00]"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    En tránsito
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-white/[0.05] mb-8" />

                {/* Timeline */}
                <Timeline steps={result.steps} />

                {/* Package details */}
                <PackageDetails result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
