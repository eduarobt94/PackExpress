/**
 * Motor de intención del ChatAgent — funciones puras, sin JSX ni efectos
 * secundarios. Recibe texto del usuario y decide qué quiere hacer.
 */
import {
  FAQ, SMALL_TALK, GREETING_PALABRAS, GREETING_RESPONSES, GOODBYE_PALABRAS,
} from './chatKnowledge'

const PALABRAS_COTIZAR = [
  'cotizar', 'cotizacion', 'precio', 'precios', 'cuanto cuesta', 'cuanto sale',
  'tarifa', 'tarifas', 'cuanto vale', 'costo de envio',
]

const PALABRAS_HUMANO = [
  'hablar con una persona', 'hablar con alguien', 'hablar con un humano',
  'necesito un asesor', 'hablar con un agente', 'pasame con alguien',
  'quiero whatsapp', 'me pasas el whatsapp', 'contactar por whatsapp',
  'hablar con un operador',
]

/** Minúsculas, sin tildes, sin espacios extra. */
export function normalizeText(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Distancia de Levenshtein entre dos strings cortos (palabras individuales). */
function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const fila = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let anterior = fila[0]
    fila[0] = i
    for (let j = 1; j <= n; j++) {
      const temp = fila[j]
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, anterior + costo)
      anterior = temp
    }
  }
  return fila[n]
}

/** Tolerancia de errores según el largo de la palabra objetivo: 0 para <4, 1 para 4-7, 2 para 8+. */
function toleranciaPara(largo) {
  if (largo < 4) return 0
  if (largo < 8) return 1
  return 2
}

/** true si alguna palabra de `texto` matchea `objetivo` exacto o con tolerancia a errores de tipeo. */
function palabraFuzzyEn(texto, objetivo) {
  const tolerancia = toleranciaPara(objetivo.length)
  return texto.split(/\s+/).some(palabra => {
    if (palabra === objetivo) return true
    if (tolerancia === 0) return false
    if (Math.abs(palabra.length - objetivo.length) > tolerancia) return false
    return levenshtein(palabra, objetivo) <= tolerancia
  })
}

/** Palabras cortas con colisiones conocidas de Levenshtein contra vocabulario común — exigen match exacto. */
const PALABRAS_SIN_FUZZY = new Set(['hola', 'precio', 'tarifa', 'buenas'])

/** Frases de una sola palabra toleran errores de tipeo (salvo excepciones conocidas); frases de varias palabras exigen substring exacto. */
function contieneFrase(textoNormalizado, frase) {
  const fraseNorm = normalizeText(frase)
  if (fraseNorm.includes(' ')) return textoNormalizado.includes(fraseNorm)
  if (PALABRAS_SIN_FUZZY.has(fraseNorm)) {
    // normalizeText no quita puntuación: "Hola," normalizado deja el token "hola,"
    // y "¿Hola?" deja "¿hola" (separados solo por \s+), así que hay que pelar
    // puntuación de ambos extremos acá para que los casos reales más comunes
    // ("Hola, ...", "¿Hola?", "¡Hola!") sigan matcheando exacto.
    return textoNormalizado
      .split(/\s+/)
      .map(palabra => palabra.replace(/^[.,!?¡¿]+|[.,!?¡¿]+$/g, ''))
      .includes(fraseNorm)
  }
  return palabraFuzzyEn(textoNormalizado, fraseNorm)
}

function contieneAlguna(textoNormalizado, frases) {
  return frases.some(frase => contieneFrase(textoNormalizado, frase))
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
 * Primero intenta match exacto, después "el texto contiene el nombre del país"
 * con límite de palabra. Sin fuzzy matching acá a propósito: el flujo de
 * cotización ya está probado en producción calculando precios reales — no
 * vale la pena el riesgo de un falso positivo ahí.
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

/** Franja horaria real: mañana 05:00-11:59, tarde 12:00-18:59, noche 19:00-04:59. Rangos configurables acá. */
export function franjaHoraria(hora) {
  if (hora >= 5 && hora < 12) return 'manana'
  if (hora >= 12 && hora < 19) return 'tarde'
  return 'noche'
}

/** Elige una respuesta de saludo al azar según la hora real del dispositivo del usuario. */
export function elegirSaludo(fecha = new Date()) {
  const franja = franjaHoraria(fecha.getHours())
  const opciones = GREETING_RESPONSES[franja]
  return opciones[Math.floor(Math.random() * opciones.length)]
}

/**
 * Busca UNA intención "de negocio" (humano, cotizar, o FAQ) en el texto ya
 * normalizado. No incluye rastreo/cotizar_respuesta (se resuelven antes, en
 * detectarIntenciones) ni greeting/small_talk/goodbye (se resuelven aparte).
 */
function buscarIntencionDeNegocio(texto) {
  if (contieneAlguna(texto, PALABRAS_HUMANO)) {
    return { tipo: 'human_handoff' }
  }
  if (contieneAlguna(texto, PALABRAS_COTIZAR)) {
    return { tipo: 'cotizar_iniciar' }
  }
  for (const entrada of FAQ) {
    if (contieneAlguna(texto, entrada.palabrasClave)) {
      return { tipo: 'faq', respuesta: entrada.respuesta, temaId: entrada.id, derivaWhatsapp: !!entrada.derivaWhatsapp }
    }
  }
  return null
}

/**
 * Detecta todas las intenciones del mensaje. Devuelve un ARRAY, nunca vacío.
 * `estado`: { flujo: 'cotizando' | null, ultimoTema: string | null }
 *
 * Prioridad: flujo de cotización en curso > número de guía > despedida >
 * small talk > saludo (+ intención de negocio si viene combinado en el mismo
 * mensaje) > intención de negocio sola > "último tema" si el mensaje tiene
 * entre 2 y 5 palabras y no matchea nada por sí solo > desconocido.
 *
 * El mínimo de 2 palabras para la heurística de "último tema" es a propósito:
 * una sola palabra sin sentido (ej. texto ilegible tipeado sin querer) no debe
 * reusar el último tema — debe caer en el fallback normal. Un seguimiento real
 * corto casi siempre tiene 2+ palabras ("y los sábados", "y el precio").
 */
export function detectarIntenciones(textoOriginal, estado) {
  if (estado?.flujo === 'cotizando') {
    return [{ tipo: 'cotizar_respuesta', valor: textoOriginal.trim() }]
  }

  const numeroGuia = extraerNumeroGuia(textoOriginal)
  if (numeroGuia) {
    return [{ tipo: 'rastreo', numero: numeroGuia }]
  }

  const texto = normalizeText(textoOriginal)

  if (contieneAlguna(texto, GOODBYE_PALABRAS)) {
    return [{ tipo: 'goodbye' }]
  }

  for (const grupo of SMALL_TALK) {
    if (contieneAlguna(texto, grupo.palabrasClave)) {
      return [{ tipo: grupo.tipo, respuestas: grupo.respuestas }]
    }
  }

  const esGreeting = contieneAlguna(texto, GREETING_PALABRAS)
  const negocio = buscarIntencionDeNegocio(texto)

  if (esGreeting && negocio) return [{ tipo: 'greeting' }, negocio]
  if (esGreeting) return [{ tipo: 'greeting' }]
  if (negocio) return [negocio]

  const palabrasMensaje = textoOriginal.trim().split(/\s+/)
  if (estado?.ultimoTema && palabrasMensaje.length >= 2 && palabrasMensaje.length < 6) {
    const temaPrevio = FAQ.find(f => f.id === estado.ultimoTema)
    if (temaPrevio) {
      return [{ tipo: 'faq', respuesta: temaPrevio.respuesta, temaId: temaPrevio.id, derivaWhatsapp: !!temaPrevio.derivaWhatsapp }]
    }
  }

  return [{ tipo: 'desconocido' }]
}
