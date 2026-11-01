/**
 * Zonas de tarifario y mapeo país → zona.
 * Fuente única — usado por Cotizacion.jsx y por el motor del chat (ChatAgent).
 */

export const ZONE_LABELS = {
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

export const COUNTRY_ZONE = {
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

/* ── Destinos suspendidos ─────────────────────────────────────────────────────
 * Países cuyo servicio está suspendido TEMPORALMENTE: no se ofrecen en el
 * cotizador ni el ChatAgent calcula precio para ellos.
 *
 * Fuente única — la consumen `Cotizacion.jsx` (filtra el selector de países) y
 * `ChatAgent` (responde que está suspendido en vez de dar una tarifa).
 *
 * PARA REACTIVAR UN DESTINO: sacarlo de esta lista. No hace falta tocar nada
 * más — ni el mapa de zonas, ni las regiones del cotizador, ni el chat.
 *
 * Se incluyen también los nombres internos del tarifario del backend (tabla
 * `cod_pais`), porque el ChatAgent resuelve "Estados Unidos" a esas filas para
 * calcular el precio: si solo se filtrara el nombre visible, el chat seguiría
 * cotizando al matchear "Miami" o "EE UU".
 */
export const SUSPENDED_COUNTRIES = [
  'Estados Unidos',
  'Miami',   // fila interna del tarifario (Zona A) que representa a EE.UU.
  'EE UU',   // fila interna alternativa (Zona E)
]

/** Mensaje único para el usuario cuando elige/menciona un destino suspendido. */
export const SUSPENDED_MESSAGE =
  'Los envíos a Estados Unidos están suspendidos temporalmente, así que por ahora no podemos cotizarlos. Escribinos por WhatsApp y te avisamos apenas se reanuden.'

/** true si el destino está suspendido (acepta el nombre visible o el interno). */
export function isPaisSuspendido(pais) {
  if (!pais) return false
  const norm = String(pais).trim().toLowerCase()
  return SUSPENDED_COUNTRIES.some(p => p.toLowerCase() === norm)
}
