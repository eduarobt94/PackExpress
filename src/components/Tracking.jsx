import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, AlertCircle,
  Package, Plane, MapPin, Building2, Shield, ShieldCheck, Truck, CheckCircle2,
  Circle, Loader2, Home,
} from 'lucide-react'
import { useTracking, TRACK_PHASE } from '../hooks/useTracking'
import { parseGuiaInput }                    from '../lib/tracking/api'
import { formatRawEventDate, getEventIconName } from '../lib/tracking/normalizer'

/* ── Mapa de íconos por nombre ───────────────────────────────────── */
const ICON_MAP = {
  Package, Plane, MapPin, Building2,
  Shield, ShieldCheck, Truck, CheckCircle2, Circle,
}

/**
 * Eventos de Copa Courier inferidos cuando Copa no devuelve datos pero
 * Destino ZAS confirma que el paquete llegó a Cuba.
 * Se muestran sin fecha (solo el recorrido).
 */
const COPA_INFERRED_EVENTS = [
  { estado: 'ENVIO RECIBIDO EN ORIGEN',    lugar: 'Montevideo, Uruguay',     fecha: '', inferred: true },
  { estado: 'PARTIENDO DE ORIGEN - MVD',   lugar: 'Montevideo → Panamá',     fecha: '', inferred: true },
  { estado: 'RECIBIDO EN TRÁNSITO - PTY',  lugar: 'Ciudad de Panamá, PA',    fecha: '', inferred: true },
  { estado: 'PARTIENDO DE TRÁNSITO - PTY', lugar: 'Panamá → La Habana',      fecha: '', inferred: true },
  { estado: 'LLEGADO A DESTINO - HAV',     lugar: 'La Habana, Cuba',         fecha: '', inferred: true },
]

/* ── Configuración de las 3 fases ───────────────────────────────── */
const PHASES = [
  {
    key:          'copa_courier',
    label:        'Copa Courier',
    subtitle:     'Tránsito internacional',
    Icon:         Plane,
    accent:       '#527ED8',
    accentDim:    'rgba(82,126,216,0.11)',
    accentBorder: 'rgba(82,126,216,0.28)',
  },
  {
    key:          'correos_cuba',
    label:        'Correos Cuba',
    subtitle:     'Red postal cubana',
    Icon:         Building2,
    accent:       '#6688BE',
    accentDim:    'rgba(102,136,190,0.10)',
    accentBorder: 'rgba(102,136,190,0.24)',
  },
  {
    key:          'destino_zas',
    label:        'Destino ZAS',
    subtitle:     'Distribución local',
    Icon:         Truck,
    accent:       '#F07232',
    accentDim:    'rgba(240,114,50,0.10)',
    accentBorder: 'rgba(240,114,50,0.25)',
  },
]

/* ── Mensajes de error ───────────────────────────────────────────── */
function getErrorMessage(code) {
  if (code === 'NOT_FOUND')     return 'No encontramos resultados para ese número de guía. Verificá que esté bien escrito.'
  if (code === 'NETWORK_ERROR') return 'No hay conexión con el servidor. Verificá tu internet e intentá de nuevo.'
  return 'Ocurrió un error al consultar el servidor. Intentá de nuevo en unos momentos.'
}

/* ════════════════════════════════════════════════════════════════════
   SUBCOMPONENTES
═══════════════════════════════════════════════════════════════════ */

/* ── Spinner inicial ────────────────────────────────────────────── */
function SearchingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col items-center justify-center py-12 gap-4"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--bd-2)' }} />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#F07232' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <p className="text-sm" style={{ color: 'var(--fg-3)' }}>Buscando información…</p>
    </motion.div>
  )
}

/* ── Fila esqueleto (placeholder de carga) ──────────────────────── */
function SkeletonRow({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, delay }}
      className="flex items-start gap-3"
    >
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--bd-2)' }} />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 rounded" style={{ background: 'var(--bd-2)', width: `${55 + delay * 15}%` }} />
        <div className="h-2.5 rounded" style={{ background: 'var(--bd-1)', width: '38%' }} />
      </div>
    </motion.div>
  )
}

/* ── Lista de eventos de una fase ───────────────────────────────── */
function EventList({ events, accent }) {
  // Filtrar eventos sintéticos sin fecha para mostrarlos de forma sutil
  const withDate    = events.filter(e => e.fecha?.trim())
  const withoutDate = events.filter(e => !e.fecha?.trim())
  const all = [...withDate, ...withoutDate]

  if (all.length === 0) {
    return (
      <p className="text-[12px] py-1" style={{ color: 'var(--fg-5)' }}>
        Sin eventos detallados
      </p>
    )
  }

  return (
    <div>
      {all.map((ev, i) => {
        const Icon       = ICON_MAP[getEventIconName(ev.estado)] ?? Package
        const isLast     = i === all.length - 1
        const fecha      = formatRawEventDate(ev.fecha)
        // Evento sintético (Correos Cuba sin fecha, no inferido): italic sutil
        const isSynth    = !ev.fecha?.trim() && !ev.inferred
        // Evento inferido de Copa: normal pero sin fecha
        const isInferred = Boolean(ev.inferred)

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06 }}
            className="flex gap-3"
          >
            {/* Columna izquierda: punto + línea */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: isSynth ? 'var(--fg-5)' : accent }}
              />
              {!isLast && (
                <div
                  className="w-px flex-1 my-0.5"
                  style={{ backgroundColor: `${accent}28`, minHeight: '14px' }}
                />
              )}
            </div>

            {/* Contenido */}
            <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-3'}`}>
              <div className="flex items-start gap-1.5">
                <Icon
                  size={12}
                  className="mt-0.5 flex-shrink-0"
                  style={{
                    color:   isSynth ? 'var(--fg-5)' : accent,
                    opacity: isSynth ? 0.6 : isInferred ? 0.7 : 0.85,
                  }}
                />
                <p
                  className="text-[13px] leading-snug break-words"
                  style={{
                    color:      isSynth   ? 'var(--fg-4)' : accent,
                    fontWeight: isSynth   ? 400 : 500,
                    fontStyle:  isSynth   ? 'italic' : 'normal',
                    opacity:    isInferred ? 0.75 : 1,
                  }}
                >
                  {ev.estado || '—'}
                </p>
              </div>
              {/* Para eventos inferidos solo mostramos el lugar, nunca la fecha */}
              {(fecha || ev.lugar) && (
                <p className="text-[11px] mt-0.5 ml-[18px]" style={{ color: 'var(--fg-4)', opacity: isInferred ? 0.7 : 1 }}>
                  {isInferred
                    ? ev.lugar                                   // solo ubicación, sin fecha
                    : [fecha, ev.lugar].filter(Boolean).join(' · ')
                  }
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Tarjeta de resumen ZAS (con peso, destino y estado) ────────── */
function ZasSummaryCard({ phaseData, guia }) {
  if (!phaseData?.found) return null

  const estadoUp   = (phaseData.estado_actual ?? '').toUpperCase()
  const isDelivered = estadoUp.includes('ENTREGAD') ||
    (phaseData.events ?? []).some(e => e.estado?.toUpperCase().includes('ENTREGAD'))

  const accent       = isDelivered ? '#22C55E'                : '#64748B'
  const accentDim    = isDelivered ? 'rgba(34,197,94,0.09)'   : 'rgba(100,116,139,0.07)'
  const accentBorder = isDelivered ? 'rgba(34,197,94,0.28)'   : 'rgba(100,116,139,0.20)'

  // Destino: municipio / provincia desde la guía, fallback "Cuba"
  const destParts  = [guia?.municipio_dest, guia?.provincia_dest].filter(Boolean)
  const destDetail = destParts.length > 0 ? destParts.join(', ') : null
  const peso       = guia?.peso_real ? parseFloat(guia.peso_real) : null
  const fechaFmt   = phaseData.fecha_estado
    ? (formatRawEventDate(phaseData.fecha_estado) ?? phaseData.fecha_estado)
    : null

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bd-1)' }}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: accentBorder, backgroundColor: accentDim }}
      >
        {/* Header: destino + badge estado */}
        <div
          className="flex items-center justify-between px-3.5 py-2.5 border-b"
          style={{ borderColor: accentBorder }}
        >
          <div className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: accent }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: accent }}
            >
              Destino final · Cuba
            </span>
          </div>

          <span
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={isDelivered
              ? { backgroundColor: 'rgba(34,197,94,0.14)',   color: '#4ADE80', borderColor: 'rgba(34,197,94,0.30)'    }
              : { backgroundColor: 'rgba(100,116,139,0.10)', color: '#94A3B8', borderColor: 'rgba(100,116,139,0.22)' }
            }
          >
            {isDelivered && <CheckCircle2 size={9} />}
            {isDelivered
              ? 'Entregado'
              : (phaseData.estado_actual || 'En tránsito')}
          </span>
        </div>

        {/* Body: ícono + info + peso */}
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            {/* Ícono de entrega */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{
                backgroundColor: isDelivered ? 'rgba(34,197,94,0.14)' : 'rgba(100,116,139,0.10)',
                borderColor:     accentBorder,
              }}
            >
              <Home size={15} style={{ color: accent }} />
            </div>

            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: isDelivered ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                Mipyme Destino ZAS
              </p>
              {destDetail && (
                <p className="text-[11px] mt-0.5" style={{ color: isDelivered ? 'var(--fg-3)' : 'var(--fg-5)' }}>
                  {destDetail}
                </p>
              )}
              {fechaFmt && (
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-5)' }}>{fechaFmt}</p>
              )}
            </div>
          </div>

          {/* Peso */}
          {peso != null && (
            <div className="text-right flex-shrink-0">
              <p
                className="text-xl font-bold leading-none tabular-nums"
                style={{ color: isDelivered ? '#4ADE80' : 'var(--fg-4)' }}
              >
                {peso % 1 === 0 ? peso : peso.toFixed(2)}
              </p>
              <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--fg-5)' }}>
                kg
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ── Tarjeta de una fase (Copa / Correos / ZAS) ─────────────────── */
function PhaseCard({ config, phaseData, loading, index, guia }) {
  const { Icon, label, subtitle, accent, accentDim, accentBorder } = config
  const found      = phaseData?.found
  const isInferred = Boolean(phaseData?.inferred)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor:     found ? accentBorder : 'var(--bd-1)',
        backgroundColor: 'var(--bg-elevated)',
      }}
    >
      {/* Header de la fase */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor:     found ? accentBorder : 'var(--bd-1)',
          backgroundColor: found ? accentDim     : 'transparent',
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Ícono de fase */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
            style={{
              backgroundColor: found ? accentDim    : 'transparent',
              borderColor:     found ? accentBorder : 'var(--bd-1)',
            }}
          >
            <Icon size={14} style={{ color: found ? accent : 'var(--fg-4)' }} />
          </div>

          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: found ? accent : 'var(--fg-3)' }}>
              {label}
            </p>
            <p className="text-[10px]" style={{ color: isInferred ? accent : 'var(--fg-4)', opacity: isInferred ? 0.7 : 1 }}>
              {isInferred ? 'Confirmado por Destino ZAS · Sin timestamps' : subtitle}
            </p>
          </div>
        </div>

        {/* Badge de estado / spinner */}
        {loading ? (
          <Loader2 size={13} className="animate-spin" style={{ color: 'var(--fg-4)' }} />
        ) : isInferred ? (
          /* Badge especial cuando el trayecto se infiere desde ZAS */
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ backgroundColor: accentDim, color: accent, borderColor: accentBorder, opacity: 0.8 }}
          >
            Trayecto confirmado
          </span>
        ) : (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={found
              ? { backgroundColor: accentDim, color: accent,        borderColor: accentBorder }
              : { backgroundColor: 'transparent', color: 'var(--fg-5)', borderColor: 'var(--bd-1)' }
            }
          >
            {found ? 'Encontrado' : 'Sin datos'}
          </span>
        )}
      </div>

      {/* Cuerpo: eventos o skeleton */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3.5">
            <SkeletonRow delay={0}   />
            <SkeletonRow delay={0.1} />
            <SkeletonRow delay={0.2} />
          </div>
        ) : !found ? (
          <p className="text-[12px] text-center py-2" style={{ color: 'var(--fg-5)' }}>
            Sin registros disponibles
          </p>
        ) : (
          <>
            {/* ZAS: estado actual destacado */}
            {config.key === 'destino_zas' && phaseData.estado_actual && (
              <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--bd-1)' }}>
                <p className="text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--fg-4)' }}>
                  Estado actual
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <CheckCircle2 size={15} style={{ color: accent }} />
                  <span className="text-sm font-semibold" style={{ color: accent }}>
                    {phaseData.estado_actual}
                  </span>
                  {phaseData.fecha_estado && (
                    <span className="text-[11px]" style={{ color: 'var(--fg-4)' }}>
                      {formatRawEventDate(phaseData.fecha_estado) ?? phaseData.fecha_estado}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Lista de eventos */}
            <EventList events={phaseData.events ?? []} accent={accent} />

            {/* ZAS: tarjeta resumen con peso y destino */}
            {config.key === 'destino_zas' && (
              <ZasSummaryCard phaseData={phaseData} guia={guia} />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ── Franja de información básica de la guía ────────────────────── */
function GuiaInfoBand({ state }) {
  if (!state) return null
  const { guia, manifiesto, numero } = state
  const route = guia?.ruta
    ? guia.ruta.replace('›', '→').replace('>', '→')
    : (guia?.origen && guia?.destino ? `${guia.origen} → ${guia.destino}` : null)

  const details = [
    guia?.tipo_bulto     && { label: 'Tipo',   value: guia.tipo_bulto },
    guia?.peso_real      && { label: 'Peso',   value: `${guia.peso_real} kg` },
    guia?.cantidad_bulto && { label: 'Bultos', value: String(guia.cantidad_bulto) },
    manifiesto?.vuelo    && { label: 'Vuelo',  value: manifiesto.vuelo },
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mt-7 pb-5 mb-5 border-b"
      style={{ borderColor: 'var(--bd-1)' }}
    >
      {/* Número de guía */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--fg-4)' }}>
          Número de guía
        </p>
        <p className="font-mono font-bold text-xl leading-none" style={{ color: '#FB923C' }}>
          {numero}
        </p>
        {route && (
          <p className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>{route}</p>
        )}
      </div>

      {/* Detalles del paquete */}
      {details.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {details.map(d => (
            <div
              key={d.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--bd-1)' }}
            >
              <span style={{ color: 'var(--fg-4)' }}>{d.label}:</span>
              <span style={{ color: 'var(--fg-2)', fontWeight: 600 }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
export default function Tracking() {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  const { phase, trackingState, rawSync, error, syncStep, track, reset } = useTracking()

  /* ── Evento externo desde el Hero ("Rastrear mi envío") ─────── */
  useEffect(() => {
    const handler = (e) => {
      const val = parseGuiaInput(e.detail || '')
      setInputValue(val)
      setInputError('')
      if (!val) { setInputError('Ingresá el número de guía.'); return }
      track(val)
    }
    window.addEventListener('doTracking', handler)
    return () => window.removeEventListener('doTracking', handler)
  }, [track])

  /* ── Handlers ────────────────────────────────────────────────── */
  function handleSearch() {
    const trimmed = parseGuiaInput(inputValue)
    if (!trimmed)          { setInputError('Ingresá el número de guía.');          return }
    if (trimmed.length < 3){ setInputError('El número de guía es demasiado corto.'); return }
    setInputError('')
    track(trimmed)
  }

  function handleClear() {
    setInputValue('')
    setInputError('')
    reset()
  }

  /* ── Estado derivado ─────────────────────────────────────────── */
  const isSearchingOnly = phase === TRACK_PHASE.SEARCHING && !trackingState
  const isSyncing       = phase === TRACK_PHASE.SYNCING
  const isError         = phase === TRACK_PHASE.ERROR
  const hasGuia         = trackingState !== null
  const showPhases      = hasGuia && (isSyncing || phase === TRACK_PHASE.COMPLETE)
  const activeError     = inputError || (isError ? getErrorMessage(error) : '')

  /**
   * Devuelve los datos de fase para cada tarjeta.
   * Caso especial Copa: si Copa no devolvió datos pero ZAS confirmó la llegada,
   * mostrar el trayecto inferido (sin fechas).
   */
  function getPhaseData(config) {
    const raw      = rawSync?.phases?.[config.key] ?? null
    const zasFound = rawSync?.phases?.destino_zas?.found
    const copaFound = rawSync?.phases?.copa_courier?.found
    if (config.key === 'copa_courier' && !copaFound && zasFound) {
      return { found: true, inferred: true, events: COPA_INFERRED_EVENTS }
    }
    return raw
  }

  return (
    <section
      id="rastreo"
      className="relative py-20 lg:py-32"
      style={{ background: 'var(--bg-alt)' }}
    >
      {/* Resplandor de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(240,114,50,0.04) 0%, transparent 68%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* ── Encabezado ───────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
          style={{ color: '#F07232' }}
        >
          Seguimiento
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold leading-[1.05] mb-3"
          style={{ color: 'var(--fg-1)', fontSize: 'clamp(2rem, 5vw, 3.1rem)' }}
        >
          Sabé siempre dónde
          <br />está tu envío.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-sm leading-relaxed mb-10 max-w-md"
          style={{ color: 'var(--fg-3)' }}
        >
          Rastreo en tiempo real para envíos Pack Express. Ingresá tu número
          de guía para ver el estado actualizado de tu paquete.
        </motion.p>

        {/* ── Tarjeta principal ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor:     'var(--bd-1)',
            padding:         'clamp(1.25rem, 4vw, 2rem)',
          }}
        >
          {/* ── Input row ────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--fg-4)' }}
              />
              <input
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value.toUpperCase()); setInputError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: CM000000689PK"
                maxLength={20}
                spellCheck={false}
                autoComplete="off"
                aria-label="Número de guía"
                className="w-full rounded-xl py-3.5 pl-10 pr-10 font-mono text-sm outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(240,114,50,0.14)]"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color:           'var(--fg-1)',
                  border: `1px solid ${activeError ? 'rgba(239,68,68,0.45)' : 'var(--bd-2)'}`,
                }}
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors cursor-pointer"
                  style={{ color: 'var(--fg-4)' }}
                  aria-label="Limpiar"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <motion.button
              onClick={handleSearch}
              whileTap={{ scale: 0.96 }}
              disabled={phase === TRACK_PHASE.SEARCHING}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-white flex-shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ backgroundColor: '#F07232', boxShadow: '0 0 20px rgba(240,114,50,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E8823C'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F07232'}
            >
              {phase === TRACK_PHASE.SEARCHING
                ? <Loader2 size={15} className="animate-spin" />
                : <Search size={15} />
              }
              Rastrear
            </motion.button>
          </div>

          {/* ── Error ────────────────────────────────────────── */}
          <AnimatePresence>
            {activeError && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
                role="alert"
              >
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3 border"
                  style={{ backgroundColor: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.22)' }}
                >
                  <AlertCircle size={14} className="shrink-0" style={{ color: '#F87171' }} />
                  <p className="text-sm" style={{ color: '#FCA5A5' }}>{activeError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Spinner inicial ───────────────────────────────── */}
          <AnimatePresence>
            {isSearchingOnly && <SearchingSpinner key="spinner" />}
          </AnimatePresence>

          {/* ── Resultados ───────────────────────────────────── */}
          <AnimatePresence>
            {hasGuia && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                role="status"
                aria-live="polite"
              >
                {/* Info básica de la guía (disponible desde DB) */}
                <GuiaInfoBand state={trackingState} />

                {/* Fases del scraping */}
                <AnimatePresence>
                  {showPhases && (
                    <motion.div
                      key="phases"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      {PHASES.map((config, i) => (
                        <PhaseCard
                          key={config.key}
                          config={config}
                          phaseData={isSyncing ? null : getPhaseData(config)}
                          loading={isSyncing}
                          index={i}
                          guia={trackingState?.guia ?? null}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
