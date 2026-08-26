#!/usr/bin/env node
/**
 * Batería de pruebas del motor de intención del ChatAgent.
 *
 * Cubre: detección de intención pura (detectarIntenciones/buscarIntencionDeNegocio,
 * sin red, sin React) contra ~140 variantes de mensajes reales — saludos, small
 * talk, despedida, las 13 FAQ, cotizar, rastreo (código pegado y en lenguaje
 * natural), derivación a humano, combinaciones multi-intención, la heurística
 * de "último tema", y las interrupciones dentro del flujo de cotización.
 * También valida en vivo la forma real de los endpoints públicos que usa
 * useChatAgent.js (rastreo.php, tarifario.php) para detectar drift de contrato
 * con el backend (ej. el bug real de "data.zonas" anidado que hubo en este
 * proyecto).
 *
 * Esto NO reemplaza un E2E de navegador real: el flujo multi-turno de
 * cotización (peso -> país -> tipo, con estado en refs de React) vive dentro
 * de useChatAgent.js y no se puede ejecutar fuera de React sin duplicar su
 * lógica (lo que daría falsa confianza). Para cubrir eso hace falta un
 * harness de navegador (Playwright) que no existe en este proyecto todavía.
 *
 * Uso: node scripts/chat-agent-battery.mjs
 * (opcional) SKIP_API=1 node scripts/chat-agent-battery.mjs   -> salta los checks de API en vivo
 */
import {
  detectarIntenciones, buscarIntencionDeNegocio, normalizeText, extraerNumeroGuia, parsePeso,
} from '../src/components/ChatAgent/intentEngine.js'

const API = 'http://localhost/pack-sistema/api/v1'

let pasaron = 0
let fallaron = 0
const fallas = []

function caso(descripcion, texto, estado, verificar) {
  const resultado = detectarIntenciones(texto, estado)
  const tipos = resultado.map(i => i.temaId || i.tipo)
  const ok = verificar(resultado, tipos)
  if (ok) {
    pasaron++
  } else {
    fallaron++
    fallas.push({ descripcion, texto, obtenido: tipos })
  }
}

function esperarTipo(tipoEsperado) {
  return (_, tipos) => tipos.length >= 1 && tipos[0] === tipoEsperado
}

function esperarSecuencia(...tiposEsperados) {
  return (_, tipos) => JSON.stringify(tipos) === JSON.stringify(tiposEsperados)
}

const sinFlujo = { flujo: null, ultimoTema: null }
const conUltimoTema = (tema) => ({ flujo: null, ultimoTema: tema })
const ZONA_FAKE = { 'España': 'B', 'Cuba': 'E', 'Estados Unidos': 'A' }
const conCountryZone = { flujo: null, ultimoTema: null, countryZone: ZONA_FAKE }

// ── Saludos ──────────────────────────────────────────────────────────────
caso('saludo simple', 'hola', sinFlujo, esperarTipo('greeting'))
caso('saludo con typo leve (holaa)', 'holaa buenas', sinFlujo, esperarTipo('greeting'))
caso('saludo formal', 'buenos dias', sinFlujo, esperarTipo('greeting'))
caso('saludo informal ingles', 'hey', sinFlujo, esperarTipo('greeting'))
caso('saludo + duda combinada', 'hola tengo una duda', sinFlujo, esperarTipo('greeting'))
caso('saludo + negocio combinado (horarios)', 'hola que horario tienen', sinFlujo, esperarSecuencia('greeting', 'horarios'))
caso('saludo con signos de exclamacion', '¡Hola!', sinFlujo, esperarTipo('greeting'))
caso('saludo con mayusculas', 'HOLA', sinFlujo, esperarTipo('greeting'))

// ── Despedida ────────────────────────────────────────────────────────────
caso('despedida simple', 'chau', sinFlujo, esperarTipo('goodbye'))
caso('despedida formal', 'hasta luego', sinFlujo, esperarTipo('goodbye'))
caso('despedida con gracias', 'listo gracias', sinFlujo, esperarTipo('goodbye'))
caso('despedida ingles', 'bye', sinFlujo, esperarTipo('goodbye'))

// ── Small talk ───────────────────────────────────────────────────────────
caso('como estas', 'como estas', sinFlujo, esperarTipo('small_talk'))
caso('gracias', 'gracias', sinFlujo, esperarTipo('thanks'))
caso('gracias con typo (grasias)', 'grasias', sinFlujo, esperarTipo('thanks'))
caso('confirmacion perfecto', 'perfecto', sinFlujo, esperarTipo('small_talk'))
caso('gracias + FAQ combinado', 'grasias, y el horario?', sinFlujo, esperarSecuencia('thanks', 'horarios'))

// ── FAQ: horarios ────────────────────────────────────────────────────────
caso('horarios directo', 'horarios', sinFlujo, esperarTipo('horarios'))
caso('horarios pregunta natural', 'a que hora abren', sinFlujo, esperarTipo('horarios'))
caso('horarios fin de semana', 'trabajan los sabados', sinFlujo, esperarTipo('horarios'))
caso('horarios variante nueva', 'que horario tienen', sinFlujo, esperarTipo('horarios'))

// ── FAQ: casillero ───────────────────────────────────────────────────────
caso('casillero directo', 'casillero', sinFlujo, esperarTipo('casillero'))
caso('casillero comprar amazon', 'quiero comprar en amazon', sinFlujo, esperarTipo('casillero'))
caso('casillero pregunta que es', 'que es el casillero', sinFlujo, esperarTipo('casillero'))
caso('casillero shein', 'puedo comprar en shein', sinFlujo, esperarTipo('casillero'))

// ── FAQ: cobertura ───────────────────────────────────────────────────────
caso('cobertura directo', 'cobertura', sinFlujo, esperarTipo('cobertura'))
caso('cobertura paises', 'a que paises envian', sinFlujo, esperarTipo('cobertura'))
caso('cobertura departamentos', 'hacen envios al interior', sinFlujo, esperarTipo('cobertura'))
caso('cobertura variante nueva', 'hacen envios a europa', sinFlujo, esperarTipo('cobertura'))

// ── FAQ: documentacion / prohibidos ─────────────────────────────────────
caso('documentacion directo', 'documentacion', sinFlujo, esperarTipo('documentacion'))
caso('articulos prohibidos exacto', 'articulos prohibidos', sinFlujo, esperarTipo('documentacion'))
caso('articulos prohibidos con typo (prhobibidos)', 'articulos prhobibidos', sinFlujo, esperarTipo('documentacion'))
caso('cuales son los articulos prohibidos', 'cuales son los articulos prohibidos', sinFlujo, esperarTipo('documentacion'))
caso('declaracion jurada', 'que es la declaracion jurada', sinFlujo, esperarTipo('documentacion'))

// ── FAQ: peso_maximo (el más parchado esta sesión) ──────────────────────
caso('peso maximo directo', 'peso maximo', sinFlujo, esperarTipo('peso_maximo'))
caso('peso maximo pregunta natural 1', 'cuanto es lo maximo que puedo enviar en un paquete', sinFlujo, esperarTipo('peso_maximo'))
caso('peso maximo pregunta natural 2', 'que es lo maximo que puede pesar un paquete', sinFlujo, esperarTipo('peso_maximo'))
caso('peso maximo pregunta natural 3', 'cuantos kg puedo enviar', sinFlujo, esperarTipo('peso_maximo'))
caso('peso maximo libras', 'cuantas libras puedo enviar', sinFlujo, esperarTipo('peso_maximo'))
caso('peso maximo kilo adicional', 'cuanto es el kilo adicional', sinFlujo, esperarTipo('peso_maximo'))
caso('peso maximo variante "cual es"', 'cual es el peso maximo que puedo enviar de un paquete', sinFlujo, esperarTipo('peso_maximo'))

// ── FAQ: servicios ───────────────────────────────────────────────────────
caso('servicios directo', 'servicios', sinFlujo, esperarTipo('servicios'))
caso('servicios que ofrecen', 'que ofrecen', sinFlujo, esperarTipo('servicios'))
caso('servicios tipo envio', 'que tipo de envios hacen', sinFlujo, esperarTipo('servicios'))

// ── FAQ: contacto / ubicacion / redes ────────────────────────────────────
caso('contacto directo', 'contacto', sinFlujo, esperarTipo('contacto'))
caso('contacto telefono', 'cual es su numero', sinFlujo, esperarTipo('contacto'))
caso('ubicacion directo', 'ubicacion', sinFlujo, esperarTipo('ubicacion'))
caso('ubicacion direccion', 'cual es su direccion', sinFlujo, esperarTipo('ubicacion'))
caso('redes instagram', 'tienen instagram', sinFlujo, esperarTipo('redes_sociales'))
caso('redes cual es', 'cual es el instagram', sinFlujo, esperarTipo('redes_sociales'))

// ── FAQ: sin_info_* (derivan a WhatsApp) ─────────────────────────────────
caso('pago metodos', 'metodos de pago', sinFlujo, (r, t) => t[0] === 'sin_info_pago' && r[0].derivaWhatsapp === true)
caso('pago tarjeta credito', 'puedo pagar con tarjeta de credito', sinFlujo, esperarTipo('sin_info_pago'))
caso('cancelacion directo', 'quiero cancelar', sinFlujo, (r, t) => t[0] === 'sin_info_cancelacion' && r[0].derivaWhatsapp === true)
caso('cancelacion reclamo', 'quiero hacer un reclamo', sinFlujo, esperarTipo('sin_info_cancelacion'))
caso('promociones directo', 'promociones', sinFlujo, (r, t) => t[0] === 'sin_info_promociones' && r[0].derivaWhatsapp === true)
caso('promociones cupones', 'hay cupones', sinFlujo, esperarTipo('sin_info_promociones'))

// ── Cotizar ──────────────────────────────────────────────────────────────
caso('cotizar directo', 'cotizar', sinFlujo, esperarTipo('cotizar_iniciar'))
caso('cotizar cuanto cuesta', 'cuanto cuesta el envio', sinFlujo, esperarTipo('cotizar_iniciar'))
caso('cotizar tarifas', 'me puedes pasarlas tarifas de los envios', sinFlujo, esperarTipo('cotizar_iniciar'))
caso('cotizar quiero un presupuesto', 'quiero un presupuesto', sinFlujo, esperarTipo('cotizar_iniciar'))

// ── Rastreo: código pegado directo (fuera de intención de negocio) ──────
caso('rastreo codigo CM solo', 'CM000001224PK', sinFlujo, esperarTipo('rastreo'))
caso('rastreo numero suelto solo', '123456', sinFlujo, esperarTipo('rastreo'))

// ── Rastreo: lenguaje natural (sin código embebido -> pide numero) ──────
caso('rastreo lenguaje natural simple', 'quiero rastrear un envio', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo lenguaje natural variante', 'donde esta mi paquete', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo lenguaje natural nueva variante', 'quiero saber donde esta mi pedido', sinFlujo, esperarTipo('rastreo_pedir_numero'))

// ── Rastreo: lenguaje natural CON código embebido en la misma frase ─────
caso('rastreo con codigo embebido CM', 'rastreame este paquete CM000001224PK por favor', sinFlujo,
  (r) => r.length === 1 && r[0].tipo === 'rastreo' && r[0].numero.toUpperCase().includes('CM000001224PK'))
caso('rastreo con numero suelto embebido', 'quiero rastrear mi guia 123456', sinFlujo,
  (r) => r.length === 1 && r[0].tipo === 'rastreo' && r[0].numero === '123456')

// ── Falso positivo histórico: numero suelto en frase NO de rastreo no debe activar rastreo ──
caso('numero en frase de peso no es rastreo', '500 gramos cuesta lo mismo?', sinFlujo, (_, t) => t[0] !== 'rastreo')

// ── Humano ───────────────────────────────────────────────────────────────
caso('humano hablar con persona', 'hablar con una persona', sinFlujo, esperarTipo('human_handoff'))
caso('humano quiero whatsapp', 'quiero whatsapp', sinFlujo, esperarTipo('human_handoff'))
caso('humano variante soporte', 'quiero hablar con soporte', sinFlujo, esperarTipo('human_handoff'))

// ── Desconocido / fallback ───────────────────────────────────────────────
caso('desconocido texto sin sentido', 'asdkjhaskjdh', sinFlujo, esperarTipo('desconocido'))
caso('desconocido sin ultimo tema', 'esto no tiene relacion con nada', sinFlujo, esperarTipo('desconocido'))

// ── Heurística "último tema" ─────────────────────────────────────────────
caso('ultimo tema: reusa con seguimiento corto (2-5 palabras)', 'y los sabados?', conUltimoTema('horarios'), esperarTipo('horarios'))
caso('ultimo tema: reusa con "y eso"', 'y eso', conUltimoTema('cobertura'), esperarTipo('cobertura'))
caso('ultimo tema: NO reusa con una sola palabra sin sentido', 'asdkjhaskjdh', conUltimoTema('horarios'), esperarTipo('desconocido'))
caso('ultimo tema: NO reusa con 6+ palabras (mensaje largo)', 'esto es un mensaje bastante largo sin relacion', conUltimoTema('horarios'), esperarTipo('desconocido'))
caso('ultimo tema: intención propia (cotizar) gana sobre el heurístico', 'y el precio', conUltimoTema('cobertura'), esperarTipo('cotizar_iniciar'))
caso('ultimo tema: intención propia (whatsapp) gana sobre el heurístico', 'y el whatsapp', conUltimoTema('horarios'), esperarTipo('human_handoff'))

// ── Interrupción dentro del flujo de cotización (buscarIntencionDeNegocio) ──
{
  const textoNorm = normalizeText('cual es el peso maximo que puedo enviar de un paquete')
  const negocio = buscarIntencionDeNegocio(textoNorm, 'cual es el peso maximo que puedo enviar de un paquete')
  if (negocio?.tipo === 'faq' && negocio.temaId === 'peso_maximo') pasaron++
  else { fallaron++; fallas.push({ descripcion: 'interrupcion de flujo: pregunta de peso máximo', texto: '(interno)', obtenido: negocio }) }
}
{
  // Una respuesta válida de país (ej. "Cuba") NO debe dispararse como negocio/FAQ —
  // si esto empezara a matchear algo, un país real rompería el paso 'país' del flujo.
  const textoNorm = normalizeText('Cuba')
  const negocio = buscarIntencionDeNegocio(textoNorm, 'Cuba')
  if (negocio === null) pasaron++
  else { fallaron++; fallas.push({ descripcion: 'un país NO debe interpretarse como intención de negocio', texto: 'Cuba', obtenido: negocio }) }
}
{
  // Una respuesta válida de tipo de envío común no debe colisionar con la FAQ de documentación
  // ("documentos" vive en las palabras clave de esa FAQ con tolerancia a typos).
  const textoNorm = normalizeText('documento')
  const negocio = buscarIntencionDeNegocio(textoNorm, 'documento')
  if (negocio?.tipo === 'faq' && negocio.temaId === 'documentacion') {
    fallaron++
    fallas.push({ descripcion: 'REGRESIÓN DE RIESGO: "documento" (posible tipo de envío) colisiona con FAQ documentación', texto: 'documento', obtenido: negocio })
  } else {
    pasaron++
  }
}

// ── Typos multi-palabra (fraseFuzzyContigua) ─────────────────────────────
caso('typo: estan aviertos', 'estan aviertos?', sinFlujo, esperarTipo('horarios'))
caso('typo: orario de atencion', 'orario de atencion', sinFlujo, esperarTipo('horarios'))
caso('typo: documentacion nesesaria', 'documentacion nesesaria', sinFlujo, esperarTipo('documentacion'))
caso('typo NO debe inflar tolerancia en palabras cortas', 'estan aviertas las puertas del cielo', sinFlujo, (_, t) => t[0] !== 'horarios')

// ── Abreviaciones de chat (q, xq, tb, dnd, hs, finde) ────────────────────
caso('abreviacion: a q hora abren', 'a q hora abren', sinFlujo, esperarTipo('horarios'))
caso('abreviacion: q horario tienen', 'q horario tienen', sinFlujo, esperarTipo('horarios'))
caso('abreviacion: dnd estan ubicados', 'dnd estan ubicados', sinFlujo, esperarTipo('ubicacion'))
caso('abreviacion: tb quiero saber el horario', 'tb quiero saber el horario', sinFlujo, esperarTipo('horarios'))

// ── Lenguaje uruguayo / rioplatense corto ────────────────────────────────
caso('uruguayo: trabajan sabado (singular)', 'trabajan sabado', sinFlujo, esperarTipo('horarios'))
caso('uruguayo: puedo caer hoy', 'puedo caer hoy', sinFlujo, esperarTipo('horarios'))
caso('uruguayo: que dias laburan', 'que dias laburan', sinFlujo, esperarTipo('horarios'))

// ── Tracking: sinónimos nuevos (tracking, guia, incidencias) ─────────────
caso('rastreo: tracking (anglicismo)', 'tracking', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo: quiero consultar mi guia', 'quiero consultar mi guia', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo: no me llego el paquete', 'no me llego el paquete', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo: el paquete llego dañado', 'el paquete llego dañado', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo: mi pedido esta perdido', 'mi pedido esta perdido', sinFlujo, esperarTipo('rastreo_pedir_numero'))

// ── Entidades: peso + país combinados → cotizar_directo ──────────────────
caso('entidad: 10 kg a España', '10 kg a España', conCountryZone, (r, t) => t[0] === 'cotizar_directo' && r[0].peso === 10 && r[0].pais === 'España')
caso('entidad: paquete de 3 kg para Cuba', 'tengo un paquete de 3 kg para Cuba', conCountryZone, (r, t) => t[0] === 'cotizar_directo' && r[0].peso === 3 && r[0].pais === 'Cuba')
caso('entidad: sin countryZone no activa cotizar_directo', '10 kg a España', sinFlujo, (_, t) => t[0] !== 'cotizar_directo')
caso('entidad: numero sin unidad de peso NO dispara cotizar_directo', '10 personas viajan a España', conCountryZone, (_, t) => t[0] !== 'cotizar_directo')
caso('entidad: peso con unidad pero sin país reconocido sigue cotizar_iniciar', 'tengo 10 kg para enviar', conCountryZone, esperarTipo('cotizar_iniciar'))

// ── Ambigüedad de precio (chips de aclaración) ───────────────────────────
caso('ambiguo: "cuanto cuesta" solo', 'cuanto cuesta', sinFlujo, esperarTipo('ambiguo_precio'))
caso('ambiguo: "precio" solo', 'precio', sinFlujo, esperarTipo('ambiguo_precio'))
caso('ambiguo: con contexto de envio ya NO es ambiguo', 'cuanto cuesta el envio', sinFlujo, esperarTipo('cotizar_iniciar'))
caso('ambiguo: pregunta de tema puntual gana sobre precio ambiguo', 'cuanto cuesta el despacho aduanero', sinFlujo, esperarTipo('despacho_aduanero'))

// ── No debe cruzar de tema (falsos positivos) ────────────────────────────
caso('NO cruza: cuanto demora el casillero sigue siendo casillero', 'cuanto demora el casillero', sinFlujo, esperarTipo('casillero'))
caso('NO cruza: "documento" solo no es la FAQ de documentacion', 'documento', sinFlujo, (_, t) => t[0] !== 'documentacion')
caso('NO cruza: enviar documentos no es la FAQ de documentacion', 'necesito enviar unos documentos', sinFlujo, (_, t) => t[0] !== 'documentacion')

// ── Cobertura por país puntual (entidad país + frase de cobertura) ───────
caso('cobertura_pais: envian a Cuba', 'Envian a Cuba?', conCountryZone, (r, t) => t[0] === 'cobertura_pais' && r[0].pais === 'Cuba')
caso('cobertura_pais: puedo enviar a Cuba', 'Puedo enviar a Cuba', conCountryZone, esperarTipo('cobertura_pais'))
caso('cobertura_pais: mandan a Cuba', 'Mandan a Cuba?', conCountryZone, esperarTipo('cobertura_pais'))
caso('cobertura_pais: llegan a Estados Unidos', 'Llegan a Estados Unidos?', conCountryZone, esperarTipo('cobertura_pais'))
caso('cobertura_pais: pais SOLO no dispara nada', 'Cuba', conCountryZone, esperarTipo('desconocido'))
caso('cobertura_pais: cotizar con precio gana sobre cobertura', 'Cuanto cuesta enviar a Cuba?', conCountryZone, esperarTipo('cotizar_iniciar'))
caso('cobertura_pais: peso+pais gana sobre cobertura', 'tengo 10 kg para enviar a Cuba', conCountryZone, esperarTipo('cotizar_directo'))

// ── "Cuánto pesa" corto → peso_maximo, no cotizar ────────────────────────
caso('cuanto pesa corto', 'Cuanto pesa?', sinFlujo, esperarTipo('peso_maximo'))

// ── rastreo vs tiempos_entrega: "seguimiento"/"tracking" genéricos ceden
// el paso a tiempos_entrega cuando el mensaje es una pregunta de tiempo,
// pero siguen pidiendo el número de guía en cualquier otro caso ──────────
caso('rastreo/tiempos: cuanto tarda el seguimiento', 'Cuanto tarda el seguimiento?', sinFlujo, esperarTipo('tiempos_entrega'))
caso('rastreo/tiempos: cuanto demora el seguimiento', 'Cuanto demora el seguimiento', sinFlujo, esperarTipo('tiempos_entrega'))
caso('rastreo/tiempos: cuanto tarda el tracking', 'Cuanto tarda el tracking?', sinFlujo, esperarTipo('tiempos_entrega'))
caso('rastreo/tiempos: "seguimiento" solo sigue siendo rastreo', 'Seguimiento', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo/tiempos: "tracking" solo sigue siendo rastreo', 'tracking', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo/tiempos: quiero hacer seguimiento sigue siendo rastreo', 'quiero hacer seguimiento', sinFlujo, esperarTipo('rastreo_pedir_numero'))
caso('rastreo/tiempos: frase especifica no se ve afectada', 'Donde esta mi paquete', sinFlujo, esperarTipo('rastreo_pedir_numero'))

// ── Extracción de guía / peso (funciones puras auxiliares) ──────────────
function assertPure(descripcion, obtenido, esperado) {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  if (ok) pasaron++
  else { fallaron++; fallas.push({ descripcion, texto: '(interno)', obtenido, esperado }) }
}
assertPure('extraerNumeroGuia: código CM válido', extraerNumeroGuia('CM000001224PK'), 'CM000001224PK')
assertPure('extraerNumeroGuia: número suelto válido', extraerNumeroGuia('123456'), '123456')
assertPure('extraerNumeroGuia: NO detecta número dentro de frase', extraerNumeroGuia('tengo 500 gramos'), null)
assertPure('parsePeso: decimal con coma', parsePeso('3,5'), 3.5)
assertPure('parsePeso: decimal con punto', parsePeso('3.5 kg'), 3.5)
assertPure('parsePeso: texto sin número', parsePeso('no se'), null)
assertPure('parsePeso: cero no es válido', parsePeso('0'), null)

// ── Reporte de la parte pura ─────────────────────────────────────────────
console.log(`\n== Motor de intención (pura, sin red) ==`)
console.log(`${pasaron} pasaron, ${fallaron} fallaron de ${pasaron + fallaron}`)
if (fallas.length) {
  console.log('\nFallas:')
  for (const f of fallas) {
    console.log(`  ✗ ${f.descripcion}`)
    console.log(`    texto: ${JSON.stringify(f.texto)}`)
    console.log(`    obtenido: ${JSON.stringify(f.obtenido)}${f.esperado !== undefined ? `  esperado: ${JSON.stringify(f.esperado)}` : ''}`)
  }
}

// ── Contrato en vivo del backend (detecta drift, no lógica de negocio) ──
if (process.env.SKIP_API === '1') {
  console.log('\n== Contrato de API en vivo: SALTEADO (SKIP_API=1) ==')
  process.exitCode = fallaron > 0 ? 1 : 0
  process.exit(process.exitCode)
}

let apiPasaron = 0
let apiFallaron = 0
const apiFallas = []

async function checkApi(descripcion, fn) {
  try {
    const ok = await fn()
    if (ok) apiPasaron++
    else { apiFallaron++; apiFallas.push({ descripcion, motivo: 'assert falso' }) }
  } catch (e) {
    apiFallaron++
    apiFallas.push({ descripcion, motivo: e.message })
  }
}

await checkApi('GET zonas devuelve array con nombre/zona_cod', async () => {
  const res = await fetch(`${API}/tarifario.php?action=zonas`)
  const json = await res.json()
  return json.ok && Array.isArray(json.data) && json.data.length > 0 && 'nombre' in json.data[0] && 'zona_cod' in json.data[0]
})

await checkApi('GET tipos es accesible SIN sesión (lo llama iniciarCotizacion desde la landing pública)', async () => {
  const res = await fetch(`${API}/tarifario.php?action=tipos`)
  const json = await res.json()
  if (res.status === 401) {
    throw new Error('401 No autenticado — "tipos" no está en la lista de endpoints públicos de tarifario.php (solo zonas/cotizar_todas lo están). Un visitante anónimo de la landing NO puede cotizar hoy: tanto el chat como el cotizador completo (Cotizacion.jsx) llaman a este endpoint sin sesión.')
  }
  return json.ok && Array.isArray(json.data) && json.data.length > 0 && 'id' in json.data[0] && 'nombre' in json.data[0]
})

await checkApi('POST cotizar_todas: data.zonas es array (no data directo)', async () => {
  // tipo_servicio_id=1 hardcodeado a propósito: no se puede depender de GET
  // tipos acá porque ese endpoint requiere sesión (ver check anterior) y este
  // test debe poder correr como visitante anónimo real.
  const res = await fetch(`${API}/tarifario.php?action=cotizar_todas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peso: 5, tipo_servicio_id: 1 }),
  })
  const json = await res.json()
  return json.ok && Array.isArray(json.data?.zonas) && 'zona_cod' in json.data.zonas[0] && 'total' in json.data.zonas[0]
})

await checkApi('GET rastreo con código inexistente devuelve ok:false (no 500)', async () => {
  const res = await fetch(`${API}/rastreo.php?guia_numero=CM999999999PK`)
  const json = await res.json()
  return res.status < 500 && json.ok === false
})

console.log(`\n== Contrato de API en vivo (localhost) ==`)
console.log(`${apiPasaron} pasaron, ${apiFallaron} fallaron de ${apiPasaron + apiFallaron}`)
if (apiFallas.length) {
  console.log('\nFallas de API (puede ser que el backend local no esté corriendo):')
  for (const f of apiFallas) console.log(`  ✗ ${f.descripcion} — ${f.motivo}`)
}

const totalFallas = fallaron + apiFallaron
console.log(`\n== TOTAL: ${pasaron + apiPasaron} pasaron, ${totalFallas} fallaron ==`)
process.exitCode = totalFallas > 0 ? 1 : 0
