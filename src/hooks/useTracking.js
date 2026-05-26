/**
 * useTracking.js
 * Hook orquestador del sistema de rastreo público.
 *
 * Máquina de estados:
 *   IDLE → SEARCHING → SYNCING → COMPLETE
 *                    ↘ ERROR
 *
 * Flujo:
 *  1. SEARCHING  : consulta la DB (rápido, <500ms) → muestra timeline inmediatamente
 *  2. SYNCING    : TrackSync en background (Copa, Correos, ZAS) → enriquece fuentes
 *  3. COMPLETE   : muestra badge "Fuentes verificadas"
 */

import { useState, useCallback, useRef } from 'react'
import { parseGuiaInput, fetchGuiaData, runTrackSync } from '../lib/tracking/api'
import { buildTrackingState } from '../lib/tracking/normalizer'

/* ── Fase de la máquina de estados ─────────────────────────────── */
export const TRACK_PHASE = {
  IDLE:      'idle',
  SEARCHING: 'searching',
  SYNCING:   'syncing',
  COMPLETE:  'complete',
  ERROR:     'error',
}

/**
 * Pasos de sincronización visibles al usuario.
 * (Destino ZAS no se muestra en la UI pública pero se sincroniza internamente.)
 */
export const SYNC_STEPS = [
  { id: 'copa',    label: 'Copa Courier', detail: 'Tránsito internacional' },
  { id: 'correos', label: 'Correos Cuba', detail: 'Red postal cubana'      },
]

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/* ── Hook principal ──────────────────────────────────────────────── */
export function useTracking() {
  const [phase,         setPhase]         = useState(TRACK_PHASE.IDLE)
  const [trackingState, setTrackingState] = useState(null)
  // rawSync: resultado completo de TrackSync (fases con eventos crudos)
  const [rawSync,       setRawSync]       = useState(null)
  const [error,         setError]         = useState(null)
  // syncStep: -1=no iniciado · 0=Copa · 1=Correos · 2=ZAS (interno) · 3=done
  const [syncStep,      setSyncStep]      = useState(-1)
  const abortRef = useRef(null)

  const track = useCallback(async (rawInput) => {
    const numero = parseGuiaInput(rawInput)
    if (!numero) return

    // Cancelar búsqueda anterior si existe
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setPhase(TRACK_PHASE.SEARCHING)
    setTrackingState(null)
    setRawSync(null)
    setError(null)
    setSyncStep(-1)

    try {
      /* ══════════════════════════════════════════════════════════
         FASE 1 — DB (respuesta inmediata)
      ══════════════════════════════════════════════════════════ */
      const guiaData = await fetchGuiaData(numero)
      if (ctrl.signal.aborted) return

      // Mostrar el timeline con datos de DB de inmediato
      setTrackingState(buildTrackingState(guiaData))

      // Sin manifiesto → no hay TrackSync posible
      if (!guiaData.manifiesto) {
        setPhase(TRACK_PHASE.COMPLETE)
        return
      }

      /* ══════════════════════════════════════════════════════════
         FASE 2 — TrackSync (enriquecimiento externo)
         La petición HTTP corre en paralelo mientras animamos los pasos.
      ══════════════════════════════════════════════════════════ */
      setPhase(TRACK_PHASE.SYNCING)
      setSyncStep(0)  // Copa Courier checking...

      // Lanzar la petición en background
      const syncPromise = runTrackSync(guiaData.manifiesto.id_manifiesto)

      // Animar pasos mientras esperamos
      await delay(750)
      if (ctrl.signal.aborted) return
      setSyncStep(1)  // Correos Cuba checking...

      await delay(750)
      if (ctrl.signal.aborted) return
      setSyncStep(2)  // ZAS (interno, sin UI)

      // Esperar la respuesta real
      let syncData = null
      try {
        syncData = await syncPromise
      } catch {
        // TrackSync falló silenciosamente — los datos de DB siguen siendo válidos
        console.warn('[TrackSync] Fuentes externas no disponibles en este momento.')
      }

      if (ctrl.signal.aborted) return

      /* ── Log ZAS a consola (no se muestra en la UI pública) ── */
      if (syncData?.phases?.destino_zas) {
        const zas = syncData.phases.destino_zas
        console.group('%c🚚 Destino ZAS', 'color: #f07232; font-weight: bold; font-size: 13px')
        console.log('Encontrado:', zas.found)
        console.log('Estado actual:', zas.estado_actual ?? '—')
        console.log('Fecha estado:', zas.fecha_estado ?? '—')
        if (zas.events?.length) {
          console.table(zas.events.map(e => ({ estado: e.estado, fecha: e.fecha })))
        }
        console.groupEnd()
      }

      // Actualizar estado con fuentes verificadas + guardar rawSync
      const enriched = buildTrackingState(guiaData, syncData)
      if (!ctrl.signal.aborted) {
        setRawSync(syncData)
        setTrackingState(enriched)
        setPhase(TRACK_PHASE.COMPLETE)
      }

    } catch (err) {
      if (ctrl.signal.aborted) return
      setError(err.message)
      setPhase(TRACK_PHASE.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setPhase(TRACK_PHASE.IDLE)
    setTrackingState(null)
    setRawSync(null)
    setError(null)
    setSyncStep(-1)
  }, [])

  return { phase, trackingState, rawSync, error, syncStep, track, reset }
}
