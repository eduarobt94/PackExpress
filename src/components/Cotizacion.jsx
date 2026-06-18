import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, FileText, CheckCircle, MapPin, Weight, Ruler,
  ChevronDown, X, Search, Loader2, AlertTriangle, Tag,
} from 'lucide-react'

/* ── Zone labels ────────────────────────────────────────────────────────────── */
const ZONE_LABELS = {
  A: 'Zona A — Miami',
  B: 'Zona B — Centro América',
  C: 'Zona C — Caribe Sur / CUBA',
  D: 'Zona D — Caribe Sur / CUBA',
  E: 'Zona E — Sudamérica',
  F: 'Zona F — Caribe / Canadá',
  G: 'Zona G — Europa Occidental',
  H: 'Zona H — Europa Oriental / Asia',
  I: 'Zona I — Resto del Mundo',
}

/* ── Country → Zone ─────────────────────────────────────────────────────────── */
const COUNTRY_ZONE = {
  'Estados Unidos': 'A',
  'México': 'B', 'Guatemala': 'B', 'Belice': 'B', 'Honduras': 'B',
  'El Salvador': 'B', 'Nicaragua': 'B', 'Costa Rica': 'B', 'Panamá': 'B',
  'Colombia': 'C', 'República Dominicana': 'C', 'Puerto Rico': 'C', 'Venezuela': 'C',
  'Cuba': 'D', 'Jamaica': 'D', 'Haití': 'D', 'Trinidad y Tobago': 'D',
  'Aruba': 'D', 'Curazao': 'D', 'Barbados': 'D',
  'Ecuador': 'E', 'Perú': 'E', 'Bolivia': 'E', 'Argentina': 'E',
  'Chile': 'E', 'Brasil': 'E', 'Paraguay': 'E', 'Guyana': 'E', 'Surinam': 'E',
  'Canadá': 'F', 'Bahamas': 'F',
  'España': 'G', 'Portugal': 'G', 'Francia': 'G', 'Alemania': 'G',
  'Italia': 'G', 'Reino Unido': 'G', 'Países Bajos': 'G', 'Bélgica': 'G',
  'Suiza': 'G', 'Austria': 'G', 'Irlanda': 'G', 'Suecia': 'G',
  'Noruega': 'G', 'Dinamarca': 'G', 'Finlandia': 'G', 'Grecia': 'G',
  'Polonia': 'G', 'República Checa': 'G', 'Hungría': 'G', 'Rumanía': 'G', 'Croacia': 'G',
  'Ucrania': 'H', 'Turquía': 'H', 'Israel': 'H',
  'China': 'H', 'Japón': 'H', 'India': 'H', 'Corea del Sur': 'H',
  'Tailandia': 'H', 'Vietnam': 'H', 'Indonesia': 'H', 'Malasia': 'H',
  'Filipinas': 'H', 'Singapur': 'H', 'Taiwán': 'H',
  'Emiratos Árabes Unidos': 'H', 'Arabia Saudita': 'H', 'Qatar': 'H',
  'Australia': 'I', 'Nueva Zelanda': 'I',
  'Sudáfrica': 'I', 'Nigeria': 'I', 'Kenia': 'I', 'Egipto': 'I',
  'Marruecos': 'I', 'Tanzania': 'I', 'Ghana': 'I',
}

/* ── Regions for CountrySelect ──────────────────────────────────────────────── */
const REGIONS = {
  'América del Sur': {
    countries: ['Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Perú', 'Surinam', 'Venezuela'],
  },
  'América Central y Caribe': {
    countries: ['Aruba', 'Barbados', 'Costa Rica', 'Cuba', 'Curazao', 'El Salvador', 'Guatemala', 'Haití', 'Honduras', 'Jamaica', 'Nicaragua', 'Panamá', 'Puerto Rico', 'República Dominicana', 'Trinidad y Tobago'],
  },
  'América del Norte': {
    countries: ['Bahamas', 'Canadá', 'Estados Unidos', 'México'],
  },
  'Europa': {
    countries: ['Alemania', 'Austria', 'Bélgica', 'Croacia', 'Dinamarca', 'España', 'Finlandia', 'Francia', 'Grecia', 'Hungría', 'Irlanda', 'Italia', 'Noruega', 'Países Bajos', 'Polonia', 'Portugal', 'Reino Unido', 'República Checa', 'Rumanía', 'Suecia', 'Suiza', 'Ucrania'],
  },
  'Asia': {
    countries: ['Arabia Saudita', 'China', 'Corea del Sur', 'Emiratos Árabes Unidos', 'Filipinas', 'India', 'Indonesia', 'Israel', 'Japón', 'Malasia', 'Qatar', 'Singapur', 'Tailandia', 'Taiwán', 'Turquía', 'Vietnam'],
  },
  'Oceanía': { countries: ['Australia', 'Nueva Zelanda'] },
  'África': {
    countries: ['Egipto', 'Ghana', 'Kenia', 'Marruecos', 'Nigeria', 'Sudáfrica', 'Tanzania'],
  },
}

/* ── API ────────────────────────────────────────────────────────────────────── */
const API = '/pack-sistema/api/v1'

async function apiGetZonas() {
  try {
    const res  = await fetch(`${API}/tarifario.php?action=zonas`)
    const json = await res.json()
    if (!json.ok) return {}
    // Convertir array [{nombre, zona_cod}] a objeto {nombre: zona_cod}
    return Object.fromEntries(json.data.map(p => [p.nombre, p.zona_cod]))
  } catch { return {} }
}

async function apiCotizarTodas({ peso, tipo_servicio_id }) {
  const res = await fetch(`${API}/tarifario.php?action=cotizar_todas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peso, tipo_servicio_id }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error ?? 'Sin tarifas disponibles')
  return json.data
}

async function apiGetTipos() {
  try {
    const res  = await fetch(`${API}/tarifario.php?action=tipos`)
    const json = await res.json()
    return json.ok ? json.data : []
  } catch { return [] }
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const usd = n => Number(n).toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = n => `${(n * 100).toFixed(1)}%`

/* ── Shared styles ──────────────────────────────────────────────────────────── */
const inputCls = `
  w-full rounded-xl px-4 py-3 text-[var(--fg-1)] placeholder-[var(--fg-4)] text-sm outline-none
  bg-[var(--bg-input)] border border-[var(--bd-2)]
  focus:border-[#FF6B00]/50 focus:shadow-[0_0_0_3px_rgba(255,107,0,0.10)]
  transition-all duration-200
`

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

/* ── CountrySelect ──────────────────────────────────────────────────────────── */
function CountrySelect({ value, onChange }) {
  const [open,    setOpen]    = useState(false)
  const [search,  setSearch]  = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef   = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (btnRef.current && !btnRef.current.closest('[data-country-select]').contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      const rect = btnRef.current?.getBoundingClientRect()
      if (rect) {
        const dropH = 340
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
        .map(([r, d]) => [r, { ...d, countries: d.countries.filter(c => c.toLowerCase().includes(q)) }])
        .filter(([, d]) => d.countries.length > 0)
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
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
            className="rounded-xl overflow-hidden border border-[var(--bd-2)] bg-[var(--bg-elevated)]
                       shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
          >
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

/* ── ResultPanel ─────────────────────────────────────────────────────────────
   Muestra el desglose real de la API para la zona del país seleccionado
   ─────────────────────────────────────────────────────────────────────────── */
function ResultPanel({ cotizacion, zona, pais, descuento, pesoEfectivo }) {
  if (!cotizacion) return null

  const z = cotizacion.zonas.find(z => z.zona_cod === zona)
  if (!z || !z.disponible) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)]">
        <AlertTriangle size={14} className="text-red-400 shrink-0" />
        <p className="text-[12px] text-red-400">Sin tarifa disponible para esta zona</p>
      </div>
    )
  }

  const hasExtra   = z.kg_adicional > 0
  const hasDcto    = descuento > 0
  const montoDesc  = hasDcto ? z.total * (descuento / 100) : 0
  const totalFinal = hasDcto ? z.total - montoDesc : z.total
  const isMin      = z.total === Math.min(...cotizacion.zonas.filter(x => x.disponible).map(x => x.total))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-3"
    >
      {/* Zona + País */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black"
            style={{ background: '#FF6B00', color: '#fff', fontFamily: 'monospace' }}
          >
            {zona}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--fg-1)]">{pais}</div>
            <div className="text-[10.5px] text-[var(--fg-4)]">{ZONE_LABELS[zona]}</div>
          </div>
        </div>
        {isMin && (
          <span className="text-[9.5px] font-bold text-green-400 bg-green-400/10 border border-green-400/20
                           rounded-md px-2 py-0.5 uppercase tracking-wider">
            ✓ Menor precio
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--bd-1)]" />

      {/* Desglose */}
      <div className="space-y-2">
        {/* Peso efectivo (info) */}
        <div className="flex justify-between text-[12px]">
          <span className="text-[var(--fg-4)]">Peso facturado</span>
          <span className="text-[var(--fg-2)] font-medium">{Number(pesoEfectivo).toFixed(2)} kg</span>
        </div>

        {/* Precio base */}
        <div className="flex justify-between text-[12px]">
          <span className="text-[var(--fg-4)]">
            Precio base
            <span className="ml-1 text-[10.5px]">
              ({hasExtra
                ? `cubre ${(z.subtotal === z.precio_base ? cotizacion.peso_kg - z.kg_adicional : cotizacion.peso_kg - z.kg_adicional).toFixed(1)} kg`
                : `${cotizacion.peso_kg} kg`})
            </span>
          </span>
          <span className="text-[var(--fg-2)]">USD {usd(z.precio_base)}</span>
        </div>

        {/* Kg adicionales */}
        {hasExtra && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[#FF6B00]">
              +{z.kg_adicional} kg adicionales
              <span className="ml-1 text-[10.5px] text-[var(--fg-4)]">(USD {usd(z.precio_kg_adicional)}/kg)</span>
            </span>
            <span className="text-[#FF6B00]">+USD {usd(z.costo_adicional)}</span>
          </div>
        )}

        {/* Fuel + Utilidad */}
        {(z.fuel + z.utilidad) > 0 && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[var(--fg-4)]">
              Fuel + Utilidad
              <span className="ml-1 text-[10.5px]">({pct(cotizacion.fuel_pct)} + {pct(cotizacion.utilidad_pct)})</span>
            </span>
            <span className="text-[var(--fg-4)]">+USD {usd(z.fuel + z.utilidad)}</span>
          </div>
        )}

        {/* Descuento */}
        {hasDcto && (
          <div className="flex justify-between text-[12px]">
            <span className="text-green-400">Descuento {descuento}%</span>
            <span className="text-green-400">−USD {usd(montoDesc)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--bd-1)]" />

      {/* Total */}
      <div className="flex items-end justify-between">
        <span className="font-display font-bold text-base text-[var(--fg-1)]">Total estimado</span>
        <div className="text-right">
          {hasDcto && (
            <div
              className="text-[13px] font-mono text-[var(--fg-4)] line-through leading-none mb-0.5"
            >
              USD {usd(z.total)}
            </div>
          )}
          <motion.div
            key={totalFinal}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-display font-bold text-3xl flex items-baseline gap-1.5"
            style={{ color: hasDcto ? '#22C55E' : '#FF6B00' }}
          >
            <span className="text-lg font-bold opacity-60 self-start mt-1">USD</span>
            {usd(totalFinal)}
          </motion.div>
        </div>
      </div>

      {/* Tarifa kg extra (referencia) */}
      {z.precio_kg_adicional > 0 && (
        <div className="text-[11px] text-[var(--fg-5)] text-center">
          Tarifa por kg adicional: <span className="text-[var(--fg-3)] font-medium">USD {usd(z.precio_kg_adicional)}/kg</span>
        </div>
      )}
    </motion.div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function Cotizacion({ onClose }) {
  const [weight,      setWeight]      = useState('')
  const [largo,       setLargo]       = useState('')
  const [ancho,       setAncho]       = useState('')
  const [alto,        setAlto]        = useState('')
  const [country,     setCountry]     = useState('')
  const [tipo,        setTipo]        = useState('PKG')
  const [descuento,   setDescuento]   = useState('')
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [apiError,    setApiError]    = useState('')
  const [tipos,       setTipos]       = useState([])
  const [submitted,   setSubmitted]   = useState(false)
  const [zonaMap,     setZonaMap]     = useState(COUNTRY_ZONE) // inicia con fallback estático

  // Fetch tipos y zonas on mount
  useEffect(() => {
    apiGetTipos().then(setTipos)
    apiGetZonas().then(dynamic => {
      if (Object.keys(dynamic).length > 0) setZonaMap(dynamic)
    })
  }, [])

  const zona         = country ? (zonaMap[country] ?? null) : null
  const docId        = tipos.find(t => t.codigo === 'DOC')?.id ?? 1
  const pkgId        = tipos.find(t => t.codigo === 'PKG')?.id ?? 2
  const tipoId       = tipo === 'DOC' ? docId : pkgId
  const descuentoPct = parseFloat(descuento) || 0

  /* Peso efectivo = max(real, volumétrico) */
  const pesoEfectivo = useMemo(() => {
    const w = parseFloat(weight)
    const l = parseFloat(largo)
    const a = parseFloat(ancho)
    const h = parseFloat(alto)
    if (isNaN(w) || w <= 0) return 0
    if (!isNaN(l) && !isNaN(a) && !isNaN(h) && l > 0 && a > 0 && h > 0) {
      const dimW = (l * a * h) / 5000
      return Math.max(w, dimW)
    }
    return w
  }, [weight, largo, ancho, alto])

  const dimWeight = useMemo(() => {
    const l = parseFloat(largo), a = parseFloat(ancho), h = parseFloat(alto)
    if (!isNaN(l) && !isNaN(a) && !isNaN(h) && l > 0 && a > 0 && h > 0)
      return ((l * a * h) / 5000).toFixed(2)
    return null
  }, [largo, ancho, alto])

  const isValid = Boolean(
    pesoEfectivo > 0 && pesoEfectivo <= 500 && country && zona
  )

  const handleCotizar = useCallback(async () => {
    if (!isValid || loading) return
    setLoading(true)
    setApiError('')
    setResult(null)
    try {
      const data = await apiCotizarTodas({ peso: pesoEfectivo, tipo_servicio_id: tipoId })
      setResult(data)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isValid, loading, pesoEfectivo, tipoId])

  const handleSubmit = e => {
    e?.preventDefault()
    if (!isValid || !result) return
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    setWeight(''); setLargo(''); setAncho(''); setAlto('')
    setCountry(''); setDescuento(''); setResult(null); setApiError('')
  }

  /* Reset result when inputs change */
  useEffect(() => { setResult(null); setApiError('') }, [weight, largo, ancho, alto, country, tipo])

  return (
    <div className="bg-[var(--bg-alt)] border border-[var(--bd-1)] rounded-2xl shadow-[var(--shadow-modal)]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
            Tarifas reales · precio al instante · sin compromisos
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

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 lg:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_360px] gap-4 lg:gap-5 items-start">

          {/* LEFT: Form ──────────────────────────────────────────────────── */}
          <div className="bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl p-5 sm:p-6 lg:p-7">
            <AnimatePresence mode="wait">
              {submitted ? (
                /* ── Success state ── */
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
                    className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--bd-2)]
                               text-[var(--fg-3)] hover:border-[#FF6B00]/40 hover:text-[#FF6B00]
                               transition-all duration-200"
                  >
                    Nueva cotización
                  </button>
                </motion.div>
              ) : (
                /* ── Form ── */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >

                  {/* Tipo DOC / PKG */}
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--fg-2)] mb-2.5">
                      <Package size={13} className="text-[#FF6B00]" />
                      Tipo de envío
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'DOC', label: 'Documentos', desc: 'Papeles y sobres', Icon: FileText },
                        { id: 'PKG', label: 'Paquetería',  desc: 'Mercancías',       Icon: Package  },
                      ].map(({ id, label, desc, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTipo(id)}
                          className="flex items-center gap-2 px-3 py-3 rounded-xl border text-left
                                     transition-all duration-200"
                          style={{
                            borderColor:  tipo === id ? 'rgba(255,107,0,0.45)' : 'var(--bd-2)',
                            background:   tipo === id ? 'rgba(255,107,0,0.07)' : 'var(--bg-input)',
                          }}
                        >
                          <Icon
                            size={15}
                            style={{ color: tipo === id ? '#FF6B00' : 'var(--fg-4)', flexShrink: 0 }}
                          />
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold truncate"
                                 style={{ color: tipo === id ? '#FF6B00' : 'var(--fg-2)' }}>
                              {label}
                            </div>
                            <div className="text-[10px] text-[var(--fg-5)] truncate">{desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Peso */}
                  <Field label="Peso (kg)" icon={Weight}>
                    <input
                      type="number" min="0.1" max="500" step="0.1"
                      placeholder="Ej: 2.5"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  {/* Dimensiones */}
                  <Field label="Dimensiones — opcional, peso volumétrico" icon={Ruler}>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: largo, setter: setLargo, placeholder: 'Largo' },
                        { value: ancho, setter: setAncho, placeholder: 'Ancho' },
                        { value: alto,  setter: setAlto,  placeholder: 'Alto'  },
                      ].map(({ value, setter, placeholder }) => (
                        <div key={placeholder} className="relative">
                          <input
                            type="number" min="0.1" step="0.1"
                            placeholder={placeholder}
                            value={value}
                            onChange={e => setter(e.target.value)}
                            className={inputCls + ' pr-7 text-[13px]'}
                            style={{ paddingLeft: '10px' }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--fg-5)]">cm</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-[var(--fg-5)] mt-1.5">Largo × Ancho × Alto (cm) · se usa el mayor entre real y volumétrico</p>
                  </Field>

                  {/* País de destino */}
                  <Field label="País de destino" icon={MapPin}>
                    <CountrySelect value={country} onChange={setCountry} />
                    {/* Zona badge */}
                    <AnimatePresence>
                      {zona && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2 mt-2.5 px-3 py-2 rounded-lg"
                          style={{
                            background:   'rgba(255,107,0,0.07)',
                            border:       '1px solid rgba(255,107,0,0.22)',
                          }}
                        >
                          <MapPin size={11} className="text-[#FF6B00] shrink-0" />
                          <span className="text-[11.5px] font-semibold text-[#FF6B00]">
                            {ZONE_LABELS[zona]}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Field>

                  {/* Descuento */}
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--fg-2)] mb-2.5">
                      <Tag size={13} className="text-[#FF6B00]" />
                      Descuento <span className="font-normal text-[var(--fg-5)] ml-1">— opcional</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" min="0" max="100" step="1"
                        placeholder="0"
                        value={descuento}
                        onChange={e => setDescuento(e.target.value)}
                        className={inputCls + ' pr-10'}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[var(--fg-4)]">%</span>
                    </div>
                  </div>

                  {/* Cotizar button */}
                  <motion.button
                    type="button"
                    onClick={handleCotizar}
                    disabled={!isValid || loading}
                    whileHover={isValid && !loading ? { scale: 1.02 } : {}}
                    whileTap={isValid && !loading ? { scale: 0.98 } : {}}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                               flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isValid && !loading ? '#FF6B00' : 'rgba(255,255,255,0.04)',
                      color:           isValid && !loading ? 'white'   : 'var(--fg-5)',
                      cursor:          isValid && !loading ? 'pointer' : 'not-allowed',
                      boxShadow:       isValid && !loading ? '0 0 28px rgba(255,107,0,0.30)' : 'none',
                    }}
                  >
                    {loading
                      ? <><Loader2 size={15} className="animate-spin" /> Calculando…</>
                      : 'Ver precio'}
                  </motion.button>

                  {apiError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                                    bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)]">
                      <AlertTriangle size={13} className="text-red-400 shrink-0" />
                      <p className="text-[12px] text-red-400">{apiError}</p>
                    </div>
                  )}

                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Price panel ──────────────────────────────────────────── */}
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
                <p className="text-[var(--fg-4)] text-xs mt-1.5">Tarifas reales · estimación en USD</p>
              </div>

              <div className="px-7 py-6 space-y-5">

                {/* Peso info (always visible when entered) */}
                <AnimatePresence mode="wait">
                  {pesoEfectivo > 0 && (
                    <motion.div
                      key="peso-info"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[var(--fg-4)]">Peso real</span>
                        <span className="text-[var(--fg-3)]">{parseFloat(weight || 0).toFixed(2)} kg</span>
                      </div>
                      {dimWeight && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[var(--fg-4)]">Peso volumétrico</span>
                          <span className="text-[var(--fg-3)]">{dimWeight} kg</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[var(--fg-4)]">Peso facturado</span>
                        <span className="text-[var(--fg-1)] font-semibold">{pesoEfectivo.toFixed(2)} kg</span>
                      </div>
                      {country && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[var(--fg-4)]">Destino</span>
                          <span className="text-[var(--fg-3)]">{country}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                {pesoEfectivo > 0 && <div className="h-px bg-[var(--bd-1)]" />}

                {/* Result */}
                <AnimatePresence mode="wait">
                  {result && zona ? (
                    <ResultPanel
                      key="result"
                      cotizacion={result}
                      zona={zona}
                      pais={country}
                      descuento={descuentoPct}
                      pesoEfectivo={pesoEfectivo}
                    />
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-base text-[var(--fg-1)]">Total estimado</span>
                        <span className="font-display font-bold text-3xl" style={{ color: 'var(--fg-5)' }}>—</span>
                      </div>
                      {!isValid && (
                        <p className="text-[11px] text-[var(--fg-5)] text-center mt-2">
                          Completá el formulario para ver el precio
                        </p>
                      )}
                      {isValid && !loading && !result && (
                        <p className="text-[11px] text-[var(--fg-5)] text-center mt-2">
                          Hacé clic en "Ver precio" para cotizar
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA — solo aparece cuando hay result */}
                {result && zona && !submitted && (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-bold text-sm text-white
                               transition-all duration-300"
                    style={{
                      background: '#FF6B00',
                      boxShadow: '0 0 28px rgba(255,107,0,0.35)',
                    }}
                  >
                    Solicitar cotización
                  </motion.button>
                )}

                {submitted && (
                  <div className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl
                                  bg-[#22C55E]/10 border border-[#22C55E]/25">
                    <CheckCircle size={16} className="text-[#22C55E]" />
                    <span className="text-sm font-semibold text-[#22C55E]">¡Cotización enviada!</span>
                  </div>
                )}

                <p className="text-[11px] text-[var(--fg-5)] text-center">
                  * Estimación basada en tarifas vigentes. El precio final se confirma al gestionar el envío.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
