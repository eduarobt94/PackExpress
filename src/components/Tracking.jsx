/**
 * Tracking.jsx — v3
 * Timeline de 10 hitos canónicos con diseño premium dark mode.
 * buildTrackingState() del normalizer ya devuelve steps[] con status/fecha/label.
 * PhaseCards eliminados — el scraping sigue en background y enriquece la timeline.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, AlertCircle,
  Package, Plane, MapPin, Building2, Shield, ShieldCheck, Truck, CheckCircle2,
  Loader2, Sparkles,
} from 'lucide-react'
import { useTracking, TRACK_PHASE } from '../hooks/useTracking'
import { parseGuiaInput }    from '../lib/tracking/api'
import { formatDate }        from '../lib/tracking/normalizer'

/* ── Mapa de íconos Lucide ─────────────────────────────────────────── */
const ICON_MAP = {
  Package, Plane, MapPin, Building2,
  Shield, ShieldCheck, Truck, CheckCircle2,
}

/* ── Mensajes de error ─────────────────────────────────────────────── */
function getErrorMessage(code) {
  if (code === 'NOT_FOUND')     return 'No encontramos resultados para ese número de guía. Verificá que esté bien escrito.'
  if (code === 'NETWORK_ERROR') return 'No hay conexión con el servidor. Verificá tu internet e intentá de nuevo.'
  return 'Ocurrió un error al consultar el servidor. Intentá de nuevo en unos momentos.'
}

/* ════════════════════════════════════════════════════════════════════
   SUBCOMPONENTES
═══════════════════════════════════════════════════════════════════ */

/* ── Spinner de búsqueda inicial ───────────────────────────────────── */
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

/* ── Franja de información básica de la guía ──────────────────────── */
function GuiaInfoBand({ state }) {
  if (!state) return null
  const { guia, manifiesto, numero } = state
  const route = guia?.ruta
    ? guia.ruta.replace('›', '→').replace('>', '→')
    : (guia?.origen && guia?.destino ? `${guia.origen} → ${guia.destino}` : null)

  const destino = [guia?.municipio_dest, guia?.provincia_dest].filter(Boolean).join(', ')

  const details = [
    guia?.tipo_bulto     && { label: 'Tipo',    value: guia.tipo_bulto },
    guia?.peso_real      && { label: 'Peso',    value: `${guia.peso_real} kg` },
    guia?.cantidad_bulto && { label: 'Bultos',  value: String(guia.cantidad_bulto) },
    manifiesto?.vuelo    && { label: 'Vuelo',   value: manifiesto.vuelo },
    destino              && { label: 'Destino', value: destino },
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mt-7 pb-5 mb-2 border-b"
      style={{ borderColor: 'var(--bd-1)' }}
    >
      <p className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--fg-4)' }}>
        Número de guía
      </p>
      <p className="font-mono font-bold text-xl leading-none" style={{ color: '#FB923C' }}>
        {numero}
      </p>
      {route && (
        <p className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>{route}</p>
      )}
      {details.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
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

/* ── Banner de estado general + barra de progreso ─────────────────── */
function StatusHeader({ state, isSyncing }) {
  if (!state) return null

  const { statusLabel, statusVariant, completedCount, totalCount, syncSummary, isDelivered } = state
  const pct = (completedCount / totalCount) * 100

  // Verde desaturado enterprise — evita el neón eléctrico
  const accent       = isDelivered ? '#059669' : '#F07232'
  const accentDim    = isDelivered ? 'rgba(5,150,105,0.08)'  : 'rgba(240,114,50,0.07)'
  const accentBorder = isDelivered ? 'rgba(5,150,105,0.22)'  : 'rgba(240,114,50,0.20)'
  const accentText   = isDelivered ? '#34D399'               : '#FB923C'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.05 }}
      className="mt-5 mb-5 rounded-xl border"
      style={{ backgroundColor: accentDim, borderColor: accentBorder, padding: '14px 16px' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: isDelivered ? 'rgba(5,150,105,0.12)' : 'rgba(240,114,50,0.12)', borderColor: accentBorder }}
          >
            {isDelivered
              ? <CheckCircle2 size={18} style={{ color: accent }} />
              : <Package      size={18} style={{ color: accent }} />
            }
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-tight truncate" style={{ color: 'var(--fg-1)' }}>
              {statusLabel}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-4)' }}>
              {completedCount} de {totalCount} etapas completadas
            </p>
          </div>
        </div>

        {/* Contador */}
        <span
          className="text-[13px] font-bold tabular-nums flex-shrink-0 px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: accentDim, color: accentText, borderColor: accentBorder }}
        >
          {completedCount}<span style={{ opacity: 0.5 }}>/{totalCount}</span>
        </span>
      </div>

      {/* Barra de progreso */}
      <div
        className="mt-3 rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </div>

      {/* Badges de fuentes verificadas */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Loader2 size={11} className="animate-spin flex-shrink-0" style={{ color: 'var(--fg-5)' }} />
            <p className="text-[11px]" style={{ color: 'var(--fg-5)' }}>
              Verificando fuentes externas…
            </p>
          </motion.div>
        )}

        {!isSyncing && syncSummary && (
          <motion.div
            key="verified"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <Sparkles size={10} style={{ color: 'var(--fg-5)', flexShrink: 0 }} />
            <span className="text-[10.5px]" style={{ color: 'var(--fg-5)' }}>Fuentes verificadas:</span>
            {syncSummary.copa && (
              <span
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'rgba(82,126,216,0.09)',
                  color:           '#7BA7E8',
                  borderColor:     'rgba(82,126,216,0.25)',
                }}
              >
                <CheckCircle2 size={8} />
                Copa Courier
              </span>
            )}
            {syncSummary.correos && (
              <span
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'rgba(102,136,190,0.09)',
                  color:           '#8AACD0',
                  borderColor:     'rgba(102,136,190,0.24)',
                }}
              >
                <CheckCircle2 size={8} />
                Correos Cuba
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Paso individual del timeline ──────────────────────────────────── */
function HitoStep({ step, index, isLast }) {
  const Icon      = ICON_MAP[step.iconName] ?? Package
  const isDone    = step.status === 'done'
  const isActive  = step.status === 'active'
  const isLit     = isDone || isActive
  const fecha     = step.fecha ? formatDate(step.fecha) : null

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
      className="flex"
    >
      {/* ── Columna izquierda: dot + línea ────────────────────── */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
        {/* Contenedor del dot — 36px ancho para centrar el círculo de 20px */}
        <div className="relative flex items-center justify-center" style={{ width: 36, height: 24 }}>
          {/* Ring de pulso para el paso activo */}
          {isActive && (
            <motion.div
              className="absolute rounded-full"
              style={{ width: 28, height: 28, backgroundColor: 'rgba(240,114,50,0.15)', borderRadius: '50%' }}
              animate={{ scale: [0.9, 1.5, 0.9], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Dot principal — 20px con ícono 11px claramente legible */}
          {isLit ? (
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width:           22,
                height:          22,
                backgroundColor: isActive ? '#F07232' : 'rgba(240,114,50,0.13)',
                border:          `1.5px solid ${isActive ? 'transparent' : 'rgba(240,114,50,0.45)'}`,
                boxShadow:       isActive
                  ? '0 0 0 3px rgba(240,114,50,0.20), 0 0 14px rgba(240,114,50,0.25)'
                  : 'none',
              }}
            >
              <Icon
                size={13}
                style={{ color: isActive ? 'white' : '#F07232' }}
              />
            </div>
          ) : (
            <div
              className="rounded-full"
              style={{ width: 10, height: 10, border: '1.5px solid var(--bd-2)' }}
            />
          )}
        </div>

        {/* Línea vertical */}
        {!isLast && (
          <div
            style={{
              width:           1.5,
              flex:            1,
              minHeight:       20,
              backgroundColor: isDone
                ? 'rgba(240,114,50,0.22)'
                : isActive
                ? 'rgba(240,114,50,0.10)'
                : 'var(--bd-1)',
            }}
          />
        )}
      </div>

      {/* ── Columna derecha: contenido ─────────────────────────── */}
      <div
        className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'} pt-0.5`}
        style={{
          paddingLeft: 10,
          ...(isActive ? {
            borderRadius:  '0 10px 10px 0',
            marginLeft:    -2,
            paddingLeft:   12,
            background:    'rgba(240,114,50,0.04)',
            borderLeft:    '2px solid rgba(240,114,50,0.22)',
          } : {}),
        }}
      >
        {/* Fila 1: label + badge/fecha */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p
            className="font-semibold leading-tight"
            style={{
              fontSize: isLit ? 13.5 : 12.5,
              color:    isLit ? 'var(--fg-1)' : 'var(--fg-4)',
            }}
          >
            {step.label}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isActive && (
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'rgba(240,114,50,0.10)',
                  color:           '#F07232',
                  borderColor:     'rgba(240,114,50,0.30)',
                }}
              >
                En curso
              </span>
            )}
            {fecha && (
              <span
                className="text-[11px] tabular-nums"
                style={{ color: isLit ? 'rgba(251,146,60,0.85)' : 'var(--fg-5)' }}
              >
                {fecha}
              </span>
            )}
          </div>
        </div>

        {/* Fila 2: sublabel + location */}
        {(step.sublabel || step.location) && (
          <p
            className="text-[11.5px] mt-0.5 leading-snug"
            style={{ color: isLit ? 'var(--fg-3)' : 'var(--fg-5)' }}
          >
            {step.sublabel}
            {step.sublabel && step.location && (
              <span style={{ opacity: 0.55 }}> · </span>
            )}
            {step.location && (
              <span style={{ opacity: isLit ? 0.65 : 0.5 }}>{step.location}</span>
            )}
          </p>
        )}

        {/* Observación interna (ya filtrada de auto-completados) */}
        {step.observacion && (
          <p
            className="text-[11px] mt-1"
            style={{ color: 'var(--fg-4)', fontStyle: 'italic' }}
          >
            {step.observacion}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ── Timeline completo de 10 hitos ────────────────────────────────── */
function HitosTimeline({ state }) {
  if (!state?.steps?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="py-2"
    >
      {state.steps.map((step, i) => (
        <HitoStep
          key={step.hito}
          step={step}
          index={i}
          isLast={i === state.steps.length - 1}
        />
      ))}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
export default function Tracking() {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  const { phase, trackingState, error, syncStep: _syncStep, track, reset } = useTracking()

  /* ── Evento externo desde Hero ("Rastrear mi envío") ─────────── */
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
    if (!trimmed)           { setInputError('Ingresá el número de guía.');           return }
    if (trimmed.length < 3) { setInputError('El número de guía es demasiado corto.'); return }
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
  const activeError     = inputError || (isError ? getErrorMessage(error) : '')

  /* ── Render ──────────────────────────────────────────────────── */
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

        {/* ── Encabezado de sección ────────────────────────────── */}
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
          {/* ── Input + botón Rastrear ────────────────────────── */}
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
                : <Search   size={15} />
              }
              Rastrear
            </motion.button>
          </div>

          {/* ── Error ─────────────────────────────────────────── */}
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

          {/* ── Spinner de búsqueda ───────────────────────────── */}
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
                {/* Franja info básica de la guía */}
                <GuiaInfoBand state={trackingState} />

                {/* Header de estado + barra de progreso */}
                <StatusHeader state={trackingState} isSyncing={isSyncing} />

                {/* ── Timeline de 10 hitos ─────────────────── */}
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--bd-1)' }}
                >
                  {/* Header de la tarjeta timeline */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: 'var(--bd-1)' }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: 'var(--fg-4)' }}
                    >
                      Recorrido del envío
                    </p>
                    {isSyncing ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 size={11} className="animate-spin" style={{ color: 'var(--fg-5)' }} />
                        <span className="text-[10px]" style={{ color: 'var(--fg-5)' }}>Actualizando…</span>
                      </div>
                    ) : trackingState?.syncSummary ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} style={{ color: '#22C55E' }} />
                        <span className="text-[10px]" style={{ color: 'var(--fg-4)' }}>Verificado</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Pasos del timeline */}
                  <div className="px-4 py-4">
                    <HitosTimeline state={trackingState} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  )
}
