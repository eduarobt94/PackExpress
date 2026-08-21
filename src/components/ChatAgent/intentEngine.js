/**
 * Motor de intención del ChatAgent — funciones puras, sin JSX ni efectos
 * secundarios. Recibe texto del usuario y decide qué quiere hacer.
 */
import { FAQ } from './chatKnowledge'

const PALABRAS_COTIZAR = [
  'cotizar', 'cotizacion', 'precio', 'precios', 'cuanto cuesta', 'cuanto sale',
  'tarifa', 'tarifas', 'cuanto vale', 'costo de envio',
]

/** Minúsculas, sin tildes, sin espacios extra. */
export function normalizeText(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function contieneAlguna(texto, frases) {
  return frases.some(frase => texto.includes(normalizeText(frase)))
}

/** Busca un número de guía: el mensaje entero debe ser solo dígitos (3+) o formato CM000000689PK. */
export function extraerNumeroGuia(texto) {
  const compacto = texto.trim().replace(/\s+/g, '')
  const matchCodigo = compacto.match(/^cm0*(\d+)pk$/i)
  if (matchCodigo) return compacto
  if (/^\d{3,}$/.test(compacto)) return compacto
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

  const contenido = paises.find(pais => {
    const paisNorm = normalizeText(pais)
    return new RegExp(`\\b${paisNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(norm)
  })
  return contenido ?? null
}

/** Busca en la lista de tipos de servicio (de la API) el que matchea el texto por nombre o código. */
export function matchTipo(texto, tipos) {
  const norm = normalizeText(texto)
  return tipos.find(t => {
    const nombreNorm = normalizeText(t.nombre)
    return norm.includes(nombreNorm) || nombreNorm.includes(norm) || norm.includes(normalizeText(t.codigo))
  }) ?? null
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

  if (contieneAlguna(texto, PALABRAS_COTIZAR)) {
    return { tipo: 'cotizar_iniciar' }
  }

  for (const entrada of FAQ) {
    if (contieneAlguna(texto, entrada.palabrasClave)) {
      return { tipo: 'faq', respuesta: entrada.respuesta }
    }
  }

  return { tipo: 'desconocido' }
}
