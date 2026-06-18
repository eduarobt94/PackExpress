/**
 * tracking/normalizer.js
 * Mapea los datos crudos de la API a un estado de visualización.
 * Contiene las 10 etapas canónicas con etiquetas públicas.
 */

/**
 * Las 10 etapas canónicas del recorrido de un envío Pack Express.
 * - `hito`     coincide exactamente con el campo `hito` de la tabla `rastreo`
 * - `label`    etiqueta pública (sin jerga interna)
 * - `sublabel` descripción breve de la etapa
 * - `location` ubicación geográfica orientativa
 * - `phase`    agrupación visual
 * - `iconName` nombre del ícono Lucide a usar
 */
export const HITOS_META = [
  {
    hito:     'ENVIO SOLICITADO POR LA WEB',
    label:    'Envío solicitado',
    sublabel: 'Paquete registrado en el sistema',
    location: 'Montevideo, Uruguay',
    phase:    'origin',
    iconName: 'Package',
  },
  {
    hito:     'PARTIENDO DE ORIGEN O PUNTO DE TRÁNSITO - MVD',
    label:    'Salida de Montevideo',
    sublabel: 'Vuelo hacia Panamá',
    location: 'MVD → PTY',
    phase:    'origin',
    iconName: 'Plane',
  },
  {
    hito:     'RECIBIDO EN PUNTO DE TRÁNSITO - PTY',
    label:    'Recibido en Panamá',
    sublabel: 'Punto de tránsito internacional',
    location: 'Ciudad de Panamá, PA',
    phase:    'transit',
    iconName: 'MapPin',
  },
  {
    hito:     'PARTIENDO DE ORIGEN O PUNTO DE TRÁNSITO - PTY',
    label:    'Salida de Panamá',
    sublabel: 'Vuelo hacia La Habana',
    location: 'PTY → HAV',
    phase:    'transit',
    iconName: 'Plane',
  },
  {
    hito:     'RECIBIDO EN DESTINO - HAV',
    label:    'Recibido en La Habana',
    sublabel: 'Ingresó al destino final',
    location: 'La Habana, Cuba',
    phase:    'destination',
    iconName: 'MapPin',
  },
  {
    hito:     'EN PROCESO DE ADUANA',
    label:    'En proceso de aduana',
    sublabel: 'Revisión y verificación aduanera',
    location: 'Cuba',
    phase:    'customs',
    iconName: 'Shield',
  },
  {
    hito:     'LIBERADO POR ADUANA',
    label:    'Liberado por aduana',
    sublabel: 'Autorizado para distribución',
    location: 'Cuba',
    phase:    'customs',
    iconName: 'ShieldCheck',
  },
  {
    hito:     'FACTURADO',
    label:    'Facturado',
    sublabel: 'Liberado por Correos y asignado a la Mipyme',
    location: 'Cuba',
    phase:    'delivery',
    iconName: 'Receipt',
  },
  {
    hito:     'LLEGO AL CENTRO DE DISTRIBUCION',
    label:    'Centro de distribución',
    sublabel: 'Preparación para entrega final',
    location: 'Cuba',
    phase:    'delivery',
    iconName: 'Building2',
  },
  {
    hito:     'EN REPARTO',
    label:    'En reparto',
    sublabel: 'El repartidor está en camino',
    location: 'Destino, Cuba',
    phase:    'delivery',
    iconName: 'Truck',
  },
  {
    hito:     'ENTREGADO AL DESTINATARIO',
    label:    'Entregado',
    sublabel: 'Paquete recibido por el destinatario',
    location: '',
    phase:    'delivered',
    iconName: 'CheckCircle2',
  },
]

/**
 * Formatea una fecha de la DB al formato "24 may 2024, 09:30".
 * Acepta "YYYY-MM-DD" y "YYYY-MM-DD HH:MM:SS".
 *
 * @param {string|null} raw
 * @returns {string|null}
 */
export function formatDate(raw) {
  if (!raw) return null
  try {
    // "2024-05-24 09:30:00" → ISO 8601
    const iso = raw.includes('T') ? raw : raw.replace(' ', 'T')
    const d   = new Date(iso)
    if (isNaN(d.getTime())) return raw

    const day   = d.getDate()
    const month = d.toLocaleDateString('es', { month: 'short' }).replace('.', '').toLowerCase()
    const year  = d.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return raw
  }
}

/* ── Nombres de meses para formateo ──────────────────────────────── */
const MONTH_NAMES = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

const MONTHS_ES_COPA = {
  ene:'01', feb:'02', mar:'03', abr:'04', may:'05', jun:'06',
  jul:'07', ago:'08', sep:'09', 'sep.':'09', oct:'10', nov:'11', dic:'12',
}

/**
 * Formatea una fecha cruda de eventos TrackSync al formato "26 abr 2026, 22:45".
 * Soporta los formatos de Copa Courier, Correos Cuba y Destino ZAS.
 *
 * @param {string|null} fecha
 * @returns {string|null}
 */
export function formatRawEventDate(fecha) {
  if (!fecha || !fecha.trim()) return null
  const s = fecha.trim()

  // Copa Courier: "26-abr.-2026 22:45" | "26-abr-2026 22:45"
  const copa = s.match(/^(\d{1,2})-([a-záéíóúüñ.]+)-(\d{4})(?:\s+(\d{1,2}:\d{2}))?/iu)
  if (copa) {
    const [, day, rawMon, year, time] = copa
    const monKey = rawMon.toLowerCase().replace(/\.$/, '')
    const m = MONTHS_ES_COPA[monKey] ?? '01'
    const mName = MONTH_NAMES[parseInt(m, 10)]
    return `${parseInt(day, 10)} ${mName} ${year}`
  }

  // Destino ZAS: "25/11/2025" | "25/11/2025 14:30"
  const zas = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}:\d{2}))?/)
  if (zas) {
    const [, day, month, year] = zas
    const mNum = parseInt(month, 10)
    return `${parseInt(day, 10)} ${MONTH_NAMES[mNum] ?? month} ${year}`
  }

  // ISO / YYYY-MM-DD: delegar al formatDate existente
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return formatDate(s)

  return s
}

/**
 * Devuelve el nombre del ícono Lucide más adecuado para un estado de evento.
 *
 * @param {string} estado
 * @returns {string}
 */
export function getEventIconName(estado) {
  if (!estado) return 'Package'
  const up = estado.toUpperCase()
  if (up.includes('ENTREGAD'))                                               return 'CheckCircle2'
  if (up.includes('REPARTO'))                                                return 'Truck'
  if (up.includes('LIBERAD') || up.includes('FACTURAD'))                    return 'ShieldCheck'
  if (up.includes('ADUANA'))                                                 return 'Shield'
  if (up.includes('PARTIENDO') || up.includes('SALIDA'))                    return 'Plane'
  if (up.includes('RECIBID')   || up.includes('LLEGAD'))                    return 'MapPin'
  if (up.includes('RECEPCIONAD') || up.includes('CLASIFIC') ||
      up.includes('DISTRIBUC')   || up.includes('CENTRO') ||
      up.includes('ALMAC'))                                                  return 'Building2'
  return 'Package'
}

/**
 * Construye el estado de visualización a partir de los datos de la DB
 * y, opcionalmente, el resultado de TrackSync.
 *
 * @param {{ guia: object, manifiesto: object|null, events: object[] }} guiaData
 * @param {object|null} syncData  resultado de runTrackSync (opcional)
 * @returns {TrackingState}
 */
export function buildTrackingState(guiaData, syncData = null) {
  const { guia, manifiesto, events } = guiaData

  // Indexar eventos por hito canónico (toma el último si hay duplicados)
  const eventsByHito = {}
  for (const ev of events ?? []) {
    eventsByHito[ev.hito] = ev
  }

  // Encontrar el índice del último hito completado
  let lastCompletedIdx = -1
  for (let i = HITOS_META.length - 1; i >= 0; i--) {
    if (eventsByHito[HITOS_META[i].hito]) {
      lastCompletedIdx = i
      break
    }
  }

  const isDelivered = Boolean(eventsByHito['ENTREGADO AL DESTINATARIO'])

  // Construir el array de pasos para la UI
  const steps = HITOS_META.map((meta, i) => {
    const ev = eventsByHito[meta.hito] ?? null

    let status
    if (ev) {
      // El último hito activo (y no entregado) se muestra como "active"
      status = (i === lastCompletedIdx && !isDelivered) ? 'active' : 'done'
    } else {
      status = 'pending'
    }

    // Ocultar observaciones internas auto-completadas
    const obs      = ev?.observacion ?? null
    const showObs  = obs && !obs.startsWith('Auto-completado')
    // Solo mostrar fecha si hay observación real (hito con fuente verificada)
    // Los backfilleados no tienen observación y su fecha es inferida, no real
    const showFecha = showObs

    return {
      ...meta,
      status,
      fecha:       showFecha ? (ev?.fecha_hora ?? null) : null,
      observacion: showObs ? obs : null,
    }
  })

  // Etiqueta y variante del badge de estado
  let statusLabel, statusVariant
  if (isDelivered) {
    statusLabel   = 'Entregado'
    statusVariant = 'delivered'
  } else if (lastCompletedIdx >= 0) {
    statusLabel   = HITOS_META[lastCompletedIdx].label
    statusVariant = 'transit'
  } else {
    statusLabel   = 'Registrado'
    statusVariant = 'neutral'
  }

  // Resumen de fuentes verificadas (Copa y Correos, no ZAS en UI pública)
  let syncSummary = null
  if (syncData?.phases) {
    syncSummary = {
      copa:    Boolean(syncData.phases.copa_courier?.found),
      correos: Boolean(syncData.phases.correos_cuba?.found),
    }
  }

  return {
    numero:         guia?.id_guia
                    ? `CM${String(guia.id_guia).padStart(9, '0')}PK`
                    : (guia?.numero ?? ''),
    guia,
    manifiesto,
    steps,
    lastCompletedIdx,
    isDelivered,
    statusLabel,
    statusVariant,
    completedCount: steps.filter(s => s.status !== 'pending').length,
    totalCount:     HITOS_META.length,
    syncSummary,
  }
}
