/**
 * Motor de intención del ChatAgent — funciones puras, sin JSX ni efectos
 * secundarios. Recibe texto del usuario y decide qué quiere hacer.
 */
import { FAQ } from './chatKnowledge'

const PALABRAS_COTIZAR = [
  'cotizar', 'cotizacion', 'precio', 'precios', 'cuanto cuesta', 'cuanto sale',
  'tarifa', 'tarifas', 'cuanto vale', 'cuanto sale enviar', 'costo de envio',
]

/** Minúsculas, sin tildes, sin espacios extra. */
export function normalizeText(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Busca un número de guía en el texto: solo dígitos (3+) o formato CM000000689PK. */
export function extraerNumeroGuia(texto) {
  const compacto = texto.replace(/\s+/g, '')
  const matchCodigo = compacto.match(/^cm0*(\d+)pk$/i)
  if (matchCodigo) return compacto

  const tokens = texto.trim().split(/\s+/)
  for (const token of tokens) {
    if (/^\d{3,}$/.test(token)) return token
  }
  return null
}

/** Extrae el primer número (con decimales) del texto, o null si no hay ninguno válido (> 0). */
export function parsePeso(texto) {
  const match = texto.replace(',', '.').match(/(\d+(\.\d+)?)/)
  if (!match) return null
  const valor = parseFloat(match[1])
  return valor > 0 ? valor : null
}

/**
 * Busca el nombre de país (clave de countryZone) que mejor matchea el texto.
 * Primero intenta match exacto, después "el texto contiene el nombre del país".
 */
export function matchPais(texto, countryZone) {
  const norm = normalizeText(texto)
  const paises = Object.keys(countryZone)

  const exacto = paises.find(pais => normalizeText(pais) === norm)
  if (exacto) return exacto

  const contenido = paises.find(pais => norm.includes(normalizeText(pais)))
  return contenido ?? null
}

/** Busca en la lista de tipos de servicio (de la API) el que matchea el texto por nombre o código. */
export function matchTipo(texto, tipos) {
  const norm = normalizeText(texto)
  return tipos.find(t =>
    norm.includes(normalizeText(t.nombre)) || norm.includes(normalizeText(t.codigo)),
  ) ?? null
}

/** 'YYYY-MM-DD HH:MM:SS' → 'DD/MM/YYYY'. */
export function formatFechaHora(fechaHora) {
  if (!fechaHora) return ''
  const [fecha] = fechaHora.split(' ')
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Detecta la intención del usuario. `estado.flujo === 'cotizando'` indica que
 * hay un flujo de cotización a mitad de camino esperando una respuesta puntual
 * (peso/país/tipo) — en ese caso el texto NO se re-evalúa como intención nueva.
 */
export function detectarIntencion(textoOriginal, estado) {
  if (estado?.flujo === 'cotizando') {
    return { tipo: 'cotizar_respuesta', valor: textoOriginal.trim() }
  }

  const numeroGuia = extraerNumeroGuia(textoOriginal)
  if (numeroGuia) {
    return { tipo: 'rastreo', numero: numeroGuia }
  }

  const texto = normalizeText(textoOriginal)

  if (PALABRAS_COTIZAR.some(p => texto.includes(p))) {
    return { tipo: 'cotizar_iniciar' }
  }

  for (const entrada of FAQ) {
    if (entrada.palabrasClave.some(p => texto.includes(normalizeText(p)))) {
      return { tipo: 'faq', respuesta: entrada.respuesta }
    }
  }

  return { tipo: 'desconocido' }
}
