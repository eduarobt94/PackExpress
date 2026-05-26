/**
 * tracking/api.js
 * Capa de acceso a datos para el sistema de rastreo público.
 * No escribe en la base de datos.
 */

const BASE = '/pack-sistema/api/v1'

/**
 * Normaliza el número de guía ingresado por el usuario.
 * @param {string} raw
 * @returns {string}
 */
export function parseGuiaInput(raw) {
  return String(raw ?? '').trim().toUpperCase()
}

/**
 * Busca una guía en la base de datos por número de texto.
 * Devuelve { guia, manifiesto, events }
 *
 * @param {string} numero
 * @throws {Error} 'NOT_FOUND' | 'SERVER_ERROR'
 */
export async function fetchGuiaData(numero) {
  let res
  try {
    res = await fetch(`${BASE}/rastreo.php?guia_numero=${encodeURIComponent(numero)}`, {
      cache: 'no-store',
    })
  } catch {
    throw new Error('NETWORK_ERROR')
  }

  if (res.status === 404) throw new Error('NOT_FOUND')
  if (!res.ok) throw new Error('SERVER_ERROR')

  const json = await res.json()
  // jsonError desde PHP devuelve { ok: false, error: "..." }
  if (json.ok === false) throw new Error('NOT_FOUND')

  // jsonOk envuelve en { ok: true, data: {...} }
  const data = json.data ?? json
  if (!data.guia) throw new Error('NOT_FOUND')

  return data
}

/**
 * Ejecuta TrackSync para un manifiesto (fuentes externas).
 * No requiere sesión — ruta pública del endpoint.
 * Devuelve { manifiesto_id, hawb, phases: { copa_courier, correos_cuba, destino_zas } }
 *
 * @param {number} manifiestoId
 * @throws {Error} 'SYNC_ERROR'
 */
export async function runTrackSync(manifiestoId) {
  let res
  try {
    res = await fetch(`${BASE}/tracksync.php?manifiesto_id=${manifiestoId}`, {
      cache: 'no-store',
    })
  } catch {
    throw new Error('SYNC_ERROR')
  }

  if (!res.ok) throw new Error('SYNC_ERROR')

  const json = await res.json()
  return json.data ?? json
}
