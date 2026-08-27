/**
 * Hook que orquesta la conversación del ChatAgent: estado de mensajes,
 * persistencia en localStorage, y los flujos de rastreo/cotización/FAQ
 * llamando a los endpoints públicos que ya usan Tracking.jsx y Cotizacion.jsx.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  detectarIntenciones, matchPais, matchTipo, formatFechaHora, elegirSaludo, normalizeText,
  buscarIntencionDeNegocio, extraerEntidadesCotizacion, nombrePaisParaMostrar,
} from './intentEngine'
import { GOODBYE_RESPONSES, FAQ, RESPUESTA_TIEMPOS_NACIONAL } from './chatKnowledge'
import { COUNTRY_ZONE, ZONE_LABELS } from '../../lib/zones'
import { WHATSAPP_URL } from '../../lib/whatsapp'

const API = '/pack-sistema/api/v1'
const STORAGE_KEY = 'pe_chat_history'
const MAX_INTENTOS_FALLIDOS = 2
/** Tope de mensajes en cola — evita acumular una avalancha si algo se traba. */
const MAX_COLA = 5

/** Pesos de referencia para armar una tabla cuando el usuario pide "todas las tarifas" en vez de un peso puntual. */
const PESOS_TABLA = [1, 3, 5, 10, 20]
const PALABRAS_TODO_TARIFARIO = [
  'todo', 'todos', 'todas', 'toda', 'de todos', 'todo el tarifario',
  'toda la tarifa', 'todas las tarifas', 'el tarifario completo',
  'todos los pesos', 'cualquier peso', 'todo el rango', 'la tabla completa',
  'todas las tarifas de envio', 'toda la lista de precios',
]

function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function crearMensaje(autor, texto, chips = null) {
  return { id: crypto.randomUUID(), autor, texto, chips, ts: Date.now() }
}

function flujoVacio() {
  return { activo: false, paso: null, datos: {}, intentosFallidos: 0, tipos: [], zonaMap: COUNTRY_ZONE }
}

function contextoVacio() {
  return { ultimoTema: null, nivelFallback: 0, esperandoGuia: false, esperandoPaisTiempos: false }
}

/* ── Slot filling del flujo de cotización ─────────────────────────────────
 * El wizard es SLOT-driven, no step-driven: en cada mensaje se extraen todas
 * las entidades que haya (ver extraerEntidadesCotizacion) y recién después se
 * mira qué falta. Eso es lo que permite que el usuario se adelante ("10kg
 * para Cuba, paquetería") o corrija algo ya dado ("perdón, son 15kg") sin
 * que el flujo tenga que preverlo paso por paso.
 */
const SLOTS_COTIZACION = ['peso', 'pais', 'tipo']

function nombresTiposDe(flujo) {
  return flujo.tipos.map(t => t.nombre).join(', ') || 'paquete, documento'
}

/** Slots todavía sin completar. En modo tabla el peso no hace falta: se cotizan varios. */
function slotsFaltantes(flujo) {
  const requeridos = flujo.datos.modoTabla ? ['pais', 'tipo'] : SLOTS_COTIZACION
  return requeridos.filter(slot => flujo.datos[slot] == null)
}

function preguntaDeSlot(slot, flujo) {
  if (slot === 'peso') return '¿Cuál es el peso aproximado del envío en kg?'
  if (slot === 'pais') return '¿A qué país enviamos?'
  return `¿Qué tipo de envío es? (${nombresTiposDe(flujo)})`
}

function noEntendiSlot(slot) {
  if (slot === 'peso') return 'No pude entender el peso, ¿podés escribirlo solo en números? Ej: 2.5'
  if (slot === 'pais') return 'No reconocí ese país, ¿podés escribirlo de nuevo? Por ejemplo: Estados Unidos, España, Cuba.'
  return 'No reconocí ese tipo de envío, ¿podés elegir uno de la lista?'
}

/** Confirma lo que se acaba de entender: "10 kg a Cuba", "15 kg", "destino España". */
function resumenEntidades(nuevas) {
  const partes = []
  if (nuevas.peso != null && nuevas.pais) partes.push(`${nuevas.peso} kg a ${nombrePaisParaMostrar(nuevas.pais)}`)
  else if (nuevas.peso != null) partes.push(`${nuevas.peso} kg`)
  else if (nuevas.pais) partes.push(`destino ${nombrePaisParaMostrar(nuevas.pais)}`)
  if (nuevas.tipo) partes.push(nuevas.tipo.nombre)
  return partes.join(', ')
}

/** Texto de tiempos de entrega según el destino: nacional (Uruguay) vs internacional. */
function respuestaTiempos(pais) {
  const internacional = FAQ.find(f => f.id === 'tiempos_entrega')?.respuesta ?? ''
  return pais && normalizeText(pais) === 'uruguay' ? RESPUESTA_TIEMPOS_NACIONAL : internacional
}

/** Respuesta final de un intent 'faq', resolviendo el caso de tiempos según destino. */
function textoDeFaq(intencion) {
  return intencion.temaId === 'tiempos_entrega' ? respuestaTiempos(intencion.pais) : intencion.respuesta
}

export function useChatAgent() {
  const [mensajes, setMensajes] = useState(cargarHistorial)
  const [escribiendo, setEscribiendo] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const flujoRef = useRef(flujoVacio())
  const contextoRef = useRef(contextoVacio())
  const procesandoRef = useRef(false)
  const dispatchGenRef = useRef(0)
  const bienvenidaEnviadaRef = useRef(false)
  // Mensajes que llegaron mientras el bot respondía: se procesan al terminar,
  // en orden, en vez de descartarse (ver enviarMensaje).
  const colaRef = useRef([])
  const despacharRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes))
  }, [mensajes])

  const agregarMensaje = useCallback((autor, texto, chips = null) => {
    setMensajes(prev => [...prev, crearMensaje(autor, texto, chips)])
  }, [])

  const responderConDelay = useCallback((texto, chips = null) => {
    setEscribiendo(true)
    const delay = 500 + Math.random() * 700
    return new Promise(resolve => {
      setTimeout(() => {
        setEscribiendo(false)
        agregarMensaje('bot', texto, chips)
        resolve()
      }, delay)
    })
  }, [agregarMensaje])

  const iniciarBienvenida = useCallback(() => {
    setMensajes(prev => {
      if (prev.length > 0 || bienvenidaEnviadaRef.current) return prev
      // Guard síncrono: responderConDelay demora el mensaje real (setTimeout),
      // así que "prev.length > 0" no alcanza para evitar duplicados si esta
      // función se llama dos veces seguidas antes de que el mensaje se agregue
      // (ej. React StrictMode invoca los efectos dos veces a propósito en dev).
      bienvenidaEnviadaRef.current = true
      responderConDelay(
        '¡Hola! 👋 Soy el asistente de Pack Express. Puedo ayudarte a rastrear un envío, cotizar, o responder preguntas frecuentes.',
        ['Rastrear mi envío', 'Cotizar', 'Preguntas frecuentes'],
      )
      return prev
    })
  }, [responderConDelay])

  const ofrecerSalidaWhatsapp = useCallback((mensaje) => {
    return responderConDelay(mensaje, ['Hablar por WhatsApp'])
  }, [responderConDelay])

  const abrirCotizadorCompleto = useCallback((mensaje) => {
    flujoRef.current = flujoVacio()
    window.dispatchEvent(new CustomEvent('openCotizar'))
    return responderConDelay(mensaje)
  }, [responderConDelay])

  const manejarRastreo = useCallback(async (numero) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    try {
      const res  = await fetch(`${API}/rastreo.php?guia_numero=${encodeURIComponent(numero)}`)
      const json = await res.json()
      if (!json.ok) {
        return ofrecerSalidaWhatsapp(`No encontré ninguna guía con el número "${numero}". Revisá que esté bien escrito, o escribinos por WhatsApp si preferís que te ayudemos directamente.`)
      }
      const { guia, events } = json.data
      // guia.numero es el AWB/manifiesto compartido por todos los paquetes del
      // lote, no identifica una guía puntual — el código único por guía es el
      // formato CM...PK derivado de id_guia (el mismo que el cliente puede
      // haber tipeado para buscar).
      const codigoGuia = `CM${String(guia.id_guia).padStart(9, '0')}PK`
      const destino = guia.municipio_dest && guia.provincia_dest
        ? ` Destino: ${guia.municipio_dest}, ${guia.provincia_dest}.`
        : ''
      const ultimo = (events ?? [])[(events ?? []).length - 1]
      if (!ultimo) {
        return responderConDelay(`Encontré tu envío ${codigoGuia}, pero todavía no tiene eventos de rastreo registrados.${destino}`)
      }
      return responderConDelay(`Tu envío ${codigoGuia} está en ${ultimo.hito} desde el ${formatFechaHora(ultimo.fecha_hora)}.${destino}`)
    } catch {
      return ofrecerSalidaWhatsapp('Tuve un problema para consultar el rastreo. Probá de nuevo en un momento, o escribinos por WhatsApp.')
    } finally {
      procesandoRef.current = false
    }
  }, [responderConDelay, ofrecerSalidaWhatsapp])

  /**
   * `paisPrellenado`/`pesoPrellenado`: si el mensaje que disparó la
   * cotización ya mencionaba el país destino (ej. "quiero mandar un paquete
   * pa Cuba") y/o el peso con unidad explícita (ej. "cuanto cuesta enviar 5
   * kg"), se guardan de una vez y el wizard salta directo al primer slot que
   * todavía falte — el país se re-valida contra el mapa dinámico real recién
   * llegado, igual que en iniciarCotizacionDirecta. "tipo" nunca llega
   * prellenado por esta vía, así que siempre queda al menos un slot pendiente.
   */
  const iniciarCotizacion = useCallback(async (paisPrellenado, pesoPrellenado) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    flujoRef.current = { activo: true, paso: 'peso', datos: {}, intentosFallidos: 0, tipos: [], zonaMap: COUNTRY_ZONE }
    try {
      const [tiposRes, zonasRes] = await Promise.all([
        fetch(`${API}/tarifario.php?action=tipos`),
        fetch(`${API}/tarifario.php?action=zonas`),
      ])
      const tiposJson = await tiposRes.json()
      flujoRef.current.tipos = tiposJson.ok ? tiposJson.data : []

      const zonasJson = await zonasRes.json()
      if (zonasJson.ok && Array.isArray(zonasJson.data)) {
        flujoRef.current.zonaMap = Object.fromEntries(zonasJson.data.map(p => [p.nombre, p.zona_cod]))
      }
    } catch {
      flujoRef.current.tipos = []
    } finally {
      procesandoRef.current = false
    }
    if (paisPrellenado) {
      const paisFinal = matchPais(paisPrellenado, flujoRef.current.zonaMap) ?? paisPrellenado
      flujoRef.current.datos.pais = paisFinal
    }
    if (pesoPrellenado != null) {
      flujoRef.current.datos.peso = pesoPrellenado
    }
    const faltan = slotsFaltantes(flujoRef.current)
    flujoRef.current.paso = faltan[0]
    const pregunta = preguntaDeSlot(faltan[0], flujoRef.current)
    const resumen = resumenEntidades(flujoRef.current.datos)
    return responderConDelay(resumen ? `¡Perfecto! ${resumen}. ${pregunta}` : pregunta)
  }, [responderConDelay])

  /**
   * Ejecuta la cotización real (o la tabla de referencia) una vez que ya se
   * tienen peso, país y tipo resueltos, y responde. Compartido por el paso
   * "tipo" del wizard y por los atajos que resuelven el tipo de una sola vez
   * (cotizar_directo cuando el propio mensaje ya lo menciona, ej. "un
   * paquete de 10kg a Cuba" — "paquete" ya identifica Paquetería).
   */
  const cotizarYResponder = useCallback(async ({ peso, pais, zonaMap, modoTabla }, tipo) => {
    const zonaCod = zonaMap[pais]
    // `pais` es la fila interna del tarifario (puede ser "Miami"); al usuario
    // se le habla siempre del país que escribió ("Estados Unidos").
    const paisMostrado = nombrePaisParaMostrar(pais)
    if (modoTabla) {
      try {
        const jsons = await Promise.all(
          PESOS_TABLA.map(p => fetch(`${API}/tarifario.php?action=cotizar_todas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peso: p, tipo_servicio_id: tipo.id }),
          }).then(r => r.json())),
        )
        flujoRef.current = flujoVacio()
        const filas = jsons.map((json, i) => {
          if (!json.ok) return null
          const fila = json.data.zonas.find(z => z.zona_cod === zonaCod)
          if (!fila || !fila.disponible) return null
          return `${PESOS_TABLA[i]} kg — USD ${fila.total.toFixed(2)}`
        }).filter(Boolean)
        if (filas.length === 0) {
          return responderConDelay(`No tengo tarifas disponibles para ${paisMostrado} en este momento. Te recomiendo escribirnos por WhatsApp para confirmarlo.`, ['Hablar por WhatsApp'])
        }
        return responderConDelay(`Precios de referencia para ${paisMostrado} (${ZONE_LABELS[zonaCod]}):\n${filas.join('\n')}\n\nSon precios estimados por peso, se confirman al gestionar el envío. Si me decís tu peso exacto te lo cotizo directo.`)
      } catch {
        flujoRef.current = flujoVacio()
        return ofrecerSalidaWhatsapp('Tuve un problema calculando las tarifas. Probá de nuevo, o escribinos por WhatsApp.')
      }
    }
    try {
      const res  = await fetch(`${API}/tarifario.php?action=cotizar_todas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso, tipo_servicio_id: tipo.id }),
      })
      const json = await res.json()
      flujoRef.current = flujoVacio()
      if (!json.ok) {
        return abrirCotizadorCompleto('Tuve un problema calculando la cotización. Te abrí el cotizador completo para que puedas intentarlo ahí.')
      }
      const fila = json.data.zonas.find(z => z.zona_cod === zonaCod)
      if (!fila || !fila.disponible) {
        return responderConDelay(`No tengo una tarifa disponible para ${paisMostrado} con ${peso} kg en este momento. Te recomiendo escribirnos por WhatsApp para confirmarlo.`, ['Hablar por WhatsApp'])
      }
      return responderConDelay(`Envío de ${peso} kg a ${paisMostrado} (${ZONE_LABELS[zonaCod]}): USD ${fila.total.toFixed(2)}. Este precio es estimado, se confirma al gestionar el envío.`)
    } catch {
      flujoRef.current = flujoVacio()
      return ofrecerSalidaWhatsapp('Tuve un problema calculando la cotización. Probá de nuevo, o escribinos por WhatsApp.')
    }
  }, [responderConDelay, ofrecerSalidaWhatsapp, abrirCotizadorCompleto])

  /**
   * Cotizar directo cuando el mensaje ya trae peso Y país juntos (ej. "10 kg
   * a España") — se salta los pasos de peso/país del wizard. El país
   * detectado con el mapa estático (síncrono) se re-valida contra el mapa
   * dinámico real apenas llega, para no arrastrar un nombre que no exista en
   * la lista viva de zonas. Si el mismo mensaje además menciona el tipo de
   * envío ("un paquete de 10kg a Cuba" -> Paquetería), se cotiza directo sin
   * preguntar nada más.
   */
  const iniciarCotizacionDirecta = useCallback(async (peso, paisDetectado, textoOriginal) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    flujoRef.current = { activo: true, paso: 'tipo', datos: { peso }, intentosFallidos: 0, tipos: [], zonaMap: COUNTRY_ZONE }
    try {
      const [tiposRes, zonasRes] = await Promise.all([
        fetch(`${API}/tarifario.php?action=tipos`),
        fetch(`${API}/tarifario.php?action=zonas`),
      ])
      const tiposJson = await tiposRes.json()
      flujoRef.current.tipos = tiposJson.ok ? tiposJson.data : []

      const zonasJson = await zonasRes.json()
      if (zonasJson.ok && Array.isArray(zonasJson.data)) {
        flujoRef.current.zonaMap = Object.fromEntries(zonasJson.data.map(p => [p.nombre, p.zona_cod]))
      }
    } catch {
      flujoRef.current.tipos = []
    } finally {
      procesandoRef.current = false
    }
    const paisFinal = matchPais(paisDetectado, flujoRef.current.zonaMap) ?? paisDetectado
    flujoRef.current.datos.pais = paisFinal

    const tipoDetectado = textoOriginal ? matchTipo(textoOriginal, flujoRef.current.tipos) : null
    if (tipoDetectado) {
      return cotizarYResponder({ peso, pais: paisFinal, zonaMap: flujoRef.current.zonaMap, modoTabla: false }, tipoDetectado)
    }

    const nombresTipos = flujoRef.current.tipos.map(t => t.nombre).join(', ') || 'paquete, documento'
    return responderConDelay(`¡Perfecto! ${peso} kg a ${nombrePaisParaMostrar(paisFinal)}. ¿Qué tipo de envío es? (${nombresTipos})`)
  }, [responderConDelay, cotizarYResponder])

  /**
   * Si el usuario, en medio del flujo de cotización, en vez de contestar el
   * paso pendiente (peso/país/tipo) hace una pregunta real (FAQ o pedir un
   * humano), la respondemos sin gastar un intento fallido y volvemos a
   * preguntar lo mismo — evita que "cuál es el peso máximo" dentro del
   * flujo termine forzando el cotizador completo en vez de responder.
   */
  const intentarResponderInterrupcion = useCallback(async (valor, promptReintento) => {
    const flujo = flujoRef.current
    const texto = normalizeText(valor)
    // Con zonaMap la interrupción entiende entidades igual que el flujo normal.
    // Antes se llamaba sin él, así que "¿cuánto demora?" en medio de una
    // cotización a Cuba no podía heredar el destino que el flujo YA conocía y
    // respondía con el texto internacional genérico.
    const negocio = buscarIntencionDeNegocio(texto, valor, flujo.zonaMap)

    if (negocio?.tipo === 'tiempos_pedir_pais') {
      // Si el flujo ya sabe el destino, no se lo volvemos a preguntar solo
      // para contestar tiempos; si no lo sabe, vale el texto internacional.
      await responderConDelay(respuestaTiempos(flujo.datos.pais))
      await responderConDelay(promptReintento)
      return true
    }
    if (negocio?.tipo === 'faq') {
      await responderConDelay(textoDeFaq(negocio), negocio.derivaWhatsapp ? ['Hablar por WhatsApp'] : null)
      await responderConDelay(promptReintento)
      return true
    }
    if (negocio?.tipo === 'human_handoff') {
      await responderConDelay('¡Dale! Te paso directo con nuestro equipo para que te ayuden mejor.', ['Hablar por WhatsApp'])
      await responderConDelay(`Cuando quieras seguimos: ${promptReintento}`)
      return true
    }
    return false
  }, [responderConDelay])

  const manejarRespuestaCotizacion = useCallback(async (valor) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    try {
      const flujo = flujoRef.current
      const pasoActual = flujo.paso

      // "todas las tarifas": cambia los slots requeridos (el peso deja de
      // hacer falta). Solo se evalúa mientras el peso siga sin definirse — es
      // una alternativa a darlo, no algo que aplique en cualquier momento.
      const textoNorm = normalizeText(valor)
      const pideTabla = flujo.datos.peso == null &&
        PALABRAS_TODO_TARIFARIO.some(p => textoNorm === p || textoNorm.includes(p))
      if (pideTabla) flujo.datos.modoTabla = true

      // UNA sola pasada de extracción sobre el mensaje completo, sin importar
      // qué slot se estaba preguntando. Lo nuevo pisa lo viejo, así que
      // corregir un dato ya dado es el mismo mecanismo que darlo por primera vez.
      const nuevas = extraerEntidadesCotizacion(valor, {
        zonaMap: flujo.zonaMap,
        tipos: flujo.tipos,
        pasoActual,
      })
      Object.assign(flujo.datos, nuevas)

      if (!pideTabla && Object.keys(nuevas).length === 0) {
        if (await intentarResponderInterrupcion(valor, preguntaDeSlot(pasoActual, flujo))) return
        flujo.intentosFallidos += 1
        if (flujo.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          return abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
        }
        return responderConDelay(noEntendiSlot(pasoActual))
      }

      flujo.intentosFallidos = 0
      const faltan = slotsFaltantes(flujo)
      if (faltan.length === 0) {
        return cotizarYResponder({ ...flujo.datos, zonaMap: flujo.zonaMap }, flujo.datos.tipo)
      }

      flujo.paso = faltan[0]
      const pregunta = preguntaDeSlot(faltan[0], flujo)
      const resumen = resumenEntidades(nuevas)
      if (resumen) return responderConDelay(`¡Perfecto! ${resumen}. ${pregunta}`)
      if (pideTabla) return responderConDelay(`¡Dale! Te muestro precios de referencia para varios pesos. ${pregunta}`)
      return responderConDelay(pregunta)
    } finally {
      procesandoRef.current = false
    }
  }, [responderConDelay, abrirCotizadorCompleto, intentarResponderInterrupcion, cotizarYResponder])

  /** Procesa UNA intención ya detectada (puede haber varias por mensaje, ver enviarMensaje). */
  const procesarIntencion = useCallback(async (intencion) => {
    if (intencion.tipo !== 'desconocido') {
      contextoRef.current.nivelFallback = 0
    }
    // Se marca (o se limpia) en cada intención resuelta, no solo al pedir el
    // número: así una respuesta real a otra pregunta ("en realidad quiero
    // cotizar") no queda arrastrando el contexto de rastreo.
    contextoRef.current.esperandoGuia = intencion.tipo === 'rastreo_pedir_numero'
    contextoRef.current.esperandoPaisTiempos = intencion.tipo === 'tiempos_pedir_pais'

    switch (intencion.tipo) {
      case 'rastreo':
        return manejarRastreo(intencion.numero)
      case 'rastreo_pedir_numero':
        return responderConDelay('Decime el número de tu guía y te digo en qué estado está.')
      case 'tiempos_pedir_pais':
        return responderConDelay('¿A qué país enviamos? Así te cuento los tiempos estimados (varían bastante entre un envío nacional y uno internacional).')
      case 'cotizar_iniciar':
        return iniciarCotizacion(intencion.paisPrellenado, intencion.pesoPrellenado)
      case 'cotizar_directo':
        return iniciarCotizacionDirecta(intencion.peso, intencion.pais, intencion.textoOriginal)
      case 'cobertura_pais':
        return responderConDelay(`Sí, hacemos envíos a ${nombrePaisParaMostrar(intencion.pais)}. En total llegamos a más de 50 países en América, Europa, Asia y Oceanía.`)
      case 'cotizar_respuesta':
        return manejarRespuestaCotizacion(intencion.valor)
      case 'ambiguo_precio':
        return responderConDelay('¡Claro! ¿Qué querés consultar?', ['Envío', 'Casillero', 'Despacho', 'Equipaje'])
      case 'greeting':
        return responderConDelay(elegirSaludo())
      case 'goodbye':
        return responderConDelay(GOODBYE_RESPONSES[Math.floor(Math.random() * GOODBYE_RESPONSES.length)])
      case 'small_talk':
      case 'thanks':
        return responderConDelay(intencion.respuestas[Math.floor(Math.random() * intencion.respuestas.length)])
      case 'human_handoff':
        return responderConDelay('¡Dale! Te paso directo con nuestro equipo para que te ayuden mejor.', ['Hablar por WhatsApp'])
      case 'faq':
        contextoRef.current.ultimoTema = intencion.temaId
        if (intencion.derivaWhatsapp) {
          return responderConDelay(intencion.respuesta, ['Hablar por WhatsApp'])
        }
        // textoDeFaq resuelve el caso de tiempos_entrega según el destino
        // (nacional vs internacional); para el resto devuelve la respuesta tal cual.
        return responderConDelay(textoDeFaq(intencion), intencion.chips ?? null)
      default: {
        contextoRef.current.nivelFallback += 1
        const nivel = contextoRef.current.nivelFallback
        if (nivel === 1) {
          return responderConDelay('Disculpá, no estoy seguro de haber entendido tu consulta. ¿Podés explicarme un poco más qué necesitás?')
        }
        if (nivel === 2) {
          return responderConDelay(
            'Quiero ayudarte 😊 ¿Tu consulta está relacionada con nuestros servicios, precios, horarios, ubicación o rastreo de un envío?',
            ['Servicios', 'Cotizar', 'Horarios', 'Ubicación', 'Rastrear mi envío'],
          )
        }
        contextoRef.current.nivelFallback = 0
        return ofrecerSalidaWhatsapp('Para esta consulta necesito la ayuda de una persona de nuestro equipo. Podés contactarnos por WhatsApp y te ayudamos directamente.')
      }
    }
  }, [responderConDelay, ofrecerSalidaWhatsapp, manejarRastreo, iniciarCotizacion, iniciarCotizacionDirecta, manejarRespuestaCotizacion])

  /**
   * Resuelve UN mensaje ya agregado a la conversación. Separado de
   * enviarMensaje para poder invocarlo también al drenar la cola (ver abajo),
   * sin volver a agregar el mensaje del usuario.
   */
  const despachar = useCallback((texto) => {
    if (texto === 'Hablar por WhatsApp') {
      window.open(WHATSAPP_URL, '_blank', 'noopener')
      return
    }
    if (texto === 'Rastrear mi envío') {
      responderConDelay('Decime el número de tu guía y te digo en qué estado está.')
      return
    }
    if (texto === 'Preguntas frecuentes') {
      responderConDelay('Puedo ayudarte con: horarios de atención, cómo funciona el casillero internacional, cobertura de países y departamentos, nuestros servicios, contacto, ubicación y documentación requerida. ¿Sobre cuál querés saber más?')
      return
    }
    // Chips de la aclaración "ambiguo_precio" (ver procesarIntencion) — cada
    // una resuelve a lo que ya existe (flujo de cotizar o una FAQ puntual),
    // sin inventar precios para casillero/despacho/equipaje donde no hay dato.
    if (texto === 'Envío') {
      iniciarCotizacion()
      return
    }
    if (texto === 'Casillero') {
      const faq = FAQ.find(f => f.id === 'casillero')
      // El casillero deriva a WhatsApp (todavía no está operativo), así que
      // el chip tiene que ofrecer la misma salida que la FAQ.
      if (faq) responderConDelay(faq.respuesta, faq.derivaWhatsapp ? ['Hablar por WhatsApp'] : null)
      return
    }
    if (texto === 'Despacho') {
      const faq = FAQ.find(f => f.id === 'despacho_aduanero')
      if (faq) responderConDelay(faq.respuesta)
      return
    }
    if (texto === 'Equipaje') {
      ofrecerSalidaWhatsapp('Para el costo del Equipaje No Acompañado te conecto con nuestro equipo por WhatsApp.')
      return
    }
    if (texto === 'Ver lista completa') {
      window.dispatchEvent(new CustomEvent('openLegal', { detail: 'prohibidos' }))
      return
    }

    const intenciones = detectarIntenciones(texto, {
      flujo: flujoRef.current.activo ? 'cotizando' : null,
      ultimoTema: contextoRef.current.ultimoTema,
      esperandoGuia: contextoRef.current.esperandoGuia,
      esperandoPaisTiempos: contextoRef.current.esperandoPaisTiempos,
      countryZone: COUNTRY_ZONE,
    })

    const miGen = ++dispatchGenRef.current
    setOcupado(true)
    ;(async () => {
      try {
        for (const intencion of intenciones) {
          if (dispatchGenRef.current !== miGen) return
          await procesarIntencion(intencion)
        }
      } finally {
        if (dispatchGenRef.current === miGen) {
          setOcupado(false)
          // Drenar lo que haya llegado mientras respondíamos, en orden.
          const siguiente = colaRef.current.shift()
          if (siguiente) despacharRef.current?.(siguiente)
        }
      }
    })()
  }, [responderConDelay, procesarIntencion, iniciarCotizacion, ofrecerSalidaWhatsapp])

  // Ref al último `despachar` para poder encadenar el drenado de la cola sin
  // crear una dependencia circular en el useCallback de arriba.
  useEffect(() => { despacharRef.current = despachar }, [despachar])

  const enviarMensaje = useCallback((textoUsuario) => {
    const texto = textoUsuario.trim()
    if (!texto) return
    agregarMensaje('user', texto)

    // El bot está a mitad de una respuesta (el input se deshabilita mientras
    // tanto, pero un envío ya en vuelo puede colarse igual). Antes el mensaje
    // se descartaba en silencio: el usuario lo veía en la conversación y no
    // pasaba nada más. Ahora se encola y se responde apenas termine lo actual,
    // en orden — así "10kg" seguido de "para Cuba" no pierde el peso.
    if (procesandoRef.current) {
      if (colaRef.current.length < MAX_COLA) colaRef.current.push(texto)
      return
    }
    despachar(texto)
  }, [agregarMensaje, despachar])

  return { mensajes, escribiendo, ocupado, enviarMensaje, iniciarBienvenida }
}
