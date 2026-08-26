/**
 * Motor de intención del ChatAgent — funciones puras, sin JSX ni efectos
 * secundarios. Recibe texto del usuario y decide qué quiere hacer.
 */
import {
  FAQ, SMALL_TALK, GREETING_PALABRAS, GREETING_RESPONSES, GOODBYE_PALABRAS,
} from './chatKnowledge.js'

const PALABRAS_COTIZAR = [
  'cotizar', 'cotizacion', 'precio', 'precios', 'cuanto cuesta', 'cuanto sale',
  'tarifa', 'tarifas', 'cuanto vale', 'costo de envio', 'costo del envio',
  'cuanto me sale el envio', 'quiero cotizar', 'quiero saber el precio',
  'que precio tiene', 'cuanto tengo que pagar', 'cuanto me cobran',
  'valor del envio', 'cuanto me cuesta', 'dame un precio',
  'necesito una cotizacion', 'me pasas un precio', 'quiero un presupuesto',
  'cuanto sale enviar', 'cuanto cuesta enviar un paquete',
  // variantes cortas / incompletas / uruguayas
  'cuanto sale mandar', 'cuanto me sale mandar', 'cuanto cuesta mandar',
  'quiero mandar un paquete', 'quiero enviar un paquete', 'tengo que mandar un paquete',
  'tengo una caja para enviar', 'cuanto me cobrarian', 'cuanto saldria',
  'que precio manejan', 'a como esta el envio', 'a como sale el envio',
  'quiero mandar', 'quiero enviar', 'tengo que enviar', 'necesito enviar',
  'necesito mandar', 'como hago para mandar',
  'tengo un paquete para enviar', 'tengo una caja',
  'kg para enviar', 'kilos para enviar',
]

/** Mensajes ultra genéricos sobre precio que, SOLOS, son ambiguos (¿envío?
 * ¿casillero? ¿despacho?). Solo dispara si el mensaje ES (casi) exactamente
 * una de estas frases — si trae más contexto ("cuanto cuesta el envio",
 * "cuanto sale mandar a cuba") ya no es ambiguo y sigue el camino normal. */
const FRASES_PRECIO_AMBIGUO = new Set([
  'cuanto cuesta', 'cuanto sale', 'cuanto vale', 'precio', 'precios',
  'cual es el precio', 'que precio tiene', 'cuanto es', 'tarifa', 'tarifas',
])

/** 'kg'/'kilo(s)' pegado o cerca de un número — evita falsos positivos con
 * cualquier número suelto en el mensaje (ej. un teléfono, una guía). */
const PATRON_PESO_CON_UNIDAD = /(\d+(?:[.,]\d+)?)\s*(kg|kgs|kilo|kilos|libras?)\b/i

const PALABRAS_HUMANO = [
  'hablar con una persona', 'hablar con alguien', 'hablar con un humano',
  'necesito un asesor', 'hablar con un agente', 'pasame con alguien',
  'quiero whatsapp', 'me pasas el whatsapp', 'contactar por whatsapp',
  'hablar con un operador', 'quiero hablar con soporte',
  'necesito ayuda de una persona', 'derivame con un humano',
  'quiero un representante', 'atencion personalizada', 'pasame con un asesor',
  'esto no me sirve pasame con alguien', 'el whatsapp', 'tienen whatsapp',
  'me das el whatsapp', 'pasame el whatsapp', 'quiero hablar con alguien real',
  'esto no me esta ayudando', 'necesito que me atienda una persona',
]

/**
 * Palabras sueltas de rastreo genéricas ("seguimiento", "tracking") — a
 * diferencia de las frases específicas de abajo, estas SOLAS son ambiguas
 * contra una pregunta general de tiempos ("cuánto tarda el seguimiento"
 * probablemente pregunta por tiempos de entrega, no pide el número de guía).
 * Se resuelven en buscarIntencionDeNegocio: si aparecen junto a un patrón de
 * pregunta de tiempo ("cuánto tarda/demora"), se cede el paso a la FAQ de
 * tiempos_entrega en vez de pedir el número de guía.
 */
const PALABRAS_RASTREO_GENERICAS = ['rastrear', 'rastreo', 'rastreame', 'rastrearlo', 'seguimiento', 'trackear', 'tracking', 'guia']

/** Frases de rastreo con intención inequívoca — sin ambigüedad contra tiempos_entrega. */
const PALABRAS_RASTREO_ESPECIFICAS = [
  'donde esta mi envio', 'donde esta mi paquete', 'donde esta mi guia',
  'estado de mi envio', 'estado de mi paquete', 'estado de mi guia',
  'donde va mi paquete', 'donde va mi envio', 'quiero saber donde esta mi pedido',
  'seguimiento de mi pedido', 'quiero rastrear', 'necesito rastrear mi envio',
  'consultar estado de guia', 'ver estado de mi envio', 'donde esta mi pedido',
  'quiero saber donde va mi paquete', 'en que estado esta mi envio',
  // variantes cortas / indirectas / informales
  'quiero saber donde esta', 'mi paquete donde esta', 'mi envio donde esta',
  'quiero consultar mi guia', 'puedo consultar una guia', 'como rastreo',
  'como hago seguimiento', 'donde puedo ver mi envio', 'que estado tiene mi paquete',
  'no me llego el paquete', 'no me llego mi pedido', 'mi paquete no llego',
  'el paquete esta demorado', 'mi envio esta demorado', 'el paquete llego dañado',
  'me llego el paquete roto', 'mi pedido esta perdido',
  // muy corta pero de alta precisión en este contexto (courier): "¿dónde
  // está?" a secas, sin objeto, casi siempre pregunta por un envío propio.
  'donde esta', 'esta llegando', 'ya llego', 'como lo rastreo',
]

/** "Cuánto tarda"/"cuánto demora(n)"/"cuánto tiempo" — patrón de pregunta general de tiempos. */
const PATRON_PREGUNTA_DE_TIEMPO = /\bcuanto\b[\s\S]*\b(tarda|tardan|demora|demoran|tiempo)\b/

/**
 * Abreviaciones de chat/WhatsApp reales y frecuentes en Uruguay — se expanden
 * palabra por palabra (nunca como substring, para no tocar "quilombo" o
 * "taxi") antes de buscar cualquier palabra clave. Lista acotada a propósito:
 * solo las que se ven todo el tiempo en conversaciones reales, no un
 * diccionario completo de jerga.
 */
const ABREVIACIONES = {
  q: 'que', qui: 'que', qro: 'quiero', xq: 'porque', pq: 'porque',
  tb: 'tambien', tmb: 'tambien', dnd: 'donde', hs: 'horas',
  finde: 'fin de semana',
  // 'pa' (por 'para') es muy frecuente en español cubano/rioplatense informal
  // de WhatsApp ("mandar pa Cuba"). Reemplazo de palabra completa, nunca
  // substring, así que no toca "pan", "papa", etc.
  pa: 'para',
}

function expandirAbreviaciones(textoNormalizado) {
  return textoNormalizado
    .split(/\s+/)
    .map(palabra => ABREVIACIONES[palabra] ?? palabra)
    .join(' ')
}

/** Minúsculas, sin tildes, sin espacios extra, con abreviaciones comunes expandidas. */
export function normalizeText(texto) {
  return expandirAbreviaciones(texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim())
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

/**
 * Tolerancia más estricta que toleranciaPara, usada SOLO dentro de una frase
 * de varias palabras (fraseFuzzyContigua): con tolerancia 2 de a palabra
 * suelta, dos palabras de 8 letras con significados opuestos pueden quedar a
 * distancia 2 una de otra (ej. "abiertos" ~ "aviertas", que en realidad es
 * "abiertas" con otro género) — al estar acompañadas de más palabras de la
 * frase el riesgo de falso positivo es mayor, así que acá se exige más
 * parecido: recién a partir de 10 letras se permite tolerancia 2.
 */
function toleranciaParaFrase(largo) {
  if (largo < 4) return 0
  if (largo < 10) return 1
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
const PALABRAS_SIN_FUZZY = new Set([
  'hola', 'precio', 'tarifa', 'buenas',
  // 'documentos' con tolerancia a errores (distancia 1) matchea "documento"
  // en singular — que puede ser una respuesta real del paso "tipo de envío"
  // en el flujo de cotización, no una pregunta sobre la FAQ de documentación.
  'documentos',
  // 'pago' (4 letras) queda a distancia 1 de "hago" — sin esto, "como hago
  // para mandar un paquete" fuzzy-matcheaba "como pago" (formas de pago) por
  // pura coincidencia de longitud/distancia, nada que ver con el tema real.
  'pago',
  // 'estan'/'esta' (singular/plural de "estar") tienen distancia 1 entre sí
  // y aparecen en frases de temas distintos ("donde estan" de ubicación vs
  // "donde esta" de rastreo) — sin esto, cualquiera de las dos frases
  // fuzzy-matcheaba la del otro tema. Son palabras reales distintas, no un
  // error de tipeo entre sí, así que ambas exigen match exacto.
  'estan', 'esta',
])

/** Pela puntuación de los extremos de cada palabra (normalizeText no lo hace). */
function tokenizar(textoNormalizado) {
  return textoNormalizado.split(/\s+/).map(p => p.replace(/^[.,!?¡¿]+|[.,!?¡¿]+$/g, ''))
}

/**
 * true si `textoNormalizado` contiene, en ALGÚN tramo contiguo, una palabra
 * por cada palabra de la frase, cada una exacta o con tolerancia a errores
 * de tipeo (misma tolerancia que las palabras sueltas — 0 para <4 letras,
 * exige exacto, así que una frase corta no gana tolerancia por estar
 * "acompañada"). Esto es lo que permite que "estan aviertos" matchee
 * "estan abiertos" sin abrir la puerta a que cualquier texto parecido
 * matchee cualquier cosa: sigue siendo la MISMA frase, palabra por palabra,
 * en el mismo orden — solo tolera errores de tipeo, no reordenamientos.
 */
function fraseFuzzyContigua(textoNormalizado, fraseNorm) {
  const palabrasFrase = fraseNorm.split(' ')
  const palabrasTexto = tokenizar(textoNormalizado)
  for (let i = 0; i + palabrasFrase.length <= palabrasTexto.length; i++) {
    let ok = true
    for (let j = 0; j < palabrasFrase.length; j++) {
      const objetivo = palabrasFrase[j]
      const candidato = palabrasTexto[i + j]
      if (candidato === objetivo) continue
      if (PALABRAS_SIN_FUZZY.has(objetivo)) { ok = false; break }
      const tolerancia = toleranciaParaFrase(objetivo.length)
      if (tolerancia === 0 || Math.abs(candidato.length - objetivo.length) > tolerancia || levenshtein(candidato, objetivo) > tolerancia) {
        ok = false
        break
      }
    }
    if (ok) return true
  }
  return false
}

/** Substring exacto pero con límite de palabra en ambos extremos — "donde esta" NO debe matchear dentro de "donde estan" solo porque es su prefijo. */
function contieneSubstringConLimite(textoNormalizado, fraseNorm) {
  const patron = new RegExp(`\\b${fraseNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
  return patron.test(textoNormalizado)
}

/** Frases de una sola palabra toleran errores de tipeo (salvo excepciones conocidas); frases de varias palabras exigen substring exacto (con límite de palabra) o, si falla, cada palabra en el mismo orden con tolerancia a typos. */
function contieneFrase(textoNormalizado, frase) {
  const fraseNorm = normalizeText(frase)
  if (fraseNorm.includes(' ')) {
    return contieneSubstringConLimite(textoNormalizado, fraseNorm) || fraseFuzzyContigua(textoNormalizado, fraseNorm)
  }
  if (PALABRAS_SIN_FUZZY.has(fraseNorm)) {
    // normalizeText no quita puntuación: "Hola," normalizado deja el token "hola,"
    // y "¿Hola?" deja "¿hola" (separados solo por \s+), así que hay que pelar
    // puntuación de ambos extremos acá para que los casos reales más comunes
    // ("Hola, ...", "¿Hola?", "¡Hola!") sigan matcheando exacto.
    return tokenizar(textoNormalizado).includes(fraseNorm)
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

/**
 * Busca un número de guía EN CUALQUIER PARTE del texto (a diferencia de
 * extraerNumeroGuia, no exige que sea el mensaje entero). Solo se usa cuando
 * ya hay una intención explícita de rastreo en el mensaje (ver
 * PALABRAS_RASTREO) o cuando el bot acaba de pedir el número de guía
 * (estado.esperandoGuia en detectarIntenciones) — así no se reintroduce el
 * falso positivo original de confundir cualquier número suelto ("500
 * gramos") con un código de guía.
 */
export function extraerNumeroGuiaEmbebido(texto) {
  const compacto = texto.replace(/\s+/g, '')
  const matchCodigo = compacto.match(/cm0*(\d+)pk/i)
  if (matchCodigo) return matchCodigo[0]
  const tokens = texto.trim().split(/\s+/)
  for (const token of tokens) {
    if (/^\d{3,}$/.test(token)) return token
  }
  return null
}

/** Extrae el primer número (con decimales) del texto, o null si no hay ninguno válido (> 0). */
/**
 * "medio kilo"/"media kilo"/"medio kg" -> "0.5 kilo"; "20 kilos y medio"/
 * "20 kg y medio" -> "20.5 kilo"; "un kilo y medio" -> "1.5 kilo". Convierte
 * el peso dicho en palabras a número ANTES de buscar dígitos, para que
 * parsePeso y extraerPesoYPais lo entiendan igual que "20.5".
 */
function expandirPesoInformal(texto) {
  return texto
    .replace(/(\d+(?:[.,]\d+)?)\s*(kilos?|kgs?)\s+y\s+medi[oa]\b/gi, (_, n) => `${parseFloat(n.replace(',', '.')) + 0.5} kilo`)
    .replace(/\bun\s+(?:kilo|kg)\s+y\s+medi[oa]\b/gi, '1.5 kilo')
    .replace(/\bmedi[oa]\s+(?:kilos?|kgs?)\b/gi, '0.5 kilo')
}

export function parsePeso(texto) {
  const match = expandirPesoInformal(texto).replace(',', '.').match(/(\d+(\.\d+)?)/)
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

  // Gana el país mencionado MÁS TARDE en el texto, no el que aparece primero
  // en el mapa de países. Sin esto, `paises.find()` devolvía el primero según
  // el orden de zones.js: "no es Cuba, es España" resolvía a Cuba (Cuba está
  // antes que España en ese objeto), justo al revés de lo que el usuario dijo.
  // La última mención es la interpretación correcta para correcciones.
  let elegido = null
  let mejorPos = -1
  for (const pais of paises) {
    const paisNorm = normalizeText(pais)
    const match = norm.match(new RegExp(`\\b${paisNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`))
    if (match && match.index > mejorPos) {
      mejorPos = match.index
      elegido = pais
    }
  }
  return elegido
}

/** Busca en la lista de tipos de servicio (de la API) el que matchea el texto por nombre o código. */
export function matchTipo(texto, tipos) {
  const norm = normalizeText(texto)
  const palabrasTexto = norm.split(/\s+/)
  return tipos.find(t => {
    const nombreNorm = normalizeText(t.nombre)
    if (norm.includes(nombreNorm) || nombreNorm.includes(norm) || norm.includes(normalizeText(t.codigo))) return true
    // Coincidencia por raíz de palabra (>=4 letras): "paquete" -> "Paquetería",
    // "documento" -> "Documentos" — sin esto, un mensaje que ya menciona el
    // tipo de forma natural ("un paquete de 10kg a Cuba") no lo reconocía
    // porque no calzaba como substring exacto de "Paquetería".
    const palabrasNombre = nombreNorm.split(/\s+/)
    return palabrasTexto.some(pt => pt.length >= 4 && palabrasNombre.some(pn =>
      pn.length >= 4 && (pn.startsWith(pt) || pt.startsWith(pn)),
    ))
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
 * Detecta la combinación peso+país en un solo mensaje ("10 kg a España",
 * "tengo un paquete de 3 kg para Cuba") — entidades explícitas que alcanzan
 * para arrancar la cotización directo, sin pedir peso y país por separado.
 * El peso exige unidad pegada (kg/kilo/libra) para no confundir cualquier
 * número suelto del mensaje con un peso real. `countryZone` es el mapa
 * estático de países (fallback síncrono — el mapa dinámico real se sigue
 * pidiendo a la API al iniciar la cotización, esto solo decide si conviene
 * saltar directo al paso "tipo").
 */
export function extraerPesoYPais(textoOriginal, countryZone) {
  const matchPeso = expandirPesoInformal(textoOriginal).match(PATRON_PESO_CON_UNIDAD)
  if (!matchPeso) return null
  const peso = parseFloat(matchPeso[1].replace(',', '.'))
  if (!(peso > 0)) return null
  const pais = matchPais(textoOriginal, countryZone)
  if (!pais) return null
  return { peso, pais }
}

/**
 * Extrae, en UNA sola pasada, todas las entidades de cotización presentes en
 * un mensaje: peso, país y tipo de envío. Reemplaza el look-ahead ad-hoc que
 * cada paso del wizard hacía por su cuenta (el paso "peso" miraba 3
 * extractores, "país" 2 y "tipo" solo 1), que era la razón de que el usuario
 * no pudiera CORREGIR un dato ya dado: los pasos podían mirar hacia adelante,
 * nunca hacia atrás.
 *
 * `pasoActual` decide cuándo un número SUELTO cuenta como peso: solo si el
 * bot está preguntando el peso justo en ese momento ("¿cuánto pesa?" → "10").
 * En cualquier otro paso se exige la unidad explícita ("15kg", "medio kilo"),
 * para que un número incidental en otra respuesta (una dirección, un número
 * de casa) no pise el peso ya confirmado.
 */
export function extraerEntidadesCotizacion(texto, { zonaMap, tipos, pasoActual } = {}) {
  const entidades = {}

  const conUnidad = expandirPesoInformal(texto).match(PATRON_PESO_CON_UNIDAD)
  if (conUnidad) {
    const valor = parseFloat(conUnidad[1].replace(',', '.'))
    if (valor > 0) entidades.peso = valor
  } else if (pasoActual === 'peso') {
    const valor = parsePeso(texto)
    if (valor != null) entidades.peso = valor
  }

  if (zonaMap) {
    const pais = matchPais(texto, zonaMap)
    if (pais) entidades.pais = pais
  }

  if (tipos?.length) {
    const tipo = matchTipo(texto, tipos)
    if (tipo) entidades.tipo = tipo
  }

  return entidades
}

/**
 * "domingo"/"sábado" como ENTIDAD (día), no como keyword de una frase exacta.
 * "trabajan el domingo" no matcheaba horarios antes porque las frases de la
 * FAQ eran de 2-3 palabras exactas ("trabajan domingo", "trabajan los
 * domingos") y "trabajan el domingo" tiene una cantidad de palabras distinta
 * — el chequeo de frase exige mismo orden Y misma cantidad de palabras. En
 * vez de agregar una frase por cada combinación de "el/los" + verbo + día,
 * esto detecta la intención por BOLSA DE PALABRAS: ¿aparece un día de la
 * semana Y un verbo de horario en el mensaje, en cualquier orden y con
 * cualquier palabra en el medio? Así "trabajan los domingos", "atienden el
 * domingo", "laburan domingo", "están abiertos el domingo" matchean todas
 * sin necesitar una frase exacta para cada una.
 */
const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'sabados', 'domingo', 'domingos']
const VERBOS_HORARIO = ['trabajan', 'atienden', 'abren', 'cierran', 'abierto', 'abierta', 'abiertos', 'abiertas', 'laburan', 'pasar', 'caer', 'ir']

/** true si el mensaje pregunta por horario de atención en relación a un día puntual. */
function esConsultaHorarioPorDia(textoNormalizado) {
  const palabras = tokenizar(textoNormalizado)
  return DIAS_SEMANA.some(d => palabras.includes(d)) && VERBOS_HORARIO.some(v => palabras.includes(v))
}

/**
 * Para tiempos_entrega, "Uruguay" cuenta como destino nacional aunque no
 * esté en COUNTRY_ZONE (ese mapa es solo de zonas internacionales — la
 * cotización de envíos usa esa lista tal cual, a propósito, así que no se
 * le agrega Uruguay ahí solo para esto). Se resuelve aparte, antes de
 * intentar matchPais.
 */
function matchDestinoTiempos(textoOriginal, countryZone) {
  if (/\buruguay\b/.test(normalizeText(textoOriginal))) return 'Uruguay'
  return matchPais(textoOriginal, countryZone)
}

/**
 * "Demora de envíos / tiempos de entrega", generalizado por RAÍZ de palabra
 * en vez de por frase exacta — cubre a la vez toda la familia
 * demora/demoran/demoro, tarda/tardan/tardaria, llega/llegan/llegaria,
 * entrega/entregan/entregarse, sin necesitar una keyword por cada
 * conjugación. Dos formas:
 *   1) palabra interrogativa (cuanto/cuantos/que/cual/cuando — "qui" ya se
 *      normaliza a "que" en normalizeText) cerca de una de esas raíces:
 *      "que tiempo demora", "cuando llegan", "cuantos dias tarda".
 *   2) "demora"/"demoras" como sustantivo pegado a envío/paquete/entrega/
 *      pedido, sin necesitar pregunta explícita: "demora de los envios",
 *      "demora del paquete", "cual es la demora".
 * Solo se evalúa DENTRO del loop de FAQ, en el lugar que le toca a
 * tiempos_entrega en el array — así un mensaje que ya matchea una FAQ
 * anterior (ej. documentacion) nunca llega a chequear esto, sin necesidad
 * de una lista de exclusión.
 */
const PATRON_TIEMPOS_ENTREGA = /\b(cuant[oa]s?|que|cual(es)?|cuando)\b[\s\S]{0,25}\b(demor\w*|tard\w*|lleg\w*|entreg\w*|plazo|recib\w*)\b|\bdemor\w*\b[\s\S]{0,15}\b(envio\w*|paquete\w*|entrega\w*|pedido\w*)\b|\bplazo\s+de\s+entrega\b/

/**
 * "¿Cómo puedo pagar?" generalizado por raíz de palabra, mismo mecanismo que
 * PATRON_TIEMPOS_ENTREGA — cubre pagar/pagan/pago/paga/abonar/abono en
 * cualquier conjugación sin necesitar una frase por cada una. Se evalúa
 * solo en el slot de sin_info_pago dentro del loop de FAQ.
 */
const PATRON_PAGO = /\b(como|de que forma|de que manera|cual es la forma)\b[\s\S]{0,30}\b(pag\w*|abon\w*)\b/

/**
 * Frases de confirmación de cobertura hacia un país puntual ("¿envían a
 * Cuba?", "¿llegan a España?"). El país SOLO (sin ninguna de estas frases)
 * no alcanza — evita que cualquier mensaje que mencione un país de pasada
 * dispare esto. Se chequea DESPUÉS de PALABRAS_COTIZAR en
 * buscarIntencionDeNegocio a propósito: "cuánto cuesta enviar a Cuba" debe
 * seguir siendo cotizar, no cobertura — el orden es lo que evita la
 * colisión, no una lista de exclusión de palabras.
 */
const PATRONES_COBERTURA_PAIS = [
  'envian a', 'envian al', 'envian para', 'mandan a', 'mandan para',
  'llegan a', 'llegan para', 'hacen envios a', 'hacen envios para',
  'puedo enviar a', 'puedo enviar para', 'puedo mandar a', 'puedo mandar para',
  'puedo llevar para', 'tienen envios a', 'cubren',
  'ustedes mandan', 'ustedes envian', 'se puede mandar', 'se puede enviar',
  'como se puede mandar', 'como se puede enviar',
]

/** Devuelve el país si el mensaje pregunta por cobertura hacia ese país puntual, o null. */
export function detectarCoberturaPais(textoOriginal, countryZone) {
  const texto = normalizeText(textoOriginal)
  if (!PATRONES_COBERTURA_PAIS.some(p => texto.includes(p))) return null
  return matchPais(textoOriginal, countryZone)
}

/**
 * Busca UNA intención "de negocio" (rastreo en lenguaje natural, humano,
 * cotizar, o FAQ). No incluye cotizar_respuesta (se resuelve antes, en
 * detectarIntenciones) ni greeting/small_talk/goodbye (se resuelven aparte).
 * `textoOriginal` (sin normalizar) hace falta para poder extraer un código
 * de guía embebido en la frase si el usuario pide rastreo con texto libre,
 * o la combinación peso+país para cotizar directo. `countryZone` es opcional
 * (solo lo pasa useChatAgent, que es quien conoce el mapa de países) — sin
 * él simplemente no se intenta la detección de cotizar_directo.
 */
export function buscarIntencionDeNegocio(texto, textoOriginal, countryZone) {
  if (contieneAlguna(texto, PALABRAS_HUMANO)) {
    return { tipo: 'human_handoff' }
  }
  if (contieneAlguna(texto, PALABRAS_RASTREO_ESPECIFICAS)) {
    const numeroEmbebido = extraerNumeroGuiaEmbebido(textoOriginal)
    if (numeroEmbebido) return { tipo: 'rastreo', numero: numeroEmbebido }
    return { tipo: 'rastreo_pedir_numero' }
  }
  // Palabra genérica de rastreo ("seguimiento", "tracking") SOLA: si además
  // el mensaje es una pregunta general de tiempo ("cuánto tarda el
  // seguimiento"), es más probable que pregunte por tiempos_entrega que por
  // el estado de un envío puntual — se cede el paso a la FAQ de abajo en vez
  // de pedir un número de guía que no viene a cuento.
  const esRastreoGenerico = PALABRAS_RASTREO_GENERICAS.some(p => contieneFrase(texto, p))
  if (esRastreoGenerico && !PATRON_PREGUNTA_DE_TIEMPO.test(texto)) {
    const numeroEmbebido = extraerNumeroGuiaEmbebido(textoOriginal)
    if (numeroEmbebido) return { tipo: 'rastreo', numero: numeroEmbebido }
    return { tipo: 'rastreo_pedir_numero' }
  }
  if (countryZone) {
    const entidades = extraerPesoYPais(textoOriginal, countryZone)
    if (entidades) return { tipo: 'cotizar_directo', ...entidades, textoOriginal }
  }
  // Entidad "día" + verbo de horario, en cualquier orden (ver esConsultaHorarioPorDia)
  // — se chequea antes que el loop de FAQ para no depender de que "horarios"
  // tenga una frase exacta para cada combinación posible.
  if (esConsultaHorarioPorDia(texto)) {
    const horarios = FAQ.find(f => f.id === 'horarios')
    if (horarios) return { tipo: 'faq', respuesta: horarios.respuesta, temaId: horarios.id, derivaWhatsapp: false }
  }
  // FAQ antes que "cotizar" genérico: palabras como "cuanto cuesta"/"precio"
  // aparecen en preguntas de temas puntuales (ej. "cuanto cuesta el despacho
  // aduanero") que tienen su propia respuesta específica y no deben terminar
  // en el flujo de cotización de envíos.
  for (const entrada of FAQ) {
    const matchTiemposGeneralizado = entrada.id === 'tiempos_entrega' && PATRON_TIEMPOS_ENTREGA.test(texto)
    const matchPagoGeneralizado = entrada.id === 'sin_info_pago' && PATRON_PAGO.test(texto)
    if (matchTiemposGeneralizado || matchPagoGeneralizado || contieneAlguna(texto, entrada.palabrasClave)) {
      // tiempos_entrega sin país mencionado: preguntamos el destino antes de
      // responder — el tiempo real (nacional 24h vs internacional con
      // escala) depende de eso, y así se evita responder a ciegas.
      if (entrada.id === 'tiempos_entrega' && countryZone) {
        const paisEncontrado = matchDestinoTiempos(textoOriginal, countryZone)
        if (!paisEncontrado) return { tipo: 'tiempos_pedir_pais' }
        return { tipo: 'faq', respuesta: entrada.respuesta, temaId: entrada.id, derivaWhatsapp: false, chips: null, pais: paisEncontrado }
      }
      return { tipo: 'faq', respuesta: entrada.respuesta, temaId: entrada.id, derivaWhatsapp: !!entrada.derivaWhatsapp, chips: entrada.chips ?? null }
    }
  }
  // Precio ultra genérico y SOLO eso (sin mención de envío/paquete/kg/país):
  // es ambiguo entre envío, casillero, despacho o equipaje — se pide aclarar
  // en vez de asumir que siempre es cotizar un envío.
  if (FRASES_PRECIO_AMBIGUO.has(texto.replace(/^[.,!?¡¿]+|[.,!?¡¿]+$/g, ''))) {
    return { tipo: 'ambiguo_precio' }
  }
  if (contieneAlguna(texto, PALABRAS_COTIZAR)) {
    // Si el mismo mensaje ya menciona el país destino (ej. "quiero mandar un
    // paquete pa Cuba"), se lo pasamos al wizard para que no lo vuelva a
    // preguntar — es el mismo principio de cotizar_directo pero sin peso.
    const paisPrellenado = countryZone ? matchPais(textoOriginal, countryZone) : null
    return { tipo: 'cotizar_iniciar', paisPrellenado }
  }
  if (countryZone) {
    const paisCobertura = detectarCoberturaPais(textoOriginal, countryZone)
    if (paisCobertura) return { tipo: 'cobertura_pais', pais: paisCobertura }
  }
  return null
}

/**
 * Detecta todas las intenciones del mensaje. Devuelve un ARRAY, nunca vacío.
 * `estado`: { flujo: 'cotizando' | null, ultimoTema: string | null, countryZone?: object }
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

  // El bot acaba de pedir el número de guía ("Decime el número de tu
  // guía..."): la respuesta real casi nunca es SOLO el código pegado (ver
  // extraerNumeroGuia arriba) — suele venir con texto alrededor ("es este
  // CM000001224PK", "el numero es 123456"). Con este contexto puntual alcanza
  // con que el código aparezca en cualquier parte del mensaje.
  if (estado?.esperandoGuia) {
    const numeroEmbebido = extraerNumeroGuiaEmbebido(textoOriginal)
    if (numeroEmbebido) return [{ tipo: 'rastreo', numero: numeroEmbebido }]
  }

  // El bot acaba de preguntar el país para responder tiempos_entrega — con
  // este contexto alcanza con que el país aparezca en el mensaje (aunque
  // sea la respuesta bien corta, "Cuba", que sola no dispara nada normalmente).
  if (estado?.esperandoPaisTiempos && estado.countryZone) {
    const pais = matchDestinoTiempos(textoOriginal, estado.countryZone)
    if (pais) {
      const tiempos = FAQ.find(f => f.id === 'tiempos_entrega')
      if (tiempos) return [{ tipo: 'faq', respuesta: tiempos.respuesta, temaId: tiempos.id, derivaWhatsapp: false, chips: null, pais }]
    }
  }

  const texto = normalizeText(textoOriginal)

  if (contieneAlguna(texto, GOODBYE_PALABRAS)) {
    return [{ tipo: 'goodbye' }]
  }

  for (const grupo of SMALL_TALK) {
    if (contieneAlguna(texto, grupo.palabrasClave)) {
      // Igual que el saludo: "gracias, y el horario?" debe responder ambas cosas,
      // no solo el agradecimiento.
      const negocioCombinado = buscarIntencionDeNegocio(texto, textoOriginal, estado?.countryZone)
      if (negocioCombinado) return [{ tipo: grupo.tipo, respuestas: grupo.respuestas }, negocioCombinado]
      return [{ tipo: grupo.tipo, respuestas: grupo.respuestas }]
    }
  }

  const esGreeting = contieneAlguna(texto, GREETING_PALABRAS)
  const negocio = buscarIntencionDeNegocio(texto, textoOriginal, estado?.countryZone)

  if (esGreeting && negocio) return [{ tipo: 'greeting' }, negocio]
  if (esGreeting) return [{ tipo: 'greeting' }]
  if (negocio) return [negocio]

  const palabrasMensaje = textoOriginal.trim().split(/\s+/)
  if (estado?.ultimoTema && palabrasMensaje.length >= 2 && palabrasMensaje.length < 6) {
    const temaPrevio = FAQ.find(f => f.id === estado.ultimoTema)
    if (temaPrevio) {
      return [{ tipo: 'faq', respuesta: temaPrevio.respuesta, temaId: temaPrevio.id, derivaWhatsapp: !!temaPrevio.derivaWhatsapp, chips: temaPrevio.chips ?? null }]
    }
  }

  return [{ tipo: 'desconocido' }]
}
